import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarFooter, 
  SidebarHeader,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Home, 
  Phone, 
  List, 
  LogOut, 
  Sparkles
} from 'lucide-react';

const AppSidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!isAuthenticated) {
    return null;
  }

  const navItems = [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: Home,
    },
    {
      title: 'Call with AI',
      href: '/dashboard/call',
      icon: Phone,
    },
    {
      title: 'Call History',
      href: '/dashboard/call/list',
      icon: List,
    },
    {
      title: 'Upgrade to Pro',
      href: '/dashboard/upgrade',
      icon: Sparkles,
    },
  ];

  return (
    <Sidebar className="border-r border-[#3F3F46] bg-[#2C2C2E]">
      <SidebarHeader className="border-b border-[#3F3F46] flex items-center justify-center">
        <Link 
          to="/dashboard" 
          className="flex items-center gap-3 text-xl font-bold text-white no-underline hover:opacity-80 transition-opacity"
        >
          <span>Sparrow</span>
        </Link>
      </SidebarHeader>
      
      <SidebarContent className="px-3 py-4">
        <nav className="space-y-1">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            
            return (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  to={item.href}
                  className="block"
                >
                  <Button
                    variant="ghost"
                    className={`w-full justify-start gap-3 px-3 py-2.5 font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-white text-gray-900 shadow-lg shadow-white/20'
                        : 'text-[#A1A1AA] hover:bg-white/5'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.title}</span>
                  </Button>
                </Link>
              </motion.div>
            );
          })}
        </nav>
      </SidebarContent>
      
      <SidebarFooter className="border-t border-[#3F3F46] px-3 py-4">
        {/* User Block - Profile and Logout grouped together */}
        <div className="space-y-2">
          {user && (
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-900 text-xs font-semibold shrink-0">
                {user.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user.name}
                </p>
                <p className="text-xs text-[#A1A1AA] truncate">{user.email}</p>
              </div>
            </div>
          )}
          
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 px-3 py-2.5 text-[#A1A1AA] hover:bg-white/5 transition-colors"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
