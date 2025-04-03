import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from "sonner";
import { useAuth } from '@/pages/features/auth/hooks/useAuth';

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

// Typed form values
type RegistrationFormValues = z.infer<typeof formSchema>;

// Reusable form input component
const FormInput: React.FC<{
  id: keyof RegistrationFormValues;
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

// Registration form component
const RegistrationForm: React.FC<{
  onSubmit: (values: RegistrationFormValues) => void;
  isLoading: boolean;
}> = ({ onSubmit, isLoading }) => {
  const form = useForm<RegistrationFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormInput
            id="firstName"
            label="First name"
            placeholder="John"
            register={form.register}
            errors={form.formState.errors}
            disabled={isLoading}
          />
          <FormInput
            id="lastName"
            label="Last name"
            placeholder="Doe"
            register={form.register}
            errors={form.formState.errors}
            disabled={isLoading}
          />
        </div>
        
        <FormInput
          id="email"
          label="Email"
          type="email"
          placeholder="john.doe@example.com"
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
        
        <FormInput
          id="confirmPassword"
          label="Confirm Password"
          type="password"
          placeholder="••••••••"
          register={form.register}
          errors={form.formState.errors}
          disabled={isLoading}
        />
      </div>
      
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
  );
};

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

// Main Register component
export default function Register() {
  const navigate = useNavigate();
  const { signInWithGoogle, signUp } = useAuth();
  const [isLoading, setIsLoading] = React.useState(false);

  // Handle form submission
  const handleSubmit = async (values: RegistrationFormValues) => {
    try {
      setIsLoading(true);
      
      // Attempt to sign up with Supabase
      await signUp(values.email, values.password, {
        fullName: `${values.firstName} ${values.lastName}`
      });
      
      // Track successful registration
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'sign_up', {
          method: 'email'
        });
      }
      
      // Show success message
      toast.success("Account created successfully!");
      
      // Redirect to user type selection
      navigate('/user-type-selection');
      
    } catch (error: any) {
      console.error("Registration failed:", error);
      
      // Handle specific error cases
      if (error.message?.includes('email already exists')) {
        toast.error("This email is already registered. Please log in instead.");
      } else if (error.message?.includes('rate limit')) {
        toast.error("Too many attempts. Please try again later.");
      } else {
        toast.error("Registration failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Google sign-in
  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      await signInWithGoogle();
      
      // Track Google sign in
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'sign_up', {
          method: 'google'
        });
      }
      
      navigate('/user-type-selection');
    } catch (error: any) {
      console.error("Google login failed:", error);
      
      if (error.message?.includes('popup closed')) {
        toast.error("Sign-in window was closed. Please try again.");
      } else {
        toast.error("Google login failed. Please try again.");
      }
    } finally {
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

      {/* Right section - Registration form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold">Create an Account</h2>
            <p className="text-gray-600">
              Enter your information to create an account
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

          <RegistrationForm onSubmit={handleSubmit} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}