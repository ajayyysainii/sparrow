import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AppSidebar from './AppSidebar';
import DashboardHeader from './DashboardHeader';
import { 
  Sheet,
  SheetContent, 
  SheetTrigger 
} from './ui/sheet';
import { Menu } from 'lucide-react';
import { Button } from './ui/button';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const isDashboardRoute = location.pathname.startsWith('/dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-[#1C1C1E]">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  // If authenticated, show sidebar layout
  if (isAuthenticated) {
    return (
      <div className="flex h-screen w-full overflow-hidden bg-[#1C1C1E]">
        {/* Mobile Sidebar Toggle */}
        <div className="md:hidden fixed top-0 left-0 z-[60] w-full">
          <div className="flex items-center justify-between p-3 bg-[#1C1C1E] border-b border-[#27272A]">
            <Link to="/dashboard" className="text-xl font-bold text-white">
              Sparrow
            </Link>
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-white hover:bg-white/10 shrink-0 [&_svg]:text-white [&_svg]:h-6 [&_svg]:w-6"
                  aria-label="Open menu"
                >
                  <Menu className="h-6 w-6 text-white" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0 bg-[#27272A] border-[#27272A]">
                <AppSidebar onNavigation={() => setMobileMenuOpen(false)} />
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Desktop Sidebar */}
        <div className="hidden md:block shrink-0">
          <AppSidebar />
        </div>
        <main className="flex-1 flex flex-col overflow-hidden w-0 min-w-0">
          {isDashboardRoute && (
            <div className="hidden md:block">
              <DashboardHeader />
            </div>
          )}
          <div className="flex-1 overflow-y-auto pt-14 md:pt-0">
            {children}
          </div>
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
