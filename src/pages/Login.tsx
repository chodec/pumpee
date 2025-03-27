import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  
  return (
    <div className="flex min-h-screen bg-background">
      {/* Left side with image/branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary items-center justify-center">
        <div className="max-w-md text-center">
          <h1 className="text-4xl font-bold text-white mb-6">Pumpee</h1>
          <p className="text-primary-foreground text-lg">
            Track your fitness journey and achieve your goals with Pumpee
          </p>
        </div>
      </div>
      
      {/* Right side with login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground">
              {isLogin ? 'Welcome back' : 'Create your account'}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {isLogin 
                ? 'Enter your credentials to access your account' 
                : 'Fill out the form to get started'}
            </p>
          </div>
          
          <div className="space-y-6">
            {/* Social login buttons */}
            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full flex items-center justify-center gap-3"
                onClick={() => console.log('Google sign in')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  <path d="M1 1h22v22H1z" fill="none"/>
                </svg>
                Continue with Google
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full flex items-center justify-center gap-3"
                onClick={() => console.log('Apple sign in')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20.94c1.5 0 2.75-.48 3.74-1.46 3.78-3.75 3.37-11.28 3.37-11.28.5-4.25-6-4.3-7.1-1.7-1.15-2.6-7.6-2.55-7.1 1.7 0 0-.4 7.53 3.37 11.28 1 .98 2.24 1.46 3.72 1.46z"/>
                  <path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/>
                </svg>
                Continue with Apple
              </Button>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with email
                </span>
              </div>
            </div>
            
            {/* Email/password form */}
            <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  className="w-full p-2 rounded-md border border-input bg-background"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="w-full p-2 rounded-md border border-input bg-background"
                  required
                />
              </div>
              
              {!isLogin && (
                <div>
                  <label htmlFor="confirm-password" className="block text-sm font-medium text-foreground mb-1">
                    Confirm Password
                  </label>
                  <input
                    id="confirm-password"
                    type="password"
                    placeholder="••••••••"
                    className="w-full p-2 rounded-md border border-input bg-background"
                    required
                  />
                </div>
              )}
              
              {isLogin && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      type="checkbox"
                      className="h-4 w-4 border-border rounded"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-foreground">
                      Remember me
                    </label>
                  </div>
                  
                  <div className="text-sm">
                    <a href="#" className="text-primary hover:underline">
                      Forgot password?
                    </a>
                  </div>
                </div>
              )}
              
              <Button type="submit" className="w-full" variant="default">
                {isLogin ? 'Sign in' : 'Create account'}
              </Button>
            </form>
            
            <div className="text-center text-sm text-muted-foreground">
              {isLogin ? (
                <>
                  Don't have an account?{' '}
                  <Link 
                    to="/register"
                    className="text-primary hover:underline font-medium"
                  >
                    Sign up
                  </Link>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button 
                    onClick={() => setIsLogin(true)}
                    className="text-primary hover:underline font-medium"
                  >
                    Sign in
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;