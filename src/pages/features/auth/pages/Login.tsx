import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Toaster, toast } from 'sonner';
import { supabase } from '@/lib/supabaseClient';

// Form schema with validation rules
const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(1, { message: "Password is required." })
});

// Type for login form values
type LoginFormValues = z.infer<typeof loginSchema>;

// Login component
export default function Login() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // Form setup with Zod validation
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  // Handle email login submission
  const handleEmailLogin = async (values: LoginFormValues) => {
    setIsLoading(true);
    try {
      // Attempt to sign in with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password
      });

      if (error) {
        throw error;
      }

      // Check user type and navigate accordingly
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('user_type')
        .eq('id', data.user?.id)
        .single();

      if (userError && userError.code !== 'PGRST116') {
        throw userError;
      }

      // Redirect based on user type
      if (userData?.user_type === 'client') {
        navigate('/client/dashboard');
      } else if (userData?.user_type === 'trainer') {
        navigate('/trainer/dashboard');
      } else {
        // No user type set, go to type selection
        navigate('/user-type-selection');
      }

      // Optional: Track login event
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'login', {
          method: 'email'
        });
      }

      toast.success('Successfully logged in!');

    } catch (error: any) {
      console.error('Login failed:', error);
      
      // Specific error handling
      if (error.message?.includes('Invalid login credentials')) {
        toast.error("Invalid email or password. Please try again.");
      } else if (error.message?.includes('rate limit')) {
        toast.error("Too many login attempts. Please try again later.");
      } else {
        toast.error("Login failed. Please check your credentials.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Google login 
  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          scopes: 'email profile'
        }
      });
  
      if (error) {
        throw error;
      }
    } catch (error: any) {
      console.error('Google login error:', error);
      
      if (error.message?.includes('popup closed')) {
        toast.error("Sign-in window was closed. Please try again.");
      } else if (error.message?.includes('network')) {
        toast.error("Network error. Please check your connection.");
      } else {
        toast.error("Google login failed. Please try again.");
      }
      
      setIsLoading(false);
    }
  };

  // Handle password reset navigation
  const handlePasswordReset = () => {
    navigate('/password-reset');
  };

  return (
    <div className="flex h-screen bg-white">
      {/* Base gradient background */}
    <div className="hidden md:flex md:w-1/2 relative overflow-hidden flex-col items-center justify-center">
      {/* Static gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#007bff] via-[#007bff] to-[#ff7f0e]"></div>
      
      {/* Content */}
      <div className="max-w-md text-center z-10 px-8">
        <h1 className="text-5xl font-bold mb-6 text-white">Pumpee</h1>
        <p className="text-xl text-white mb-12">
          Track your fitness journey and achieve your goals with Pumpee
        </p>
        
        {/* Feature icons */}
        <div className="flex justify-around">
          <div className="flex flex-col items-center">
            <div className="bg-white/30 backdrop-blur-sm p-4 rounded-full mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <span className="text-sm text-white">Track Progress</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="bg-white/30 backdrop-blur-sm p-4 rounded-full mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-sm text-white">Save Time</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="bg-white/30 backdrop-blur-sm p-4 rounded-full mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-sm text-white">Boost Results</span>
          </div>
        </div>
      </div>
    </div>

      {/* Right section - Login form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold">Welcome back</h2>
            <p className="text-gray-600">
              Enter your credentials to access your account
            </p>
          </div>

          {/* Login form */}
          <form onSubmit={form.handleSubmit(handleEmailLogin)} noValidate>
            <div className="space-y-4">
              {/* Email input */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  {...form.register('email')}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="name@example.com"
                  disabled={isLoading}
                />
                {form.formState.errors.email && (
                  <p className="text-red-500 text-sm mt-1">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>

              {/* Password input */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  {...form.register('password')}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="••••••••"
                  disabled={isLoading}
                />
                {form.formState.errors.password && (
                  <p className="text-red-500 text-sm mt-1">
                    {form.formState.errors.password.message}
                  </p>
                )}
              </div>

              {/* Forgot password link */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handlePasswordReset}
                  className="text-sm text-blue-500 hover:underline"
                >
                  Forgot password?
                </button>
              </div>
            </div>

            {/* Login button */}
            <div className="mt-6">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </button>
            </div>
          </form>

          {/* Social login divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                OR CONTINUE WITH
              </span>
            </div>
          </div>

          {/* Google login button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 border border-gray-300 py-2 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <svg 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" 
                fill="#4285F4"
              />
              <path 
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" 
                fill="#34A853"
              />
              <path 
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" 
                fill="#FBBC05"
              />
              <path 
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" 
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </button>

          {/* Registration link */}
          <p className="text-center text-sm text-gray-600 mt-4">
            Don't have an account?{" "}
            <Link to="/register" className="text-blue-500 hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>

      {/* Toaster for notifications */}
      <Toaster position="top-right" richColors />
    </div>
  );
}