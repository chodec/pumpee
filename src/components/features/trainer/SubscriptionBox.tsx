// src/components/features/trainer/SubscriptionBox.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useSubscription, formatPrice } from '@/pages/features/trainer/hooks/useSubscription';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/organisms/Card';
import { Button } from '@/components/atoms/Button';
import LoadingSpinner from '@/components/atoms/LoadingSpinner';
import Icon from '@/components/atoms/Icon';

export default function SubscriptionBox() {
  const { 
    subscription, 
    clientCount, 
    clientLimit, 
    usagePercentage, 
    isLoading,
    error
  } = useSubscription();

  // Loading state
  if (isLoading) {
    return (
      <Card className="h-full">
        <CardContent className="flex flex-col items-center justify-center p-8 min-h-[280px]">
          <LoadingSpinner size="md" color="primary" />
          <p className="text-sm text-gray-500 mt-4">Loading subscription...</p>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className="h-full border-red-200 bg-red-50">
        <CardContent className="flex flex-col items-center justify-center p-8 min-h-[280px]">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
            <Icon name="x" size={24} className="text-red-600" />
          </div>
          <h3 className="font-medium text-red-800 mb-2">Unable to load subscription</h3>
          <p className="text-sm text-red-600 text-center mb-6">
            Please try refreshing the page
          </p>
          <Button variant="outline" size="sm">
            <Link to="/trainer/subscriptions">
              Try Again
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Get plan color and icon based on tier
  const getPlanStyle = (planName: string) => {
    const styles = {
      'Basic': { 
        color: 'text-gray-600', 
        bgColor: 'bg-gray-100', 
        iconColor: 'text-gray-600'
      },
      'Advanced': { 
        color: 'text-[#007bff]', 
        bgColor: 'bg-blue-100', 
        iconColor: 'text-[#007bff]'
      },
      'Pro': { 
        color: 'text-[#ff7f0e]', 
        bgColor: 'bg-orange-100', 
        iconColor: 'text-[#ff7f0e]'
      },
      'Arnold': { 
        color: 'text-[#7690cd]', 
        bgColor: 'bg-purple-100', 
        iconColor: 'text-[#7690cd]'
      }
    };
    return styles[planName as keyof typeof styles] || styles.Basic;
  };

  const planStyle = getPlanStyle(subscription?.name || 'Basic');

  // Determine progress bar color based on usage
  const getProgressColor = () => {
    if (usagePercentage >= 90) return 'bg-red-500';
    if (usagePercentage >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center text-lg">
          <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${planStyle.bgColor} mr-3`}>
            <Icon name="credit-card" size={16} className={planStyle.iconColor} />
          </div>
          Subscription
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex flex-col flex-grow">
        <div className="space-y-6 flex-grow">
          {/* Current Plan Section */}
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="mb-2">
              <span className="text-sm text-gray-500">Current Plan</span>
            </div>
            <div className={`text-xl font-bold ${planStyle.color} mb-1`}>
              {subscription?.name || 'Basic'}
            </div>
            <div className="text-lg font-semibold text-gray-700">
              {formatPrice(subscription?.price, subscription?.billing_cycle)}
            </div>
          </div>

          {/* Client Usage Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Client Usage</span>
              <span className="text-sm font-semibold text-gray-900">
                {clientCount} / {clientLimit || '∞'}
              </span>
            </div>
            
            {/* Progress Bar */}
            {clientLimit ? (
              <div className="space-y-2">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full transition-all duration-500 ${getProgressColor()}`}
                    style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                    role="progressbar"
                    aria-valuenow={usagePercentage}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  />
                </div>
                
                {/* Usage warning */}
                {usagePercentage >= 90 && (
                  <div className="flex items-center text-xs text-red-600 bg-red-50 p-2 rounded">
                    <Icon name="x" size={12} className="mr-1" />
                    <span>Client limit almost reached</span>
                  </div>
                )}
                
                {usagePercentage >= 75 && usagePercentage < 90 && (
                  <div className="flex items-center text-xs text-yellow-700 bg-yellow-50 p-2 rounded">
                    <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span>Consider upgrading soon</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-xs text-gray-500 italic">Unlimited clients</div>
            )}
          </div>
        </div>

        {/* Action Button - Pinned to bottom */}
        <div className="mt-auto pt-4">
          <Link to="/trainer/subscriptions" className="block">
            <Button 
              variant="blue" 
              size="full"
              className="group"
            >
              <span>Manage Subscription</span>
              <svg 
                className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}