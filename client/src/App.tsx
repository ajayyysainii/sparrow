import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './components/Login';
import Signup from './components/Signup';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardPage from './pages/DashboardPage';
import CallPage from './pages/CallPage';
import CallListPage from './pages/CallListPage';
import CallDetailPage from './pages/CallDetailPage';
import BreathingExercisesPage from './pages/BreathingExercisesPage';
import DiaphragmaticBreathingPage from './pages/DiaphragmaticBreathingPage';
import SquareBreathingPage from './pages/SquareBreathingPage';
import SustainedBreathPage from './pages/SustainedBreathPage';
import PitchSlidesPage from './pages/PitchSlidesPage';
import ScalePracticePage from './pages/ScalePracticePage';
import IntervalJumpsPage from './pages/IntervalJumpsPage';
import TongueTwistersPage from './pages/TongueTwistersPage';
import LipTrillsPage from './pages/LipTrillsPage';
import DictionPracticePage from './pages/DictionPracticePage';
import LandingPage from './pages/LandingPage';
import HealthCheck from './components/HealthCheck';
import { AuthProvider } from './contexts/AuthContext';
import "./App.css";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Landing Page - Public (no Layout wrapper) */}
          <Route path="/" element={<LandingPage />} />
          
          {/* Auth routes without Layout */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
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
          <Route path="/dashboard/call/:callId" element={
            <Layout>
              <ProtectedRoute>
                <CallDetailPage />
              </ProtectedRoute>
            </Layout>
          } />
          <Route path="/dashboard/breathing" element={
            <Layout>
              <ProtectedRoute>
                <BreathingExercisesPage />
              </ProtectedRoute>
            </Layout>
          } />
          <Route path="/dashboard/breathing/diaphragmatic" element={
            <Layout>
              <ProtectedRoute>
                <DiaphragmaticBreathingPage />
              </ProtectedRoute>
            </Layout>
          } />
          <Route path="/dashboard/breathing/square" element={
            <Layout>
              <ProtectedRoute>
                <SquareBreathingPage />
              </ProtectedRoute>
            </Layout>
          } />
          <Route path="/dashboard/breathing/sustained" element={
            <Layout>
              <ProtectedRoute>
                <SustainedBreathPage />
              </ProtectedRoute>
            </Layout>
          } />
          <Route path="/dashboard/pitch/slides" element={
            <Layout>
              <ProtectedRoute>
                <PitchSlidesPage />
              </ProtectedRoute>
            </Layout>
          } />
          <Route path="/dashboard/pitch/scale" element={
            <Layout>
              <ProtectedRoute>
                <ScalePracticePage />
              </ProtectedRoute>
            </Layout>
          } />
          <Route path="/dashboard/pitch/intervals" element={
            <Layout>
              <ProtectedRoute>
                <IntervalJumpsPage />
              </ProtectedRoute>
            </Layout>
          } />
          <Route path="/dashboard/articulation/tongue-twisters" element={
            <Layout>
              <ProtectedRoute>
                <TongueTwistersPage />
              </ProtectedRoute>
            </Layout>
          } />
          <Route path="/dashboard/articulation/lip-trills" element={
            <Layout>
              <ProtectedRoute>
                <LipTrillsPage />
              </ProtectedRoute>
            </Layout>
          } />
          <Route path="/dashboard/articulation/diction" element={
            <Layout>
              <ProtectedRoute>
                <DictionPracticePage />
              </ProtectedRoute>
            </Layout>
          } />
          <Route path="/health" element={
            <Layout>
              <ProtectedRoute>
                <HealthCheck />
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
