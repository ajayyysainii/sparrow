import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import CallReportVisualization from '../components/CallReportVisualization';

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

// Waveform Component
interface WaveformProps {
  src: string;
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onEnded: () => void;
}

const Waveform: React.FC<WaveformProps> = ({ src, isPlaying, onPlay, onPause, onEnded }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const barCount = 120;
    const barWidth = width / barCount;
    const progressWidth = (progress / 100) * width;

    ctx.clearRect(0, 0, width, height);

    // Draw waveform bars
    for (let i = 0; i < barCount; i++) {
      const x = i * barWidth;
      const isPastProgress = x < progressWidth;
      
      // Generate random bar height (simulated waveform)
      const baseHeight = height * 0.4;
      const variation = Math.sin(i * 0.25) * (height * 0.3);
      const barHeight = baseHeight + Math.abs(variation);
      
      // Different colors for played vs unplayed
      ctx.fillStyle = isPastProgress 
        ? 'rgba(255, 255, 255, 0.95)' 
        : 'rgba(255, 255, 255, 0.3)';
      
      // Draw bar centered
      const barY = (height - barHeight) / 2;
      ctx.fillRect(x + 1, barY, barWidth - 2, barHeight);
    }
  }, [progress]);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    
    if (audioRef.current && duration) {
      audioRef.current.currentTime = (percentage / 100) * duration;
      setProgress(percentage);
    }
  };

  const togglePlay = () => {
    if (isPlaying) {
      onPause();
    } else {
      onPlay();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full bg-white/5 rounded-lg border border-white/10 p-6 backdrop-blur-xl">
      <audio ref={audioRef} src={src} preload="metadata" />
      <div className="space-y-4">
        {/* Play/Pause Button */}
        <div className="flex items-center justify-center">
          <button
            onClick={togglePlay}
            className="w-16 h-16 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/15 border border-white/20 transition-all duration-200 active:scale-95"
            title={isPlaying ? "Pause audio" : "Play audio"}
          >
            {isPlaying ? (
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
        </div>

        {/* Waveform */}
        <div 
          className="relative cursor-pointer"
          onClick={handleClick}
          title="Click to seek"
        >
          <canvas
            ref={canvasRef}
            width={600}
            height={80}
            className="w-full h-20"
            style={{ imageRendering: 'crisp-edges' }}
          />
          {/* Progress indicator line */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-white/80 pointer-events-none"
            style={{ left: `${progress}%` }}
          />
        </div>

        {/* Time Display */}
        <div className="flex items-center justify-between text-sm text-[#A0AEC0] font-medium">
          <span>{formatTime((progress / 100) * duration)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
};

const CallDetailPage: React.FC = () => {
  const { callId } = useParams<{ callId: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [call, setCall] = useState<Call | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!callId) return;
    fetchCallDetails();
  }, [callId, token]);

  const fetchCallDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await axios.get(`${import.meta.env.VITE_API_URL}/call/call-list`, {
        headers,
      });

      const callsArray = Array.isArray(response.data) ? response.data : [];
      const foundCall = callsArray.find((c: any) => (c.callid ?? c._id) === callId);
      
      if (foundCall) {
        setCall({
          id: foundCall.callid ?? foundCall._id,
          status: "completed",
          startedAt: foundCall.time,
          duration: typeof foundCall.duration === 'number' ? Math.round(foundCall.duration) : undefined,
          recordingUrl: foundCall.callrecording_url,
          cost: foundCall.cost,
        });
      } else {
        setError('Call not found');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load call details');
      console.error('Error fetching call details:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRecordingUrl = (call: Call) => {
    return call.recordingUrl || 
           call.stereoRecordingUrl || 
           call.artifact?.recording?.stereoUrl ||
           call.artifact?.recording?.mono?.combinedUrl;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
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
    return 'N/A';
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'ended':
        return '#48BB78';
      case 'in-progress':
      case 'ringing':
        return '#6366F1';
      case 'failed':
        return '#F56565';
      case 'queued':
        return '#ff9500';
      default:
        return '#8e8e93';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="relative">
          <div className="w-12 h-12 border-2 border-white/10 border-t-white/40 rounded-full animate-spin"></div>
        </div>
        <p className="text-base text-white/60 font-medium mt-6 tracking-tight">
          Loading call details...
        </p>
      </div>
    );
  }

  if (error || !call) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
          <span className="text-2xl">⚠️</span>
        </div>
        <h3 className="text-xl font-semibold text-white mb-2 tracking-tight">
          {error || 'Call not found'}
        </h3>
        <button
          onClick={() => navigate('/dashboard/call/list')}
          className="px-6 py-3 bg-white text-black rounded-full text-sm font-medium tracking-tight transition-all duration-200 hover:bg-white/90 active:scale-95 mt-4"
        >
          Back to Call List
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard/call/list')}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/15 border border-white/20 transition-all duration-200 active:scale-95"
            title="Back to call list"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-white mb-1 tracking-tight">
              Call {call.id.slice(-8)}
            </h1>
            <p className="text-sm text-white/50">
              {formatDate(call.startedAt)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span 
            className="inline-block px-3 py-1 rounded-full text-xs font-medium text-white capitalize backdrop-blur-sm"
            style={{ 
              backgroundColor: `${getStatusColor(call.status)}20`,
              border: `1px solid ${getStatusColor(call.status)}40`
            }}
          >
            {call.status}
          </span>
        </div>
      </div>

      {/* Waveform */}
      {getRecordingUrl(call) && (
        <Waveform
          src={getRecordingUrl(call)!}
          isPlaying={isPlaying}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
        />
      )}

      {/* Call Details */}
      <div className="bg-white/5 rounded-lg border border-white/10 p-6 backdrop-blur-xl">
        <h2 className="text-lg font-semibold text-white mb-4 tracking-tight">Call Details</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-[#A0AEC0] mb-1">Duration</p>
            <p className="text-base text-[#E2E8F0] font-medium">{formatDuration(call)}</p>
          </div>
          {call.cost !== undefined && (
            <div>
              <p className="text-xs text-[#A0AEC0] mb-1">Cost</p>
              <p className="text-base text-[#E2E8F0] font-medium">${call.cost.toFixed(4)}</p>
            </div>
          )}
          {call.endedReason && (
            <div className="col-span-2">
              <p className="text-xs text-[#A0AEC0] mb-1">Ended Reason</p>
              <p className="text-base text-[#E2E8F0] font-medium">{call.endedReason.replace(/-/g, ' ')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Report Section */}
      <div className="bg-white/5 rounded-lg border border-white/10 p-6 backdrop-blur-xl">
        <h2 className="text-lg font-semibold text-white mb-6 tracking-tight">Call Report</h2>
        <CallReportVisualization callId={call.id} />
      </div>
    </div>
  );
};

export default CallDetailPage;

