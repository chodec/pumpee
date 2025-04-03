import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Toaster, toast } from 'sonner';
import { supabase } from '@/lib/supabaseClient';

// Define the form schema with Zod validation
const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
  rememberMe: z.boolean().optional(),
});

// Type for our form data
type LoginFormValues = z.infer<typeof formSchema>;

// Reusable form input component
const FormInput: React.FC<{
  id: keyof LoginFormValues;
  label: string;
  type?: string;
  placeholder?: string;
  register: any;
  errors: any;
  disabled?: boolean;
}> = ({ id, label, type = "text", placeholder, register, errors, disabled = false }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium mb-1">
      {label}
    </label>
    <input
      id={id}
      type={type}
      className="w-full p-2 border rounded-md"
      placeholder={placeholder}
      aria-invalid={errors[id] ? "true" : "false"}
      aria-describedby={errors[id] ? `${id}-error` : undefined}
      disabled={disabled}
      {...register(id)}
    />
    {errors[id] && (
      <p className="text-red-500 text-sm mt-1" id={`${id}-error`} role="alert">
        {errors[id].message}
      </p>
    )}
  </div>
);

// Social login button component
const SocialLoginButton: React.FC<{
  provider: string;
  onClick: () => void;
  disabled?: boolean;
  icon: React.ReactNode;
}> = ({ provider, onClick, disabled = false, icon }) => (
  <button
    type="button"
    className="w-full flex items-center justify-center gap-2 border border-gray-300 p-2 rounded-md hover:bg-gray-50 disabled:opacity-50"
    onClick={onClick}
    disabled={disabled}
    aria-label={`Continue with ${provider}`}
  >
    {icon}
    Continue with {provider}
  </button>
);

// Divider component
const Divider: React.FC = () => (
  <div className="relative mb-6">
    <div className="absolute inset-0 flex items-center">
      <div className="w-full border-t border-gray-300"></div>
    </div>
    <div className="relative flex justify-center text-sm">
      <span className="px-2 bg-white text-gray-500">OR CONTINUE WITH EMAIL</span>
    </div>
  </div>
);

// Google icon component
const GoogleIcon: React.FC = () => (
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
);

// Remember Me & Forgot Password row component
const LoginOptions: React.FC<{
  register: any;
}> = ({ register }) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center">
      <input
        id="rememberMe"
        type="checkbox"
        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        {...register("rememberMe")}
      />
      <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
        Remember me
      </label>
    </div>
    <div className="text-sm">
      <Link to="/forgot-password" className="text-blue-500 hover:underline">
        Forgot password?
      </Link>
    </div>
  </div>
);

// Login form component
const LoginForm: React.FC<{
  onSubmit: (values: LoginFormValues) => void;
  isLoading: boolean;
}> = ({ onSubmit, isLoading }) => {
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
      <div className="space-y-4">
        <FormInput
          id="email"
          label="Email"
          type="email"
          placeholder="name@example.com"
          register={form.register}
          errors={form.formState.errors}
          disabled={isLoading}
        />
        
        <FormInput
          id="password"
          label="Password"
          type="password"
          placeholder="••••••••"
          register={form.register}
          errors={form.formState.errors}
          disabled={isLoading}
        />
        
        <LoginOptions register={form.register} />
      </div>
      
      <div className="mt-6">
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:bg-blue-300"
          disabled={isLoading}
        >
          {isLoading ? "Signing in..." : "Sign in"}
        </button>
        <p className="text-center text-sm text-gray-600 mt-4">
          Don't have an account?{" "}
          <Link to="/register" className="text-blue-500 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </form>
  );
};

// Main Login component
export default function Login() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = React.useState(false);

  // Handle form submission
  const handleSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    try {
      // Attempt to sign in
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) {
        throw error;
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('Authentication failed');
        return;
      }

      // Track successful login
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'login', {
          method: 'email'
        });
      }

      // Check if user exists in users table and get their type
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('user_type')
        .eq('id', user.id)
        .single();
      
      if (userError && userError.code !== 'PGRST116') {
        console.error("Error fetching user data:", userError);
        toast.error("Error loading user profile");
        return;
      }
      
      if (userData) {
        // User exists, redirect based on their type
        if (userData.user_type === 'client') {
          navigate('/client/dashboard');
        } else if (userData.user_type === 'trainer') {
          navigate('/trainer/dashboard');
        } else {
          // Invalid user type
          navigate('/user-type-selection');
        }
      } else {
        // If no user type found, redirect to user type selection
        navigate('/user-type-selection');
      }
      
    } catch (error: any) {
      console.error("Login failed:", error);
      
      // Handle specific error cases
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
  
      if (error) {
        throw error;
      }
      
      // Note: No need to track here as we'll redirect to callback
      // and handle the success there
      
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

  return (
    <div className="flex h-screen bg-white">
      {/* Left section - Blue sidebar with app info */}
      <div className="hidden md:flex md:w-1/2 bg-blue-500 flex-col items-center justify-center text-white p-10">
        <h1 className="text-4xl font-bold mb-4">Pumpee</h1>
        <p className="text-center text-xl">
          Track your fitness journey and achieve your goals with Pumpee
        </p>
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

          {/* Social login button */}
          <div className="mb-6">
            <SocialLoginButton
              provider="Google"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              icon={<GoogleIcon />}
            />
          </div>

          <Divider />

          <LoginForm onSubmit={handleSubmit} isLoading={isLoading} />
        </div>
      </div>

      {/* Toaster for notifications */}
      <Toaster position="top-right" richColors />
    </div>
  );
}