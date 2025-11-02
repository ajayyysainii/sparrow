import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

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

// Inline Audio Player Component
interface InlineAudioPlayerProps {
  src: string;
  isPlaying: boolean;
  onEnded: () => void;
}

const InlineAudioPlayer: React.FC<InlineAudioPlayerProps> = ({ src, isPlaying, onEnded }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    const handleTimeUpdate = () => updateProgress();
    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };
    const handleEnded = () => {
      onEnded();
      setProgress(0);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [onEnded]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.play().catch(console.error);
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  const handleScrubberClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    
    if (audioRef.current && duration) {
      audioRef.current.currentTime = (percentage / 100) * duration;
      setProgress(percentage);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="mt-2">
      <audio ref={audioRef} src={src} preload="metadata" />
      <div 
        className="relative h-1 bg-white/10 rounded-full cursor-pointer group"
        onClick={handleScrubberClick}
      >
        <div 
          className="absolute left-0 top-0 h-full bg-white/60 rounded-full transition-all"
          style={{ width: `${progress}%` }}
        />
        <div 
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ left: `calc(${progress}% - 6px)` }}
        />
      </div>
      <div className="flex items-center justify-between mt-1.5">
        <span className="text-xs text-[#A1A1AA]">{formatTime((progress / 100) * duration)}</span>
        <span className="text-xs text-[#A1A1AA]">{formatTime(duration)}</span>
      </div>
    </div>
  );
};

const CallList: React.FC<CallListProps> = ({ apiKey, onCallSelect }) => {
  const navigate = useNavigate();
  const [calls, setCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playingCallId, setPlayingCallId] = useState<string | null>(null);
  const { token } = useAuth();

  useEffect(() => {
    fetchCalls();
  }, [apiKey, token]);

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
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await axios.get(`${import.meta.env.VITE_API_URL}/call/call-list`, {
        headers,
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

  const formatDateCompact = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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


  const getRecordingUrl = (call: Call) => {
    return call.recordingUrl || 
           call.stereoRecordingUrl || 
           call.artifact?.recording?.stereoUrl ||
           call.artifact?.recording?.mono?.combinedUrl;
  };

  const handlePlayToggle = (call: Call, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (playingCallId === call.id) {
      // Pause current audio
      setPlayingCallId(null);
    } else {
      // Stop any currently playing audio and start this one
      setPlayingCallId(call.id);
    }
  };

  const handleCallClick = (call: Call, e: React.MouseEvent) => {
    // Don't navigate if clicking on interactive elements
    if ((e.target as HTMLElement).closest('.play-button') ||
        (e.target as HTMLElement).closest('.audio-player')) {
      return;
    }
    navigate(`/dashboard/call/${call.id}`);
    onCallSelect?.(call);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="relative">
          <div className="w-12 h-12 border-2 border-white/10 border-t-white/40 rounded-full animate-spin"></div>
        </div>
        <p className="text-base text-white/60 font-medium mt-6 tracking-tight">
          Loading calls...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
          <span className="text-2xl">⚠️</span>
        </div>
        <h3 className="text-xl font-semibold text-white mb-2 tracking-tight">
          Unable to Load Calls
        </h3>
        <p className="text-sm text-white/50 mb-8 text-center max-w-sm leading-relaxed">
          {error}
        </p>
        <button
          onClick={fetchCalls}
          className="px-6 py-3 bg-white text-black rounded-full text-sm font-medium tracking-tight transition-all duration-200 hover:bg-white/90 active:scale-95"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 px-1">
        <div>
          <h2 className="text-2xl font-semibold text-white mb-1 tracking-tight">
            Call History
          </h2>
          <p className="text-sm text-[#A1A1AA] font-normal">
            {calls.length} {calls.length === 1 ? 'call' : 'calls'}
          </p>
        </div>
        <button
          onClick={fetchCalls}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/15 border border-white/20 transition-all duration-200 active:scale-95 shrink-0"
          title="Refresh"
        >
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Calls List - Compact Rows */}
      <div className="space-y-2">
        {calls.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] p-8 bg-white/5 rounded-xl border border-white/10">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6">
              <span className="text-3xl">📞</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2 tracking-tight">
              No Calls Yet
            </h3>
            <p className="text-sm text-[#A1A1AA] text-center max-w-sm leading-relaxed">
              Start a call to see it appear here
            </p>
          </div>
        ) : (
          calls.map((call, index) => {
            const isPlaying = playingCallId === call.id;
            const hasRecording = !!getRecordingUrl(call);
            
            return (
              <div
                key={call.id}
                onClick={(e) => handleCallClick(call, e)}
                className={`group relative px-4 py-3 rounded-lg border transition-all duration-200 cursor-pointer ${
                  isPlaying
                    ? 'bg-white/10 border-white/20'
                    : 'bg-white/5 hover:bg-white/10 border-white/10 hover:border-white/15'
                }`}
                style={{
                  animation: `fadeIn 0.2s ease-out ${index * 0.02}s both`
                }}
              >
                <div className="flex items-center justify-between">
                  {/* Left Section: Call ID, Date, and Audio Player */}
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="text-left flex-1 min-w-0">
                      <button
                        onClick={(e) => handleCallClick(call, e)}
                        className="text-left w-full"
                      >
                        <div className="font-medium text-white mb-0.5 tracking-tight hover:underline transition-all duration-200">
                          Call {call.id.slice(-8)}
                        </div>
                        <div className="text-sm text-[#A1A1AA] font-normal">
                          {formatDateCompact(call.startedAt)}
                        </div>
                      </button>
                      
                      {/* Inline Audio Player - Shows when playing */}
                      {isPlaying && hasRecording && (
                        <div 
                          className="audio-player animate-fadeIn"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <InlineAudioPlayer
                            src={getRecordingUrl(call)!}
                            isPlaying={isPlaying}
                            onEnded={() => setPlayingCallId(null)}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Section: Status Badge, Play Button, and Report Button */}
                  <div className="flex items-center gap-3 shrink-0">
                    {/* Status Badge */}
                    <span 
                      className="inline-block px-2.5 py-1 rounded-md text-xs font-medium capitalize"
                      style={{ 
                        backgroundColor: `${getStatusColor(call.status)}20`,
                        color: getStatusColor(call.status),
                        border: `1px solid ${getStatusColor(call.status)}40`
                      }}
                    >
                      {call.status}
                    </span>

                    {/* Play/Pause Button */}
                    {hasRecording && (
                      <button
                        onClick={(e) => handlePlayToggle(call, e)}
                        className="play-button w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/15 border border-white/20 transition-all duration-200 active:scale-95 shrink-0"
                        title={isPlaying ? "Pause audio" : "Play audio"}
                      >
                        {isPlaying ? (
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default CallList;
