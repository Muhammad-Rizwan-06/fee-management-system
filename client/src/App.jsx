import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import AdminLogin from './pages/AdminLogin';
import StudentLogin from './pages/StudentLogin';
import AdminDashboard from './pages/AdminDashboard';
import StudentDashboard from './pages/StudentDashboard';
import SystemSetup from './pages/SystemSetup';

// Admin Private Route Guard
const AdminRoute = ({ children }) => {
  const { token, user, loading } = useContext(AuthContext);
  
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-900 text-white">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-t-teal-500 border-r-transparent"></div>
      </div>
    );
  }
  
  if (!token || !user || user.role !== 'admin') {
    return <Navigate to="/admin/login" replace />;
  }

  // If admin hasn't configured system yet, redirect to setup
  if (!user.systemConfigured) {
    return <Navigate to="/admin/configure" replace />;
  }
  
  return children;
};

// System Setup Route Guard — only for logged-in admins who haven't configured yet
const SystemSetupRoute = ({ children }) => {
  const { token, user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-900 text-white">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-t-teal-500 border-r-transparent"></div>
      </div>
    );
  }

  // Not logged in → send to login
  if (!token || !user || user.role !== 'admin') {
    return <Navigate to="/admin/login" replace />;
  }

  // Already configured → skip setup, go straight to dashboard
  if (user.systemConfigured) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
};

// Student Private Route Guard
const StudentRoute = ({ children }) => {
  const { token, user, loading } = useContext(AuthContext);
  
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-900 text-white">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-t-purple-500 border-r-transparent"></div>
      </div>
    );
  }
  
  if (!token || !user || user.role !== 'student') {
    return <Navigate to="/student/login" replace />;
  }
  
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/student/login" element={<StudentLogin />} />
      
      <Route
        path="/admin/configure"
        element={
          <SystemSetupRoute>
            <SystemSetup />
          </SystemSetupRoute>
        }
      />

      <Route 
        path="/admin/dashboard" 
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        } 
      />
      
      <Route 
        path="/student/dashboard" 
        element={
          <StudentRoute>
            <StudentDashboard />
          </StudentRoute>
        } 
      />
      
      {/* Catch-all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

