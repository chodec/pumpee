// src/pages/features/auth/pages/Register.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Toaster, toast } from 'sonner';
import { supabase } from '@/lib/supabaseClient';

// Form schema with validation rules
const formSchema = z.object({
  firstName: z.string().min(2, { message: "First name must be at least 2 characters." }),
  lastName: z.string().min(2, { message: "Last name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string()
    .min(8, { message: "Password must be at least 8 characters." })
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter." })
    .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter." })
    .regex(/[0-9]/, { message: "Password must contain at least one number." }),
  confirmPassword: z.string().min(8, { message: "Confirm Password must be at least 8 characters." }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

// Type for our form values
type RegistrationFormValues = z.infer<typeof formSchema>;

export default function Register() {
  const [isLoading, setIsLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

  // Form setup with React Hook Form
  const { 
    register, 
    handleSubmit, 
    formState: { errors },
    setError
  } = useForm<RegistrationFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Handle registration submission
  const onSubmit = async (data: RegistrationFormValues) => {
    setIsLoading(true);
    
    try {
      // Check if the email already exists in users table
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('email')
        .eq('email', data.email)
        .maybeSingle();
      
      if (checkError && !checkError.message.includes('No rows found')) {
        throw checkError;
      }
  
      if (existingUser) {
        // Email already exists, set form error
        setError('email', {
          type: 'manual',
          message: 'This email is already registered. Please login instead.'
        });
        
        toast.error('This email is already registered. Please login instead.');
        setIsLoading(false);
        return;
      }
      
      // Create full name from first and last name
      const fullName = `${data.firstName} ${data.lastName}`;
      
      // Register with Supabase
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback?type=signup`
        }
      });
      
      if (error) {
        // Double-check for duplicate email errors from Supabase
        if (error.message?.includes('User already registered')) {
          setError('email', {
            type: 'manual',
            message: 'This email is already registered. Please login instead.'
          });
          toast.error('This email is already registered. Please login instead.');
          setIsLoading(false);
          return;
        }
        throw error;
      }
      
      // Show success screen
      setRegisteredEmail(data.email);
      setRegistrationSuccess(true);
      
    } catch (error: any) {
      console.error("Registration failed:", error);
      
      // Handle general errors
      if (error.message?.includes('email already exists') || 
          error.message?.includes('User already registered')) {
        setError('email', {
          type: 'manual',
          message: 'This email is already registered. Please login instead.'
        });
        toast.error('This email is already registered. Please login instead.');
      } else {
        toast.error(error.message || "Registration failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Google sign-in
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
      
      if (error) throw error;
      
    } catch (error: any) {
      console.error('Google login error:', error);
      toast.error("Google login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Show success message if registration was successful
  if (registrationSuccess) {
    return (
      <div className="flex min-h-screen bg-background">
        <div className="w-full max-w-md m-auto p-8 rounded-lg shadow-lg bg-white">
          <div className="text-center">
            <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Check your email</h2>
            <p className="text-gray-600 mb-6">
              We've sent a confirmation link to <strong>{registeredEmail}</strong>
            </p>
            <p className="text-gray-600 mb-6">
              Please click the link in the email to verify your account and complete the registration process.
            </p>
            <div className="mt-6">
              <Link to="/login">
                <button className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600">
                  Return to Login
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Rest of the component remains the same...
  return (
    <div className="flex h-screen bg-white">
      {/* Left gradient background */}
      <div className="hidden md:flex md:w-1/2 relative overflow-hidden flex-col items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-[#007bff] via-[#007bff] to-[#ff7f0e]"></div>
        
        <div className="max-w-md text-center z-10 px-8">
          <h1 className="text-5xl font-bold mb-6 text-white">Pumpee</h1>
          <p className="text-xl text-white mb-12">
            Track your fitness journey and achieve your goals
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

      {/* Right section - Registration form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold">Create an Account</h2>
            <p className="text-gray-600">
              Enter your information to create an account
            </p>
          </div>

          {/* Google login button */}
          <div className="mb-6">
            <button
              type="button"
              className="w-full flex items-center justify-center gap-2 border border-gray-300 p-2 rounded-md hover:bg-gray-50 disabled:opacity-50"
              onClick={handleGoogleLogin}
              disabled={isLoading}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
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
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">OR CONTINUE WITH EMAIL</span>
            </div>
          </div>

          {/* Registration form */}
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* First name */}
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium mb-1">
                    First name
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    className="w-full p-2 border rounded-md"
                    placeholder="John"
                    disabled={isLoading}
                    {...register("firstName")}
                  />
                  {errors.firstName && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.firstName.message}
                    </p>
                  )}
                </div>
                
                {/* Last name */}
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium mb-1">
                    Last name
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    className="w-full p-2 border rounded-md"
                    placeholder="Doe"
                    disabled={isLoading}
                    {...register("lastName")}
                  />
                  {errors.lastName && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.lastName.message}
                    </p>
                  )}
                </div>
              </div>
              
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  className="w-full p-2 border rounded-md"
                  placeholder="john.doe@example.com"
                  disabled={isLoading}
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>
              
              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-1">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  className="w-full p-2 border rounded-md"
                  placeholder="••••••••"
                  disabled={isLoading}
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>
              
              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  className="w-full p-2 border rounded-md"
                  placeholder="••••••••"
                  disabled={isLoading}
                  {...register("confirmPassword")}
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
            </div>
            
            {/* Submit button */}
            <div className="mt-6">
              <button
                type="submit"
                className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:bg-blue-300"
                disabled={isLoading}
              >
                {isLoading ? "Creating Account..." : "Register"}
              </button>
              <p className="text-center text-sm text-gray-600 mt-4">
                Already have an account?{" "}
                <Link to="/login" className="text-blue-500 hover:underline">
                  Log in
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* Toaster for notifications */}
      <Toaster position="top-right" richColors />
    </div>
  );
}