// src/lib/api/auth.ts - Authentication related API calls
import { supabase } from '@/lib/supabaseClient';
import { UserProfile, UserType } from '../types';

export const AuthAPI = {
  getUserProfile: async (): Promise<UserProfile | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (error) throw error;
      return data as UserProfile;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  },
  
  getUserType: async (): Promise<UserType | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('users')
        .select('user_type')
        .eq('id', user.id)
        .single();
        
      if (error) throw error;
      return data?.user_type as UserType;
    } catch (error) {
      console.error('Error fetching user type:', error);
      return null;
    }
  },
  
  checkEmailExists: async (email: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('email')
        .eq('email', email)
        .maybeSingle();
        
      if (error) throw error;
      return !!data;
    } catch (error) {
      console.error('Error checking email:', error);
      return false;
    }
  },

  updateUserType: async (userId: string, userType: UserType): Promise<boolean> => {
    try {
      const { error: updateError } = await supabase
        .from('users')
        .update({ user_type: userType })
        .eq('id', userId);
        
      if (updateError) throw updateError;
      
      if (userType === 'client') {
        const { error: clientError } = await supabase
          .from('clients')
          .upsert({ user_id: userId });
          
        if (clientError) throw clientError;
      } else {
        const { data: basicTier, error: tierError } = await supabase
          .from('subscription_tiers')
          .select('id')
          .eq('name', 'Basic')
          .single();
          
        if (tierError) throw tierError;
        
        const { error: trainerError } = await supabase
          .from('trainers')
          .upsert({ 
            user_id: userId,
            subscription_tier_id: basicTier.id 
          });
          
        if (trainerError) throw trainerError;
      }
      
      return true;
    } catch (error) {
      console.error('Error updating user type:', error);
      return false;
    }
  }
};