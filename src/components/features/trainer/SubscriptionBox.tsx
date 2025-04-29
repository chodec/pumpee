// src/components/features/trainer/SubscriptionBox.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useSubscription, formatPrice } from '@/pages/features/trainer/hooks/useSubscription';
import { ArrowRight } from 'lucide-react';

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