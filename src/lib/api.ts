// src/lib/api.ts
import { supabase } from '@/lib/supabaseClient';
import { UserProfile, UserType, SubscriptionTier } from '@/lib/types';

/**
 * Authentication related API functions
 */
export const AuthAPI = {
  /**
   * Get the current user's profile data
   */
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
  
  /**
   * Get the current user's type (client or trainer)
   */
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
  
  /**
   * Check if email exists in the database
   */
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

  /**
   * Update user type and create appropriate profile
   */
  updateUserType: async (userId: string, userType: UserType): Promise<boolean> => {
    try {
      // Update user type
      const { error: updateError } = await supabase
        .from('users')
        .update({ user_type: userType })
        .eq('id', userId);
        
      if (updateError) throw updateError;
      
      // Create profile based on user type
      if (userType === 'client') {
        const { error: clientError } = await supabase
          .from('clients')
          .upsert({ user_id: userId });
          
        if (clientError) throw clientError;
      } else {
        // For trainers, get basic subscription tier
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

/**
 * Trainer related API functions
 */
export const TrainerAPI = {
  /**
   * Get trainer's subscription details
   */
  getSubscription: async (): Promise<SubscriptionTier | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return null;
      
      // Get trainer's subscription tier ID
      const { data: trainerData, error: trainerError } = await supabase
        .from('trainers')
        .select('subscription_tier_id')
        .eq('user_id', user.id)
        .single();
        
      if (trainerError) throw trainerError;
      
      // Get subscription tier details
      const { data: subscription, error: subscriptionError } = await supabase
        .from('subscription_tiers')
        .select('*')
        .eq('id', trainerData.subscription_tier_id)
        .single();
        
      if (subscriptionError) throw subscriptionError;
      
      return subscription as SubscriptionTier;
    } catch (error) {
      console.error('Error fetching subscription:', error);
      return null;
    }
  },
  
  /**
   * Update trainer's subscription
   */
  updateSubscription: async (tierId: string): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return false;
      
      const { error } = await supabase
        .from('trainers')
        .update({ subscription_tier_id: tierId })
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error updating subscription:', error);
      return false;
    }
  },
  
  /**
   * Get count of trainer's clients
   */
  getClientCount: async (): Promise<number> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return 0;
      
      const { count, error } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true })
        .eq('trainer_id', user.id);
        
      if (error) throw error;
      
      return count || 0;
    } catch (error) {
      console.error('Error fetching client count:', error);
      return 0;
    }
  },
  
  /**
   * Get all subscription tiers
   */
  getAllSubscriptionTiers: async (): Promise<SubscriptionTier[]> => {
    try {
      const { data, error } = await supabase
        .from('subscription_tiers')
        .select('*')
        .order('price', { ascending: true });
        
      if (error) throw error;
      
      return data as SubscriptionTier[];
    } catch (error) {
      console.error('Error fetching subscription tiers:', error);
      return [];
    }
  }
};

/**
 * Client related API functions
 */
export const ClientAPI = {
  /**
   * Get client's profile data
   */
  getClientProfile: async (): Promise<any | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('clients')
        .select('*, users(*)')
        .eq('user_id', user.id)
        .single();
        
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error fetching client profile:', error);
      return null;
    }
  },
  
  /**
   * Get client's assigned trainer
   */
  getAssignedTrainer: async (): Promise<any | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return null;
      
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('trainer_id')
        .eq('user_id', user.id)
        .single();
        
      if (clientError || !clientData?.trainer_id) return null;
      
      const { data: trainerData, error: trainerError } = await supabase
        .from('trainers')
        .select('*, users(*)')
        .eq('user_id', clientData.trainer_id)
        .single();
        
      if (trainerError) throw trainerError;
      
      return trainerData;
    } catch (error) {
      console.error('Error fetching assigned trainer:', error);
      return null;
    }
  }
};

/**
 * Common data fetching functions
 */
export const CommonAPI = {
  /**
   * Get app settings
   */
  getAppSettings: async (): Promise<any> => {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('*')
        .single();
        
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error fetching app settings:', error);
      return null;
    }
  }
};