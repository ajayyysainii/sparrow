import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Bell,
  Settings,
  Calendar,
  Filter,
  TrendingUp,
  Phone,
  Users,
  Clock,
  MoreHorizontal,
  ChevronUp,
  ChevronDown,
  User,
  LogOut,
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
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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

  const recentCalls = useMemo(
    () => [
      {
        id: 1,
        caller: 'John Doe',
        duration: '15:32',
        sentiment: 'positive',
        date: '2024-01-15',
        status: 'completed',
      },
      {
        id: 2,
        caller: 'Jane Smith',
        duration: '08:45',
        sentiment: 'neutral',
        date: '2024-01-15',
        status: 'completed',
      },
      {
        id: 3,
        caller: 'Mike Johnson',
        duration: '22:18',
        sentiment: 'positive',
        date: '2024-01-14',
        status: 'completed',
      },
      {
        id: 4,
        caller: 'Sarah Wilson',
        duration: '12:05',
        sentiment: 'negative',
        date: '2024-01-14',
        status: 'completed',
      },
      {
        id: 5,
        caller: 'David Brown',
        duration: '30:42',
        sentiment: 'positive',
        date: '2024-01-13',
        status: 'completed',
      },
    ],
    []
  );

  const metrics = useMemo(
    () => [
      {
        title: 'Total Calls',
        value: '1,247',
        change: '+12.5%',
        trend: 'up',
        icon: Phone,
        color: 'text-white',
      },
      {
        title: 'Active Users',
        value: '892',
        change: '+8.2%',
        trend: 'up',
        icon: Users,
        color: 'text-green-400',
      },
      {
        title: 'Avg Call Duration',
        value: '18:32',
        change: '-3.1%',
        trend: 'down',
        icon: Clock,
        color: 'text-blue-400',
      },
      {
        title: 'Resolution Rate',
        value: '94%',
        change: '+5.3%',
        trend: 'up',
        icon: TrendingUp,
        color: 'text-white',
      },
    ],
    []
  );

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

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
            >
              <Calendar className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-[#A1A1AA] hover:text-white hover:bg-white/5"
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
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#EF4444]"></span>
            </Button>

            <Button className="bg-white hover:bg-white/90 text-gray-900">
              Share Report
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-10 w-10 rounded-full p-0"
                >
                  <Avatar className="h-10 w-10 border-2 border-[#3F3F46]">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-white text-gray-900">
                      {user ? getUserInitials(user.name) : 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 bg-[#2C2C2E] border-[#3F3F46]"
              >
                <div className="flex items-center gap-3 px-2 py-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-white text-gray-900">
                      {user ? getUserInitials(user.name) : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-white">
                      {user?.name || 'User'}
                    </span>
                    <span className="text-xs text-[#A1A1AA]">{user?.email}</span>
                  </div>
                </div>
                <DropdownMenuSeparator className="bg-[#3F3F46]" />
                <DropdownMenuItem className="text-[#A1A1AA] hover:text-white hover:bg-white/5 cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="text-[#A1A1AA] hover:text-white hover:bg-white/5 cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-[#3F3F46]" />
                <DropdownMenuItem
                  className="text-[#EF4444] hover:text-[#EF4444] hover:bg-[#EF4444]/10 cursor-pointer"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
                <Card className="border-[#3F3F46] bg-[#2C2C2E] hover:border-white/50 transition-all duration-200 cursor-pointer">
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
            <Card className="border-[#3F3F46] bg-[#2C2C2E]">
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
                        borderRadius: '8px',
                        color: 'white',
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
            <Card className="border-[#3F3F46] bg-[#2C2C2E]">
              <CardHeader>
                <CardTitle>Sentiment Analysis</CardTitle>
                <CardDescription className="text-[#A1A1AA]">
                  Weekly sentiment breakdown
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
                        borderRadius: '8px',
                        color: 'white',
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
          <Card className="border-[#3F3F46] bg-[#2C2C2E]">
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
                        Sentiment
                      </th>
                      <th className="text-left p-4 text-xs font-medium uppercase tracking-wide text-[#A1A1AA]">
                        Date
                      </th>
                      <th className="text-right p-4 text-xs font-medium uppercase tracking-wide text-[#A1A1AA]">
                        Actions
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
                        <td className="p-4">
                          <Badge
                            variant={
                              call.sentiment === 'positive'
                                ? 'default'
                                : call.sentiment === 'neutral'
                                  ? 'secondary'
                                  : 'destructive'
                            }
                            className={`${
                              call.sentiment === 'positive'
                                ? 'bg-[#22C55E]/20 text-[#22C55E] border-[#22C55E]/30'
                                : call.sentiment === 'neutral'
                                  ? 'bg-[#FBBF24]/20 text-[#FBBF24] border-[#FBBF24]/30'
                                  : 'bg-[#EF4444]/20 text-[#EF4444] border-[#EF4444]/30'
                            }`}
                          >
                            {call.sentiment.charAt(0).toUpperCase() +
                              call.sentiment.slice(1)}
                          </Badge>
                        </td>
                        <td className="p-4 text-[#A1A1AA]">{call.date}</td>
                        <td className="p-4 text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-[#A1A1AA] hover:text-white"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardPage;
