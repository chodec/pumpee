import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/organisms/Card';
import { Button } from '@/components/atoms/Button';
import LoadingSpinner from '@/components/atoms/LoadingSpinner';
import Icon from '@/components/atoms/Icon';
import { useSubscription, formatPrice, calculateUsageStatus } from '@/pages/features/trainer/hooks/useSubscription';

interface PlanStyle {
  color: string;
  bgColor: string;
  iconColor: string;
}

const PLAN_STYLES: Record<string, PlanStyle> = {
  Basic: {
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    iconColor: 'text-gray-600'
  },
  Advanced: {
    color: 'text-[#007bff]',
    bgColor: 'bg-blue-100',
    iconColor: 'text-[#007bff]'
  },
  Pro: {
    color: 'text-[#ff7f0e]',
    bgColor: 'bg-orange-100',
    iconColor: 'text-[#ff7f0e]'
  },
  Arnold: {
    color: 'text-[#7690cd]',
    bgColor: 'bg-purple-100',
    iconColor: 'text-[#7690cd]'
  }
};

const LoadingState: React.FC = () => (
  <Card className="h-full">
    <CardContent className="flex flex-col items-center justify-center p-8 min-h-[280px]">
      <LoadingSpinner size="md" color="primary" />
      <p className="text-sm text-gray-500 mt-4">Loading subscription...</p>
    </CardContent>
  </Card>
);

interface ErrorStateProps {
  onRetry: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({ onRetry }) => (
  <Card className="h-full">
    <CardHeader className="pb-4">
      <CardTitle className="flex items-center text-lg">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 mr-3">
          <Icon name="credit-card" size={16} className="text-gray-600" />
        </div>
        Subscription
      </CardTitle>
    </CardHeader>
    
    <CardContent className="space-y-6">
      <div className="text-center p-4 bg-gray-50 rounded-lg">
        <div className="mb-2">
          <span className="text-sm text-gray-500">Current Plan</span>
        </div>
        <div className="text-xl font-bold text-gray-600 mb-1">Basic</div>
        <div className="text-lg font-semibold text-gray-700">Free</div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Client Usage</span>
          <span className="text-sm font-semibold text-gray-900">0 / 10</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div className="h-2.5 rounded-full bg-gray-400" style={{ width: '0%' }} />
        </div>
      </div>

      <div className="pt-2">
        <Link to="/trainer/subscriptions" className="block">
          <Button variant="blue" size="full" className="group">
            <span>Manage Subscription</span>
            <svg className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Button>
        </Link>
      </div>
    </CardContent>
  </Card>
);

interface CurrentPlanSectionProps {
  planName: string;
  price: string;
  style?: PlanStyle;
}

const CurrentPlanSection: React.FC<CurrentPlanSectionProps> = ({ 
  planName, 
  price, 
  style = PLAN_STYLES.Basic 
}) => (
  <div className="text-center p-4 bg-gray-50 rounded-lg">
    <div className="mb-2">
      <span className="text-sm text-gray-500">Current Plan</span>
    </div>
    <div className={`text-xl font-bold ${style.color} mb-1`}>
      {planName}
    </div>
    <div className="text-lg font-semibold text-gray-700">
      {price}
    </div>
  </div>
);

interface ClientUsageSectionProps {
  clientCount: number;
  clientLimit: number | null;
  usagePercentage: number;
}

const ClientUsageSection: React.FC<ClientUsageSectionProps> = ({
  clientCount,
  clientLimit,
  usagePercentage
}) => {
  const usageStatus = calculateUsageStatus(usagePercentage);
  
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">Client Usage</span>
        <span className="text-sm font-semibold text-gray-900">
          {clientCount} / {clientLimit || '∞'}
        </span>
      </div>
      
      <div className="space-y-2">
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className={`h-2.5 rounded-full transition-all duration-500 ${usageStatus.color}`}
            style={{ width: `${Math.min(usagePercentage, 100)}%` }}
            role="progressbar"
            aria-valuenow={usagePercentage}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
        
        {usageStatus.message && (
          <UsageWarning status={usageStatus.status} message={usageStatus.message} />
        )}
      </div>
    </div>
  );
};

interface UsageWarningProps {
  status: 'warning' | 'danger';
  message: string;
}

const UsageWarning: React.FC<UsageWarningProps> = ({ status, message }) => {
  const styles = {
    warning: {
      textColor: 'text-yellow-700',
      bgColor: 'bg-yellow-50',
      icon: (
        <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      )
    },
    danger: {
      textColor: 'text-red-600',
      bgColor: 'bg-red-50',
      icon: <Icon name="x" size={12} className="mr-1" />
    }
  };
  
  const style = styles[status];
  
  return (
    <div className={`flex items-center text-xs ${style.textColor} ${style.bgColor} p-2 rounded`}>
      {style.icon}
      <span>{message}</span>
    </div>
  );
};

const SubscriptionBox: React.FC = () => {
  const { 
    subscription, 
    clientCount, 
    clientLimit, 
    usagePercentage, 
    isLoading,
    error,
    refetch
  } = useSubscription();

  const getPlanStyle = (planName: string): PlanStyle => {
    return PLAN_STYLES[planName] || PLAN_STYLES.Basic;
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (error && !subscription) {
    return <ErrorState onRetry={refetch} />;
  }

  const planStyle = getPlanStyle(subscription?.name || 'Basic');
  const formattedPrice = formatPrice(subscription?.price, subscription?.billing_cycle);

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center text-lg">
          <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${planStyle.bgColor} mr-3`}>
            <Icon name="credit-card" size={16} className={planStyle.iconColor} />
          </div>
          Subscription
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <CurrentPlanSection 
          planName={subscription?.name || 'Basic'}
          price={formattedPrice}
          style={planStyle}
        />
        
        <ClientUsageSection 
          clientCount={clientCount}
          clientLimit={clientLimit}
          usagePercentage={usagePercentage}
        />

        <div className="pt-2">
          <Link to="/trainer/subscriptions" className="block">
            <Button variant="blue" size="full" className="group">
              <span>Manage Subscription</span>
              <svg className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default SubscriptionBox;