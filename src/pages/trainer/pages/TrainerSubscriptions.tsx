// src/pages/trainer/pages/TrainerSubscriptions.tsx
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/organisms/DashboardLayout';
import { Button } from '@/components/atoms/Button';
import Icon from '@/components/atoms/Icon';
import LoadingSpinner from '@/components/atoms/LoadingSpinner';
import { Toaster, toast } from '@/components/feedback/Toast';
import { TrainerAPI } from '@/lib/api';
import { useSubscription } from '@/pages/features/trainer/hooks/useSubscription';
import { SUBSCRIPTION_TIERS, FEATURE_COMPARISON, USER_TYPES } from '@/lib/constants';
import { SubscriptionTier } from '@/lib/types';
import { showErrorToast, showSuccessToast } from '@/lib/errors';

export default function TrainerSubscriptions() {
  const { subscription: currentSubscription, refetch } = useSubscription();
  const [isLoading, setIsLoading] = useState(false);
  const [upgradingTierId, setUpgradingTierId] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [showFeatureComparison, setShowFeatureComparison] = useState(false);
  const [subscriptionTiers, setSubscriptionTiers] = useState(SUBSCRIPTION_TIERS);

  // Fetch actual subscription tiers from the database
  useEffect(() => {
    const fetchTiers = async () => {
      try {
        const tiers = await TrainerAPI.getAllSubscriptionTiers();
        if (tiers.length > 0) {
          // Map database tiers to our formatted tiers with UI properties
          const formattedTiers = tiers.map((tier) => {
            const tierTemplate = SUBSCRIPTION_TIERS.find(t => t.name === tier.name) || SUBSCRIPTION_TIERS[0];
            return {
              ...tierTemplate,
              id: tier.id,
              name: tier.name,
              price: tier.price,
              salePrice: tier.sale_price,
              description: tier.description || tierTemplate.description
            };
          });
          setSubscriptionTiers(formattedTiers);
        }
      } catch (error) {
        showErrorToast(error, 'Failed to load subscription tiers');
      }
    };

    fetchTiers();
  }, []);

  // Handle subscription change
  const handleSubscriptionChange = async (tierId: string) => {
    // If clicking on Arnold tier, show contact info instead
    if (tierId.includes('arnold') || tierId.includes('tier_arnold')) {
      toast.info('Please contact our sales team for custom pricing', {
        description: 'Email sales@pumpee.com or call +1-555-123-4567',
        duration: 5000
      });
      return;
    }
    
    // Don't do anything if this is already the current subscription
    if (tierId === currentSubscription?.id) return;
    
    try {
      setIsLoading(true);
      setUpgradingTierId(tierId);
      
      // Update trainer subscription
      const success = await TrainerAPI.updateSubscription(tierId);
      
      if (!success) {
        throw new Error('Failed to update subscription');
      }
      
      // Refetch subscription data
      await refetch();
      
      showSuccessToast('Subscription updated successfully');
    } catch (error) {
      showErrorToast(error, 'Failed to update subscription');
    } finally {
      setIsLoading(false);
      setUpgradingTierId(null);
    }
  };

  return (
    <DashboardLayout userType={USER_TYPES.TRAINER}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#040b07]">Subscription Plans</h1>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Choose the plan that best suits your training business needs and scale as you grow.
          </p>
          
          {/* Billing cycle toggle */}
          <div className="mt-8 inline-flex border border-gray-200 rounded-md overflow-hidden">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-3 ${
                billingCycle === 'monthly' 
                  ? 'bg-[#f8f9fa] text-[#040b07] font-medium' 
                  : 'bg-white text-gray-500 hover:text-gray-700'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-3 ${
                billingCycle === 'yearly' 
                  ? 'bg-[#f8f9fa] text-[#040b07] font-medium' 
                  : 'bg-white text-gray-500 hover:text-gray-700'
              }`}
            >
              Yearly Billing <span className="text-green-600">Save up to 20%</span>
            </button>
          </div>
        </div>
        
        {/* Subscription Cards */}
        {isLoading && !upgradingTierId ? (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            {subscriptionTiers.map((tier) => {
              const isCurrentTier = tier.id === currentSubscription?.id;
              const isUpgrading = upgradingTierId === tier.id;
              
              return (
                <div 
                  key={tier.id}
                  className="relative bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex flex-col"
                >
                  {/* Popular tag for Pro tier */}
                  {tier.popular && (
                    <div className="absolute top-0 left-0 right-0 bg-[#ff7f0e] text-white text-center text-sm py-1">
                      Most popular
                    </div>
                  )}
                  
                  <div className="p-6 flex-grow">
                    <h3 className="text-xl font-bold">{tier.name}</h3>
                    <div className="mt-4 mb-3">
                      {tier.name === 'Basic' ? (
                        <div className="text-2xl font-bold">FREE</div>
                      ) : tier.name === 'Arnold' ? (
                        <div className="text-2xl font-bold">Dynamic Pricing</div>
                      ) : (
                        <div>
                          <span className="text-gray-500 line-through mr-2">{tier.price} CZK</span>
                          <span className="text-2xl font-bold">{tier.salePrice} CZK</span>
                          <span className="text-gray-500 text-sm">/{billingCycle === 'monthly' ? 'month' : 'year'}</span>
                        </div>
                      )}
                    </div>
                    
                    <p className="text-gray-600 min-h-[50px]">
                      {tier.description}
                    </p>
                    
                    {/* Features */}
                    <div className="space-y-3 mt-4">
                      {tier.features.map((feature, idx) => (
                        <div key={idx} className="flex items-start">
                          <Icon name="check" className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Button */}
                  <div className="p-6 mt-auto">
                    <Button
                      onClick={() => handleSubscriptionChange(tier.id)}
                      disabled={isCurrentTier || isLoading}
                      isLoading={isUpgrading && tier.id === upgradingTierId}
                      className={`w-full py-3 rounded-md text-white font-medium hover:opacity-90`}
                      style={{ backgroundColor: tier.buttonColor }}
                    >
                      {isCurrentTier ? 'Current Plan' : tier.buttonText}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {/* View All Features button */}
        <div className="mt-12 text-center">
          <Button
            onClick={() => setShowFeatureComparison(!showFeatureComparison)}
            variant="outline"
          >
            {showFeatureComparison ? 'Hide Features' : 'View All Features'}
          </Button>
        </div>
        
        {/* Features comparison table */}
        {showFeatureComparison && (
          <div className="mt-8 overflow-x-auto">
            <h2 className="text-xl font-bold text-[#040b07] mb-4">Features by Tier</h2>
            <table className="min-w-full border-collapse bg-gray-900 text-white rounded-lg overflow-hidden">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="py-3 px-4 text-left font-medium">Feature</th>
                  <th className="py-3 px-4 text-center font-medium">Basic</th>
                  <th className="py-3 px-4 text-center font-medium">Advanced</th>
                  <th className="py-3 px-4 text-center font-medium">Pro</th>
                  <th className="py-3 px-4 text-center font-medium">Arnold</th>
                </tr>
              </thead>
              <tbody>
                {FEATURE_COMPARISON.map((item, index) => (
                  <tr key={index} className="border-b border-gray-700">
                    <td className="py-3 px-4 font-medium">{item.feature}</td>
                    <td className="py-3 px-4 text-center">
                      {item.basic ? (
                        <Icon name="check" className="text-green-500 mx-auto" />
                      ) : (
                        <Icon name="x" className="text-red-500 mx-auto" />
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {item.advanced ? (
                        <Icon name="check" className="text-green-500 mx-auto" />
                      ) : (
                        <Icon name="x" className="text-red-500 mx-auto" />
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {item.pro ? (
                        <Icon name="check" className="text-green-500 mx-auto" />
                      ) : (
                        <Icon name="x" className="text-red-500 mx-auto" />
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {item.arnold ? (
                        <Icon name="check" className="text-green-500 mx-auto" />
                      ) : (
                        <Icon name="x" className="text-red-500 mx-auto" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}