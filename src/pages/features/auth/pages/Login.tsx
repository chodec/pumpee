// src/pages/features/auth/pages/Login.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/pages/features/auth/hooks/useAuth';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/molecules/Form';
import { Toaster, toast } from '@/components/feedback/Toast';
import { LoginFormValues } from '@/lib/types';
import { AUTH_ROUTES, DASHBOARD_ROUTES, USER_TYPES } from '@/lib/constants';
import { handleAuthError } from '@/lib/errors';

// Form schema with validation rules
const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(1, { message: "Password is required." })
});

// Login component
export default function Login() {
  const navigate = useNavigate();
  const { signIn, signInWithGoogle, getUserType, isLoading } = useAuth();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

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
    try {
      // Attempt to sign in
      const { error } = await signIn(values.email, values.password);

      if (error) {
        throw error;
      }

      // Get user type and navigate accordingly
      const userType = await getUserType();

      // Redirect based on user type
      if (userType === USER_TYPES.CLIENT) {
        navigate(DASHBOARD_ROUTES.CLIENT.DASHBOARD);
      } else if (userType === USER_TYPES.TRAINER) {
        navigate(DASHBOARD_ROUTES.TRAINER.DASHBOARD);
      } else {
        // No user type set, go to type selection
        navigate(AUTH_ROUTES.USER_TYPE_SELECTION);
      }

      // Optional: Track login event
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'login', {
          method: 'email'
        });
      }

      toast.success('Successfully logged in!');

    } catch (error) {
      const message = handleAuthError(error);
      toast.error(message);
    }
  };

  // Handle Google login 
  const handleGoogleLogin = async () => {
    try {
      setIsGoogleLoading(true);
      const { error } = await signInWithGoogle();
  
      if (error) {
        throw error;
      }
    } catch (error) {
      const message = handleAuthError(error);
      toast.error(message);
      setIsGoogleLoading(false);
    }
  };

  // Handle password reset navigation
  const handlePasswordReset = () => {
    navigate(AUTH_ROUTES.PASSWORD_RESET);
  };

  return (
    <div className="flex h-screen bg-white">
      {/* Left section - Blue gradient background */}
      <div className="hidden md:flex md:w-1/2 relative overflow-hidden flex-col items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-[#007bff] via-[#007bff] to-[#ff7f0e]"></div>
        
        {/* Content */}
        <div className="max-w-md text-center z-10 px-8">
          <h1 className="text-5xl font-bold mb-6 text-white">Pumpee</h1>
          <p className="text-xl text-white mb-12">
            Track your fitness journey and achieve your goals with Pumpee
          </p>
          
          {/* Feature icons */}
          <div className="flex justify-around">
            {/* Features would go here */}
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
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleEmailLogin)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="name@example.com" 
                        type="email" 
                        disabled={isLoading} 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="••••••••" 
                        type="password" 
                        disabled={isLoading} 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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

              {/* Login button */}
              <Button
                type="submit"
                isLoading={isLoading}
                disabled={isLoading}
                variant="blue"
                size="full"
                className="mt-2"
              >
                Sign In
              </Button>
            </form>
          </Form>

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
          <Button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading || isGoogleLoading}
            isLoading={isGoogleLoading}
            variant="outline"
            size="full"
            className="flex items-center justify-center gap-2"
          >
            {!isGoogleLoading && (
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
            )}
            Continue with Google
          </Button>

          {/* Registration link */}
          <p className="text-center text-sm text-gray-600 mt-4">
            Don't have an account?{" "}
            <Link to={AUTH_ROUTES.REGISTER} className="text-blue-500 hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>

      {/* Toaster for notifications */}
      <Toaster position="top-right" />
    </div>
  );
}