import React from 'react';
import { motion } from 'framer-motion';
import BreathingExercises from '@/components/BreathingExercises';

const BreathingExercisesPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#1C1C1E] text-white">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h1 className="text-3xl font-bold mb-2">Breathing Exercises</h1>
          <p className="text-[#AAAAAA]">
            Practice mindfulness and improve your well-being with guided breathing exercises.
          </p>
        </motion.div>

        {/* Breathing Exercises Component */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <BreathingExercises />
        </motion.div>
      </div>
    </div>
  );
};

export default BreathingExercisesPage;

