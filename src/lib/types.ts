// src/lib/types.ts
import { Session, User } from '@supabase/supabase-js';

export type UserType = 'client' | 'trainer';

// User profile data structure
export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  user_type?: UserType;
  registration_method?: string;
  created_at?: string;
}

// Client-specific profile data
export interface ClientProfile extends UserProfile {
  user_type: 'client';
  trainer_id?: string;
  metrics?: Record<string, any>;
}

// Trainer-specific profile data
export interface TrainerProfile extends UserProfile {
  user_type: 'trainer';
  subscription_tier_id: string;
  bio?: string;
  specialties?: string[];
}

// Subscription data structure
export interface SubscriptionTier {
  id: string;
  name: string;
  price: number | null;
  billing_cycle: string;
  description: string | null;
  client_limit: number | null;
  yearly_price: number | null;
  sale_price: number | null;
  justification: string | null;
}

// Auth-related data and functions
export interface AuthData {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, userData: { fullName: string }) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  getUserType: () => Promise<UserType | null>;
  getUserProfile: () => Promise<UserProfile | null>;
}

// Registration form values
export interface RegistrationFormValues {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

// Login form values
export interface LoginFormValues {
  email: string;
  password: string;
}