import Call from "../models/call.model.js";
import Report from "../models/report.model.js";
import Groq from "groq-sdk";
import FormData from "form-data";
import { Readable } from "stream";


// Lazy initialization of Groq client to ensure env vars are loaded
let groq = null;
const getGroqClient = () => {
  if (!groq) {
    if (!process.env.GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY environment variable is not set");
    }
    groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
  }
  return groq;
};

// Helper function to fetch call details from Vapi API
const fetchCallDetailsFromVapi = async (callid) => {
  try {
    // Try query parameter format first (as specified by user)
    let response = await fetch(`https://api.vapi.ai/call?id=${callid}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${process.env.VAPI_API_KEY_PRIVATE}`,
      },
    });

    // If query parameter doesn't work, try path parameter format
    if (!response.ok) {
      response = await fetch(`https://api.vapi.ai/call/${callid}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${process.env.VAPI_API_KEY_PRIVATE}`,
        },
      });
    }

    if (!response.ok) {
      return null;
    }

    const vapiCallData = await response.json();
    
    // Handle different response formats
    let callData = null;
    if (Array.isArray(vapiCallData)) {
      callData = vapiCallData.find(call => call.id === callid) || vapiCallData[0];
    } else if (vapiCallData.id) {
      callData = vapiCallData;
    } else if (vapiCallData.calls && Array.isArray(vapiCallData.calls)) {
      callData = vapiCallData.calls.find(call => call.id === callid) || vapiCallData.calls[0];
    }

    if (!callData) {
      return null;
    }

    // Calculate duration if available
    let duration = null;
    if (callData.endedAt && callData.startedAt) {
      duration = (new Date(callData.endedAt) - new Date(callData.startedAt)) / 1000; // seconds
    } else if (callData.duration) {
      duration = callData.duration;
    }

    // Extract recording URL
    const callrecording_url =
      callData.recordingUrl ||
      (callData.artifact && callData.artifact.recordingUrl) ||
      (callData.artifact && callData.artifact.recording && callData.artifact.recording.mono && callData.artifact.recording.mono.combinedUrl) ||
      null;

    // Extract cost
    const cost =
      callData.cost ||
      (callData.costBreakdown && callData.costBreakdown.total) ||
      null;

    // Extract time
    const time = callData.startedAt
      ? new Date(callData.startedAt)
      : new Date();

    return {
      duration,
      callrecording_url,
      cost,
      time,
      transcript: callData.transcript || callData.summary || "",
      ...callData, // Include all other fields from Vapi
    };
  } catch (error) {
    console.error("Error fetching call details from Vapi:", error.message);
    return null;
  }
};

