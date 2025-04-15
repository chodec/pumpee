import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        if (!session) {
          toast.error('Authentication failed');
          navigate('/login');
          return;
        }

        // Check if the user already has a user type set
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('user_type')
          .eq('id', session.user.id)
          .single();

        if (userError && userError.code !== 'PGRST116') {
          throw userError;
        }

        // If user type exists, redirect to appropriate dashboard
        if (userData && userData.user_type) {
          if (userData.user_type === 'client') {
            navigate('/client/dashboard');
          } else if (userData.user_type === 'trainer') {
            navigate('/trainer/dashboard');
          }
        } else {
          // If no user type, redirect to user type selection
          navigate('/user-type-selection');
        }

      } catch (error) {
        console.error('Authentication callback error:', error);
        toast.error('Authentication failed');
        navigate('/login');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Authenticating...</p>
      </div>
    </div>
  );
}