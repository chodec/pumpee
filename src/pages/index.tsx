import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/pages/features/auth/hooks/useAuth'
import { Toaster } from 'sonner'
import '../styles/index.css'
import App from '@/pages/App'
import Login from '@/pages/features/auth/pages/Login'
import Register from '@/pages/features/auth/pages/Register'
import Legal from '@/pages/Legal'
import UserTypeSelection from '@/pages/features/auth/pages/UserTypeSelection'
import ClientDashboard from '@/pages/client/pages/ClientDashboard'
import TrainerDashboard from '@/pages/trainer/pages/TrainerDashboard'
import TrainerSubscriptions from '@/pages/trainer/pages/TrainerSubscriptions'
import AuthCallback from '@/pages/features/auth/components/AuthCallback'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/legal" element={<Legal />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/user-type-selection" element={<UserTypeSelection />} />
          <Route path="/client/dashboard" element={<ClientDashboard />} />
          <Route path="/trainer/dashboard" element={<TrainerDashboard />} />
          <Route path="/trainer/subscriptions" element={<TrainerSubscriptions />} />
          {/* Catch-all route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        <Toaster position="top-right" richColors />
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>,
)