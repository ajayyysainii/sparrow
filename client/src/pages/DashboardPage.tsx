import React, { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  TrendingUp,
  ChevronUp,
  ChevronDown,
  Flame,
  Star,
  DollarSign,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
} from 'recharts';

const DashboardPage: React.FC = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [calls, setCalls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<{ streak: number; totalPoints: number } | null>(null);
  const [totalCost, setTotalCost] = useState<number>(0);
  const [dashboardStats, setDashboardStats] = useState<{
    recentReports: any[];
    latestReport: any;
    averages: { avgJitter: number; avgShimmer: number; mfccMean: number[]; mfccStd: number[] };
    weeklyData: Array<{ date: string; jitter: number; shimmer: number }>;
    predictionDistribution: Record<string, number>;
    exerciseProgress: { completed: number; total: number };
  } | null>(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);

  // Fetch real call data from API
  useEffect(() => {
    const fetchCalls = async () => {
      try {
        setLoading(true);
        setError(null);

        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const response = await axios.get(`${import.meta.env.VITE_API_URL}/call/call-list`, {
          headers,
        });

        setCalls(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch calls');
        console.error('Error fetching calls:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCalls();
  }, [token]);

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

  // Fetch total cost from API
  useEffect(() => {
    const fetchTotalCost = async () => {
      try {
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const response = await axios.get(`${import.meta.env.VITE_API_URL}/call/total-cost`, {
          headers,
        });

        setTotalCost(parseFloat(response.data.totalCost) || 0);
      } catch (err: any) {
        console.error('Error fetching total cost:', err);
        // Set default value on error
        setTotalCost(0);
      }
    };

    if (token) {
      fetchTotalCost();
    }
  }, [token]);

  // Fetch dashboard stats from API
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setDashboardLoading(true);
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const response = await axios.get(`${import.meta.env.VITE_API_URL}/stats/dashboard`, {
          headers,
        });

        if (response.data.success && response.data.data) {
          setDashboardStats(response.data.data);
        }
      } catch (err: any) {
        console.error('Error fetching dashboard stats:', err);
        // Set default values on error
        setDashboardStats({
          recentReports: [],
          latestReport: null,
          averages: { avgJitter: 0, avgShimmer: 0, mfccMean: [], mfccStd: [] },
          weeklyData: [],
          predictionDistribution: {},
          exerciseProgress: { completed: 0, total: 9 },
        });
      } finally {
        setDashboardLoading(false);
      }
    };

    if (token) {
      fetchDashboardStats();
    }
  }, [token]);

  // Process real calls for table display (top 5 most recent)
  const recentCalls = useMemo(() => {
    return calls
      .slice(0, 5)
      .map((call, index) => ({
        id: call.callid || call._id || index,
        caller: `Call ${index + 1}`,
        duration: call.duration 
          ? `${Math.floor(call.duration / 60)}:${String(Math.floor(call.duration % 60)).padStart(2, '0')}`
          : 'N/A',
        sentiment: 'positive', // TODO: Get from report if available
        date: call.time ? new Date(call.time).toLocaleDateString() : 'N/A',
        status: 'completed',
        cost: call.cost || undefined,
      }));
  }, [calls]);

  // Process weekly data for line chart (Voice Health Metrics)
  const weeklyData = useMemo(() => {
    if (!dashboardStats?.weeklyData || dashboardStats.weeklyData.length === 0) {
      return [];
    }
    return dashboardStats.weeklyData.map((entry) => {
      // Handle date parsing - entry.date is in "YYYY-MM-DD" format
      let formattedDate = entry.date;
      try {
        const date = new Date(entry.date + 'T00:00:00'); // Add time to avoid timezone issues
        if (!isNaN(date.getTime())) {
          formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
      } catch (e) {
        // Keep original date if parsing fails
      }
      
      return {
        date: formattedDate,
        jitter: entry.jitter ? Number(entry.jitter.toFixed(4)) : 0,
        shimmer: entry.shimmer ? Number(entry.shimmer.toFixed(4)) : 0,
      };
    });
  }, [dashboardStats]);

  // Process prediction distribution for pie chart
  const predictionData = useMemo(() => {
    if (!dashboardStats?.predictionDistribution) {
      return [];
    }
    const colors = {
      Healthy: '#2D9D7A',
      Laryngitis: '#FBBF24',
      Vocal_Polyp: '#F56565',
    };
    
    return Object.entries(dashboardStats.predictionDistribution).map(([name, value]) => ({
      name,
      value: Number(value),
      color: colors[name as keyof typeof colors] || '#AAAAAA',
    }));
  }, [dashboardStats]);

  const metrics = useMemo(
    () => [
      {
        title: 'Streak',
        value: stats?.streak?.toString() || '0',
        change: '+0',
        trend: 'up' as const,
        icon: Flame,
        color: 'text-orange-400',
      },
      {
        title: 'Points',
        value: stats?.totalPoints?.toString() || '0',
        change: '+0',
        trend: 'up' as const,
        icon: Star,
        color: 'text-yellow-400',
      },
      {
        title: 'Total Cost',
        value: `$${totalCost.toFixed(2)}`,
        change: '',
        trend: 'up' as const,
        icon: DollarSign,
        color: 'text-green-400',
        decreaseIsGood: false, // Increase is good
      },
    ],
    [stats, totalCost]
  );



  return (
    <div className="min-h-screen bg-[#1C1C1E] text-white">
      {/* Main Content */}
      <div className="max-w-[1400px] mx-auto p-4 md:p-6 space-y-6 md:space-y-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-sm md:text-base text-[#AAAAAA]">
            Welcome back! Here's what's happening with your calls today.
          </p>
        </motion.div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <motion.div
                key={metric.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="group"
              >
                <Card className="border-[#27272A] bg-[#27272A] hover:border-white/50 hover:shadow-lg hover:shadow-white/10 transition-all duration-200 cursor-pointer">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xs md:text-sm font-medium text-[#AAAAAA] uppercase tracking-wide">
                      {metric.title}
                    </CardTitle>
                    <Icon className={`h-3.5 w-3.5 md:h-4 md:w-4 ${metric.color}`} />
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-baseline gap-2">
                      <CardTitle className="text-2xl md:text-3xl font-bold text-white">
                        {metric.value}
                      </CardTitle>
                      {metric.change && (
                        <div
                          className={`flex items-center gap-1 text-xs md:text-sm font-medium ${
                            metric.trend === 'up'
                              ? 'text-[#48BB78]'
                              : 'text-[#F56565]'
                          }`}
                        >
                          {metric.trend === 'up' ? (
                            <ChevronUp className="h-3 w-3 md:h-4 md:w-4" />
                          ) : (
                            <ChevronDown className="h-3 w-3 md:h-4 md:w-4" />
                          )}
                          {metric.change}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Voice Health Metrics Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.01 }}
          >
            <Card className="border-[#27272A] bg-[#27272A] hover:border-white/50 hover:shadow-lg hover:shadow-white/10 transition-all duration-200">
              <CardHeader>
                <CardTitle className="text-base md:text-lg">Voice Health Metrics</CardTitle>
                <CardDescription className="text-xs md:text-sm text-[#AAAAAA]">
                  Jitter and Shimmer over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                {dashboardLoading ? (
                  <div className="flex items-center justify-center h-[250px] md:h-[300px]">
                    <div className="text-xs md:text-sm text-[#AAAAAA]">Loading chart data...</div>
                  </div>
                ) : weeklyData.length === 0 ? (
                  <div className="flex items-center justify-center h-[250px] md:h-[300px]">
                    <div className="text-xs md:text-sm text-[#AAAAAA]">No data available</div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={weeklyData}>
                      <defs>
                        <linearGradient
                          id="colorJitter"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#2D9D7A"
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor="#2D9D7A"
                            stopOpacity={0}
                          />
                        </linearGradient>
                        <linearGradient
                          id="colorShimmer"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#FBBF24"
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor="#FBBF24"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#3F3F46"
                        opacity={0.8}
                      />
                      <XAxis
                        dataKey="date"
                        stroke="#AAAAAA"
                        style={{ fontSize: '12px' }}
                      />
                      <YAxis stroke="#AAAAAA" style={{ fontSize: '12px' }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#27272A',
                          border: '1px solid #27272A',
                          borderRadius: '8px',
                          color: 'white',
                          padding: '6px 10px',
                          fontSize: '12px',
                        }}
                        itemStyle={{
                          color: 'white',
                          padding: '2px 0',
                          fontSize: '12px',
                        }}
                        labelStyle={{
                          color: '#AAAAAA',
                          fontSize: '11px',
                          marginBottom: '4px',
                        }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="jitter"
                        stroke="#2D9D7A"
                        strokeWidth={2}
                        fill="url(#colorJitter)"
                        name="Jitter"
                      />
                      <Line
                        type="monotone"
                        dataKey="shimmer"
                        stroke="#FBBF24"
                        strokeWidth={2}
                        fill="url(#colorShimmer)"
                        name="Shimmer"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Prediction Distribution Chart */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            whileHover={{ scale: 1.01 }}
          >
            <Card className="border-[#27272A] bg-[#27272A] hover:border-white/50 hover:shadow-lg hover:shadow-white/10 transition-all duration-200">
              <CardHeader>
                <CardTitle className="text-base md:text-lg">Prediction Distribution</CardTitle>
                <CardDescription className="text-xs md:text-sm text-[#AAAAAA]">
                  Voice health predictions breakdown
                </CardDescription>
              </CardHeader>
              <CardContent>
                {dashboardLoading ? (
                  <div className="flex items-center justify-center h-[250px] md:h-[300px]">
                    <div className="text-xs md:text-sm text-[#AAAAAA]">Loading chart data...</div>
                  </div>
                ) : predictionData.length === 0 ? (
                  <div className="flex items-center justify-center h-[250px] md:h-[300px]">
                    <div className="text-xs md:text-sm text-[#AAAAAA]">No prediction data available</div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={predictionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {predictionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#27272A',
                          border: '1px solid #27272A',
                          borderRadius: '8px',
                          color: 'white',
                          padding: '6px 10px',
                          fontSize: '12px',
                        }}
                        itemStyle={{
                          color: 'white',
                          padding: '2px 0',
                          fontSize: '12px',
                        }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Recent Calls Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-lg md:text-xl font-semibold text-white">Recent Calls</h2>
                <p className="text-xs md:text-sm text-[#AAAAAA] mt-1">
                  Latest 5 calls from your history
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-[#AAAAAA] hover:text-white"
                onClick={() => navigate('/dashboard/call/list')}
              >
                View All
              </Button>
            </div>
            <div className="overflow-x-auto">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-[#AAAAAA]">Loading calls...</div>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-red-500">{error}</div>
                </div>
              ) : recentCalls.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-[#AAAAAA]">No calls found</div>
                </div>
              ) : (
                <div className="overflow-hidden rounded-lg min-w-full">
                  <table className="w-full min-w-[600px]">
                    <thead>
                      <tr className="border-b border-[#3F3F46]">
                        <th className="text-left p-3 md:p-4 text-xs font-medium uppercase tracking-wide text-[#AAAAAA]">
                          Caller
                        </th>
                        <th className="text-left p-3 md:p-4 text-xs font-medium uppercase tracking-wide text-[#AAAAAA]">
                          Duration
                        </th>
                        <th className="text-left p-3 md:p-4 text-xs font-medium uppercase tracking-wide text-[#AAAAAA]">
                          Cost
                        </th>
                        <th className="text-left p-3 md:p-4 text-xs font-medium uppercase tracking-wide text-[#AAAAAA]">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentCalls.map((call) => (
                        <tr
                          key={call.id}
                          className="border-b border-[#27272A] hover:bg-white/5 transition-colors"
                        >
                          <td className="p-3 md:p-4 text-sm md:text-base font-medium text-[#E0E0E0]">{call.caller}</td>
                          <td className="p-3 md:p-4 text-sm md:text-base text-[#AAAAAA]">{call.duration}</td>
                          <td className="p-3 md:p-4 text-sm md:text-base text-[#AAAAAA]">${call.cost.toFixed(2)}</td>
                          <td className="p-3 md:p-4 text-sm md:text-base text-[#AAAAAA]">{call.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardPage;
