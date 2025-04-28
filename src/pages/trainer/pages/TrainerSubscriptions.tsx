// src/pages/trainer/pages/TrainerSubscriptions.tsx
import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/organisms/DashboardLayout';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';
// Updated import path to match your project structure
import { useSubscription, formatPrice, SubscriptionTier } from '@/pages/features/trainer/hooks/useSubscription';

export default function TrainerSubscriptions() {
  const { subscription: currentSubscriptionData } = useSubscription();
  const [subscriptionTiers, setSubscriptionTiers] = useState<SubscriptionTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => {
    async function fetchSubscriptions() {
      try {
        setLoading(true);
        
        // Get all subscription tiers
        const { data: tiers, error: tiersError } = await supabase
          .from('subscription_tiers')
          .select('*')
          .order('price', { ascending: true });
          
        if (tiersError) throw tiersError;
        
        setSubscriptionTiers(tiers);
      } catch (error) {
        console.error('Error fetching subscriptions:', error);
        toast.error('Failed to load subscription data');
      } finally {
        setLoading(false);
      }
    }
    
    fetchSubscriptions();
  }, []);
  
  const handleUpgradeSubscription = async (tierId: string) => {
    if (tierId === currentSubscriptionData?.id) return;
    
    try {
      setUpgrading(true);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found');
      
      // Update trainer subscription
      const { error } = await supabase
        .from('trainers')
        .update({ subscription_tier_id: tierId })
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      toast.success('Subscription updated successfully');
      
      // Force reload to refresh subscription data
      setTimeout(() => {
        window.location.reload();
      }, 1500);
      
    } catch (error) {
      console.error('Error upgrading subscription:', error);
      toast.error('Failed to update subscription');
    } finally {
      setUpgrading(false);
    }
  };

  return (
    <DashboardLayout userType="trainer">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Subscription Plans</h1>
          <p className="text-gray-600 mt-2">
            Choose a subscription plan that fits your training business needs
          </p>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse border border-gray-200 rounded-lg p-6">
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-3"></div>
                <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-6"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {subscriptionTiers.map((tier) => (
              <div 
                key={tier.id} 
                className={`border rounded-lg p-6 ${
                  tier.id === currentSubscriptionData?.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 bg-white'
                }`}
              >
                <h3 className="text-xl font-semibold mb-2">{tier.name}</h3>
                <p className="text-2xl font-bold mb-4">
                  {formatPrice(tier.price, tier.billing_cycle)}
                </p>
                
                {tier.description && (
                  <p className="text-gray-600 mb-4">{tier.description}</p>
                )}
                
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Up to {tier.client_limit || 'Unlimited'} clients</span>
                  </li>
                  
                  {tier.has_discount && tier.discount_percentage && (
                    <li className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>{tier.discount_percentage}% discount on yearly billing</span>
                    </li>
                  )}
                  
                  {tier.yearly_price && (
                    <li className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Annual option: ${tier.yearly_price}/year</span>
                    </li>
                  )}
                </ul>
                
                <button
                  onClick={() => handleUpgradeSubscription(tier.id)}
                  disabled={upgrading || tier.id === currentSubscriptionData?.id}
                  className={`w-full py-2 px-4 rounded-md font-medium ${
                    tier.id === currentSubscriptionData?.id
                      ? 'bg-blue-500 text-white cursor-default'
                      : 'bg-white border border-blue-500 text-blue-500 hover:bg-blue-50'
                  }`}
                >
                  {tier.id === currentSubscriptionData?.id
                    ? 'Current Plan'
                    : upgrading
                      ? 'Updating...'
                      : 'Upgrade'}
                </button>
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-10 bg-gray-50 rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-medium mb-2">Need a custom plan?</h3>
          <p className="text-gray-600 mb-4">
            If none of our standard plans meet your needs, we can create a custom subscription plan tailored to your specific requirements.
          </p>
          <button
            className="text-blue-500 font-medium hover:text-blue-600"
            onClick={() => toast.info('Contact support for custom plans')}
          >
            Contact us for custom pricing
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}