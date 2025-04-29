// src/pages/features/trainer/hooks/useSubscription.tsx
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

// Define subscription tier interface
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

// Define return type for the hook
export interface SubscriptionData {
  subscription: SubscriptionTier | null;
  clientCount: number;
  clientLimit: number | null;
  usagePercentage: number;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Custom hook to fetch trainer's current subscription data
 */
export function useSubscription(): SubscriptionData {
  const [subscription, setSubscription] = useState<SubscriptionTier | null>(null);
  const [clientCount, setClientCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchSubscriptionData() {
      try {
        setIsLoading(true);
        setError(null);
        
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          throw new Error('User not found');
        }
        
        // Get trainer data with subscription tier ID
        const { data: trainerData, error: trainerError } = await supabase
          .from('trainers')
          .select('subscription_tier_id')
          .eq('user_id', user.id)
          .single();
          
        if (trainerError) {
          throw trainerError;
        }
        
        if (!trainerData?.subscription_tier_id) {
          throw new Error('No subscription found');
        }
        
        // Get subscription tier details
        const { data: subscriptionData, error: subscriptionError } = await supabase
          .from('subscription_tiers')
          .select('*')
          .eq('id', trainerData.subscription_tier_id)
          .single();
          
        if (subscriptionError) {
          throw subscriptionError;
        }
        
        setSubscription(subscriptionData);
        
        // Count the trainer's clients
        const { count, error: countError } = await supabase
          .from('clients')
          .select('*', { count: 'exact', head: true })
          .eq('trainer_id', user.id);
          
        if (countError) {
          console.error('Error counting clients:', countError);
        } else {
          setClientCount(count || 0);
        }
        
      } catch (error: any) {
        console.error('Error fetching subscription data:', error);
        setError(error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchSubscriptionData();
  }, []);

  // Calculate usage percentage
  const clientLimit = subscription?.client_limit || null;
  const usagePercentage = clientLimit 
    ? Math.min(Math.round((clientCount / clientLimit) * 100), 100) 
    : 0;

  return {
    subscription,
    clientCount,
    clientLimit,
    usagePercentage,
    isLoading,
    error
  };
}

/**
 * Helper function to format price for display
 */
export function formatPrice(price: number | null, billingCycle?: string): string {
  if (price === null || price === 0) return 'Free';
  
  const formattedPrice = `${price.toLocaleString()} CZK`;
  
  if (!billingCycle) return formattedPrice;
  
  switch (billingCycle) {
    case 'monthly':
      return `${formattedPrice}/month`;
    case 'yearly':
      return `${formattedPrice}/year`;
    case 'custom':
      return formattedPrice;
    default:
      return formattedPrice;
  }
}