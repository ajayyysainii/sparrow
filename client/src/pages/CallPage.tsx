import React from 'react';
import { motion } from 'framer-motion';
import VapiWidget from '../components/VapiWidget';

const CallPage: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="w-full h-full bg-[#1C1C1E]"
    >
      <VapiWidget 
        apiKey={import.meta.env.VITE_VAPI_API_KEY} 
        assistantId={import.meta.env.VITE_ASSISTANT_ID} 
      />
    </motion.div>
  );
};

export default CallPage;
