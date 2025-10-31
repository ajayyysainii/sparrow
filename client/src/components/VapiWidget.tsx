import React, { useState, useEffect } from 'react';
import Vapi from '@vapi-ai/web';

interface VapiWidgetProps {
  apiKey: string;
  assistantId: string;
  config?: Record<string, unknown>;
}

const VapiWidget: React.FC<VapiWidgetProps> = ({ 
  apiKey, 
  assistantId
}) => {
  const [vapi, setVapi] = useState<Vapi | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);

  useEffect(() => {
    const vapiInstance = new Vapi(apiKey);
    setVapi(vapiInstance);

    // Event listeners
    vapiInstance.on('call-start', () => {
      console.log('Call started');
      setIsConnected(true);
    });

    vapiInstance.on('call-end', () => {
      console.log('Call ended');
      setIsConnected(false);
      setIsSpeaking(false);
      setIsUserSpeaking(false);
    });

    vapiInstance.on('speech-start', (...args: any[]) => {
      console.log('Speech started:', args);
      const data = args[0];
      if (data?.role === 'assistant') {
        setIsSpeaking(true);
      } else if (data?.role === 'user') {
        setIsUserSpeaking(true);
      } else {
        // Default to assistant if no role specified
        setIsSpeaking(true);
      }
    });

    vapiInstance.on('speech-end', (...args: any[]) => {
      console.log('Speech ended:', args);
      const data = args[0];
      if (data?.role === 'assistant') {
        setIsSpeaking(false);
      } else if (data?.role === 'user') {
        setIsUserSpeaking(false);
      } else {
        // Default to assistant if no role specified
        setIsSpeaking(false);
      }
    });

    vapiInstance.on('message', (message) => {
      // Voice-only mode - no transcript display needed
      console.log('Message received:', message);
    });

    vapiInstance.on('error', (error) => {
      console.error('Vapi error:', error);
    });

    return () => {
      vapiInstance?.stop();
    };
  }, [apiKey]);

  const startCall = () => {
    if (vapi) {
      const call =vapi.start(assistantId);
      console.log('Call ID:', call);
    }
  };

  const endCall = () => {
    if (vapi) {
      vapi.stop();
    }
  };

  return (
    <div className="fixed inset-0 w-screen h-screen bg-linear-to-br from-slate-50 to-slate-100 flex flex-col items-center justify-center font-sans z-50 p-6">
      {!isConnected ? (
        <div className="text-center max-w-lg">
          <div className="w-30 h-30 rounded-3xl bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-indigo-500/30 transition-all duration-300 ease-out">
            <span className="text-6xl">🤖</span>
          </div>
          
          <h1 className="text-5xl font-bold mb-3 text-slate-900 tracking-tight">
            AI Voice Assistant
          </h1>
          
          <p className="text-xl text-slate-500 mb-12 leading-relaxed font-normal">
            Start a natural voice conversation with your AI assistant
          </p>
          
          <button
            onClick={startCall}
            className="bg-linear-to-r from-blue-500 to-blue-700 text-white border-0 rounded-3xl px-10 py-4 text-lg font-semibold cursor-pointer inline-flex items-center gap-2 transition-all duration-200 ease-out shadow-lg shadow-blue-500/30 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-500/40 tracking-tight"
          >
            <span className="text-xl">🎤</span>
            Start Call
          </button>
        </div>
      ) : (
        <div className="w-full max-w-6xl h-full flex gap-6 items-center justify-center relative">
          {/* Agent Card */}
          <div className={`flex-1 h-96 bg-white/80 backdrop-blur-xl rounded-3xl border border-white/50 flex flex-col items-center justify-center p-12 transition-all duration-300 ease-out relative overflow-hidden ${
            isSpeaking 
              ? 'shadow-2xl shadow-blue-500/25 ring-2 ring-blue-500/10' 
              : 'shadow-2xl shadow-black/8'
          }`}>
            {/* Background gradient when speaking */}
            {isSpeaking && (
              <div className="absolute inset-0 bg-linear-to-br from-blue-500/5 to-indigo-500/5 animate-pulse"></div>
            )}
            
            {/* Avatar */}
            <div className={`w-44 h-44 rounded-full flex items-center justify-center transition-all duration-300 ease-out mb-8 ${
              isSpeaking ? 'scale-105' : 'scale-100'
            } ${
              isSpeaking
                ? 'bg-linear-to-br from-blue-500 to-purple-600 shadow-2xl shadow-blue-500/40 ring-8 ring-blue-500/10'
                : 'bg-linear-to-br from-indigo-500 to-purple-600 shadow-2xl shadow-indigo-500/30'
            }`}>
              <span className="text-8xl">🤖</span>
            </div>
            
            {/* Name */}
            <h2 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">
              AI Assistant
            </h2>
            
            {/* Status */}
            <div className="flex items-center gap-2 mt-4">
              <div className={`w-2 h-2 rounded-full ${
                isSpeaking ? 'bg-blue-500 animate-pulse shadow-lg shadow-blue-500/60' : 'bg-green-500'
              }`}></div>
              <span className="text-sm text-slate-500 font-medium">
                {isSpeaking ? 'Speaking' : 'Listening'}
              </span>
            </div>
          </div>

          {/* User Card */}
          <div className={`flex-1 h-96 bg-white/80 backdrop-blur-xl rounded-3xl border border-white/50 flex flex-col items-center justify-center p-12 transition-all duration-300 ease-out relative overflow-hidden ${
            isUserSpeaking
              ? 'shadow-2xl shadow-green-500/25 ring-2 ring-green-500/10'
              : 'shadow-2xl shadow-black/8'
          }`}>
            {/* Background gradient when speaking */}
            {isUserSpeaking && (
              <div className="absolute inset-0 bg-linear-to-br from-green-500/5 to-indigo-500/5 animate-pulse"></div>
            )}
            
            {/* Avatar */}
            <div className={`w-44 h-44 rounded-full flex items-center justify-center transition-all duration-300 ease-out mb-8 ${
              isUserSpeaking ? 'scale-105' : 'scale-100'
            } ${
              isUserSpeaking
                ? 'bg-linear-to-br from-green-500 to-green-400 shadow-2xl shadow-green-500/40 ring-8 ring-green-500/10'
                : 'bg-linear-to-br from-slate-400 to-slate-600 shadow-2xl shadow-slate-400/30'
            }`}>
              <span className="text-8xl">👤</span>
            </div>
            
            {/* Name */}
            <h2 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">
              You
            </h2>
            
            {/* Status */}
            <div className="flex items-center gap-2 mt-4">
              <div className={`w-2 h-2 rounded-full ${
                isUserSpeaking ? 'bg-green-500 animate-pulse shadow-lg shadow-green-500/60' : 'bg-slate-400'
              }`}></div>
              <span className="text-sm text-slate-500 font-medium">
                {isUserSpeaking ? 'Speaking' : 'Listening'}
              </span>
            </div>
          </div>

          {/* Bottom controls */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-4 items-center">
            <button
              onClick={endCall}
              className="bg-red-500 text-white border-0 rounded-full w-16 h-16 flex items-center justify-center cursor-pointer transition-all duration-200 ease-out shadow-lg shadow-red-500/30 hover:bg-red-600 hover:scale-110 hover:shadow-xl hover:shadow-red-500/40 text-3xl"
            >
              📞
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VapiWidget;

// Usage in your app:
// <VapiWidget 
//   apiKey="your_public_api_key" 
//   assistantId="your_assistant_id" 
// />
