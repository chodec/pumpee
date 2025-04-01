import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/hooks/useAuth'
import '../styles/index.css'
import App from '@/pages/App'
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import Legal from '@/pages/Legal'
import UserTypeSelection from '@/pages/UserTypeSelection'
import ClientDashboard from '@/pages/ClientDashboard'
import TrainerDashboard from '@/pages/TrainerDashboard'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/legal" element={<Legal />} />
          <Route path="/user-type-selection" element={<UserTypeSelection />} />
          <Route path="/client/dashboard" element={<ClientDashboard />} />
          <Route path="/trainer/dashboard" element={<TrainerDashboard />} />
          {/* Catch-all route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>,
)