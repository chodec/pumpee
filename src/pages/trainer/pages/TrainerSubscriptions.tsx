// src/pages/trainer/pages/TrainerSubscriptions.tsx - Refactored Version
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/organisms/DashboardLayout';
import { Button } from '@/components/atoms/Button';
import Icon from '@/components/atoms/Icon';
import LoadingSpinner from '@/components/atoms/LoadingSpinner';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/organisms/Card';
import { toast } from 'sonner';
import { TrainerAPI } from '@/lib/api';
import { useSubscription } from '@/pages/features/trainer/hooks/useSubscription';
import { SUBSCRIPTION_TIERS, FEATURE_COMPARISON, USER_TYPES } from '@/lib/constants';
import { SubscriptionTier } from '@/lib/types';
import { showErrorToast, showSuccessToast } from '@/lib/errors';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface SubscriptionPageState {
  isLoading: boolean;
  upgradingTierId: string | null;
  showFeatureComparison: boolean;
  subscriptionTiers: typeof SUBSCRIPTION_TIERS;
}

interface TierColors {
  border: string;
  background: string;
}

interface TierVariant {
  variant: 'gray' | 'blue' | 'orange' | 'purple';
}

// ============================================================================
// CONSTANTS
// ============================================================================

const INITIAL_STATE: SubscriptionPageState = {
  isLoading: false,
  upgradingTierId: null,
  showFeatureComparison: false,
  subscriptionTiers: SUBSCRIPTION_TIERS
};

const TIER_COLORS: Record<string, TierColors> = {
  Basic: { border: 'border-gray-300', background: 'bg-gray-50' },
  Advanced: { border: 'border-blue-200', background: 'bg-blue-50' },
  Pro: { border: 'border-orange-200', background: 'bg-orange-50' },
  Arnold: { border: 'border-purple-200', background: 'bg-purple-50' }
};

