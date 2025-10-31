import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './components/Login';
import Signup from './components/Signup';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardPage from './pages/DashboardPage';
import CallPage from './pages/CallPage';
import CallListPage from './pages/CallListPage';
import { AuthProvider } from './contexts/AuthContext';
import "./App.css";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            {/* Landing Page - Public */}
            <Route path="/" element={
              <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center">
                <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-indigo-500/30">
                  <span className="text-8xl">🤖</span>
                </div>
                
                <h1 className="text-6xl font-bold mb-4 text-slate-900 tracking-tight">
                  AI Voice Assistant
                </h1>
                
                <p className="text-2xl text-slate-500 mb-12 leading-relaxed max-w-2xl">
                  Start natural voice conversations with your AI assistant. 
                  Make calls, view history, and experience seamless voice interactions.
                </p>
                
                <div className="flex gap-6">
                  <Link
                    to="/login"
                    className="bg-gradient-to-r from-blue-500 to-blue-700 text-white border-0 rounded-3xl px-8 py-4 text-lg font-semibold cursor-pointer inline-flex items-center gap-3 transition-all duration-200 ease-out shadow-lg shadow-blue-500/30 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-500/40 no-underline"
                  >
                    Get Started
                  </Link>
                </div>
              </div>
            } />
            
            {/* Auth Routes - Public */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            {/* Dashboard Routes - Protected */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/call" element={
              <ProtectedRoute>
                <CallPage />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/call/list" element={
              <ProtectedRoute>
                <CallListPage />
              </ProtectedRoute>
            } />
            
            {/* Redirect old routes to dashboard */}
            <Route path="/call" element={<Navigate to="/dashboard/call" replace />} />
            <Route path="/call/list" element={<Navigate to="/dashboard/call/list" replace />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;
