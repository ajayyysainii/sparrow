import React from 'react';
import { motion } from 'framer-motion';
import { Clock, ExternalLink, Play, Pause, X, BarChart3, Tag } from 'lucide-react';
import { useBreathingExercise } from '../../hooks/useBreathingExercise';
import { Toast } from '../ui/toast';

const PitchSlides: React.FC = () => {
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

  const duration = 10; 
  const exerciseId = 'slides';
  const title = 'Pitch Slides';
  const description = 'Slide smoothly between high and low notes';

  const handleStart = () => {
    startTimer(exerciseId, duration);
  };

  // Generate sine wave path based on frequency
  const generateWavePath = (freq: number) => {
    const width = 400;
    const height = 100;
    const centerY = height / 2;
    const amplitude = 30;
    const points: string[] = [];
    
    for (let x = 0; x <= width; x += 2) {
      const y = centerY + amplitude * Math.sin((x / width) * Math.PI * 2 * freq);
      points.push(`${x},${y}`);
    }
    
    return `M ${points.join(' L ')}`;
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
          {/* 1. The Animated Sine Wave Graphic (Hero Element) */}
          <div className="flex items-center justify-center py-8">
            <div className="relative w-full max-w-md h-32 flex items-center justify-center">
              <motion.svg
                width="400"
                height="100"
                viewBox="0 0 400 100"
                className="absolute"
                style={{ transform: 'translate(-50%, -50%)', left: '50%', top: '50%' }}
              >
                <motion.path
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.8)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  animate={{
                    d: [
                      generateWavePath(0.5), // Low frequency (long wave)
                      generateWavePath(3),  // High frequency (short wave)
                      generateWavePath(0.5), // Back to low frequency
                    ],
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: [0.4, 0, 0.6, 1], // Smooth ease-in-out
                  }}
                />
              </motion.svg>
            </div>
          </div>

          {/* 2. Description Text */}
          <p className="text-base text-[#E2E8F0] leading-relaxed text-center max-w-md">
            {description}
          </p>

          {/* 3. Stats (as a Subtitle) */}
          <div className="flex items-center justify-center gap-3 text-sm text-[#AAAAAA]">
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              <span>4 mins</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <BarChart3 className="h-3.5 w-3.5" />
              <span>Difficulty: Medium</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <Tag className="h-3.5 w-3.5" />
              <span>Category: Pitch</span>
            </div>
          </div>

          {/* 4. Start Exercise Button */}
          {activeTimer ? (
            <div className="w-full max-w-md space-y-4 pt-4 border-t border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[#A0AEC0]">
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
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 text-[#A0AEC0] rounded-lg text-sm font-medium hover:bg-white/10 transition-colors border border-white/10"
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
                className="w-full px-6 py-2.5 bg-white text-gray-900 rounded-lg text-sm font-semibold hover:bg-white/90 transition-all disabled:bg-white/20 disabled:text-gray-900/40 disabled:cursor-not-allowed"
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

export default PitchSlides;