const TIER_VARIANTS: Record<string, TierVariant> = {
  Basic: { variant: 'gray' },
  Advanced: { variant: 'blue' },
  Pro: { variant: 'orange' },
  Arnold: { variant: 'purple' }
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const getTierColor = (tierName: string): string => {
  return TIER_COLORS[tierName]?.border + ' ' + TIER_COLORS[tierName]?.background || 
         TIER_COLORS.Basic.border + ' ' + TIER_COLORS.Basic.background;
};

const getButtonVariant = (tierName: string) => {
  return TIER_VARIANTS[tierName]?.variant || 'gray';
};

const formatTierData = (tiers: SubscriptionTier[]) => {
  return tiers.map((tier) => {
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
};

// ============================================================================
// COMPONENT PARTS
// ============================================================================

interface PageHeaderProps {
  onToggleComparison: () => void;
  showComparison: boolean;
}

const PageHeader: React.FC<PageHeaderProps> = ({ onToggleComparison, showComparison }) => (
  <div>
    <h1 className="text-2xl font-bold text-[#040b07]">Subscription Plans</h1>
    <p className="text-gray-600 mt-2">
      Choose the plan that fits your training business needs
    </p>
  </div>
);

interface CurrentSubscriptionOverviewProps {
  subscription: SubscriptionTier | null;
  clientCount: number;
  clientLimit: number | null;
  usagePercentage: number;
  isLoading: boolean;
}

const CurrentSubscriptionOverview: React.FC<CurrentSubscriptionOverviewProps> = ({
  subscription,
  clientCount,
  clientLimit,
  usagePercentage,
  isLoading
}) => (
  <Card>
    <CardHeader>
      <CardTitle>Current Subscription</CardTitle>
    </CardHeader>
    <CardContent>
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner size="md" />
          <span className="ml-3 text-gray-500">Loading subscription details...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CurrentPlanDisplay subscription={subscription} />
          <ClientUsageDisplay 
            clientCount={clientCount}
            clientLimit={clientLimit}
            usagePercentage={usagePercentage}
          />
          <BillingDisplay subscription={subscription} />
        </div>
      )}
    </CardContent>
  </Card>
);

interface CurrentPlanDisplayProps {
  subscription: SubscriptionTier | null;
}

const CurrentPlanDisplay: React.FC<CurrentPlanDisplayProps> = ({ subscription }) => (
  <div className="flex items-center space-x-4">
    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-[#007bff]">
      <Icon name="credit-card" size={24} />
    </div>
    <div>
      <p className="text-sm text-gray-500">Current Plan</p>
      <p className="text-lg font-semibold text-[#007bff]">
        {subscription?.name || 'Basic'}
      </p>
    </div>
  </div>
);

interface ClientUsageDisplayProps {
  clientCount: number;
  clientLimit: number | null;
  usagePercentage: number;
}

const ClientUsageDisplay: React.FC<ClientUsageDisplayProps> = ({
  clientCount,
  clientLimit,
  usagePercentage
}) => (
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
);

interface BillingDisplayProps {
  subscription: SubscriptionTier | null;
}

const BillingDisplay: React.FC<BillingDisplayProps> = ({ subscription }) => (
  <div className="flex items-center space-x-4">
    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
      </svg>
    </div>
    <div>
      <p className="text-sm text-gray-500">Monthly Cost</p>
      <p className="text-lg font-semibold text-green-600">
        {subscription?.price ? `${subscription.price} CZK` : 'Free'}
      </p>
    </div>
  </div>
);

interface AvailablePlansProps {
  tiers: typeof SUBSCRIPTION_TIERS;
  currentSubscription: SubscriptionTier | null;
  isLoading: boolean;
  upgradingTierId: string | null;
  onSubscriptionChange: (tierId: string, tierName: string) => void;
  onToggleComparison: () => void;
  showComparison: boolean;
}

const AvailablePlans: React.FC<AvailablePlansProps> = ({
  tiers,
  currentSubscription,
  isLoading,
  upgradingTierId,
  onSubscriptionChange,
  onToggleComparison,
  showComparison
}) => (
  <div>
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-xl font-semibold text-[#040b07]">Available Plans</h2>
      <Button 
        variant="outline" 
        size="sm"
        onClick={onToggleComparison}
      >
        {showComparison ? 'Hide' : 'Compare'} Features
      </Button>
    </div>

    {isLoading ? (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    ) : (
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        {tiers.map((tier) => (
          <TierCard
            key={tier.id}
            tier={tier}
            currentSubscription={currentSubscription}
            isUpgrading={upgradingTierId === tier.id}
            onSubscriptionChange={onSubscriptionChange}
            disabled={isLoading}
          />
        ))}
      </div>
    )}
  </div>
);

interface TierCardProps {
  tier: typeof SUBSCRIPTION_TIERS[0];
  currentSubscription: SubscriptionTier | null;
  isUpgrading: boolean;
  onSubscriptionChange: (tierId: string, tierName: string) => void;
  disabled: boolean;
}

const TierCard: React.FC<TierCardProps> = ({
  tier,
  currentSubscription,
  isUpgrading,
  onSubscriptionChange,
  disabled
}) => {
  const isCurrentTier = tier.id === currentSubscription?.id || tier.name === currentSubscription?.name;
  
  return (
    <Card 
      className={`relative transition-all duration-200 hover:shadow-md ${
        isCurrentTier ? 'ring-2 ring-[#007bff] ring-opacity-50' : ''
      } ${tier.popular ? 'scale-105' : ''}`}
    >
      {tier.popular && <PopularBadge />}
      {isCurrentTier && <CurrentBadge />}
      
      <CardContent className="p-6">
        <TierHeader tier={tier} />
        <TierFeatures features={tier.features} />
        <TierActionButton
          tier={tier}
          isCurrentTier={isCurrentTier}
          isUpgrading={isUpgrading}
          onSubscriptionChange={onSubscriptionChange}
          disabled={disabled}
        />
      </CardContent>
    </Card>
  );
};

const PopularBadge: React.FC = () => (
  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
    <span className="bg-[#ff7f0e] text-white px-3 py-1 rounded-full text-xs font-medium">
      Most Popular
    </span>
  </div>
);

const CurrentBadge: React.FC = () => (
  <div className="absolute -top-3 right-4">
    <span className="bg-[#007bff] text-white px-3 py-1 rounded-full text-xs font-medium">
      Current
    </span>
  </div>
);

interface TierHeaderProps {
  tier: typeof SUBSCRIPTION_TIERS[0];
}

const TierHeader: React.FC<TierHeaderProps> = ({ tier }) => (
  <div className="text-center mb-6">
    <h3 className="text-xl font-bold text-[#040b07] mb-2">{tier.name}</h3>
    <div className="mb-3">
      {tier.name === 'Basic' ? (
        <span className="text-3xl font-bold text-gray-700">Free</span>
      ) : tier.name === 'Arnold' ? (
        <>
          <span className="text-lg font-semibold text-gray-600">Custom</span>
          <p className="text-sm text-gray-500">Contact Sales</p>
        </>
      ) : (
        <div>
          {tier.salePrice && tier.price && tier.salePrice < tier.price ? (
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
);

interface TierFeaturesProps {
  features: string[];
}

const TierFeatures: React.FC<TierFeaturesProps> = ({ features }) => (
  <div className="space-y-3 mb-6">
    {features.slice(0, 3).map((feature, idx) => (
      <div key={idx} className="flex items-center text-sm">
        <Icon name="check" className="text-green-500 mr-3 flex-shrink-0" size={16} />
        <span className="text-gray-700">{feature}</span>
      </div>
    ))}
    {features.length > 3 && (
      <div className="text-xs text-gray-500 ml-6">
        +{features.length - 3} more features
      </div>
    )}
  </div>
);

interface TierActionButtonProps {
  tier: typeof SUBSCRIPTION_TIERS[0];
  isCurrentTier: boolean;
  isUpgrading: boolean;
  onSubscriptionChange: (tierId: string, tierName: string) => void;
  disabled: boolean;
}

const TierActionButton: React.FC<TierActionButtonProps> = ({
  tier,
  isCurrentTier,
  isUpgrading,
  onSubscriptionChange,
  disabled
}) => (
  <Button
    onClick={() => onSubscriptionChange(tier.id, tier.name)}
    disabled={isCurrentTier || disabled}
    isLoading={isUpgrading}
    variant={isCurrentTier ? 'outline' : getButtonVariant(tier.name)}
    size="full"
    className="mt-auto"
  >
    {isCurrentTier ? 'Current Plan' : tier.buttonText}
  </Button>
);

interface FeatureComparisonProps {
  show: boolean;
}

const FeatureComparison: React.FC<FeatureComparisonProps> = ({ show }) => {
  if (!show) return null;
  
  return (
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
                  <FeatureCell hasFeature={item.basic} />
                  <FeatureCell hasFeature={item.advanced} />
                  <FeatureCell hasFeature={item.pro} />
                  <FeatureCell hasFeature={item.arnold} />
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

interface FeatureCellProps {
  hasFeature: boolean;
}

const FeatureCell: React.FC<FeatureCellProps> = ({ hasFeature }) => (
  <td className="py-3 px-4 text-center">
    {hasFeature ? (
      <Icon name="check" className="text-green-500 mx-auto" size={18} />
    ) : (
      <Icon name="x" className="text-gray-300 mx-auto" size={18} />
    )}
  </td>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const TrainerSubscriptions: React.FC = () => {
  const { 
    subscription: currentSubscription, 
    clientCount, 
    clientLimit, 
    usagePercentage, 
    refetch,
    isLoading: subscriptionLoading 
  } = useSubscription();
  
  const [state, setState] = useState<SubscriptionPageState>(INITIAL_STATE);

  const updateState = (updates: Partial<SubscriptionPageState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  // Fetch subscription tiers from API
  useEffect(() => {
    const fetchTiers = async () => {
      try {
        const tiers = await TrainerAPI.getAllSubscriptionTiers();
        if (tiers.length > 0) {
          const formattedTiers = formatTierData(tiers);
          updateState({ subscriptionTiers: formattedTiers });
        }
      } catch (error) {
        console.error('Error fetching subscription tiers:', error);
        // Keep default tiers on error
      }
    };

    fetchTiers();
  }, []);

  // Handle subscription changes
  const handleSubscriptionChange = async (tierId: string, tierName: string) => {
    // Special handling for Arnold tier
    if (tierName === 'Arnold' || tierId.includes('arnold')) {
      toast.info('Contact our sales team for custom pricing', {
        description: 'Email: sales@pumpee.com',
        duration: 4000
      });
      return;
    }
    
    // Don't change if already current
    if (tierId === currentSubscription?.id) return;
    
    try {
      updateState({ isLoading: true, upgradingTierId: tierId });
      
      const success = await TrainerAPI.updateSubscription(tierId);
      
      if (!success) {
        throw new Error('Failed to update subscription');
      }
      
      await refetch();
      showSuccessToast('Subscription updated successfully');
    } catch (error) {
      showErrorToast(error, 'Failed to update subscription');
    } finally {
      updateState({ isLoading: false, upgradingTierId: null });
    }
  };

  const handleToggleComparison = () => {
    updateState({ showFeatureComparison: !state.showFeatureComparison });
  };

  return (
    <DashboardLayout userType={USER_TYPES.TRAINER}>
      <div className="space-y-8">
        <PageHeader 
          onToggleComparison={handleToggleComparison}
          showComparison={state.showFeatureComparison}
        />

        <CurrentSubscriptionOverview
          subscription={currentSubscription}
          clientCount={clientCount}
          clientLimit={clientLimit}
          usagePercentage={usagePercentage}
          isLoading={subscriptionLoading}
        />

        <AvailablePlans
          tiers={state.subscriptionTiers}
          currentSubscription={currentSubscription}
          isLoading={state.isLoading}
          upgradingTierId={state.upgradingTierId}
          onSubscriptionChange={handleSubscriptionChange}
          onToggleComparison={handleToggleComparison}
          showComparison={state.showFeatureComparison}
        />

        <FeatureComparison show={state.showFeatureComparison} />
      </div>
    </DashboardLayout>
  );
};

export default TrainerSubscriptions;