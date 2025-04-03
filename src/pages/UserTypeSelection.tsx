// src/pages/UserTypeSelection.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

interface LocationState {
  userData: {
    email: string;
    fullName: string;
    registrationMethod: string;
  };
}

export default function UserTypeSelection() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  
  // Get user data from location state (passed from OAuth handler or Registration)
  const state = location.state as LocationState;
  const userData = state?.userData;
  
  useEffect(() => {
    // Redirect to register if no user data is provided
    if (!userData && !user) {
      navigate('/register');
    }
  }, [userData, user, navigate]);

  const handleUserTypeSelection = async (userType: 'client' | 'trainer') => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get current authenticated user if not available through useAuth
      const currentUser = user || (await supabase.auth.getUser()).data.user;
      
      if (!currentUser) throw new Error("No authenticated user found");
      
      // 1. First create record in the users table
      const { error: userError } = await supabase
        .from('users')
        .insert({
          id: currentUser.id,
          email: currentUser.email,
          full_name: userData?.fullName || currentUser.user_metadata?.full_name || '',
          phone_number: null, // Can be updated later in profile
          registration_method: userData?.registrationMethod || 'google',
          user_type: userType
        });
        
      if (userError) throw userError;
      
      // 2. Then create record in the role-specific table
      const { error: roleError } = await supabase
        .from(userType === 'client' ? 'clients' : 'trainers')
        .insert({
          user_id: currentUser.id
          // No other fields needed here since they're now in users table
        });
        
      if (roleError) throw roleError;
      
      // Show success message
      toast.success(`Successfully registered as a ${userType}!`);
      
      // Redirect to the appropriate dashboard
      navigate(userType === 'client' ? '/client/dashboard' : '/trainer/dashboard');
      
    } catch (err) {
      console.error('Error creating account:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      toast.error("Failed to complete registration. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Rest of your component remains the same
  return (
    <div className="flex h-screen bg-white">
      {/* Left section - Blue sidebar with app info */}
      <div className="hidden md:flex md:w-1/2 bg-blue-500 flex-col items-center justify-center text-white p-10">
        <h1 className="text-4xl font-bold mb-4">Pumpee</h1>
        <p className="text-center text-xl">
          Track your fitness journey and achieve your goals with Pumpee
        </p>
      </div>

      {/* Right section - User type selection */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold">Welcome to Pumpee, {userData?.fullName || user?.user_metadata?.full_name || 'there'}!</h2>
            <p className="text-gray-600 mt-2">
              Tell us how you'll be using Pumpee
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <button
              onClick={() => handleUserTypeSelection('client')}
              disabled={isLoading}
              className="w-full p-4 bg-white border-2 border-blue-500 rounded-lg flex flex-col items-center justify-center hover:bg-blue-50 transition-colors"
            >
              <span className="text-xl font-medium text-blue-500">I am a Client</span>
              <span className="text-gray-600 mt-1">I want to work with a trainer</span>
            </button>

            <button
              onClick={() => handleUserTypeSelection('trainer')}
              disabled={isLoading}
              className="w-full p-4 bg-white border-2 border-[#ff7f0e] rounded-lg flex flex-col items-center justify-center hover:bg-orange-50 transition-colors"
            >
              <span className="text-xl font-medium text-[#ff7f0e]">I am a Trainer</span>
              <span className="text-gray-600 mt-1">I want to help clients achieve their goals</span>
            </button>
          </div>

          {isLoading && (
            <div className="mt-6 text-center text-gray-600">
              Setting up your account...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}