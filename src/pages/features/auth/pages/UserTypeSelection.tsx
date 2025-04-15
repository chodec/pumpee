import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabaseClient';

// Custom type for user type
type UserType = 'client' | 'trainer';

export default function UserTypeSelection() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Check user authentication and existing user type on component mount
  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        // Fetch current authenticated user
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
          toast.error('Authentication failed');
          navigate('/login');
          return;
        }

        // Check if user type already exists
        const { data: existingUser, error: existingUserError } = await supabase
          .from('users')
          .select('user_type')
          .eq('id', user.id)
          .single();

        if (existingUserError && existingUserError.code !== 'PGRST116') {
          throw existingUserError;
        }

        // If user type exists, redirect to appropriate dashboard
        if (existingUser?.user_type) {
          redirectToDashboard(existingUser.user_type);
          return;
        }

        // Set current user for further processing
        setCurrentUser(user);
      } catch (error) {
        console.error('Error checking user status:', error);
        toast.error('Something went wrong');
        navigate('/login');
      }
    };

    checkUserStatus();
  }, [navigate]);

  // Redirect to appropriate dashboard based on user type
  const redirectToDashboard = (userType: UserType) => {
    navigate(userType === 'client' ? '/client/dashboard' : '/trainer/dashboard');
  };

  // Handle user type selection
  const handleUserTypeSelection = async (userType: UserType) => {
    if (!currentUser) return;

    try {
      setIsLoading(true);

      // Insert or update user type in users table
      const { error } = await supabase
        .from('users')
        .upsert({
          id: currentUser.id,
          email: currentUser.email,
          full_name: currentUser.user_metadata?.full_name || '',
          user_type: userType,
          registration_method: currentUser.app_metadata?.provider || 'email'
        }, { 
          onConflict: 'id' 
        });

      if (error) throw error;

      // Create corresponding client or trainer record
      if (userType === 'client') {
        await createClientRecord(currentUser.id);
      } else {
        await createTrainerRecord(currentUser.id);
      }

      // Redirect to dashboard
      redirectToDashboard(userType);

      // Show success toast
      toast.success(`Successfully registered as a ${userType}`);

    } catch (error) {
      console.error('User type selection error:', error);
      toast.error('Failed to complete registration');
    } finally {
      setIsLoading(false);
    }
  };

  // Create client record
  const createClientRecord = async (userId: string) => {
    const { error } = await supabase
      .from('clients')
      .upsert({ user_id: userId }, { onConflict: 'user_id' });

    if (error) throw error;
  };

  // Create trainer record
  const createTrainerRecord = async (userId: string) => {
    // Fetch default subscription tier
    const { data: tierData, error: tierError } = await supabase
      .from('subscription_tiers')
      .select('id')
      .limit(1)
      .single();

    if (tierError) throw tierError;

    const { error } = await supabase
      .from('trainers')
      .upsert({ 
        user_id: userId,
        subscription_tier_id: tierData.id 
      }, { onConflict: 'user_id' });

    if (error) throw error;
  };

  // Prevent rendering if no user
  if (!currentUser) {
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
              Welcome to Pumpee, {currentUser?.user_metadata?.full_name || 'there'}!
            </h2>
            <p className="text-gray-600 mt-2">
              Tell us how you'll be using Pumpee
            </p>
          </div>

          <div className="space-y-4">
            <button
              type="button"
              onClick={() => handleUserTypeSelection('client')}
              disabled={isLoading}
              className="w-full p-4 bg-white border-2 border-blue-500 rounded-lg flex flex-col items-center justify-center hover:bg-blue-50 transition-colors disabled:opacity-50"
            >
              <span className="text-xl font-medium text-blue-500">I am a Client</span>
              <span className="text-gray-600 mt-1">I want to work with a trainer</span>
            </button>

            <button
              type="button"
              onClick={() => handleUserTypeSelection('trainer')}
              disabled={isLoading}
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