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
      
      console.log("Starting user type selection process for:", userType);
      
      // Get current authenticated user if not available through useAuth
      const currentUser = user || (await supabase.auth.getUser()).data.user;
      
      if (!currentUser) throw new Error("No authenticated user found");
      console.log("Current user:", currentUser);
      
      // 1. Check if user already exists in users table
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('id, user_type')
        .eq('id', currentUser.id)
        .single();
      
      console.log("Check for existing user:", existingUser, checkError);
      
      // 2. Insert or update user in users table
      if (existingUser) {
        console.log("User exists, updating user_type");
        const { error: updateError } = await supabase
          .from('users')
          .update({ user_type: userType })
          .eq('id', currentUser.id);
          
        if (updateError) {
          console.error("Error updating user:", updateError);
          throw updateError;
        }
      } else {
        console.log("Creating new user record");
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: currentUser.id,
            email: currentUser.email,
            full_name: userData?.fullName || currentUser.user_metadata?.full_name || '',
            phone_number: null,
            registration_method: userData?.registrationMethod || 'google',
            user_type: userType
          });
          
        if (insertError) {
          console.error("Error inserting user:", insertError);
          throw insertError;
        }
      }
      
      if (userType === 'trainer') {
        console.log("Creating trainer record");
        
        try {
          // Get an existing subscription tier
          const { data: tierData, error: tierFetchError } = await supabase
            .from('subscription_tiers')
            .select('id')
            .limit(1);
          
          if (tierFetchError || !tierData || tierData.length === 0) {
            throw new Error("No subscription tiers found. Please contact support.");
          }
          
          // Use the first available subscription tier
          const subscriptionTierId = tierData[0].id;
          
          // Create the trainer record with the subscription tier ID
          const { data: trainerData, error: trainerError } = await supabase
            .from('trainers')
            .insert({
              user_id: currentUser.id,
              subscription_tier_id: subscriptionTierId
            })
            .select();
          
          console.log("Trainer insert result:", trainerData, trainerError);
          
          if (trainerError) throw trainerError;
          
          toast.success("Successfully registered as a trainer!");
          navigate('/trainer/dashboard');
          
        } catch (err) {
          console.error("Error creating trainer:", err);
          throw new Error(`Failed to create trainer record: ${err.message}`);
        }
      }
      else {
        console.log("Creating client record");
        
        // First check if client record already exists
        const { data: existingClient } = await supabase
          .from('clients')
          .select('user_id')
          .eq('user_id', currentUser.id)
          .single();
          
        if (existingClient) {
          console.log("Client record already exists");
        } else {
          // Create a client record
          const { error: clientError } = await supabase
            .from('clients')
            .insert({
              user_id: currentUser.id
            });
            
          console.log("Client insert result:", clientError);
          
          if (clientError) {
            console.error("Error creating client:", clientError);
            throw clientError;
          }
        }
        
        toast.success("Successfully registered as a client!");
        navigate('/client/dashboard'); // Make sure this path matches your route definition
      }
      
    } catch (err) {
      console.error('Error creating account:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      toast.error("Failed to complete registration. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!userData && !user) {
    return null; // Will redirect via useEffect
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