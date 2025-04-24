import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(true);
  const [statusMessage, setStatusMessage] = useState('Processing authentication...');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Check the URL for the type of action
        const url = new URL(window.location.href);
        const errorParam = url.searchParams.get('error');
        const errorDescription = url.searchParams.get('error_description');
        
        // If there are errors in the URL, handle them
        if (errorParam) {
          toast.error(errorDescription || 'Authentication error');
          setStatusMessage('Authentication failed. Redirecting...');
          setTimeout(() => navigate('/login'), 2000);
          return;
        }

        // Check if this is an email confirmation callback (which has a different URL structure)
        // Supabase typically includes a 'type' parameter set to 'signup' or 'recovery'
        const type = url.searchParams.get('type');
        
        if (type === 'signup') {
          // Handle email confirmation success
          setStatusMessage('Email verified successfully! Setting up your account...');
          
          // Allow some time for Supabase to complete the verification process
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Get current session after verification
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError || !session) {
            throw sessionError || new Error('Session not found after verification');
          }
          
          // Show success message
          toast.success('Email verified successfully!');
          
          // Redirect to user type selection after successful verification
          navigate('/user-type-selection');
          return;
        }
        
        if (type === 'recovery') {
          // Handle password reset flow
          setStatusMessage('Password reset link verified. Redirecting...');
          
          // Could redirect to a password reset form page
          setTimeout(() => navigate('/reset-password'), 1500);
          return;
        }

        // Handle standard OAuth logins (like Google)
        // Get the current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        if (!session) {
          setStatusMessage('No active session found. Redirecting to login...');
          setTimeout(() => navigate('/login'), 2000);
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
            setStatusMessage('Authentication successful! Redirecting to client dashboard...');
            setTimeout(() => navigate('/client/dashboard'), 1000);
          } else if (userData.user_type === 'trainer') {
            setStatusMessage('Authentication successful! Redirecting to trainer dashboard...');
            setTimeout(() => navigate('/trainer/dashboard'), 1000);
          }
        } else {
          // If no user type, redirect to user type selection
          setStatusMessage('Authentication successful! Setting up your profile...');
          setTimeout(() => navigate('/user-type-selection'), 1000);
        }
      } catch (error) {
        console.error('Authentication callback error:', error);
        toast.error('Authentication process failed. Please try again.');
        setStatusMessage('Authentication error. Redirecting to login...');
        setTimeout(() => navigate('/login'), 2000);
      } finally {
        setIsProcessing(false);
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="flex justify-center items-center min-h-screen bg-background">
      <div className="w-full max-w-md p-8 rounded-lg shadow-lg bg-white">
        <div className="text-center">
          {isProcessing ? (
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 mx-auto mb-4"></div>
          ) : (
            <div className="h-16 w-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
          <h2 className="text-xl font-medium text-gray-800 mb-2">Authentication</h2>
          <p className="text-gray-600">{statusMessage}</p>
        </div>
      </div>
    </div>
  );
}