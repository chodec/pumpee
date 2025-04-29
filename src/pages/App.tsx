// src/pages/App.tsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/pages/features/auth/hooks/useAuth';
import { supabase } from '@/lib/supabaseClient';

function App() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  // Check authentication status on component mount
  useEffect(() => {
    const checkAuth = async () => {
      if (isLoading) return;

      // Get the session from supabase
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // If no session, redirect to login
        navigate('/login');
        return;
      }

      // Get user type to determine where to redirect
      const { data: userData, error } = await supabase
        .from('users')
        .select('user_type')
        .eq('id', session.user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user type:', error);
        navigate('/login');
        return;
      }

      // Redirect based on user type
      if (userData?.user_type === 'client') {
        navigate('/client/dashboard');
      } else if (userData?.user_type === 'trainer') {
        navigate('/trainer/dashboard');
      } else {
        navigate('/user-type-selection');
      }
    };

    checkAuth();
  }, [isLoading, navigate, user]);

  // Add auth state change listener to prevent unwanted logouts
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event);
      
      // If signed out, redirect to login
      if (event === 'SIGNED_OUT') {
        navigate('/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#007bff]"></div>
      </div>
    );
  }

  // This component is mainly for routing, and the actual content is rendered via Routes in index.tsx
  return null;
}

export default App;