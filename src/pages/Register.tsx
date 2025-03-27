import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    acceptTerms: false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // Clear error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'You must accept the terms and conditions';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      // Submit form data to your backend or authentication service
      console.log('Form submitted:', formData);
      // Redirect to dashboard or show success message
    }
  };
  
  return (
    <div className="flex min-h-screen bg-background">
      {/* Left side with image/branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary items-center justify-center">
        <div className="max-w-md text-center">
          <h1 className="text-4xl font-bold text-white mb-6">Pumpee</h1>
          <p className="text-primary-foreground text-lg">
            Join thousands of fitness enthusiasts tracking their progress with Pumpee
          </p>
        </div>
      </div>
      
      {/* Right side with registration form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground">Create an account</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Start your fitness journey with Pumpee today
            </p>
          </div>
          
          <div className="space-y-6">
            {/* Social signup buttons */}
            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full flex items-center justify-center gap-3"
                onClick={() => console.log('Google sign up')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  <path d="M1 1h22v22H1z" fill="none"/>
                </svg>
                Sign up with Google
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full flex items-center justify-center gap-3"
                onClick={() => console.log('Apple sign up')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16.8 0.2c-2 0.2-3.3 1.4-4.1 2.6-0.7 1.1-1.4 2.8-1.2 4.5 1.9 0.1 3.9-1 4.8-2.5 0.9-1.5 1.5-3.1 1.2-4.6-0.3 0-0.5 0-0.7 0z" />
                  <path d="M22 16.7c-0.3 0.7-0.4 1-0.8 1.7-1.1 1.7-2.8 3.8-4.9 3.8-1.8 0-2.3-1.1-4.8-1.1-2.4 0-3 1.1-4.9 1.1-2 0-3.5-1.8-4.9-3.9-3.3-5.3-3.6-11.5 0.6-14.7 1.9-1.5 4.5-1.4 6.1 0.4 1-1.6 3-2.6 5.1-2.2 1.6 0.3 3.2 1.2 4.2 2.9-3.7 2-3.1 7.2 0.7 8.6-0.9 2.5-2.6 4.1-3.4 4.4z" />
                </svg>
                Sign up with Apple
              </Button>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or sign up with email
                </span>
              </div>
            </div>
            
            {/* Registration form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1">
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="John Doe"
                  className={cn(
                    "w-full p-2 rounded-md border border-input bg-background",
                    errors.name && "border-destructive focus:ring-destructive"
                  )}
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-destructive">{errors.name}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  className={cn(
                    "w-full p-2 rounded-md border border-input bg-background",
                    errors.email && "border-destructive focus:ring-destructive"
                  )}
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-destructive">{errors.email}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  className={cn(
                    "w-full p-2 rounded-md border border-input bg-background",
                    errors.password && "border-destructive focus:ring-destructive"
                  )}
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-destructive">{errors.password}</p>
                )}
                <p className="mt-1 text-xs text-muted-foreground">
                  Password must be at least 8 characters long
                </p>
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-1">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  className={cn(
                    "w-full p-2 rounded-md border border-input bg-background",
                    errors.confirmPassword && "border-destructive focus:ring-destructive"
                  )}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-destructive">{errors.confirmPassword}</p>
                )}
              </div>
              
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="acceptTerms"
                    name="acceptTerms"
                    type="checkbox"
                    className={cn(
                      "h-4 w-4 border-border rounded",
                      errors.acceptTerms && "border-destructive"
                    )}
                    checked={formData.acceptTerms}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="acceptTerms" className="text-foreground">
                    I agree to the <Link to="/legal?tab=terms" className="text-primary hover:underline">Terms of Service</Link> and <Link to="/legal?tab=privacy" className="text-primary hover:underline">Privacy Policy</Link>
                  </label>
                  {errors.acceptTerms && (
                    <p className="mt-1 text-sm text-destructive">{errors.acceptTerms}</p>
                  )}
                </div>
              </div>
              
              <Button type="submit" className="w-full" variant="default">
                Create account
              </Button>
            </form>
            
            <div className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;