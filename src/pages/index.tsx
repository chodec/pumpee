// src/pages/index.tsx - Fixed main entry point
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/pages/features/auth/hooks/useAuth'
import { Toaster } from 'sonner'
import '../styles/index.css'

// Main App Component
import App from '@/pages/App'

// Authentication Pages
import Login from '@/pages/features/auth/pages/Login'
import Register from '@/pages/features/auth/pages/Register'
import UserTypeSelection from '@/pages/features/auth/pages/UserTypeSelection'
import AuthCallback from '@/pages/features/auth/components/AuthCallback'

// Client Pages
import ClientDashboard from '@/pages/client/pages/ClientDashboard'

// Trainer Pages
import TrainerDashboard from '@/pages/trainer/pages/TrainerDashboard'
import TrainerSubscriptions from '@/pages/trainer/pages/TrainerSubscriptions'
import TrainerSubscriptionPlans from '@/pages/trainer/pages/TrainerSubscriptionPlans'
import TrainerMenus from '@/pages/trainer/pages/TrainerMenus'
import TrainerWorkouts from '@/pages/trainer/pages/TrainerWorkouts'

// Static Pages
import Legal from '@/pages/Legal'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Main App Route */}
          <Route path="/" element={<App />} />
          
          {/* Authentication Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/user-type-selection" element={<UserTypeSelection />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          
          {/* Client Routes */}
          <Route path="/client/dashboard" element={<ClientDashboard />} />
          
          {/* Trainer Routes */}
          <Route path="/trainer/dashboard" element={<TrainerDashboard />} />
          <Route path="/trainer/subscriptions" element={<TrainerSubscriptions />} />
          <Route path="/trainer/subscription-plans" element={<TrainerSubscriptionPlans />} />
          <Route path="/trainer/menus" element={<TrainerMenus />} />
          <Route path="/trainer/workouts" element={<TrainerWorkouts />} />
          
          {/* Static Pages */}
          <Route path="/legal" element={<Legal />} />
          
          {/* Catch-all route - redirects to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        
        {/* Global Toast Notifications */}
        <Toaster position="top-right" richColors />
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>,
)