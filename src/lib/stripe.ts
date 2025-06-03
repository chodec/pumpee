// src/lib/stripe.ts
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { supabase } from '@/lib/supabaseClient';

let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
};

export interface CreateSubscriptionRequest {
  subscriptionTierId: string;
  billingCycle: 'monthly' | 'yearly';
}

export interface CreateSubscriptionResponse {
  success: boolean;
  subscriptionId?: string;
  clientSecret?: string;
  customerId?: string;
  message?: string;
  error?: string;
}

export interface CancelSubscriptionResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export class StripeService {
  static async createSubscription(request: CreateSubscriptionRequest): Promise<CreateSubscriptionResponse> {
    try {
      const { data: session } = await supabase.auth.getSession();
      
      if (!session?.session?.access_token) {
        throw new Error('Not authenticated');
      }

      const { data, error } = await supabase.functions.invoke('create-subscription', {
        body: request,
        headers: {
          Authorization: `Bearer ${session.session.access_token}`,
        },
      });

      if (error) {
        throw error;
      }

      return data;
    } catch (error: any) {
      console.error('Error creating subscription:', error);
      return {
        success: false,
        error: error.message || 'Failed to create subscription'
      };
    }
  }

  static async cancelSubscription(cancelAtPeriodEnd = true): Promise<CancelSubscriptionResponse> {
    try {
      const { data: session } = await supabase.auth.getSession();
      
      if (!session?.session?.access_token) {
        throw new Error('Not authenticated');
      }

      const { data, error } = await supabase.functions.invoke('cancel-subscription', {
        body: { cancelAtPeriodEnd },
        headers: {
          Authorization: `Bearer ${session.session.access_token}`,
        },
      });

      if (error) {
        throw error;
      }

      return data;
    } catch (error: any) {
      console.error('Error canceling subscription:', error);
      return {
        success: false,
        error: error.message || 'Failed to cancel subscription'
      };
    }
  }

  static async confirmPayment(clientSecret: string): Promise<{ success: boolean; error?: string }> {
    try {
      const stripe = await getStripe();
      
      if (!stripe) {
        throw new Error('Stripe not loaded');
      }

      const { error } = await stripe.confirmPayment({
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/trainer/subscriptions?success=true`,
        },
      });

      if (error) {
        return {
          success: false,
          error: error.message
        };
      }

      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Payment confirmation failed'
      };
    }
  }
}