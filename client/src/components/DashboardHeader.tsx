import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { Flame, Star, Coins, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DashboardHeader: React.FC = () => {
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [stats, setStats] = useState<{ streak: number; totalPoints: number } | null>(null);

  // Fetch stats data from API
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const response = await axios.get(`${import.meta.env.VITE_API_URL}/stats`, {
          headers,
        });

        setStats({
          streak: response.data.streak || 0,
          totalPoints: response.data.totalPoints || 0,
        });
      } catch (err: any) {
        console.error('Error fetching stats:', err);
        // Set default values on error
        setStats({ streak: 0, totalPoints: 0 });
      }
    };

    if (token) {
      fetchStats();
    }
  }, [token]);

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 border-b border-white/5 bg-[#1C1C1E]/70 backdrop-blur-2xl"
      style={{
        WebkitBackdropFilter: 'blur(30px) saturate(180%)',
        backdropFilter: 'blur(30px) saturate(180%)',
      }}
    >
      <div className="flex h-14 items-center justify-end px-6">
        {/* Search and Filters */}
    
          

        {/* Points, Streaks, and Credits Display */}
        <div className="flex items-center gap-3">
          {/* Credits */}
          <div 
            onClick={() => !user?.isPremium && navigate('/dashboard/upgrade')}
            className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-[#2C2C2E]/40 border border-white/10 hover:bg-[#2C2C2E]/60 hover:border-[#6366f1]/40 transition-all duration-300 group ${!user?.isPremium ? 'cursor-pointer' : 'cursor-default'}`}
          >
            <div className="relative">
              {user?.isPremium ? (
                <Crown className="h-4 w-4 text-[#FFD700] group-hover:scale-110 transition-transform duration-300" />
              ) : (
                <Coins className="h-4 w-4 text-[#6366f1] group-hover:scale-110 transition-transform duration-300" />
              )}
            </div>
            <div className="flex flex-col items-start">
              <span className="text-[10px] font-medium text-[#8E8E93] leading-none uppercase tracking-wider">
                {user?.isPremium ? 'Premium' : 'Credits'}
              </span>
              <span className="text-[15px] font-semibold text-white leading-tight mt-0.5 tracking-tight">
                {user?.isPremium ? '∞' : (user?.credits?.toString() || '0')}
              </span>
            </div>
          </div>

          {/* Streak */}
          <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-[#2C2C2E]/40 border border-white/10 hover:bg-[#2C2C2E]/60 hover:border-[#FF6B35]/40 transition-all duration-300 group cursor-default">
            <div className="relative">
              <Flame className="h-4 w-4 text-[#FF6B35] group-hover:scale-110 transition-transform duration-300" />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-[10px] font-medium text-[#8E8E93] leading-none uppercase tracking-wider">Streak</span>
              <span className="text-[15px] font-semibold text-white leading-tight mt-0.5 tracking-tight">
                {stats?.streak?.toString() || '0'}
              </span>
            </div>
          </div>

          {/* Points */}
          <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-[#2C2C2E]/40 border border-white/10 hover:bg-[#2C2C2E]/60 hover:border-[#FFD700]/40 transition-all duration-300 group cursor-default">
            <div className="relative">
              <Star className="h-4 w-4 text-[#FFD700] group-hover:scale-110 transition-transform duration-300 fill-[#FFD700]/20 group-hover:fill-[#FFD700]/40" />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-[10px] font-medium text-[#8E8E93] leading-none uppercase tracking-wider">Points</span>
              <span className="text-[15px] font-semibold text-white leading-tight mt-0.5 tracking-tight">
                {stats?.totalPoints?.toString() || '0'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DashboardHeader;

