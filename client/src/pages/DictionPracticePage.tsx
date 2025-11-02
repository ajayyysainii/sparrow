import React from 'react';
import { motion } from 'framer-motion';
import DictionPractice from '@/components/exercises/DictionPractice';

const DictionPracticePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#1C1C1E] text-white">
      <div className="p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <DictionPractice />
        </motion.div>
      </div>
    </div>
  );
};

export default DictionPracticePage;

