// src/components/features/client/ClientSubscriptionBox.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/atoms/Button';
import LoadingSpinner from '@/components/atoms/LoadingSpinner';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/organisms/Card';
import { ClientAPI } from '@/lib/api';
import { showErrorToast } from '@/lib/errors';
import { DASHBOARD_ROUTES } from '@/lib/constants';
import { UserProfile } from '@/lib/types';

// Interface for trainer info
interface TrainerInfo {
  id: string;
  full_name: string;
  email: string;
  subscription_name: string;
  subscription_price: number | null;
  start_date: string;
}

export const ClientSubscriptionBox: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [trainerInfo, setTrainerInfo] = useState<TrainerInfo | null>(null);

  useEffect(() => {
    async function fetchTrainerData() {
      try {
        setLoading(true);
        
        // In a real app, this would be:
        // const trainer = await ClientAPI.getAssignedTrainer();
        
        // For now, we'll use mock data - null to simulate no trainer assigned
        const trainer = null;
        setTrainerInfo(trainer);
      } catch (error) {
        showErrorToast(error, 'Failed to load trainer information');
      } finally {
        setLoading(false);
      }
    }
    
    fetchTrainerData();
  }, []);

  // Loading state
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Trainer Subscription</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center min-h-[200px]">
          <LoadingSpinner size="md" />
          <p className="mt-4 text-sm text-gray-500">Loading subscription details...</p>
        </CardContent>
      </Card>
    );
  }

  // No trainer state
  if (!trainerInfo) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Trainer Subscription</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-gray-500">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 00-3-3.87"></path>
                <path d="M16 3.13a4 4 0 010 7.75"></path>
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">No Active Subscription</h3>
            <p className="text-gray-600 mb-6">
              You don't have an active trainer subscription. 
              Find a trainer to help you achieve your fitness goals.
            </p>
            <Button variant="blue" size="sm">
              <Link to={DASHBOARD_ROUTES.CLIENT.TRAINERS}>Find a Trainer</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Active trainer subscription
  return (
    <Card>
      <CardHeader>
        <CardTitle>Trainer Subscription</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-[#007bff] text-white flex items-center justify-center mr-3">
              {trainerInfo.full_name.charAt(0)}
            </div>
            <div>
              <h3 className="font-medium text-gray-800">{trainerInfo.full_name}</h3>
              <p className="text-sm text-gray-500">{trainerInfo.email}</p>
            </div>
          </div>
          
          <div className="pt-4 border-t border-gray-200">
            <div className="flex justify-between py-2">
              <span className="text-gray-500">Subscription</span>
              <span className="font-medium">{trainerInfo.subscription_name}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-500">Price</span>
              <span className="font-medium">
                {trainerInfo.subscription_price 
                  ? `${trainerInfo.subscription_price} CZK/month` 
                  : 'Free'}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-500">Start Date</span>
              <span className="font-medium">
                {new Date(trainerInfo.start_date).toLocaleDateString()}
              </span>
            </div>
          </div>
          
          <div className="flex justify-between pt-4">
            <Button variant="outline" size="sm">
              <Link to={`${DASHBOARD_ROUTES.CLIENT.TRAINERS}/${trainerInfo.id}`}>
                View Trainer
              </Link>
            </Button>
            <Button variant="blue" size="sm">
              Contact Trainer
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClientSubscriptionBox;