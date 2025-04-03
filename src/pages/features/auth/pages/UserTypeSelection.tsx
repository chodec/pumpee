// src/pages/UserTypeSelection.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import * as z from 'zod';

// Supabase imports
import { supabase } from '@/lib/supabaseClient';
import type { User } from '@supabase/supabase-js';

// Custom hooks
import { useAuth } from '@/pages/features/auth/hooks/useAuth';

// Type definitions with Zod for runtime validation
const UserDataSchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  registrationMethod: z.string().optional()
});

const UserTypeSchema = z.enum(['client', 'trainer']);

// Enhanced type for location state
interface LocationState {
  userData?: z.infer<typeof UserDataSchema>;
}

// Centralized error handling
class RegistrationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RegistrationError';
  }
}

export default function UserTypeSelection() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  
  // Safely extract user data from location state
  const state = location.state as LocationState;
  const userData = state?.userData;
  
  useEffect(() => {
    // Redirect to register if no user data is provided
    if (!userData && !user) {
      navigate('/register');
    }
  }, [userData, user, navigate]);

  // Centralized error handler
  const handleError = (err: unknown) => {
    const errorMessage = err instanceof Error 
      ? err.message 
      : 'An unexpected error occurred';
    
    console.error('Registration error:', err);
    setError(errorMessage);
    toast.error("Failed to complete registration. Please try again.");
  };

  // Validate user type input
  const validateUserType = (userType: string): asserts userType is 'client' | 'trainer' => {
    try {
      UserTypeSchema.parse(userType);
    } catch {
      throw new RegistrationError('Invalid user type selected');
    }
  };

  // Safely get or create subscription tier
  const getSubscriptionTier = async () => {
    const { data: tierData, error: tierFetchError } = await supabase
      .from('subscription_tiers')
      .select('id')
      .limit(1);
    
    if (tierFetchError || !tierData || tierData.length === 0) {
      throw new RegistrationError("No subscription tiers found. Please contact support.");
    }
    
    return tierData[0].id;
  };

  // Create trainer record
  const createTrainerRecord = async (user: User, subscriptionTierId: number) => {
    const { data: trainerData, error: trainerError } = await supabase
      .from('trainers')
      .insert({
        user_id: user.id,
        subscription_tier_id: subscriptionTierId
      })
      .select();
    
    if (trainerError) {
      throw new RegistrationError(`Failed to create trainer record: ${trainerError.message}`);
    }
    
    return trainerData;
  };

  // Create or update user record
  const upsertUserRecord = async (
    user: User, 
    userType: 'client' | 'trainer', 
    userData?: LocationState['userData']
  ) => {
    // Validate input data
    const safeUserData = userData 
      ? UserDataSchema.parse(userData) 
      : null;

    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id, user_type')
      .eq('id', user.id)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') {
      throw new RegistrationError('Error checking existing user');
    }

    if (existingUser) {
      // Update existing user
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          user_type: userType,
          ...(safeUserData && {
            email: safeUserData.email,
            full_name: safeUserData.fullName
          })
        })
        .eq('id', user.id);
      
      if (updateError) {
        throw new RegistrationError('Failed to update user');
      }
    } else {
      // Insert new user
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: user.id,
          email: safeUserData?.email || user.email,
          full_name: safeUserData?.fullName || user.user_metadata?.full_name || '',
          phone_number: null,
          registration_method: safeUserData?.registrationMethod || 'google',
          user_type: userType
        });
      
      if (insertError) {
        throw new RegistrationError('Failed to create user record');
      }
    }
  };

  // Create client record
  const createClientRecord = async (user: User) => {
    // Check if client record already exists
    const { data: existingClient } = await supabase
      .from('clients')
      .select('user_id')
      .eq('user_id', user.id)
      .single();
    
    if (!existingClient) {
      const { error: clientError } = await supabase
        .from('clients')
        .insert({
          user_id: user.id
        });
      
      if (clientError) {
        throw new RegistrationError('Failed to create client record');
      }
    }
  };

  const handleUserTypeSelection = async (userType: 'client' | 'trainer') => {
    try {
      // Reset previous states
      setIsLoading(true);
      setError(null);
      
      // Validate user type
      validateUserType(userType);
      
      // Get current authenticated user
      const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !currentUser) {
        throw new RegistrationError('No authenticated user found');
      }
      
      // Upsert user record
      await upsertUserRecord(currentUser, userType, userData);
      
      // Handle specific user type logic
      if (userType === 'trainer') {
        const subscriptionTierId = await getSubscriptionTier();
        await createTrainerRecord(currentUser, subscriptionTierId);
        
        toast.success("Successfully registered as a trainer!");
        navigate('/trainer/dashboard');
      } else {
        await createClientRecord(currentUser);
        
        toast.success("Successfully registered as a client!");
        navigate('/client/dashboard');
      }
    } catch (err) {
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Prevent rendering if no user data
  if (!userData && !user) {
    return null;
  }

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
            <h2 className="text-2xl font-bold">
              Welcome to Pumpee, {userData?.fullName || user?.user_metadata?.full_name || 'there'}!
            </h2>
            <p className="text-gray-600 mt-2">
              Tell us how you'll be using Pumpee
            </p>
          </div>

          {error && (
            <div 
              role="alert"
              className="mb-6 p-3 bg-red-100 border border-red-400 text-red-700 rounded"
            >
              {error}
            </div>
          )}

          <div className="space-y-4">
            <button
              type="button"
              onClick={() => handleUserTypeSelection('client')}
              disabled={isLoading}
              aria-busy={isLoading}
              className="w-full p-4 bg-white border-2 border-blue-500 rounded-lg flex flex-col items-center justify-center hover:bg-blue-50 transition-colors disabled:opacity-50"
            >
              <span className="text-xl font-medium text-blue-500">I am a Client</span>
              <span className="text-gray-600 mt-1">I want to work with a trainer</span>
            </button>

            <button
              type="button"
              onClick={() => handleUserTypeSelection('trainer')}
              disabled={isLoading}
              aria-busy={isLoading}
              className="w-full p-4 bg-white border-2 border-[#ff7f0e] rounded-lg flex flex-col items-center justify-center hover:bg-orange-50 transition-colors disabled:opacity-50"
            >
              <span className="text-xl font-medium text-[#ff7f0e]">I am a Trainer</span>
              <span className="text-gray-600 mt-1">I want to help clients achieve their goals</span>
            </button>
          </div>

          {isLoading && (
            <div 
              aria-live="polite"
              className="mt-6 text-center text-gray-600"
            >
              Setting up your account...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}