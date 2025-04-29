// src/pages/trainer/pages/TrainerSubscriptions.tsx
import React, { useState } from 'react';
import DashboardLayout from '@/components/organisms/DashboardLayout';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';
import { Check, X } from 'lucide-react';
import { useSubscription } from '@/pages/features/trainer/hooks/useSubscription';

export default function TrainerSubscriptions() {
  const { subscription: currentSubscription } = useSubscription();
  const [loading, setLoading] = useState(false);
  const [upgrading, setUpgrading] = useState(false);
  const [upgradingTierId, setUpgradingTierId] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [showFeatureComparison, setShowFeatureComparison] = useState(false);

  // Define the subscription tiers
  const subscriptionTiers = [
    {
      id: 'tier_basic',
      name: 'Basic',
      price: 0,
      description: 'Perfect for new or part-time coaches starting small.',
      features: [
        'Up to 10 clients',
        'Basic reporting'
      ],
      buttonColor: 'bg-[#444d59]',
      buttonText: 'Select Plan'
    },
    {
      id: 'tier_advanced',
      name: 'Advanced',
      price: 300,
      salePrice: 250,
      description: 'Adds tools for better client tracking & engagement.',
      features: [
        'Up to 50 clients',
        'Basic reporting',
        'Advanced analytics'
      ],
      buttonColor: 'bg-[#007bff]',
      buttonText: 'Select Plan'
    },
    {
      id: 'tier_pro',
      name: 'Pro',
      price: 800,
      salePrice: 650,
      description: 'Designed for full-time coaches scaling their business.',
      features: [
        'Up to 150 clients',
        'Basic reporting',
        'Advanced analytics',
        'Custom branding'
      ],
      buttonColor: 'bg-[#ff7f0e]',
      buttonText: 'Select Plan',
      popular: true
    },
    {
      id: 'tier_arnold',
      name: 'Arnold',
      price: null,
      description: 'Built for elite coaches managing large client bases.',
      features: [
        'Unlimited clients',
        'Basic reporting',
        'Advanced analytics',
        'Custom branding',
        'Priority support'
      ],
      buttonColor: 'bg-[#7690cd]',
      buttonText: 'Contact Sales'
    }
  ];

  // Feature comparison table data
  const featureComparisonData = [
    { feature: 'Basic Analytics for Coaches', basic: true, advanced: true, pro: true, arnold: true },
    { feature: 'Measurement of Progress', basic: true, advanced: true, pro: true, arnold: true },
    { feature: 'Menu Planning', basic: true, advanced: true, pro: true, arnold: true },
    { feature: 'Training Plans', basic: true, advanced: true, pro: true, arnold: true },
    { feature: 'Table of Feelings', basic: false, advanced: true, pro: true, arnold: true },
    { feature: 'Notifications (Email)', basic: false, advanced: true, pro: true, arnold: true },
    { feature: 'In-App Messaging', basic: false, advanced: false, pro: true, arnold: true },
    { feature: 'Advanced Analytics for Coaches', basic: false, advanced: false, pro: true, arnold: true }
  ];

  // Handle subscription change
  const handleSubscriptionChange = async (tierId: string) => {
    // If clicking on Arnold tier, show contact info instead
    if (tierId === 'tier_arnold') {
      toast.info('Please contact our sales team for custom pricing', {
        description: 'Email sales@pumpee.com or call +1-555-123-4567',
        duration: 5000
      });
      return;
    }
    
    // Don't do anything if this is already the current subscription
    if (tierId === currentSubscription?.id) return;
    
    try {
      setUpgrading(true);
      setUpgradingTierId(tierId);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found');
      
      // Small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Update trainer subscription
      const { error } = await supabase
        .from('trainers')
        .update({ subscription_tier_id: tierId })
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      toast.success('Subscription updated successfully', {
        description: 'Your new subscription is now active'
      });
      
      // Reload the page after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 1500);
      
    } catch (error) {
      console.error('Error updating subscription:', error);
      toast.error('Failed to update subscription', {
        description: 'Please try again or contact support'
      });
    } finally {
      setUpgrading(false);
      setUpgradingTierId(null);
    }
  };

  return (
    <DashboardLayout userType="trainer">
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
        
        {/* Subscription Cards - with consistent height and button alignment */}
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
                        <span className="text-gray-500 text-sm">/month</span>
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
                        <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Button - always at the bottom with consistent styling */}
                <div className="p-6 mt-auto">
                  <button
                    onClick={() => handleSubscriptionChange(tier.id)}
                    disabled={isCurrentTier || upgrading}
                    className={`w-full py-3 rounded-md text-white font-medium hover:opacity-90 ${tier.buttonColor}`}
                  >
                    {isCurrentTier ? 'Current Plan' : (
                      isUpgrading && tier.id === upgradingTierId ? (
                        <div className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </div>
                      ) : tier.buttonText
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* View All Features button */}
        <div className="mt-12 text-center">
          <button
            onClick={() => setShowFeatureComparison(!showFeatureComparison)}
            className="inline-flex items-center px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
          >
            View All Features
          </button>
        </div>
        
        {/* Features comparison table */}
        {showFeatureComparison && (
          <div className="mt-8 overflow-x-auto">
            <h2 className="text-xl font-bold text-[#040b07] mb-4">Features by Tier</h2>
            <table className="min-w-full border-collapse bg-gray-900 text-white rounded-lg overflow-hidden">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="py-3 px-4 text-left font-medium">Feature</th>
                  <th className="py-3 px-4 text-center font-medium">Basic (0-10)</th>
                  <th className="py-3 px-4 text-center font-medium">Advanced (10-50)</th>
                  <th className="py-3 px-4 text-center font-medium">Pro (50-150)</th>
                  <th className="py-3 px-4 text-center font-medium">Arnold (150+)</th>
                </tr>
              </thead>
              <tbody>
                {featureComparisonData.map((item, index) => (
                  <tr key={index} className="border-b border-gray-700">
                    <td className="py-3 px-4 font-medium">{item.feature}</td>
                    <td className="py-3 px-4 text-center">
                      {item.basic ? (
                        <Check className="h-5 w-5 text-green-500 mx-auto" />
                      ) : (
                        <X className="h-5 w-5 text-red-500 mx-auto" />
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {item.advanced ? (
                        <Check className="h-5 w-5 text-green-500 mx-auto" />
                      ) : (
                        <X className="h-5 w-5 text-red-500 mx-auto" />
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {item.pro ? (
                        <Check className="h-5 w-5 text-green-500 mx-auto" />
                      ) : (
                        <X className="h-5 w-5 text-red-500 mx-auto" />
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {item.arnold ? (
                        <Check className="h-5 w-5 text-green-500 mx-auto" />
                      ) : (
                        <X className="h-5 w-5 text-red-500 mx-auto" />
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