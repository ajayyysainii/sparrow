import React from 'react';
import { motion } from 'framer-motion';
import DiaphragmaticBreathing from '@/components/exercises/DiaphragmaticBreathing';

const DiaphragmaticBreathingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#1C1C1E] text-white">
      <div className="max-w-4xl mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <DiaphragmaticBreathing />
        </motion.div>
      </div>
    </div>
  );
};

export default DiaphragmaticBreathingPage;

