import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AppSidebar from './AppSidebar';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();

  // If authenticated, show sidebar layout
  if (isAuthenticated) {
    return (
      <div className="flex h-screen w-full overflow-hidden bg-[#1C1C1E]">
        <div className="shrink-0">
          <AppSidebar />
        </div>
        <main className="flex-1 overflow-y-auto w-0 min-w-0">
          {children}
        </main>
      </div>
    );
  }

  // If not authenticated, show top navigation layout
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 font-sans">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-xl border-b border-black/10 px-6 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link 
            to="/" 
            className="text-2xl font-bold text-slate-900 tracking-tight no-underline"
          >
            AI Voice Assistant
          </Link>
          
          <div className="flex gap-2">
            <Link
              to="/login"
              className="px-4 py-2 rounded-xl text-sm font-semibold text-blue-600 hover:bg-blue-50 transition-all duration-200"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="p-6 max-w-7xl mx-auto min-h-[calc(100vh-80px)]">
        {children}
      </main>
    </div>
  );
};

export default Layout;
