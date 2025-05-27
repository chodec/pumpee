// src/pages/client/pages/ClientDashboard.tsx - Cleaned and refactored
import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/organisms/DashboardLayout';
import LoadingSpinner from '@/components/atoms/LoadingSpinner';
import { Card, CardContent } from '@/components/organisms/Card';
import StatsOverview from '@/components/features/client/StatsOverview';
import { ClientAPI, AuthAPI } from '@/lib/api';
import { showSuccessToast, showErrorToast } from '@/lib/errors';
import { USER_TYPES } from '@/lib/constants';
import { UserProfile, ClientProgress } from '@/lib/types';

// Import components
import ClientSubscriptionBox from '@/components/features/client/ClientSubscriptionBox';
import MeasurementTracker, { MeasurementFormValues } from '@/components/features/client/MeasurementTracker';
import ProgressGraph from '@/components/features/client/ProgressGraph';
import RecentWorkoutsList from '@/components/features/client/RecentWorkoutsList';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface ClientStat {
  value: number;
  change: number;
  unit: string;
}

interface ClientStats {
  currentWeight: ClientStat;
  bodyFat: ClientStat;
  muscleGain: ClientStat;
}

interface DashboardState {
  profile: UserProfile | null;
  measurements: ClientProgress[];
  clientStats: ClientStats;
  refreshTrigger: number;
  loading: {
    profile: boolean;
    measurements: boolean;
    stats: boolean;
  };
}

// ============================================================================
// CONSTANTS
// ============================================================================

const INITIAL_STATS: ClientStats = {
  currentWeight: { value: 0, change: 0, unit: 'kg' },
  bodyFat: { value: 0, change: 0, unit: '%' },
  muscleGain: { value: 0, change: 0, unit: 'kg' }
};

const INITIAL_STATE: DashboardState = {
  profile: null,
  measurements: [],
  clientStats: INITIAL_STATS,
  refreshTrigger: 0,
  loading: {
    profile: true,
    measurements: true,
    stats: true
  }
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const ClientDashboard: React.FC = () => {
  const [state, setState] = useState<DashboardState>(INITIAL_STATE);

  // Update state helper
  const updateState = useCallback((updates: Partial<DashboardState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // Update loading state helper
  const updateLoading = useCallback((loadingUpdates: Partial<DashboardState['loading']>) => {
    setState(prev => ({
      ...prev,
      loading: { ...prev.loading, ...loadingUpdates }
    }));
  }, []);

  // Fetch user profile
  const fetchProfile = useCallback(async () => {
    try {
      updateLoading({ profile: true });
      const profileData = await AuthAPI.getUserProfile();
      updateState({ profile: profileData });
    } catch (error: any) {
      console.error('Failed to load profile:', error);
      showErrorToast(error, 'Failed to load profile data');
    } finally {
      updateLoading({ profile: false });
    }
  }, [updateState, updateLoading]);

  // Fetch measurements and calculate stats
  const fetchMeasurementsAndStats = useCallback(async () => {
    try {
      updateLoading({ measurements: true, stats: true });

      const clientMeasurements = await ClientAPI.getClientMeasurements(30);
      updateState({ measurements: clientMeasurements || [] });
      
      if (clientMeasurements && clientMeasurements.length > 0) {
        const stats = await ClientAPI.getClientStats();
        updateState({ clientStats: stats || INITIAL_STATS });
      } else {
        updateState({ clientStats: INITIAL_STATS });
      }
      
    } catch (error: any) {
      console.error('Failed to load measurements:', error);
      showErrorToast(error, 'Failed to load client data');
      updateState({ 
        measurements: [],
        clientStats: INITIAL_STATS 
      });
    } finally {
      updateLoading({ measurements: false, stats: false });
    }
  }, [updateState, updateLoading]);

  // Add new measurement
  const handleAddMeasurement = useCallback(async (measurementData: MeasurementFormValues) => {
    try {
      const apiData = {
        date: measurementData.date,
        body_weight: measurementData.body_weight,
        chest_size: measurementData.chest_size,
        waist_size: measurementData.waist_size,
        biceps_size: measurementData.biceps_size,
        thigh_size: measurementData.thigh_size,
        notes: measurementData.notes || null
      };

      const success = await ClientAPI.addMeasurement(apiData);
      
      if (success) {
        await fetchMeasurementsAndStats();
        updateState({ refreshTrigger: prev => prev.refreshTrigger + 1 });
        showSuccessToast('Measurement added successfully');
      } else {
        throw new Error('Failed to add measurement');
      }
    } catch (error: any) {
      console.error('Error adding measurement:', error);
      showErrorToast(error, 'Failed to add measurement');
      throw error;
    }
  }, [fetchMeasurementsAndStats, updateState]);

  // Initialize data on mount
  useEffect(() => {
    const initializeData = async () => {
      await Promise.all([
        fetchProfile(),
        fetchMeasurementsAndStats()
      ]);
    };
    
    initializeData();
  }, [fetchProfile, fetchMeasurementsAndStats]);

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderWelcomeSection = () => (
    <Card>
      <CardContent className="p-6">
        {state.loading.profile ? (
          <div className="flex items-center space-x-4">
            <LoadingSpinner size="sm" />
            <p>Loading profile...</p>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-semibold text-gray-800">
              Welcome back, {state.profile?.full_name || 'Client'}
            </h2>
            <p className="mt-2 text-gray-600">
              Track your fitness journey and achieve your goals. 
              Here's an overview of your progress.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );

  const renderMainContent = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column - Subscription Box & Measurements */}
      <div className="lg:col-span-1 space-y-6">
        <ClientSubscriptionBox />
        <MeasurementTracker 
          measurements={state.measurements}
          onAddMeasurement={handleAddMeasurement}
          isLoading={state.loading.measurements}
        />
      </div>
      
      {/* Right Column - Progress Graph & Recent Workouts */}
      <div className="lg:col-span-2 space-y-6">
        <ProgressGraph refreshTrigger={state.refreshTrigger} />
        <RecentWorkoutsList />
      </div>
    </div>
  );

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <DashboardLayout userType={USER_TYPES.CLIENT}>
      <div className="space-y-6">
        {renderWelcomeSection()}

        <StatsOverview 
          currentWeight={state.clientStats.currentWeight}
          bodyFat={state.clientStats.bodyFat}
          muscleGain={state.clientStats.muscleGain}
          isLoading={state.loading.stats}
        />
        
        {renderMainContent()}
      </div>
    </DashboardLayout>
  );
};

export default ClientDashboard;