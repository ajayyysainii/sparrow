import React from 'react';
import { motion } from 'framer-motion';
import { Clock, ExternalLink, Play, Pause, X } from 'lucide-react';
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
        className="bg-pink-50 rounded-2xl shadow-lg overflow-hidden border border-pink-100"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-800">{title}</h2>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-white/60 px-3 py-1.5 rounded-full">
                <span className="text-lg">🔥</span>
                <span className="text-sm font-semibold text-gray-800">
                  {stats.streak}
                </span>
              </div>
              <div className="flex items-center gap-1 bg-white/60 px-3 py-1.5 rounded-full">
                <span className="text-sm font-semibold text-gray-800">
                  {stats.totalPoints} pts
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md border border-pink-100">
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-xl font-bold text-gray-800 flex-1">
                {title}
              </h3>
              <div className="flex items-center gap-1 text-sm text-gray-600 bg-pink-50 px-2 py-1 rounded-full ml-2">
                <Clock className="h-3 w-3" />
                <span>4 mins</span>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-4">{description}</p>

            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              className="text-sm text-pink-600 hover:text-pink-700 font-medium mb-4 flex items-center gap-1 w-fit"
            >
              Learn More
              <ExternalLink className="h-3 w-3" />
            </a>

            {activeTimer ? (
              <div className="mt-6 pt-4 border-t border-pink-100">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-full">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        Time Remaining
                      </span>
                      <span className="text-2xl font-bold text-pink-600">
                        {formatTime(activeTimer.timeRemaining)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <motion.div
                        className="bg-pink-600 h-2 rounded-full"
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
                  </div>

                  <div className="flex items-center gap-2 w-full">
                    {activeTimer.isPaused ? (
                      <button
                        onClick={resumeTimer}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                      >
                        <Play className="h-4 w-4" />
                        Resume
                      </button>
                    ) : (
                      <button
                        onClick={pauseTimer}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg text-sm font-medium hover:bg-yellow-600 transition-colors"
                      >
                        <Pause className="h-4 w-4" />
                        Pause
                      </button>
                    )}
                    <button
                      onClick={cancelTimer}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-400 transition-colors"
                    >
                      <X className="h-4 w-4" />
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={handleStart}
                disabled={loading}
                className="mt-6 w-full px-4 py-2 bg-pink-600 text-white rounded-lg text-sm font-medium hover:bg-pink-700 shadow-md hover:shadow-lg transition-all disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                Start Exercise
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PitchSlides;

