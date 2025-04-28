// src/pages/App.tsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from '@/pages/features/auth/hooks/useAuth';
import { useAuth } from '@/pages/features/auth/hooks/useAuth';
import Login from '@/pages/features/auth/pages/Login';
import Register from '@/pages/features/auth/pages/Register';
import UserTypeSelection from '@/pages/features/auth/pages/UserTypeSelection';
import AuthCallback from '@/pages/features/auth/components/AuthCallback';
import ClientDashboard from '@/pages/client/pages/ClientDashboard';
import TrainerDashboard from '@/pages/trainer/pages/TrainerDashboard';
import TrainerSubscriptions from '@/pages/trainer/pages/TrainerSubscriptions';

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
            {/* Client Routes */}
            <Route path="/client/dashboard" element={<ClientDashboard />} />
            
            {/* Trainer Routes */}
            <Route path="/trainer/dashboard" element={<TrainerDashboard />} />
            <Route path="/trainer/subscriptions" element={<TrainerSubscriptions />} />
          </Route>

          {/* Default Route */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* 404 Not Found Route */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;