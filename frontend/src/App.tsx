import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ProtectedRoute } from './components/ProtectedRoute';

import { LandingPage } from './pages/LandingPage';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Profile } from './pages/Profile';
import { EmergencyContacts } from './pages/EmergencyContacts';
import { SOSHistory } from './pages/SOSHistory';
import { LocationShare } from './pages/LocationShare';
import { JourneyPage } from './pages/JourneyPage';
import { SafetyDiary } from './pages/SafetyDiary';
import { SafetyInsights } from './pages/SafetyInsights';
import { AIAssistant } from './pages/AIAssistant';
import { FakeCall } from './pages/FakeCall';
import { AudioRecording } from './pages/AudioRecording';
import { EmergencyServices } from './pages/EmergencyServices';
import { SafetyTips } from './pages/SafetyTips';
import { IncidentReports } from './pages/IncidentReports';
import { AdminDashboard } from './pages/AdminDashboard';

const HomeRoute: React.FC = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <LandingPage />;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <Navbar />
          <main style={{ flex: 1 }}>
            <Routes>
              <Route path="/" element={<HomeRoute />} />
              <Route path="/landing" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Authenticated Core Routes */}
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/emergency-contacts" element={<ProtectedRoute><EmergencyContacts /></ProtectedRoute>} />
              <Route path="/sos-history" element={<ProtectedRoute><SOSHistory /></ProtectedRoute>} />
              <Route path="/location-share" element={<ProtectedRoute><LocationShare /></ProtectedRoute>} />
              <Route path="/journey" element={<ProtectedRoute><JourneyPage /></ProtectedRoute>} />
              <Route path="/diary" element={<ProtectedRoute><SafetyDiary /></ProtectedRoute>} />
              <Route path="/safety-insights" element={<ProtectedRoute><SafetyInsights /></ProtectedRoute>} />
              <Route path="/ai-assistant" element={<ProtectedRoute><AIAssistant /></ProtectedRoute>} />
              <Route path="/fake-call" element={<ProtectedRoute><FakeCall /></ProtectedRoute>} />
              <Route path="/audio-recording" element={<ProtectedRoute><AudioRecording /></ProtectedRoute>} />
              <Route path="/emergency-services" element={<ProtectedRoute><EmergencyServices /></ProtectedRoute>} />
              <Route path="/safety-tips" element={<ProtectedRoute><SafetyTips /></ProtectedRoute>} />
              <Route path="/reports" element={<ProtectedRoute><IncidentReports /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
