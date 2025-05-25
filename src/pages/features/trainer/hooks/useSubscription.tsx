// src/pages/features/trainer/hooks/useSubscription.tsx - Refactored Version
import { useState, useEffect, useCallback } from 'react';
import { TrainerAPI } from '@/lib/api';
import { SubscriptionTier } from '@/lib/types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface SubscriptionState {
  subscription: SubscriptionTier | null;
  clientCount: number;
  isLoading: boolean;
  error: Error | null;
}

export interface SubscriptionData extends SubscriptionState {
  clientLimit: number | null;
  usagePercentage: number;
  refetch: () => Promise<void>;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const INITIAL_STATE: SubscriptionState = {
  subscription: null,
  clientCount: 0,
  isLoading: true,
  error: null
};

const FALLBACK_SUBSCRIPTION: SubscriptionTier = {
  id: 'basic-fallback',
  name: 'Basic',
  price: 0,
  billing_cycle: 'monthly',
  description: 'Basic plan',
  client_limit: 10,
  yearly_price: null,
  sale_price: null,
  justification: null
};

// ============================================================================
// CUSTOM HOOK
// ============================================================================

export function useSubscription(): SubscriptionData {
  const [state, setState] = useState<SubscriptionState>(INITIAL_STATE);

  const updateState = useCallback((updates: Partial<SubscriptionState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const fetchSubscriptionData = useCallback(async () => {
    try {
      updateState({ isLoading: true, error: null });
      
      const [subscriptionData, clientCount] = await Promise.all([
        TrainerAPI.getSubscription(),
        TrainerAPI.getClientCount()
      ]);
      
      updateState({
        subscription: subscriptionData || FALLBACK_SUBSCRIPTION,
        clientCount,
        isLoading: false
      });
      
    } catch (error: any) {
      console.error('Error fetching subscription data:', error);
      
      updateState({
        subscription: FALLBACK_SUBSCRIPTION,
        clientCount: 0,
        error,
        isLoading: false
      });
    }
  }, [updateState]);

  useEffect(() => {
    fetchSubscriptionData();
  }, [fetchSubscriptionData]);

  // Computed values
  const clientLimit = state.subscription?.client_limit || null;
  const usagePercentage = clientLimit 
    ? Math.min(Math.round((state.clientCount / clientLimit) * 100), 100) 
    : 0;

  return {
    ...state,
    clientLimit,
    usagePercentage,
    refetch: fetchSubscriptionData
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function formatPrice(price: number | null, billingCycle?: string): string {
  if (price === null || price === 0) return 'Free';
  
  const formattedPrice = `${price.toLocaleString()} CZK`;
  
  const cycleMap: Record<string, string> = {
    monthly: '/month',
    yearly: '/year',
    custom: ''
  };
  
  const suffix = billingCycle ? cycleMap[billingCycle] || '' : '';
  return `${formattedPrice}${suffix}`;
}

export function calculateUsageStatus(usagePercentage: number): {
  color: string;
  status: 'safe' | 'warning' | 'danger';
  message?: string;
} {
  if (usagePercentage >= 90) {
    return {
      color: 'bg-red-500',
      status: 'danger',
      message: 'Client limit almost reached'
    };
  }
  
  if (usagePercentage >= 75) {
    return {
      color: 'bg-yellow-500',
      status: 'warning',
      message: 'Consider upgrading soon'
    };
  }
  
  return {
    color: 'bg-green-500',
    status: 'safe'
  };
}