// src/components/features/trainer/SubscriptionBox.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useSubscription, formatPrice } from '@/pages/features/trainer/hooks/useSubscription';

// The key issue is here - make sure to use "export default function"
export default function SubscriptionBox() {
  const { 
    subscription, 
    clientCount, 
    clientLimit, 
    usagePercentage, 
    isLoading 
  } = useSubscription();

  if (isLoading) {
    return (
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <div className="animate-pulse">
          <div className="h-5 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
          <div className="h-8 bg-gray-200 rounded w-full mt-4"></div>
        </div>
      </div>
    );
  }

  // Determine progress bar color based on usage percentage
  let progressColor = 'bg-blue-500';
  if (usagePercentage >= 90) {
    progressColor = 'bg-red-500';
  } else if (usagePercentage >= 70) {
    progressColor = 'bg-yellow-500';
  }

  return (
    <div className="rounded-lg bg-white p-6 shadow-sm">
      <h3 className="text-lg font-medium text-gray-900 mb-6">Subscription</h3>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-500">Current plan</span>
          <span className="font-semibold">{subscription?.name || 'None'}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-500">Price</span>
          <span className="font-semibold">
            {formatPrice(subscription?.price, subscription?.billing_cycle)}
          </span>
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-500">Client limit usage</span>
            <span className="font-semibold">{clientCount} / {clientLimit || 'Unlimited'}</span>
          </div>
          
          {clientLimit && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`${progressColor} h-2 rounded-full`}
                style={{ width: `${usagePercentage}%` }}
              ></div>
            </div>
          )}
        </div>
      </div>
      
      <Link 
        to="/trainer/subscriptions"
        className="block w-full mt-6 py-2 text-center bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
      >
        Manage subscription
      </Link>
    </div>
  );
}