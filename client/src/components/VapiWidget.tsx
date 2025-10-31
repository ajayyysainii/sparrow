import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Orb, type AgentState } from './orb';
import Vapi from '@vapi-ai/web';
import { Phone, PhoneOff } from 'lucide-react';

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
        setIsSpeaking(false);
      }
    });

    vapiInstance.on('message', (message) => {
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
      const call = vapi.start(assistantId);
      console.log('Call ID:', call);
    }
  };

  const endCall = () => {
    if (vapi) {
      vapi.stop();
    }
  };

  return (
    <div className="w-full h-full min-h-[calc(100vh-200px)] bg-[#1C1C1E] flex flex-col items-center justify-center font-sans p-6">
      <AnimatePresence mode="wait">
        {!isConnected ? (
          <motion.div
            key="idle"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="text-center max-w-lg"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
              className="relative w-32 h-32 mx-auto mb-8"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-white/5 rounded-[2rem] backdrop-blur-xl"></div>
              <div className="relative w-full h-full flex items-center justify-center">
                <span className="text-8xl">🤖</span>
                
              </div>
              
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  opacity: [0.3, 0.5, 0.3]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent rounded-[2rem]"
              />
            </motion.div>
            
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="text-5xl font-bold mb-3 text-white tracking-tight"
            >
              AI Voice Assistant
            </motion.h1>
            
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.4 }}
              className="text-xl text-[#A1A1AA] mb-12 leading-relaxed font-normal"
            >
              Start a natural voice conversation with your AI assistant
            </motion.p>
            
            <motion.button
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.4 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startCall}
              className="bg-white text-gray-900 border-0 rounded-full px-8 py-4 text-lg font-semibold cursor-pointer inline-flex items-center gap-3 transition-all duration-200 shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-black/30"
            >
              <Phone className="w-5 h-5" />
              <span>Start Call</span>
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key="connected"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-6xl h-full flex flex-col items-center justify-center relative"
          >
            {/* Main Content Container */}
            <div className="flex gap-6 items-center justify-center w-full">
              {/* Agent Orb */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="flex-1 h-96 max-w-md bg-[#2C2C2E] rounded-3xl border border-[#3F3F46] p-12 relative overflow-hidden"
              >
                <div className="w-full h-full flex flex-col items-center justify-center">
                  <div className="w-64 h-64 mb-6 relative">
                    <Orb
                      colors={["#3B82F6", "#60A5FA"]}
                      agentState={(isSpeaking ? "talking" : "listening") as AgentState}
                      seed={1000}
                    />
                  </div>
                  {/* Name */}
                  <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">
                    AI Assistant
                  </h2>
                  {/* Status */}
                  <div className="flex items-center gap-2 mt-4">
                    <div className={`w-2 h-2 rounded-full ${
                      isSpeaking ? 'bg-white' : 'bg-green-500'
                    }`} />
                    <span className="text-sm text-[#A1A1AA] font-medium">
                      {isSpeaking ? 'Speaking' : 'Listening'}
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* User Orb */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="flex-1 h-96 max-w-md bg-[#2C2C2E] rounded-3xl border border-[#3F3F46] p-12 relative overflow-hidden"
              >
                <div className="w-full h-full flex flex-col items-center justify-center">
                  <div className="w-64 h-64 mb-6 relative">
                    <Orb
                      colors={["#10B981", "#34D399"]}
                      agentState={(isUserSpeaking ? "talking" : "listening") as AgentState}
                      seed={2000}
                    />
                  </div>
                  {/* Name */}
                  <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">
                    You
                  </h2>
                  {/* Status */}
                  <div className="flex items-center gap-2 mt-4">
                    <div className={`w-2 h-2 rounded-full ${
                      isUserSpeaking ? 'bg-white' : 'bg-[#A1A1AA]'
                    }`} />
                    <span className="text-sm text-[#A1A1AA] font-medium">
                      {isUserSpeaking ? 'Speaking' : 'Listening'}
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Bottom controls */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="absolute bottom-8 flex gap-4 items-center"
            >
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={endCall}
                className="bg-[#EF4444] text-white border-0 rounded-full w-16 h-16 flex items-center justify-center cursor-pointer transition-all duration-200 shadow-lg shadow-[#EF4444]/30 hover:shadow-xl hover:shadow-[#EF4444]/40"
              >
                <PhoneOff className="w-6 h-6" />
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VapiWidget;
