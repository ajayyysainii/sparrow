import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Clock, ExternalLink, Play, Pause, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { Toast } from './ui/toast';

interface Exercise {
  id: string;
  title: string;
  duration: string;
  durationSeconds: number; // Duration in seconds
  description: string;
}

interface UserStats {
  streak: number;
  totalPoints: number;
  lastCompletedDate: string | null;
}

const exercises: Exercise[] = [
  {
    id: 'diaphragmatic',
    title: 'Diaphragmatic Breathing',
    duration: '1 mins',
    durationSeconds: 10, 
    description: 'Lie down, place hand on belly, breathe deeply',
  },
  {
    id: 'square',
    title: 'Square Breathing',
    duration: '3 mins',
    durationSeconds: 10, // 3 minutes = 180 seconds
    description: 'Inhale 4s, hold 4s, exhale 4s, hold 4s',
  },
  {
    id: 'sustained',
    title: 'Sustained Breath',
    duration: '4 mins',
    durationSeconds: 10, // 4 minutes = 240 seconds
    description: "Take deep breath, sustain 'ah' sound as long as possible",
  },
];

const BreathingExercises: React.FC = () => {
  const { user, token } = useAuth();
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [stats, setStats] = useState<UserStats>({
    streak: 0,
    totalPoints: 0,
    lastCompletedDate: null,
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    type?: 'success' | 'info';
  }>({ visible: false, message: '' });
  
  // Timer state
  const [activeTimer, setActiveTimer] = useState<{
    exerciseId: string;
    timeRemaining: number;
    totalDuration: number;
    isPaused: boolean;
  } | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch user stats on component mount
  useEffect(() => {
    if (user && token) {
      fetchStats();
    }
  }, [user, token]);

  // Function to complete exercise after timer
  const handleExerciseCompleteAfterTimer = useCallback(async (exerciseId: string) => {
    if (!token) return;

    setLoading(true);
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/stats/complete-exercise`,
        {},
        { headers }
      );

      // Update local stats
      setStats({
        streak: response.data.streak,
        totalPoints: response.data.totalPoints,
        lastCompletedDate: response.data.lastCompletedDate,
      });

      // Show toast notification
      if (response.data.message === 'Exercise already completed today') {
        setToast({
          visible: true,
          message: 'Exercise already completed today! Try again tomorrow 🔥',
          type: 'info',
        });
      } else if (response.data.streakRestarted) {
        setToast({
          visible: true,
          message: 'Streak restarted 💪',
          type: 'info',
        });
      } else {
        setToast({
          visible: true,
          message: `+10 points earned! Streak continued 🔥`,
          type: 'success',
        });
      }

      // Reset selected exercise and timer
      setSelectedExercise(null);
      setActiveTimer(null);
    } catch (error: any) {
      console.error('Error completing exercise:', error);
      setToast({
        visible: true,
        message: error.response?.data?.message || 'Failed to complete exercise',
        type: 'info',
      });
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Timer effect
  useEffect(() => {
    if (activeTimer && !activeTimer.isPaused && activeTimer.timeRemaining > 0) {
      timerIntervalRef.current = setInterval(() => {
        setActiveTimer((prev) => {
          if (!prev) return null;
          
          if (prev.timeRemaining <= 1) {
            // Timer finished - complete the exercise
            clearInterval(timerIntervalRef.current!);
            handleExerciseCompleteAfterTimer(prev.exerciseId);
            return null;
          }
          
          return {
            ...prev,
            timeRemaining: prev.timeRemaining - 1,
          };
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [activeTimer, handleExerciseCompleteAfterTimer]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startTimer = (exerciseId: string) => {
    const exercise = exercises.find((e) => e.id === exerciseId);
    if (!exercise) return;

    setActiveTimer({
      exerciseId,
      timeRemaining: exercise.durationSeconds,
      totalDuration: exercise.durationSeconds,
      isPaused: false,
    });
  };

  const pauseTimer = () => {
    if (activeTimer) {
      setActiveTimer({ ...activeTimer, isPaused: true });
    }
  };

  const resumeTimer = () => {
    if (activeTimer) {
      setActiveTimer({ ...activeTimer, isPaused: false });
    }
  };

  const cancelTimer = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    setActiveTimer(null);
    setSelectedExercise(null);
  };

  const fetchStats = async () => {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/stats`,
        { headers }
      );

      setStats({
        streak: response.data.streak || 0,
        totalPoints: response.data.totalPoints || 0,
        lastCompletedDate: response.data.lastCompletedDate || null,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleStartExercise = (exerciseId: string) => {
    startTimer(exerciseId);
  };

  const closeToast = () => {
    setToast({ visible: false, message: '' });
  };

  return (
    <div className="w-full">
      {/* Toast Notification */}
      <Toast
        message={toast.message}
        isVisible={toast.visible}
        onClose={closeToast}
        type={toast.type || 'success'}
      />

      {/* Collapsible Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-pink-50 rounded-2xl shadow-lg overflow-hidden border border-pink-100"
      >
        {/* Header */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between p-6 bg-pink-50 hover:bg-pink-100 transition-colors"
        >
          <h2 className="text-2xl font-bold text-gray-800">
            Breathing Exercises
          </h2>
          <div className="flex items-center gap-4">
            {/* Streak and Points Display */}
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
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              {isExpanded ? (
                <ChevronUp className="h-6 w-6 text-gray-600" />
              ) : (
                <ChevronDown className="h-6 w-6 text-gray-600" />
              )}
            </motion.div>
          </div>
        </button>

        {/* Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="p-6 pt-0">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {exercises.map((exercise, index) => (
                    <motion.div
                      key={exercise.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                      className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-pink-100"
                    >
                      {/* Exercise Card */}
                      <div className="flex flex-col h-full">
                        {/* Title and Duration */}
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-lg font-bold text-gray-800 flex-1">
                            {exercise.title}
                          </h3>
                          <div className="flex items-center gap-1 text-sm text-gray-600 bg-pink-50 px-2 py-1 rounded-full ml-2">
                            <Clock className="h-3 w-3" />
                            <span>{exercise.duration}</span>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-sm text-gray-600 mb-4 flex-grow">
                          {exercise.description}
                        </p>

                        {/* Learn More Link */}
                        <a
                          href="#"
                          onClick={(e) => e.preventDefault()}
                          className="text-sm text-pink-600 hover:text-pink-700 font-medium mb-4 flex items-center gap-1 w-fit"
                        >
                          Learn More
                          <ExternalLink className="h-3 w-3" />
                        </a>

                        {/* Timer Display or Radio Button and Start Button */}
                        {activeTimer && activeTimer.exerciseId === exercise.id ? (
                          <div className="mt-auto pt-4 border-t border-pink-100">
                            <div className="flex flex-col items-center gap-4">
                              {/* Timer Display */}
                              <div className="w-full">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-medium text-gray-700">
                                    Time Remaining
                                  </span>
                                  <span className="text-2xl font-bold text-pink-600">
                                    {formatTime(activeTimer.timeRemaining)}
                                  </span>
                                </div>
                                
                                {/* Progress Bar */}
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

                              {/* Timer Controls */}
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
                          <div className="flex items-center justify-between mt-auto pt-4 border-t border-pink-100">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name="exercise"
                                checked={selectedExercise === exercise.id}
                                onChange={() => setSelectedExercise(exercise.id)}
                                disabled={activeTimer !== null}
                                className="w-5 h-5 text-pink-600 focus:ring-pink-500 focus:ring-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                              />
                              <span className="text-sm text-gray-700">
                                Select
                              </span>
                            </label>

                            <button
                              onClick={() => handleStartExercise(exercise.id)}
                              disabled={
                                activeTimer !== null ||
                                selectedExercise !== exercise.id ||
                                !token
                              }
                              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                selectedExercise === exercise.id &&
                                !activeTimer &&
                                token
                                  ? 'bg-pink-600 text-white hover:bg-pink-700 shadow-md hover:shadow-lg'
                                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                              }`}
                            >
                              Start
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default BreathingExercises;

