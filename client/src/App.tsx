import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './components/Login';
import Signup from './components/Signup';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardPage from './pages/DashboardPage';
import CallPage from './pages/CallPage';
import CallListPage from './pages/CallListPage';
import LandingPage from './pages/LandingPage';
import { AuthProvider } from './contexts/AuthContext';
import "./App.css";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Landing Page - Public (no Layout wrapper) */}
          <Route path="/" element={<LandingPage />} />
          
          {/* Other routes with Layout */}
          <Route path="/login" element={
            <Layout>
              <Login />
            </Layout>
          } />
          <Route path="/signup" element={
            <Layout>
              <Signup />
            </Layout>
          } />
          
          {/* Dashboard Routes - Protected */}
          <Route path="/dashboard" element={
            <Layout>
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            </Layout>
          } />
          <Route path="/dashboard/call" element={
            <Layout>
              <ProtectedRoute>
                <CallPage />
              </ProtectedRoute>
            </Layout>
          } />
          <Route path="/dashboard/call/list" element={
            <Layout>
              <ProtectedRoute>
                <CallListPage />
              </ProtectedRoute>
            </Layout>
          } />
          
          {/* Redirect old routes to dashboard */}
          <Route path="/call" element={<Navigate to="/dashboard/call" replace />} />
          <Route path="/call/list" element={<Navigate to="/dashboard/call/list" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
