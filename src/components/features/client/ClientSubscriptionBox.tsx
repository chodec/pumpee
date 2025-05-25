// src/components/features/client/ClientSubscriptionBox.tsx - Refactored Version
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/atoms/Button';
import LoadingSpinner from '@/components/atoms/LoadingSpinner';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/organisms/Card';
import { ClientAPI } from '@/lib/api';
import { showErrorToast } from '@/lib/errors';
import { DASHBOARD_ROUTES } from '@/lib/constants';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface TrainerInfo {
  id: string;
  full_name: string;
  email: string;
  subscription_name: string;
  subscription_price: number | null;
  start_date: string;
  status: 'active' | 'inactive' | 'pending';
}

interface SubscriptionState {
  trainer: TrainerInfo | null;
  loading: boolean;
  error: string | null;
  hasActiveSubscription: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const INITIAL_STATE: SubscriptionState = {
  trainer: null,
  loading: true,
  error: null,
  hasActiveSubscription: false
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const formatDate = (dateString: string): string => {
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', dateString);
    return dateString;
  }
};

const formatPrice = (price: number | null): string => {
  if (price === null || price === 0) return 'Free';
  return `${price} CZK/month`;
};

const getTrainerInitials = (fullName: string): string => {
  return fullName
    .split(' ')
    .map(name => name.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// ============================================================================
// COMPONENT PARTS
// ============================================================================

const LoadingState: React.FC = () => (
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

interface ErrorStateProps {
  error: string;
  onRetry: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({ error, onRetry }) => (
  <Card className="border-red-200 bg-red-50">
    <CardHeader>
      <CardTitle className="text-red-800">Trainer Subscription</CardTitle>
    </CardHeader>
    <CardContent className="text-center py-8">
      <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-red-800 mb-2">Unable to load subscription</h3>
      <p className="text-red-600 mb-6 text-sm">{error}</p>
      <Button variant="outline" size="sm" onClick={onRetry}>
        Try Again
      </Button>
    </CardContent>
  </Card>
);

const NoSubscriptionState: React.FC = () => (
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
        <Link to={DASHBOARD_ROUTES.CLIENT.TRAINERS}>
          <Button variant="blue" size="sm">
            Find a Trainer
          </Button>
        </Link>
      </div>
    </CardContent>
  </Card>
);

interface TrainerAvatarProps {
  fullName: string;
  size?: 'sm' | 'md' | 'lg';
}

const TrainerAvatar: React.FC<TrainerAvatarProps> = ({ fullName, size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-8 w-8 text-sm',
    md: 'h-10 w-10 text-base',
    lg: 'h-12 w-12 text-lg'
  };

  return (
    <div className={`rounded-full bg-[#007bff] text-white flex items-center justify-center font-medium ${sizeClasses[size]}`}>
      {getTrainerInitials(fullName)}
    </div>
  );
};

interface TrainerInfoSectionProps {
  trainer: TrainerInfo;
}

const TrainerInfoSection: React.FC<TrainerInfoSectionProps> = ({ trainer }) => (
  <div className="flex items-center mb-4">
    <TrainerAvatar fullName={trainer.full_name} size="md" />
    <div className="ml-3">
      <h3 className="font-medium text-gray-800">{trainer.full_name}</h3>
      <p className="text-sm text-gray-500">{trainer.email}</p>
      {trainer.status !== 'active' && (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${
          trainer.status === 'pending' 
            ? 'bg-yellow-100 text-yellow-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {trainer.status === 'pending' ? 'Pending' : 'Inactive'}
        </span>
      )}
    </div>
  </div>
);

interface SubscriptionDetailsProps {
  trainer: TrainerInfo;
}

const SubscriptionDetails: React.FC<SubscriptionDetailsProps> = ({ trainer }) => (
  <div className="pt-4 border-t border-gray-200">
    <div className="space-y-3">
      <DetailRow 
        label="Subscription" 
        value={trainer.subscription_name} 
      />
      <DetailRow 
        label="Price" 
        value={formatPrice(trainer.subscription_price)} 
      />
      <DetailRow 
        label="Start Date" 
        value={formatDate(trainer.start_date)} 
      />
      {trainer.status === 'active' && (
        <DetailRow 
          label="Status" 
          value={
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Active
            </span>
          } 
        />
      )}
    </div>
  </div>
);

interface DetailRowProps {
  label: string;
  value: React.ReactNode;
}

const DetailRow: React.FC<DetailRowProps> = ({ label, value }) => (
  <div className="flex justify-between items-center py-2">
    <span className="text-gray-500 text-sm">{label}</span>
    <span className="font-medium text-sm">
      {typeof value === 'string' ? value : value}
    </span>
  </div>
);

interface ActionButtonsProps {
  trainer: TrainerInfo;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ trainer }) => (
  <div className="flex justify-between pt-4 space-x-3">
    <Link 
      to={`${DASHBOARD_ROUTES.CLIENT.TRAINERS}/${trainer.id}`}
      className="flex-1"
    >
      <Button variant="outline" size="sm" className="w-full">
        View Trainer
      </Button>
    </Link>
    <Button variant="blue" size="sm" className="flex-1">
      Contact Trainer
    </Button>
  </div>
);

interface ActiveSubscriptionProps {
  trainer: TrainerInfo;
}

const ActiveSubscription: React.FC<ActiveSubscriptionProps> = ({ trainer }) => (
  <Card>
    <CardHeader>
      <CardTitle>Trainer Subscription</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        <TrainerInfoSection trainer={trainer} />
        <SubscriptionDetails trainer={trainer} />
        <ActionButtons trainer={trainer} />
      </div>
    </CardContent>
  </Card>
);

// ============================================================================
// CUSTOM HOOK
// ============================================================================

const useClientSubscription = () => {
  const [state, setState] = useState<SubscriptionState>(INITIAL_STATE);

  const updateState = useCallback((updates: Partial<SubscriptionState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const fetchTrainerData = useCallback(async () => {
    try {
      updateState({ loading: true, error: null });
      
      const trainer = await ClientAPI.getAssignedTrainer();
      
      if (trainer) {
        updateState({
          trainer,
          hasActiveSubscription: true,
          loading: false
        });
      } else {
        updateState({
          trainer: null,
          hasActiveSubscription: false,
          loading: false
        });
      }
    } catch (error: any) {
      console.error('Error fetching trainer data:', error);
      const errorMessage = error?.message || 'Failed to load trainer information';
      
      updateState({
        trainer: null,
        hasActiveSubscription: false,
        error: errorMessage,
        loading: false
      });
      
      showErrorToast(error, 'Failed to load trainer information');
    }
  }, [updateState]);

  const retryFetch = useCallback(() => {
    fetchTrainerData();
  }, [fetchTrainerData]);

  useEffect(() => {
    fetchTrainerData();
  }, [fetchTrainerData]);

  return {
    ...state,
    retryFetch,
    refetch: fetchTrainerData
  };
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const ClientSubscriptionBox: React.FC = () => {
  const { 
    trainer, 
    loading, 
    error, 
    hasActiveSubscription,
    retryFetch 
  } = useClientSubscription();

  // Loading state
  if (loading) {
    return <LoadingState />;
  }

  // Error state
  if (error) {
    return <ErrorState error={error} onRetry={retryFetch} />;
  }

  // No subscription state
  if (!hasActiveSubscription || !trainer) {
    return <NoSubscriptionState />;
  }

  // Active subscription state
  return <ActiveSubscription trainer={trainer} />;
};

export default ClientSubscriptionBox;