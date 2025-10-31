import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 font-sans">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-xl border-b border-black/10 px-6 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link 
              to="/" 
              className="text-2xl font-bold text-slate-900 tracking-tight no-underline"
            >
              AI Voice Assistant
            </Link>
            
            <div className="flex gap-2">
              <Link
                to="/call"
                className={`px-4 py-2 rounded-xl text-sm font-semibold no-underline transition-all duration-200 ${
                  location.pathname === '/call' 
                    ? 'text-blue-500 bg-blue-50' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                📞 Make Call
              </Link>
              
              <Link
                to="/call/list"
                className={`px-4 py-2 rounded-xl text-sm font-semibold no-underline transition-all duration-200 ${
                  location.pathname === '/call/list' 
                    ? 'text-blue-500 bg-blue-50' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                📋 Call History
              </Link>
            </div>
          </div>
          
          <div className="text-sm text-slate-500 font-medium">
            AI Voice Assistant
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
