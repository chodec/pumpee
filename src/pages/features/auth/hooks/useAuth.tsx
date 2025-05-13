// src/pages/features/auth/hooks/useAuth.tsx
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { AuthData, UserProfile, UserType } from '@/lib/types';
import { Session, User } from '@supabase/supabase-js';

// Create context with undefined as default value
const AuthContext = createContext<AuthData | undefined>(undefined);

// Define props type for AuthProvider
interface AuthProviderProps {
  children: ReactNode;
}

// AuthProvider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Get initial session
    const initializeAuth = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Get the current session
        const { data, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        setSession(data.session);
        setUser(data.session?.user ?? null);
      } catch (error: any) {
        console.error('Error initializing auth:', error);
        setError(error);
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeAuth();

    // Set up auth state listener for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log('Auth state changed:', event, newSession?.user?.id);
        setSession(newSession);
        setUser(newSession?.user ?? null);
        setIsLoading(false);
      }
    );

    // Clean up the subscription
    return () => subscription.unsubscribe();
  }, []);

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error };
    } catch (error: any) {
      setError(error);
      return { error };
    } finally {
      setIsLoading(false);
    }
  };

  // Sign in with Google OAuth
  const signInWithGoogle = async () => {
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          scopes: 'email profile'
        }
      });
      
      return { error };
    } catch (error: any) {
      setError(error);
      return { error };
    }
  };

  // Sign up with email and password
  const signUp = async (email: string, password: string, userData: { fullName: string }) => {
    setIsLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            full_name: userData.fullName,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback?type=signup`
        }
      });
      
      return { error };
    } catch (error: any) {
      setError(error);
      return { error };
    } finally {
      setIsLoading(false);
    }
  };

  // Sign out
  const signOut = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await supabase.auth.signOut();
    } catch (error: any) {
      console.error('Error signing out:', error);
      setError(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get user type (client or trainer)
  const getUserType = async (): Promise<UserType | null> => {
    if (!user) return null;
  
    try {
      const { data, error } = await supabase
        .from('users')
        .select('user_type')
        .eq('id', user.id)
        .single();
    
      if (error) {
        console.error('Error fetching user type:', error);
        return null;
      }
    
      return (data?.user_type as UserType) || null;
    } catch (error) {
      console.error('Error in getUserType:', error);
      return null;
    }
  };

  // Get user profile data
  const getUserProfile = async (): Promise<UserProfile | null> => {
    if (!user) return null;
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }
      
      return data as UserProfile;
    } catch (error) {
      console.error('Error in getUserProfile:', error);
      return null;
    }
  };

  // Create the context value object with all our auth functions and state
  const contextValue: AuthData = {
    session,
    user,
    isLoading,
    error,
    signIn,
    signInWithGoogle,
    signUp,
    signOut,
    getUserType,
    getUserProfile
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};