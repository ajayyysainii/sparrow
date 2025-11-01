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
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Search,
  Bell,
  Calendar,
  Filter,
  TrendingUp,
  ChevronUp,
  ChevronDown,
  User,
  LogOut,
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
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const DashboardPage: React.FC = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [calls, setCalls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<{ streak: number; totalPoints: number } | null>(null);
  const [totalCost, setTotalCost] = useState<number>(0);

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

  // Mock data for charts and metrics
  const callData = useMemo(
    () => [
      { name: 'Mon', calls: 12, duration: 45 },
      { name: 'Tue', calls: 19, duration: 62 },
      { name: 'Wed', calls: 15, duration: 52 },
      { name: 'Thu', calls: 24, duration: 78 },
      { name: 'Fri', calls: 18, duration: 58 },
      { name: 'Sat', calls: 8, duration: 32 },
      { name: 'Sun', calls: 5, duration: 21 },
    ],
    []
  );

  const sentimentData = useMemo(
    () => [
      { name: 'Week 1', positive: 65, neutral: 25, negative: 10 },
      { name: 'Week 2', positive: 72, neutral: 18, negative: 10 },
      { name: 'Week 3', positive: 68, neutral: 22, negative: 10 },
      { name: 'Week 4', positive: 75, neutral: 15, negative: 10 },
    ],
    []
  );

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
      {
        title: 'Resolution Rate',
        value: '94%',
        change: '+5.3%',
        trend: 'up' as const,
        icon: TrendingUp,
        color: 'text-white',
        decreaseIsGood: false, // Increase is good
      },
    ],
    [stats, totalCost]
  );



  return (
    <div className="min-h-screen bg-[#1C1C1E] text-white">
      {/* Top Navigation Bar */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-50 border-b border-[#3F3F46] bg-[#2C2C2E]/95 backdrop-blur-sm"
      >
        <div className="flex h-16 items-center justify-between px-6">
          {/* Search and Filters */}
          <div className="flex items-center gap-4 flex-1 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A1A1AA]" />
              <Input
                placeholder="Search calls, users, reports..."
                className="pl-10 bg-[#1C1C1E] border-[#3F3F46] text-white placeholder:text-[#A1A1AA] focus:border-white focus:ring-white"
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:inline-flex h-6 items-center gap-1 rounded border border-[#3F3F46] bg-[#2C2C2E] px-2 font-mono text-[10px] text-[#A1A1AA]">
                ⌘K
              </kbd>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-[#A1A1AA] hover:text-white hover:bg-white/5"
              title="Filter by date"
            >
              <Calendar className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-[#A1A1AA] hover:text-white hover:bg-white/5"
              title="Filter options"
            >
              <Filter className="h-5 w-5" />
            </Button>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="relative text-[#A1A1AA] hover:text-white hover:bg-white/5"
              title="Notifications"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#EF4444]"></span>
            </Button>

            <Button className="bg-white hover:bg-white/90 text-gray-900">
              Share Report
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-[1400px] mx-auto p-6 space-y-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-[#A1A1AA]">
            Welcome back! Here's what's happening with your calls today.
          </p>
        </motion.div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                <Card className="border-[#3F3F46] bg-[#2C2C2E] hover:border-white/50 hover:shadow-lg hover:shadow-white/10 transition-all duration-200 cursor-pointer">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-[#A1A1AA] uppercase tracking-wide">
                      {metric.title}
                    </CardTitle>
                    <Icon className={`h-4 w-4 ${metric.color}`} />
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-baseline gap-2">
                      <CardTitle className="text-3xl font-bold">
                        {metric.value}
                      </CardTitle>
                      {metric.change && (
                        <div
                          className={`flex items-center gap-1 text-sm font-medium ${
                            metric.trend === 'up'
                              ? 'text-[#22C55E]'
                              : 'text-[#EF4444]'
                          }`}
                        >
                          {metric.trend === 'up' ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Call Volume Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.01 }}
          >
            <Card className="border-[#3F3F46] bg-[#2C2C2E] hover:border-white/50 hover:shadow-lg hover:shadow-white/10 transition-all duration-200">
              <CardHeader>
                <CardTitle>Call Volume</CardTitle>
                <CardDescription className="text-[#A1A1AA]">
                  Calls and duration over the past week
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={callData}>
                    <defs>
                      <linearGradient
                        id="colorCalls"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#FFFFFF"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#FFFFFF"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#3F3F46"
                      opacity={0.5}
                    />
                    <XAxis
                      dataKey="name"
                      stroke="#A1A1AA"
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis stroke="#A1A1AA" style={{ fontSize: '12px' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#2C2C2E',
                        border: '1px solid #3F3F46',
                        borderRadius: '4px',
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
                        color: '#A1A1AA',
                        fontSize: '11px',
                        marginBottom: '4px',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="calls"
                      stroke="#FFFFFF"
                      strokeWidth={2}
                      fill="url(#colorCalls)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Sentiment Analysis Chart */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            whileHover={{ scale: 1.01 }}
          >
            <Card className="border-[#3F3F46] bg-[#2C2C2E] hover:border-white/50 hover:shadow-lg hover:shadow-white/10 transition-all duration-200">
              <CardHeader>
                <CardTitle>Cost Analysis</CardTitle>
                <CardDescription className="text-[#A1A1AA]">
                  Weekly cost breakdown
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={sentimentData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#3F3F46"
                      opacity={0.5}
                    />
                    <XAxis
                      dataKey="name"
                      stroke="#A1A1AA"
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis stroke="#A1A1AA" style={{ fontSize: '12px' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#2C2C2E',
                        border: '1px solid #3F3F46',
                        borderRadius: '4px',
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
                        color: '#A1A1AA',
                        fontSize: '11px',
                        marginBottom: '4px',
                      }}
                    />
                    <Legend />
                    <Bar dataKey="positive" fill="#22C55E" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="neutral" fill="#FBBF24" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="negative" fill="#EF4444" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
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
          <Card className="border-[#3F3F46] bg-[#2C2C2E] hover:border-white/50 hover:shadow-lg hover:shadow-white/10 transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Calls</CardTitle>
                <CardDescription className="text-[#A1A1AA]">
                  Latest 5 calls from your history
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-[#A1A1AA] hover:text-white"
                onClick={() => navigate('/dashboard/call/list')}
              >
                View All
              </Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-[#A1A1AA]">Loading calls...</div>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-red-500">{error}</div>
                </div>
              ) : recentCalls.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-[#A1A1AA]">No calls found</div>
                </div>
              ) : (
                <div className="overflow-hidden rounded-lg">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#3F3F46]">
                        <th className="text-left p-4 text-xs font-medium uppercase tracking-wide text-[#A1A1AA]">
                          Caller
                        </th>
                        <th className="text-left p-4 text-xs font-medium uppercase tracking-wide text-[#A1A1AA]">
                          Duration
                        </th>
                        <th className="text-left p-4 text-xs font-medium uppercase tracking-wide text-[#A1A1AA]">
                          Cost
                        </th>
                        <th className="text-left p-4 text-xs font-medium uppercase tracking-wide text-[#A1A1AA]">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentCalls.map((call) => (
                        <tr
                          key={call.id}
                          className="border-b border-[#3F3F46] hover:bg-white/5 transition-colors"
                        >
                          <td className="p-4 font-medium">{call.caller}</td>
                          <td className="p-4 text-[#A1A1AA]">{call.duration}</td>
                          <td className="p-4 text-[#A1A1AA]">${call.cost.toFixed(2)}</td>
                          <td className="p-4 text-[#A1A1AA]">{call.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardPage;
