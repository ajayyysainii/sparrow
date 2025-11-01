import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth as useAuthContext } from '../contexts/AuthContext';
import axios from 'axios';

interface UserStats {
  streak: number;
  totalPoints: number;
  lastCompletedDate: string | null;
  completedExercisesToday?: string[];
  totalExercises?: number;
}

interface ToastState {
  visible: boolean;
  message: string;
  type?: 'success' | 'info';
}

export const useBreathingExercise = () => {
  const { token } = useAuthContext();
  const [stats, setStats] = useState<UserStats>({
    streak: 0,
    totalPoints: 0,
    lastCompletedDate: null,
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<ToastState>({ visible: false, message: '' });
  const [activeTimer, setActiveTimer] = useState<{
    exerciseId: string;
    timeRemaining: number;
    totalDuration: number;
    isPaused: boolean;
  } | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchStats = useCallback(async () => {
    if (!token) return;
    
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      };

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/stats`,
        { headers }
      );

      setStats({
        streak: response.data.streak || 0,
        totalPoints: response.data.totalPoints || 0,
        lastCompletedDate: response.data.lastCompletedDate || null,
        completedExercisesToday: response.data.completedExercisesToday || [],
        totalExercises: response.data.totalExercises || 9,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchStats();
    }
  }, [token, fetchStats]);

  const handleExerciseCompleteAfterTimer = useCallback(async (exerciseId: string) => {
    if (!token) return;

    setLoading(true);
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      };

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/stats/complete-exercise`,
        { exerciseId },
        { headers }
      );

      setStats({
        streak: response.data.streak,
        totalPoints: response.data.totalPoints,
        lastCompletedDate: response.data.lastCompletedDate,
        completedExercisesToday: response.data.completedExercisesToday || [],
        totalExercises: response.data.totalExercises || 9,
      });

      if (response.data.message === 'Exercise already completed today') {
        setToast({
          visible: true,
          message: 'Exercise already completed today! 🔥',
          type: 'info',
        });
      } else if (response.data.message === 'All exercises already completed today') {
        setToast({
          visible: true,
          message: 'All exercises already completed today! 🔥',
          type: 'info',
        });
      } else if (response.data.allCompleted) {
        // All exercises completed - award points and streak
        if (response.data.streakRestarted) {
          setToast({
            visible: true,
            message: '💪 Streak restarted! All exercises completed.',
            type: 'info',
          });
        } else {
          setToast({
            visible: true,
            message: `✅ +10 points earned! Streak continued 🔥`,
            type: 'success',
          });
        }
      } else {
        // Exercise completed but not all exercises done yet
        const completed = response.data.completedExercisesToday?.length || 0;
        const total = response.data.totalExercises || 9;
        setToast({
          visible: true,
          message: `Exercise completed! ${completed}/${total} exercises done. Complete all to earn points! 🔥`,
          type: 'info',
        });
      }

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

  const startTimer = useCallback((exerciseId: string, durationSeconds: number) => {
    setActiveTimer({
      exerciseId,
      timeRemaining: durationSeconds,
      totalDuration: durationSeconds,
      isPaused: false,
    });
  }, []);

  const pauseTimer = useCallback(() => {
    if (activeTimer) {
      setActiveTimer({ ...activeTimer, isPaused: true });
    }
  }, [activeTimer]);

  const resumeTimer = useCallback(() => {
    if (activeTimer) {
      setActiveTimer({ ...activeTimer, isPaused: false });
    }
  }, [activeTimer]);

  const cancelTimer = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    setActiveTimer(null);
  }, []);

  const closeToast = useCallback(() => {
    setToast({ visible: false, message: '' });
  }, []);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return {
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
    fetchStats,
  };
};

