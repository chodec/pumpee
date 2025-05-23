// src/pages/trainer/pages/TrainerSubscriptions.tsx
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/organisms/DashboardLayout';
import { Button } from '@/components/atoms/Button';
import Icon from '@/components/atoms/Icon';
import LoadingSpinner from '@/components/atoms/LoadingSpinner';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/organisms/Card';
import { Toaster, toast } from '@/components/feedback/Toast';
import { TrainerAPI } from '@/lib/api';
import { useSubscription } from '@/pages/features/trainer/hooks/useSubscription';
import { SUBSCRIPTION_TIERS, FEATURE_COMPARISON, USER_TYPES } from '@/lib/constants';
import { SubscriptionTier } from '@/lib/types';
import { showErrorToast, showSuccessToast } from '@/lib/errors';

export default function TrainerSubscriptions() {
  const { subscription: currentSubscription, clientCount, clientLimit, usagePercentage, refetch } = useSubscription();
  const [isLoading, setIsLoading] = useState(false);
  const [upgradingTierId, setUpgradingTierId] = useState<string | null>(null);
  const [showFeatureComparison, setShowFeatureComparison] = useState(false);
  const [subscriptionTiers, setSubscriptionTiers] = useState(SUBSCRIPTION_TIERS);

  // Fetch actual subscription tiers from the database
  useEffect(() => {
    const fetchTiers = async () => {
      try {
        const tiers = await TrainerAPI.getAllSubscriptionTiers();
        if (tiers.length > 0) {
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
      toast.info('Contact our sales team for custom pricing', {
        description: 'Email: sales@pumpee.com',
        duration: 4000
      });
      return;
    }
    
    // Don't do anything if this is already the current subscription
    if (tierId === currentSubscription?.id) return;
    
    try {
      setIsLoading(true);
      setUpgradingTierId(tierId);
      
      const success = await TrainerAPI.updateSubscription(tierId);
      
      if (!success) {
        throw new Error('Failed to update subscription');
      }
      
      await refetch();
      showSuccessToast('Subscription updated successfully');
    } catch (error) {
      showErrorToast(error, 'Failed to update subscription');
    } finally {
      setIsLoading(false);
      setUpgradingTierId(null);
    }
  };

  // Get tier color based on name
  const getTierColor = (tierName: string) => {
    const colors = {
      'Basic': 'border-gray-300 bg-gray-50',
      'Advanced': 'border-blue-200 bg-blue-50',
      'Pro': 'border-orange-200 bg-orange-50',
      'Arnold': 'border-purple-200 bg-purple-50'
    };
    return colors[tierName as keyof typeof colors] || colors.Basic;
  };

  // Get button variant based on tier
  const getButtonVariant = (tierName: string) => {
    const variants = {
      'Basic': 'gray' as const,
      'Advanced': 'blue' as const,
      'Pro': 'orange' as const,
      'Arnold': 'purple' as const
    };
    return variants[tierName as keyof typeof variants] || 'gray';
  };

  return (
    <DashboardLayout userType={USER_TYPES.TRAINER}>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-[#040b07]">Subscription Plans</h1>
          <p className="text-gray-600 mt-2">
            Choose the plan that fits your training business needs
          </p>
        </div>

        {/* Current Subscription Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Current Subscription</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Current Plan */}
              <div className="flex items-center space-x-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-[#007bff]">
                  <Icon name="credit-card" size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Current Plan</p>
                  <p className="text-lg font-semibold text-[#007bff]">
                    {currentSubscription?.name || 'Basic'}
                  </p>
                </div>
              </div>

              {/* Client Usage */}
              <div className="flex items-center space-x-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-[#7690cd]">
                  <Icon name="users" size={24} />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500">Client Usage</p>
                  <div className="flex items-center space-x-2">
                    <p className="text-lg font-semibold">
                      {clientCount} / {clientLimit || '∞'}
                    </p>
                    {clientLimit && (
                      <div className="flex-1 bg-gray-200 rounded-full h-2 min-w-[60px]">
                        <div 
                          className={`h-2 rounded-full transition-all duration-500 ${
                            usagePercentage >= 90 ? 'bg-red-500' : 
                            usagePercentage >= 70 ? 'bg-[#ff7f0e]' : 'bg-[#007bff]'
                          }`}
                          style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Billing */}
              <div className="flex items-center space-x-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Monthly Cost</p>
                  <p className="text-lg font-semibold text-green-600">
                    {currentSubscription?.price ? `${currentSubscription.price} CZK` : 'Free'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Available Plans */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-[#040b07]">Available Plans</h2>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowFeatureComparison(!showFeatureComparison)}
            >
              {showFeatureComparison ? 'Hide' : 'Compare'} Features
            </Button>
          </div>

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
                  <Card 
                    key={tier.id}
                    className={`relative transition-all duration-200 hover:shadow-md ${
                      isCurrentTier ? 'ring-2 ring-[#007bff] ring-opacity-50' : ''
                    } ${tier.popular ? 'scale-105' : ''}`}
                  >
                    {/* Popular badge */}
                    {tier.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="bg-[#ff7f0e] text-white px-3 py-1 rounded-full text-xs font-medium">
                          Most Popular
                        </span>
                      </div>
                    )}

                    {/* Current plan badge */}
                    {isCurrentTier && (
                      <div className="absolute -top-3 right-4">
                        <span className="bg-[#007bff] text-white px-3 py-1 rounded-full text-xs font-medium">
                          Current
                        </span>
                      </div>
                    )}
                    
                    <CardContent className="p-6">
                      {/* Plan name and price */}
                      <div className="text-center mb-6">
                        <h3 className="text-xl font-bold text-[#040b07] mb-2">{tier.name}</h3>
                        <div className="mb-3">
                          {tier.name === 'Basic' ? (
                            <div>
                              <span className="text-3xl font-bold text-gray-700">Free</span>
                            </div>
                          ) : tier.name === 'Arnold' ? (
                            <div>
                              <span className="text-lg font-semibold text-gray-600">Custom</span>
                              <p className="text-sm text-gray-500">Contact Sales</p>
                            </div>
                          ) : (
                            <div>
                              {tier.salePrice && tier.salePrice < tier.price ? (
                                <>
                                  <span className="text-lg text-gray-400 line-through">{tier.price}</span>
                                  <span className="text-3xl font-bold text-[#ff7f0e] ml-2">{tier.salePrice}</span>
                                </>
                              ) : (
                                <span className="text-3xl font-bold text-gray-700">{tier.price}</span>
                              )}
                              <span className="text-gray-500 text-sm ml-1">CZK/month</span>
                            </div>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm min-h-[40px]">
                          {tier.description}
                        </p>
                      </div>
                      
                      {/* Key features */}
                      <div className="space-y-3 mb-6">
                        {tier.features.slice(0, 3).map((feature, idx) => (
                          <div key={idx} className="flex items-center text-sm">
                            <Icon name="check" className="text-green-500 mr-3 flex-shrink-0" size={16} />
                            <span className="text-gray-700">{feature}</span>
                          </div>
                        ))}
                        {tier.features.length > 3 && (
                          <div className="text-xs text-gray-500 ml-6">
                            +{tier.features.length - 3} more features
                          </div>
                        )}
                      </div>
                      
                      {/* Action button */}
                      <Button
                        onClick={() => handleSubscriptionChange(tier.id)}
                        disabled={isCurrentTier || isLoading}
                        isLoading={isUpgrading}
                        variant={isCurrentTier ? 'outline' : getButtonVariant(tier.name)}
                        size="full"
                        className="mt-auto"
                      >
                        {isCurrentTier ? 'Current Plan' : tier.buttonText}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Feature comparison table */}
        {showFeatureComparison && (
          <Card>
            <CardHeader>
              <CardTitle>Feature Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="py-3 px-4 text-left font-medium text-gray-700">Feature</th>
                      <th className="py-3 px-4 text-center font-medium text-gray-700">Basic</th>
                      <th className="py-3 px-4 text-center font-medium text-gray-700">Advanced</th>
                      <th className="py-3 px-4 text-center font-medium text-gray-700">Pro</th>
                      <th className="py-3 px-4 text-center font-medium text-gray-700">Arnold</th>
                    </tr>
                  </thead>
                  <tbody>
                    {FEATURE_COMPARISON.map((item, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium text-gray-800">{item.feature}</td>
                        <td className="py-3 px-4 text-center">
                          {item.basic ? (
                            <Icon name="check" className="text-green-500 mx-auto" size={18} />
                          ) : (
                            <Icon name="x" className="text-gray-300 mx-auto" size={18} />
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {item.advanced ? (
                            <Icon name="check" className="text-green-500 mx-auto" size={18} />
                          ) : (
                            <Icon name="x" className="text-gray-300 mx-auto" size={18} />
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {item.pro ? (
                            <Icon name="check" className="text-green-500 mx-auto" size={18} />
                          ) : (
                            <Icon name="x" className="text-gray-300 mx-auto" size={18} />
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {item.arnold ? (
                            <Icon name="check" className="text-green-500 mx-auto" size={18} />
                          ) : (
                            <Icon name="x" className="text-gray-300 mx-auto" size={18} />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Toaster />
    </DashboardLayout>
  );
}