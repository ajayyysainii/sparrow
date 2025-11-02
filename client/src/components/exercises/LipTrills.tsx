import React from 'react';
import { motion } from 'framer-motion';
import { Clock, ExternalLink, Play, Pause, X, BarChart3, Tag } from 'lucide-react';
import { useBreathingExercise } from '../../hooks/useBreathingExercise';
import { Toast } from '../ui/toast';

const LipTrills: React.FC = () => {
  const {
    stats,
    loading,
    toast,
    activeTimer,
    startTimer,
    pauseTimer,
    resumeTimer,
    cancelTimer,
    closeToast,
    formatTime,
  } = useBreathingExercise();

  const duration = 10; // seconds (3 minutes = 180 seconds in production)
  const exerciseId = 'lip-trills';
  const title = 'Lip Trills';
  const description = 'Perform lip trills while changing pitch';

  const handleStart = () => {
    startTimer(exerciseId, duration);
  };

  return (
    <div className="w-full">
      <Toast
        message={toast.message}
        isVisible={toast.visible}
        onClose={closeToast}
        type={toast.type || 'success'}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-semibold text-white tracking-tight">
            {title}
          </h1>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-white/10 px-3 py-1.5 rounded-full border border-white/20">
              <span className="text-lg">🔥</span>
              <span className="text-sm font-semibold text-white">
                {stats.streak}
              </span>
            </div>
            <div className="flex items-center gap-1 bg-white/10 px-3 py-1.5 rounded-full border border-white/20">
              <span className="text-sm font-semibold text-white">
                {stats.totalPoints} pts
              </span>
            </div>
          </div>
        </div>

        {/* Main Content - Single Centered Waterfall Layout */}
        <div className="flex flex-col items-center max-w-2xl mx-auto space-y-6">
          {/* 1. The Animated Graphic (Hero Element) - Lips with Air Puffs */}
          <div className="flex items-center justify-center py-8">
            <div className="relative w-40 h-40 flex items-center justify-center">
              {/* Lips Icon - Simple SVG representation */}
              <svg
                className="w-32 h-32 text-white/80"
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M50 30 Q70 30 80 40 Q85 50 75 60 Q70 65 50 65 Q30 65 25 60 Q15 50 20 40 Q30 30 50 30 Z"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                />
              </svg>
              
              {/* Air Puff Lines - Animated */}
              {[0, 1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  className="absolute"
                  style={{
                    left: '50%',
                    top: '50%',
                    originX: 0.5,
                    originY: 0.5,
                  }}
                  animate={{
                    x: [0, 15 + i * 5, 30 + i * 8],
                    y: [-10 - i * 2, -8 - i * 2, -5 - i * 2],
                    opacity: [0, 0.6, 0],
                    scale: [0.8, 1, 1.2],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: 'easeOut',
                  }}
                >
                  <div className="w-2 h-2 rounded-full bg-white/60" />
                </motion.div>
              ))}
              
              {/* Additional air puffs going to the left */}
              {[0, 1, 2, 3].map((i) => (
                <motion.div
                  key={`left-${i}`}
                  className="absolute"
                  style={{
                    left: '50%',
                    top: '50%',
                    originX: 0.5,
                    originY: 0.5,
                  }}
                  animate={{
                    x: [0, -15 - i * 5, -30 - i * 8],
                    y: [-10 - i * 2, -8 - i * 2, -5 - i * 2],
                    opacity: [0, 0.6, 0],
                    scale: [0.8, 1, 1.2],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2 + 0.75,
                    ease: 'easeOut',
                  }}
                >
                  <div className="w-2 h-2 rounded-full bg-white/60" />
                </motion.div>
              ))}
            </div>
          </div>

          {/* 2. Description Text */}
          <p className="text-base text-[#E0E0E0] leading-relaxed text-center max-w-md">
            {description}
          </p>

          {/* 3. Stats (as a Subtitle) */}
          <div className="flex items-center justify-center gap-3 text-sm text-[#AAAAAA]">
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              <span>3 mins</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <BarChart3 className="h-3.5 w-3.5" />
              <span>Difficulty: Medium</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <Tag className="h-3.5 w-3.5" />
              <span>Category: Articulation</span>
            </div>
          </div>

          {/* 4. Start Exercise Button */}
          {activeTimer ? (
            <div className="w-full max-w-md space-y-4 pt-4 border-t border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[#AAAAAA]">
                  Time Remaining
                </span>
                <span className="text-2xl font-bold text-white">
                  {formatTime(activeTimer.timeRemaining)}
                </span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                <motion.div
                  className="bg-white/60 h-2 rounded-full"
                  initial={{ width: '100%' }}
                  animate={{
                    width: `${
                      (activeTimer.timeRemaining /
                        activeTimer.totalDuration) *
                      100
                    }%`,
                  }}
                  transition={{ duration: 1, ease: 'linear' }}
                />
              </div>

              <div className="flex items-center gap-2">
                {activeTimer.isPaused ? (
                  <button
                    onClick={resumeTimer}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-gray-900 rounded-lg text-sm font-medium hover:bg-white/90 transition-colors"
                  >
                    <Play className="h-4 w-4" />
                    Resume
                  </button>
                ) : (
                  <button
                    onClick={pauseTimer}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white/10 text-white rounded-lg text-sm font-medium hover:bg-white/15 transition-colors border border-white/20"
                  >
                    <Pause className="h-4 w-4" />
                    Pause
                  </button>
                )}
                <button
                  onClick={cancelTimer}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 text-[#AAAAAA] rounded-lg text-sm font-medium hover:bg-white/10 transition-colors border border-white/10"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="w-full max-w-md pt-2 space-y-3">
              <button
                onClick={handleStart}
                disabled={loading}
                className="w-full px-6 py-2.5 bg-white text-black rounded-lg text-sm font-semibold hover:bg-white/90 transition-all disabled:bg-white/20 disabled:text-black/40 disabled:cursor-not-allowed"
              >
                Start Exercise
              </button>
              
              {/* Learn More link (Small, subtle, under the button) */}
              <div className="text-center">
                <a
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  className="text-sm text-white hover:underline font-medium inline-flex items-center gap-1 transition-all duration-200"
                >
                  Learn More
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default LipTrills;
