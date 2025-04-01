import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from '@/hooks/useAuth';
import { useAuth } from '@/hooks/useAuth';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import UserTypeSelection from '@/pages/UserTypeSelection';
import AuthCallback from '@/pages/AuthCallback';
import ClientDashboard from '@/pages/ClientDashboard';
import TrainerDashboard from '@/pages/TrainerDashboard';

// Protected Route Component
const ProtectedRoute = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    // Optional: Add a loading spinner or placeholder
    return <div>Loading...</div>;
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/user-type-selection" element={<UserTypeSelection />} />
          <Route path="/auth/callback" element={<AuthCallback />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/client/dashboard" element={<ClientDashboard />} />
            <Route path="/trainer/dashboard" element={<TrainerDashboard />} />
          </Route>

          {/* Default Route */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Optional: 404 Not Found Route */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;