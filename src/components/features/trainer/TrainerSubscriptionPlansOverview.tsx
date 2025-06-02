import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/organisms/Card';
import { Button } from '@/components/atoms/Button';
import LoadingSpinner from '@/components/atoms/LoadingSpinner';
import Icon from '@/components/atoms/Icon';
import { TrainerAPI } from '@/lib/api/trainer';
import { showErrorToast } from '@/lib/errors';

interface TrainerSubscriptionTier {
  id: string;
  trainer_id: string;
  name: string;
  description: string;
  price: number;
  yearly_price?: number | null;
  billing_cycle: 'monthly' | 'yearly';
  created_at: string;
  updated_at: string;
}

interface SubscriptionPlansStats {
  totalPlans: number;
}

export default function TrainerSubscriptionPlansOverview() {
  const [stats, setStats] = useState<SubscriptionPlansStats>({
    totalPlans: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscriptionPlansStats = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (typeof TrainerAPI.getTrainerSubscriptionTiers !== 'function') {
        throw new Error('getTrainerSubscriptionTiers function is not available');
      }
      
      const subscriptionPlans = await TrainerAPI.getTrainerSubscriptionTiers();
      
      const totalPlans = subscriptionPlans?.length || 0;
      
      setStats({ totalPlans });
    } catch (error) {
      console.error('Error fetching subscription plans stats:', error);
      setError('Failed to load subscription plans');
      showErrorToast(error, 'Failed to load subscription plans');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptionPlansStats();
  }, []);

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardContent className="flex flex-col items-center justify-center p-8 min-h-[280px]">
          <LoadingSpinner size="md" color="primary" />
          <p className="text-sm text-gray-500 mt-4">Loading subscription plans...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="h-full border-red-200 bg-red-50">
        <CardContent className="flex flex-col items-center justify-center p-8 min-h-[280px]">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
            <Icon name="x" size={24} className="text-red-600" />
          </div>
          <h3 className="font-medium text-red-800 mb-2">Unable to load subscription plans</h3>
          <p className="text-sm text-red-600 text-center mb-6">{error}</p>
          <Button variant="outline" size="sm" onClick={fetchSubscriptionPlansStats}>
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center text-lg">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 mr-3">
            <Icon name="credit-card" size={16} className="text-purple-600" />
          </div>
          Subscription Plans
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex flex-col flex-1">
        <div className="flex-1 flex items-center justify-center min-h-[120px]">
          {stats.totalPlans === 0 ? (
            <div className="text-center py-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 mx-auto mb-4">
                <Icon name="credit-card" size={24} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">No Subscription Plans</h3>
              <p className="text-gray-600 text-sm mb-6">Create subscription plans that clients can purchase</p>
              <Link to="/trainer/subscription-plans">
                <Button variant="blue" size="sm">Create Plan</Button>
              </Link>
            </div>
          ) : (
            <div className="text-center p-4 bg-gray-50 rounded-lg w-full max-w-xs mx-auto">
              <div className="text-2xl font-bold text-[#7690cd] mb-1">{stats.totalPlans}</div>
              <div className="text-sm text-gray-600">Active Plans</div>
            </div>
          )}
        </div>

        <div className="pt-6">
          <Link to="/trainer/subscription-plans" className="block">
            <Button variant="blue" size="full" className="group">
              <span>Manage Plans</span>
              <svg className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}