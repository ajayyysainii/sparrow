import Call from "../models/call.model.js";
import Report from "../models/report.model.js";
import Groq from "groq-sdk";
import FormData from "form-data";
import { Readable } from "stream";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export class CallController {
  getCallList = async (req, res) => {
    try {
      const calls = await Call.find({ callrecording_url: { $ne: null } }).sort({
        time: -1,
      });
      res.status(200).json(calls);
    } catch (error) {
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
      console.error("Error in checkCallReportStatus:", error);
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
      // Check if recording URL is available
      if (!call.callrecording_url) {
        return res
          .status(400)
          .json({ message: "No recording URL available for this call" });
      }

      // Step 1: Try to get transcript from Vapi API first
      let transcript = "";
      try {
        const vapiResponse = await fetch(`https://api.vapi.ai/call/${callid}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${process.env.VAPI_API_KEY_PRIVATE}`,
          },
        });

        const vapiData = await vapiResponse.json();
        console.log("Vapi call data:", vapiData);
        transcript = vapiData.transcript || vapiData.summary || "";
      } catch (error) {
        console.error("Error fetching transcript from Vapi:", error);
      }

      // Step 2: If no transcript from Vapi, download and transcribe using Groq
      if (!transcript) {
        try {
          const audioResponse = await fetch(call.callrecording_url);
          const audioFile = await audioResponse.arrayBuffer();

          const formData = new FormData();
          const audioBuffer = Buffer.from(audioFile);
          const audioStream = Readable.from(audioBuffer);
          formData.append("file", audioStream, {
            filename: "recording.mp3",
            contentType: "audio/mpeg",
          });
          formData.append("model", "whisper-large-v3");

          console.log("Attempting Groq transcription...");
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

          console.log(
            "transcriptionResponse status:",
            transcriptionResponse.status
          );

          if (!transcriptionResponse.ok) {
            const errorText = await transcriptionResponse.text();
            console.error("Transcription error response:", errorText);
            throw new Error(`Transcription failed: ${errorText}`);
          }

          const transcriptionData = await transcriptionResponse.json();
          console.log("transcriptionData:", transcriptionData);
          transcript = transcriptionData.text || "";
        } catch (error) {
          console.error("Error transcribing audio:", error);
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

Transcript: ${transcript}

Please provide your response in the following JSON format:
{
  "sentimentAnalysis": "Positive/Neutral/Negative",
  "confidenceLevel": 85,
  "vocabularyRichness": 75,
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

      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content:
              "You are an expert call analyst. Analyze call transcripts and provide structured feedback.",
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
        console.error("Error parsing AI response:", parseError);
        // Fallback to default values
        reportData = {
          sentimentAnalysis: "Neutral",
          confidenceLevel: 50,
          vocabularyRichness: 50,
          speakingTimeSplit: {
            caller: 50,
            callee: 50,
          },
          areasToImprove: ["Unable to analyze recording"],
        };
      }

      // Create and save the report
      report = await Report.create({
        callId: call._id,
        sentimentAnalysis: reportData.sentimentAnalysis,
        confidenceLevel: reportData.confidenceLevel,
        vocabularyRichness: reportData.vocabularyRichness,
        speakingTimeSplit: reportData.speakingTimeSplit,
        areasToImprove: reportData.areasToImprove || [],
      });

      res.status(200).json({
        message: "Report generated successfully",
        report,
      });
    } catch (error) {
      console.error("Error in getCallReport:", error);
      res.status(500).json({ message: error.message });
    }
  };
}

// POLLING FUNCTION (STATIC METHOD)
export async function pollAndSyncVapiCalls() {
  try {
    console.log("Polling Vapi API...");
    const response = await fetch("https://api.vapi.ai/call", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.VAPI_API_KEY_PRIVATE}`,
      },
    });
    const body = await response.json();
    let callArray = [];
    if (Array.isArray(body)) {
      callArray = body;
    } else if (body && Array.isArray(body.calls)) {
      callArray = body.calls;
    } else if (body && body.id) {
      callArray = [body];
    }
    for (const callInfo of callArray) {
      let duration = null;
      if (callInfo.endedAt && callInfo.startedAt) {
        duration =
          (new Date(callInfo.endedAt) - new Date(callInfo.startedAt)) / 1000; // seconds
      } else if (callInfo.duration) {
        duration = callInfo.duration;
      }
      const callrecording_url =
        callInfo.recordingUrl ||
        (callInfo.artifact && callInfo.artifact.recordingUrl) ||
        null;
      const callid = callInfo.id || null;
      const cost =
        callInfo.cost ||
        (callInfo.costBreakdown && callInfo.costBreakdown.total) ||
        null;
      const time = callInfo.startedAt
        ? new Date(callInfo.startedAt)
        : new Date();
      if (!callid) continue;
      const callData = { callid, duration, callrecording_url, cost, time };
      await Call.updateOne({ callid }, { $set: callData }, { upsert: true });
    }
    // Optional: log that sync completed
    // console.log(`Vapi call sync complete: ${callArray.length} calls processed`);
  } catch (err) {
    console.error("Polling Vapi API failed:", err);
  }
}
