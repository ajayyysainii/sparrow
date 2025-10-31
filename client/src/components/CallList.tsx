import React, { useState, useEffect } from 'react';
import AudioPlayer, { RHAP_UI } from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
import axios from 'axios';
import CallReport from './CallReport';

interface Call {
  id: string;
  status: string;
  startedAt: string;
  endedAt?: string;
  duration?: number;
  recordingUrl?: string;
  stereoRecordingUrl?: string;
  transcript?: string;
  cost?: number;
  assistantId?: string;
  customerId?: string;
  endedReason?: string;
  summary?: string;
  webCallUrl?: string;
  artifact?: {
    recording?: {
      mono?: {
        combinedUrl?: string;
        assistantUrl?: string;
        customerUrl?: string;
      };
      stereoUrl?: string;
    };
  };
}

interface CallListProps {
  apiKey: string;
  onCallSelect?: (call: Call) => void;
}

const CallList: React.FC<CallListProps> = ({ apiKey, onCallSelect }) => {
  const [calls, setCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCall, setSelectedCall] = useState<Call | null>(null);
  const [playingCallId, setPlayingCallId] = useState<string | null>(null);

  useEffect(() => {
    fetchCalls();
  }, [apiKey]);

  // Map backend call object to UI Call interface
  const mapBackendCallToCall: (backendCall: any) => Call = (backendCall) => ({
    id: backendCall.callid ?? backendCall._id,
    status: "completed", // No status info in backend, assuming all are completed
    startedAt: backendCall.time,
    endedAt: undefined, // Not present in backend
    duration: typeof backendCall.duration === 'number' ? Math.round(backendCall.duration) : undefined,
    recordingUrl: backendCall.callrecording_url,
    stereoRecordingUrl: undefined,
    transcript: undefined,
    cost: backendCall.cost,
    assistantId: undefined,
    customerId: undefined,
    endedReason: undefined,
    summary: undefined,
    webCallUrl: undefined,
    artifact: undefined,
  });

  const fetchCalls = async () => {
    try {
      setLoading(true);
      setError(null);

      // Use axios for API call
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/call/call-list`, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      // axios stores response data in .data
      const data = response.data;
      console.log(data);
      const callsArray = Array.isArray(data) ? data : [];
      const mappedCalls = callsArray.map(mapBackendCallToCall);
      setCalls(mappedCalls);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch calls');
      console.error('Error fetching calls:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (call: Call) => {
    if (call.duration) {
      const minutes = Math.floor(call.duration / 60);
      const remainingSeconds = call.duration % 60;
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    
    // Calculate duration from startedAt and endedAt
    if (call.startedAt && call.endedAt) {
      const start = new Date(call.startedAt);
      const end = new Date(call.endedAt);
      const diffMs = end.getTime() - start.getTime();
      const diffSeconds = Math.floor(diffMs / 1000);
      const minutes = Math.floor(diffSeconds / 60);
      const remainingSeconds = diffSeconds % 60;
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    
    return 'N/A';
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'ended':
        return '#34c759';
      case 'in-progress':
      case 'ringing':
        return '#007aff';
      case 'failed':
        return '#ff3b30';
      case 'queued':
        return '#ff9500';
      default:
        return '#8e8e93';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'ended':
        return '✅';
      case 'in-progress':
      case 'ringing':
        return '🔄';
      case 'failed':
        return '❌';
      case 'queued':
        return '⏳';
      default:
        return '📞';
    }
  };

  const handleCallSelect = (call: Call) => {
    setSelectedCall(call);
    onCallSelect?.(call);
  };

  const getRecordingUrl = (call: Call) => {
    // Try different recording URLs in order of preference
    return call.recordingUrl || 
           call.stereoRecordingUrl || 
           call.artifact?.recording?.stereoUrl ||
           call.artifact?.recording?.mono?.combinedUrl;
  };

  const handlePlay = (callId: string) => {
    setPlayingCallId(callId);
  };

  const handlePause = () => {
    setPlayingCallId(null);
  };

  const handleEnded = () => {
    setPlayingCallId(null);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-3 border-gray-200 border-t-blue-500 rounded-full animate-spin mb-4"></div>
        <p className="text-lg text-slate-500 font-medium m-0">
          Loading calls...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-white/80 backdrop-blur-xl rounded-3xl border border-white/50 shadow-2xl shadow-black/8 p-12">
        <div className="text-5xl mb-4">⚠️</div>
        <p className="text-lg text-red-500 font-semibold mb-2 m-0">
          Error loading calls
        </p>
        <p className="text-sm text-slate-500 mb-6 text-center m-0">
          {error}
        </p>
        <button
          onClick={fetchCalls}
          className="bg-linear-to-br from-blue-500 to-blue-700 text-white border-0 rounded-3xl px-6 py-3 text-sm font-semibold cursor-pointer transition-all duration-200 ease-out shadow-lg shadow-blue-500/30 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-500/40"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-3xl border min-w-screen border-white/50 shadow-2xl shadow-black/8 p-8 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-black/10">
        <h2 className="text-3xl font-bold text-slate-900 m-0 tracking-tight">
          Call History
        </h2>
        <button
          onClick={fetchCalls}
          className="bg-blue-50 text-blue-500 border-0 rounded-xl px-4 py-2 text-sm font-semibold cursor-pointer transition-all duration-200 ease-out hover:bg-blue-100"
        >
          Refresh
        </button>
      </div>

      {/* Calls List */}
      <div className="flex-1 overflow-y-auto pr-2">
        {calls.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-slate-500">
            <div className="text-5xl mb-4">📞</div>
            <p className="text-lg font-medium mb-2 m-0">
              No calls yet
            </p>
            <p className="text-sm m-0">
              Start a call to see it here
            </p>
          </div>
        ) : (
          calls.map((call) => (
            <div
              key={call.id}
              onClick={() => handleCallSelect(call)}
              className={`rounded-2xl p-4 mb-3 cursor-pointer transition-all duration-200 ease-out ${
                selectedCall?.id === call.id 
                  ? 'bg-blue-50 border border-blue-300' 
                  : playingCallId === call.id
                  ? 'bg-green-50 border border-green-300'
                  : 'bg-black/5 border border-transparent hover:bg-black/10'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="text-xl">
                    {getStatusIcon(call.status)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-base font-semibold text-slate-900 m-0">
                        Call #{call.id.slice(-8)}
                      </p>
                      {playingCallId === call.id && (
                        <div className="flex items-center gap-1 text-green-600">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-xs font-medium">Playing</span>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-slate-500 m-0">
                      {formatDate(call.startedAt)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div 
                    className="text-white px-2 py-1 rounded-lg text-xs font-semibold capitalize"
                    style={{ backgroundColor: getStatusColor(call.status) }}
                  >
                    {call.status}
                  </div>
                  
                  {getRecordingUrl(call) && (
                    <div 
                      className="flex items-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <AudioPlayer
                        src={getRecordingUrl(call)!}
                        onPlay={() => handlePlay(call.id)}
                        onPause={handlePause}
                        onEnded={handleEnded}
                        className="w-32! h-8!"
                        style={{
                          '--rhap-theme-color': '#3b82f6',
                          '--rhap-bg-color': 'transparent',
                          '--rhap-progress-color': '#3b82f6',
                          '--rhap-bar-color': '#e5e7eb',
                          '--rhap-time-color': '#6b7280',
                          '--rhap-font-family': 'inherit',
                        } as React.CSSProperties}
                        layout="horizontal-reverse"
                        showJumpControls={false}
                        showFilledProgress={true}
                        showDownloadProgress={false}
                        showFilledVolume={true}
                        customProgressBarSection={[]}
                        customControlsSection={[RHAP_UI.MAIN_CONTROLS, RHAP_UI.VOLUME_CONTROLS]}
                        customAdditionalControls={[]}
                      />
                    </div>
                  )}

                  {/* Report actions */}
                  <div onClick={(e) => e.stopPropagation()}>
                    <CallReport callId={call.id} />
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-slate-500">
                <span>Duration: {formatDuration(call)}</span>
                {call.cost && (
                  <span>Cost: ${call.cost.toFixed(4)}</span>
                )}
                {call.endedReason && (
                  <span className="text-xs bg-slate-100 px-2 py-1 rounded">
                    {call.endedReason.replace(/-/g, ' ')}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CallList;
