// src/components/features/trainer/SubscriptionBox.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useSubscription, formatPrice } from '@/pages/features/trainer/hooks/useSubscription';
import { ArrowRight } from 'lucide-react';
import LoadingSpinner from '@/components/atoms/LoadingSpinner';

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
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <div className="flex flex-col items-center justify-center h-48 space-y-4">
          <LoadingSpinner size="md" color="primary" />
          <p className="text-sm text-gray-500">Loading subscription details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <h3 className="text-lg font-medium text-[#040b07] mb-6">Subscription</h3>
        <div className="p-4 border border-red-200 rounded-md bg-red-50 text-red-600 mb-4">
          <p>Unable to load subscription details.</p>
          <p className="text-sm mt-1">Please try again later.</p>
        </div>
        <Link 
          to="/trainer/subscriptions"
          className="flex justify-between items-center w-full mt-6 py-2 px-4 text-center text-white bg-[#007bff] rounded-md hover:bg-blue-600 transition-colors group"
        >
          <span>Manage subscription</span>
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    );
  }

  // Determine progress bar color based on usage percentage
  let progressColor = 'bg-[#007bff]'; // Primary color from your palette
  if (usagePercentage >= 90) {
    progressColor = 'bg-red-500';
  } else if (usagePercentage >= 70) {
    progressColor = 'bg-[#ff7f0e]'; // Secondary color from your palette
  }

  // Determine subscription name color based on tier
  let subscriptionNameColor = 'text-gray-700';
  if (subscription?.name === 'Advanced') {
    subscriptionNameColor = 'text-[#007bff]';
  } else if (subscription?.name === 'Pro') {
    subscriptionNameColor = 'text-[#ff7f0e]';
  } else if (subscription?.name === 'Arnold') {
    subscriptionNameColor = 'text-[#7690cd]';
  }

  return (
    <div className="rounded-lg bg-white p-6 shadow-sm">
      <h3 className="text-lg font-medium text-[#040b07] mb-6">Subscription</h3>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-500">Current plan</span>
          <span className={`font-semibold ${subscriptionNameColor}`}>
            {subscription?.name || 'None'}
          </span>
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
            <span className="font-semibold">
              {clientCount} / {clientLimit || 'Unlimited'}
            </span>
          </div>
          
          {clientLimit && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`${progressColor} h-2 rounded-full transition-all duration-500`}
                style={{ width: `${usagePercentage}%` }}
                aria-valuenow={usagePercentage}
                aria-valuemin={0}
                aria-valuemax={100}
                role="progressbar"
              ></div>
            </div>
          )}
        </div>
      </div>
      
      {/* Fixed link that preserves authentication */}
      <Link 
        to="/trainer/subscriptions"
        className="flex justify-between items-center w-full mt-6 py-2 px-4 text-center text-white bg-[#007bff] rounded-md hover:bg-blue-600 transition-colors group"
      >
        <span>Manage subscription</span>
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </Link>
    </div>
  );
}