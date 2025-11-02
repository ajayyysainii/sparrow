import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

interface CallReportVisualizationProps {
  callId: string;
}

interface ReportPayload {
  sentimentAnalysis?: 'Positive' | 'Neutral' | 'Negative' | null;
  confidenceLevel?: number | null;
  vocabularyRichness?: number | null;
  speakingTimeSplit?: {
    caller?: number;
    callee?: number;
  };
  areasToImprove?: string[];
}

interface GetReportResponse {
  message: string;
  report: ReportPayload;
}

const CallReportVisualization: React.FC<CallReportVisualizationProps> = ({ callId }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [generating, setGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<ReportPayload | null>(null);
  const { token } = useAuth();

  const apiBase = useMemo(() => import.meta.env.VITE_API_URL, []);

  const fetchReport = async () => {
    try {
      setError(null);
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      
      // First check if report exists
      const statusRes = await axios.get(`${apiBase}/call/call-report-status/${callId}`, { headers });
      const exists = Boolean(statusRes.data?.exists);
      
      if (exists) {
        // Fetch the report
        const res = await axios.get<GetReportResponse>(`${apiBase}/call/call-report/${callId}`, { headers });
        setReport(res.data?.report || null);
        return true;
      }
      return false;
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load report');
      return false;
    }
  };

  useEffect(() => {
    let cancelled = false;
    
    async function loadReport() {
      setLoading(true);
      const exists = await fetchReport();
      if (!cancelled) {
        setLoading(false);
      }
    }
    
    loadReport();
    return () => {
      cancelled = true;
    };
  }, [apiBase, callId, token]);

  const handleGenerateReport = async () => {
    try {
      setGenerating(true);
      setError(null);
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      // Trigger report generation (this endpoint will generate if it doesn't exist)
      try {
        await axios.get<GetReportResponse>(`${apiBase}/call/call-report/${callId}`, { 
          headers,
          timeout: 30000 // 30 second timeout for initial request
        });
        // If request succeeds immediately, report already exists
        const reportRes = await axios.get<GetReportResponse>(`${apiBase}/call/call-report/${callId}`, { headers });
        setReport(reportRes.data?.report || null);
        setGenerating(false);
        // Refresh user data to update credits
        window.location.reload();
        return;
      } catch (err: any) {
        // Check for credit/payment errors
        if (err.response?.status === 403 || err.response?.data?.needsUpgrade) {
          const shouldUpgrade = window.confirm(
            err.response?.data?.message || "No credits remaining. Would you like to upgrade to Premium?"
          );
          if (shouldUpgrade) {
            navigate("/dashboard/upgrade");
          }
          setGenerating(false);
          return;
        }
        
        // If it times out or errors, report generation was triggered - we'll poll for status
        if (err.code === 'ECONNABORTED' || err.response?.status === 500) {
          console.log('Report generation initiated, polling for completion...');
        } else {
          // Other errors - might mean generation failed
          throw err;
        }
      }

      // Poll for report completion
      let pollCount = 0;
      const maxPolls = 60; // 2 minutes max (60 polls * 2 seconds)
      
      const pollInterval = setInterval(async () => {
        pollCount++;
        try {
          const statusRes = await axios.get(`${apiBase}/call/call-report-status/${callId}`, { headers });
          const exists = Boolean(statusRes.data?.exists);
          
          if (exists) {
            clearInterval(pollInterval);
            // Fetch the full report
            const res = await axios.get<GetReportResponse>(`${apiBase}/call/call-report/${callId}`, { headers });
            setReport(res.data?.report || null);
            setGenerating(false);
            // Refresh user data to update credits
            window.location.reload();
          } else if (pollCount >= maxPolls) {
            clearInterval(pollInterval);
            setGenerating(false);
            setError('Report generation is taking longer than expected. Please refresh the page.');
          }
        } catch (err) {
          // Continue polling unless we've exceeded max polls
          if (pollCount >= maxPolls) {
            clearInterval(pollInterval);
            setGenerating(false);
            setError('Report generation is taking longer than expected. Please refresh the page.');
          }
        }
      }, 2000); // Poll every 2 seconds

      // Safety timeout - stop polling after 2.5 minutes
      setTimeout(() => {
        clearInterval(pollInterval);
        setGenerating(false);
        // Only set error if we don't have a report yet
        if (!report) {
          setError('Report generation is taking longer than expected. Please refresh the page.');
        }
      }, 150000);
    } catch (err: any) {
      setGenerating(false);
      setError(err?.response?.data?.message || err?.message || 'Failed to generate report');
    }
  };

  const getSentimentIcon = (sentiment?: string) => {
    switch (sentiment?.toLowerCase()) {
      case 'positive':
        return '🙂';
      case 'neutral':
        return '😐';
      case 'negative':
        return '☹️';
      default:
        return '—';
    }
  };

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment?.toLowerCase()) {
      case 'positive':
        return 'text-[#48BB78]';
      case 'neutral':
        return 'text-yellow-400';
      case 'negative':
        return 'text-[#F56565]';
      default:
        return 'text-[#A0AEC0]';
    }
  };

  if (loading || generating) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <div className="w-8 h-8 border-2 border-white/10 border-t-white/40 rounded-full animate-spin mb-4"></div>
        <p className="text-sm text-[#A1A1AA]">
          {generating ? 'Generating report...' : 'Loading report...'}
        </p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <p className="text-sm text-[#A0AEC0] mb-4">
          {error || 'No report available. Generate a report to see analytics.'}
        </p>
        <button
          onClick={handleGenerateReport}
          disabled={generating}
          className="px-6 py-2.5 bg-white text-black rounded-lg text-sm font-medium tracking-tight transition-all duration-200 hover:bg-white/90 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {generating ? (
            <>
              <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin"></div>
              <span>Generating...</span>
            </>
          ) : (
            <span>Generate Report</span>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-8">
      {/* Left Column: At-a-glance Visualizations */}
      <div className="space-y-6">
        {/* Sentiment */}
        {report.sentimentAnalysis && (
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">{getSentimentIcon(report.sentimentAnalysis)}</span>
              <div>
                <p className="text-xs text-[#A0AEC0] mb-0.5">Sentiment</p>
                <p className={`text-base font-medium capitalize ${getSentimentColor(report.sentimentAnalysis)}`}>
                  {report.sentimentAnalysis}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Confidence & Vocabulary */}
        <div className="space-y-4">
          {/* Confidence */}
          {report.confidenceLevel !== undefined && report.confidenceLevel !== null && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-[#A0AEC0]">Confidence</p>
                <p className="text-sm font-medium text-[#E2E8F0]">{report.confidenceLevel}%</p>
              </div>
              <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="absolute left-0 top-0 h-full bg-white/60 rounded-full transition-all duration-500"
                  style={{ width: `${report.confidenceLevel}%` }}
                />
              </div>
            </div>
          )}

          {/* Vocabulary */}
          {report.vocabularyRichness !== undefined && report.vocabularyRichness !== null && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-[#A0AEC0]">Vocabulary</p>
                <p className="text-sm font-medium text-[#E2E8F0]">{report.vocabularyRichness}%</p>
              </div>
              <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="absolute left-0 top-0 h-full bg-white/60 rounded-full transition-all duration-500"
                  style={{ width: `${report.vocabularyRichness}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Speaking Time Split */}
        {report.speakingTimeSplit && (
          <div>
            <p className="text-xs text-[#A0AEC0] mb-2">Speaking Time Split</p>
            <div className="relative h-8 bg-white/10 rounded-lg overflow-hidden">
              <div className="absolute inset-0 flex">
                {/* Caller segment */}
                {report.speakingTimeSplit.caller !== undefined && (
                  <div 
                    className="h-full bg-white/30 flex items-center justify-center transition-all duration-500"
                    style={{ width: `${report.speakingTimeSplit.caller}%` }}
                  >
                    {report.speakingTimeSplit.caller > 10 && (
                      <span className="text-xs font-medium text-[#E2E8F0]">Caller {report.speakingTimeSplit.caller}%</span>
                    )}
                  </div>
                )}
                {/* Callee segment */}
                {report.speakingTimeSplit.callee !== undefined && (
                  <div 
                    className="h-full bg-white/60 flex items-center justify-center transition-all duration-500"
                    style={{ width: `${report.speakingTimeSplit.callee}%` }}
                  >
                    {report.speakingTimeSplit.callee > 10 && (
                      <span className="text-xs font-medium text-[#E2E8F0]">Callee {report.speakingTimeSplit.callee}%</span>
                    )}
                  </div>
                )}
              </div>
            </div>
            {/* Labels below the bar */}
            <div className="flex items-center justify-between mt-2 text-xs">
              {report.speakingTimeSplit.caller !== undefined && (
                <span className="text-[#A0AEC0]">
                  Caller: <span className="text-[#E2E8F0] font-medium">{report.speakingTimeSplit.caller}%</span>
                </span>
              )}
              {report.speakingTimeSplit.callee !== undefined && (
                <span className="text-[#A0AEC0]">
                  Callee: <span className="text-[#E2E8F0] font-medium">{report.speakingTimeSplit.callee}%</span>
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Right Column: Additional Content */}
      <div>
        {/* Areas to Improve */}
        {report.areasToImprove && report.areasToImprove.length > 0 && (
          <div>
            <p className="text-xs text-[#A0AEC0] mb-3">Areas to Improve</p>
            <ul className="space-y-2">
              {report.areasToImprove.map((item, idx) => (
                <li key={idx} className="text-sm text-[#E2E8F0] flex items-start gap-2">
                  <span className="text-[#A0AEC0] mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default CallReportVisualization;