export class CallController {
  getCallList = async (req, res) => {
    try {
      // Filter calls by userId
      const query = {};
      if (req.user && req.user.userId) {
        query.userId = req.user.userId;
      }
      
      const calls = await Call.find(query).sort({ _id: -1 });
      
      // Fetch details from Vapi API for each call
      const callsWithDetails = await Promise.all(
        calls.map(async (call) => {
          const vapiDetails = await fetchCallDetailsFromVapi(call.callid);
          
          // Only return calls that have a recording URL (filter out incomplete calls)
          if (!vapiDetails || !vapiDetails.callrecording_url) {
            return null;
          }

          return {
            _id: call._id,
            callid: call.callid,
            userId: call.userId,
            duration: vapiDetails.duration,
            callrecording_url: vapiDetails.callrecording_url,
            cost: vapiDetails.cost,
            time: vapiDetails.time,
          };
        })
      );

      // Filter out null values (calls without recording URLs)
      const filteredCalls = callsWithDetails.filter(call => call !== null);
      
      res.status(200).json(filteredCalls);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  // Save call with userId after client creates it
  saveCall = async (req, res) => {
    try {
      const { callid } = req.body;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      if (!callid) {
        return res.status(400).json({ message: "callid is required" });
      }

      // Save only callid and userId to database
      const call = await Call.findOneAndUpdate(
        { callid },
        { $set: { callid, userId } },
        { upsert: true, new: true }
      );

      res.status(201).json({
        message: "Call saved successfully",
        call: {
          callid: call.callid,
          userId: call.userId,
          _id: call._id,
        },
      });
    } catch (error) {
      console.error("Error saving call:", error);
      res.status(500).json({ message: error.message });
    }
  };

  // Lightweight existence check without generating a new report
  checkCallReportStatus = async (req, res) => {
    try {
      const { callid } = req.params;

      if (!callid) {
        return res.status(400).json({ message: "callid is required" });
      }

      const call = await Call.findOne({ callid });
      if (!call) {
        return res.status(404).json({ message: "Call not found" });
      }

      const report = await Report.findOne({ callId: call._id });
      if (!report) {
        return res.status(200).json({ exists: false });
      }

      return res.status(200).json({ exists: true });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  getCallReport = async (req, res) => {
    try {
      const { callid } = req.params;

      if (!callid) {
        return res.status(400).json({ message: "callid is required" });
      }

      // Find the call by callid
      const call = await Call.findOne({ callid });

      if (!call) {
        return res.status(404).json({ message: "Call not found" });
      }

      // Check if report already exists for this call
      let report = await Report.findOne({ callId: call._id });

      if (report) {
        return res.status(200).json({
          message: "Report retrieved successfully",
          report,
        });
      }

      // If report doesn't exist, generate it using GroqAI
      // Fetch call details from Vapi API
      const vapiDetails = await fetchCallDetailsFromVapi(callid);
      
      if (!vapiDetails || !vapiDetails.callrecording_url) {
        return res
          .status(400)
          .json({ message: "No recording URL available for this call" });
      }

      // Step 1: Try to get transcript from Vapi API first
      let transcript = vapiDetails.transcript || "";

      // Step 2: If no transcript from Vapi, download and transcribe using Groq
      if (!transcript) {
        try {
          const audioResponse = await fetch(vapiDetails.callrecording_url);
          const audioFile = await audioResponse.arrayBuffer();

          const formData = new FormData();
          const audioBuffer = Buffer.from(audioFile);
          const audioStream = Readable.from(audioBuffer);
          formData.append("file", audioStream, {
            filename: "recording.mp3",
            contentType: "audio/mpeg",
          });
          formData.append("model", "whisper-large-v3");

          const transcriptionResponse = await fetch(
            "https://api.groq.com/openai/v1/audio/transcriptions",
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
                ...formData.getHeaders(),
              },
              body: formData,
            }
          );

          if (!transcriptionResponse.ok) {
            const errorText = await transcriptionResponse.text();
            throw new Error(`Transcription failed: ${errorText}`);
          }

          const transcriptionData = await transcriptionResponse.json();
          transcript = transcriptionData.text || "";
        } catch (error) {
          // Continue with empty transcript and let the LLM try to analyze
          transcript = "Unable to transcribe the audio recording.";
        }
      }

      // Step 3: Analyze the transcript using GroqAI
      const prompt = `Analyze this call transcript and provide a detailed report with the following fields:
1. Sentiment Analysis: Provide overall sentiment (Positive, Neutral, or Negative)
2. Confidence Level: Rate from 0-100
3. Vocabulary Richness: Rate from 0-100 based on word variety and sophistication
4. Speaking Time Split: Estimate percentage of speaking time between caller and callee
5. Areas to Improve: List 3-5 key areas for improvement

IMPORTANT RULES:
- If the caller spoke 100% and callee 0%, set sentimentAnalysis, confidenceLevel, and vocabularyRichness to null (these cannot be evaluated)
- If there is silence, background noise only, or insufficient speech content, set these three fields to null
- Only provide sentimentAnalysis, confidenceLevel, and vocabularyRichness when there is meaningful two-way conversation with the callee
- Areas to Improve should still be provided even if other fields are null

Transcript: ${transcript}

Please provide your response in the following JSON format (use null for fields that cannot be evaluated):
{
  "sentimentAnalysis": "Positive/Neutral/Negative or null",
  "confidenceLevel": 85 or null,
  "vocabularyRichness": 75 or null,
  "speakingTimeSplit": {
    "caller": 60,
    "callee": 40
  },
  "areasToImprove": [
    "Area 1",
    "Area 2",
    "Area 3"
  ]
}`;
      const completion = await getGroqClient().chat.completions.create({
        messages: [
          {
            role: "system",
            content:
              "You are an expert call analyst. Analyze call transcripts and provide structured feedback. ",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        model: "llama-3.3-70b-versatile",
        temperature: 0.7,
        max_tokens: 1024,
      });

      const aiResponse = completion.choices[0]?.message?.content || "";

      // Parse JSON from AI response
      let reportData;
      try {
        // Try to extract JSON from the response
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          reportData = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("No JSON found in AI response");
        }
      } catch (parseError) {
        // Fallback to default values
        reportData = {
          sentimentAnalysis: null,
          confidenceLevel: null,
          vocabularyRichness: null,
          speakingTimeSplit: {
            caller: 50,
            callee: 50,
          },
          areasToImprove: ["Unable to analyze recording"],
        };
      }

      // Validate speaking time split
      if (!reportData.speakingTimeSplit || 
          (typeof reportData.speakingTimeSplit.caller !== 'number') ||
          (typeof reportData.speakingTimeSplit.callee !== 'number')) {
        reportData.speakingTimeSplit = {
          caller: 50,
          callee: 50,
        };
      }

      // If caller is 100%, ensure other fields are null
      if (reportData.speakingTimeSplit.caller === 100 && reportData.speakingTimeSplit.callee === 0) {
        reportData.sentimentAnalysis = null;
        reportData.confidenceLevel = null;
        reportData.vocabularyRichness = null;
      }

      // Helper to safely convert to null
      const toNullSafe = (value) => {
        return (value !== undefined && value !== null && value !== '') ? value : null;
      };

      // Create and save the report
      report = await Report.create({
        callId: call._id,
        sentimentAnalysis: toNullSafe(reportData.sentimentAnalysis),
        confidenceLevel: toNullSafe(reportData.confidenceLevel),
        vocabularyRichness: toNullSafe(reportData.vocabularyRichness),
        speakingTimeSplit: reportData.speakingTimeSplit,
        areasToImprove: reportData.areasToImprove || [],
      });

      res.status(200).json({
        message: "Report generated successfully",
        report,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  // Get total cost of all calls for the authenticated user
  getTotalCost = async (req, res) => {
    try {
      // Filter calls by userId
      const query = {};
      if (req.user && req.user.userId) {
        query.userId = req.user.userId;
      }
      
      const calls = await Call.find(query).sort({ _id: -1 });
      
      // Fetch details from Vapi API for each call and calculate total cost
      let totalCost = 0;
      await Promise.all(
        calls.map(async (call) => {
          const vapiDetails = await fetchCallDetailsFromVapi(call.callid);
          
          // Only include calls that have a cost
          if (vapiDetails && vapiDetails.cost && typeof vapiDetails.cost === 'number') {
            totalCost += vapiDetails.cost;
          }
        })
      );
      
      res.status(200).json({ 
        totalCost: totalCost.toFixed(2),
        currency: 'USD'
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
}

