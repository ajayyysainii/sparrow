import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

interface CallReportProps {
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

const CallReport: React.FC<CallReportProps> = ({ callId }) => {
  const [exists, setExists] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [report, setReport] = useState<ReportPayload | null>(null);
  const { token } = useAuth();

  const apiBase = useMemo(() => import.meta.env.VITE_API_URL, []);

  useEffect(() => {
    let cancelled = false;
    async function fetchStatus() {
      try {
        setError(null);
        const headers: Record<string, string> = {};
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }
        const res = await axios.get(`${apiBase}/call/call-report-status/${callId}`, { headers });
        if (!cancelled) setExists(Boolean(res.data?.exists));
      } catch (err: any) {
        // If status check fails, don't block UI; keep exists=false so user can try generate
        if (!cancelled) setExists(false);
      }
    }
    fetchStatus();
    return () => {
      cancelled = true;
    };
  }, [apiBase, callId, token]);

  const openAndFetch = async () => {
    try {
      setLoading(true);
      setError(null);
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      const res = await axios.get<GetReportResponse>(`${apiBase}/call/call-report/${callId}`, { headers });
      setReport(res.data?.report || null);
      setExists(true);
      setIsOpen(true);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to get report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={openAndFetch}
        disabled={loading}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all duration-200 ease-out ${
          'bg-white/5 text-[#A1A1AA] hover:bg-white/10 hover:text-white border border-white/10'
        } ${loading ? 'opacity-70 pointer-events-none' : ''}`}
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <span>{exists ? 'See report' : 'Generate report'}</span>
      </button>
      {error && (
        <span className="text-xs text-red-500">{error}</span>
      )}

      {isOpen && (
        <div className="z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsOpen(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl w-[90vw] max-w-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-slate-900 m-0">Call Report</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-500 hover:text-slate-700 text-sm"
              >
                Close
              </button>
            </div>

            {!report ? (
              <div className="text-slate-500 text-sm">No report data.</div>
            ) : (
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-700">Sentiment:</span>
                  <span className="capitalize">{report.sentimentAnalysis || '—'}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="font-semibold text-slate-700">Confidence</div>
                    <div>{report.confidenceLevel ?? '—'}</div>
                  </div>
                  <div>
                    <div className="font-semibold text-slate-700">Vocabulary</div>
                    <div>{report.vocabularyRichness ?? '—'}</div>
                  </div>
                </div>
                <div>
                  <div className="font-semibold text-slate-700 mb-1">Speaking Time Split</div>
                  <div className="flex items-center gap-4">
                    <span>Caller: {report.speakingTimeSplit?.caller ?? '—'}%</span>
                    <span>Callee: {report.speakingTimeSplit?.callee ?? '—'}%</span>
                  </div>
                </div>
                <div>
                  <div className="font-semibold text-slate-700 mb-1">Areas to Improve</div>
                  {(report.areasToImprove && report.areasToImprove.length > 0) ? (
                    <ul className="list-disc pl-5 space-y-1">
                      {report.areasToImprove.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-slate-500">—</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CallReport;


