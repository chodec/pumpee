// src/pages/client/pages/ClientDashboard.tsx - Refactored Version
import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/organisms/DashboardLayout';
import LoadingSpinner from '@/components/atoms/LoadingSpinner';
import { Card, CardContent } from '@/components/organisms/Card';
import StatsOverview from '@/components/features/client/StatsOverview';
import { ClientAPI, AuthAPI, ClientProgress } from '@/lib/api';
import { showSuccessToast, showErrorToast } from '@/lib/errors';
import { USER_TYPES } from '@/lib/constants';
import { UserProfile } from '@/lib/types';

// Import components
import ClientSubscriptionBox from '@/components/features/client/ClientSubscriptionBox';
import MeasurementTracker from '@/components/features/client/MeasurementTracker';
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
  error: {
    profile: string | null;
    measurements: string | null;
    stats: string | null;
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
  },
  error: {
    profile: null,
    measurements: null,
    stats: null
  }
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const updateLoadingState = (
  prevState: DashboardState,
  section: keyof DashboardState['loading'],
  isLoading: boolean
): DashboardState => ({
  ...prevState,
  loading: {
    ...prevState.loading,
    [section]: isLoading
  }
});

const updateErrorState = (
  prevState: DashboardState,
  section: keyof DashboardState['error'],
  error: string | null
): DashboardState => ({
  ...prevState,
  error: {
    ...prevState.error,
    [section]: error
  }
});

// ============================================================================
// COMPONENT PARTS
// ============================================================================

interface WelcomeSectionProps {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
}

const WelcomeSection: React.FC<WelcomeSectionProps> = ({ profile, isLoading, error }) => (
  <Card>
    <CardContent className="p-6">
      {isLoading ? (
        <div className="flex items-center space-x-4">
          <LoadingSpinner size="sm" />
          <p>Loading profile...</p>
        </div>
      ) : error ? (
        <div className="text-center py-4">
          <p className="text-red-600 mb-2">Failed to load profile</p>
          <p className="text-gray-600">Welcome to your dashboard</p>
        </div>
      ) : (
        <>
          <h2 className="text-xl font-semibold text-gray-800">
            Welcome back, {profile?.full_name || 'Client'}
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

interface DashboardGridProps {
  measurements: ClientProgress[];
  clientStats: ClientStats;
  refreshTrigger: number;
  isStatsLoading: boolean;
  isMeasurementsLoading: boolean;
  onAddMeasurement: (measurement: any) => Promise<void>;
  onRefreshTrigger: () => void;
}

const DashboardGrid: React.FC<DashboardGridProps> = ({
  measurements,
  clientStats,
  refreshTrigger,
  isStatsLoading,
  isMeasurementsLoading,
  onAddMeasurement,
  onRefreshTrigger
}) => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    {/* Left Column - Subscription Box & Measurements */}
    <div className="lg:col-span-1 space-y-6">
      <ClientSubscriptionBox />
      <MeasurementTracker 
        measurements={measurements}
        onAddMeasurement={onAddMeasurement}
        isLoading={isMeasurementsLoading}
      />
    </div>
    
    {/* Right Column - Progress Graph & Recent Workouts */}
    <div className="lg:col-span-2 space-y-6">
      <ProgressGraph 
        refreshTrigger={refreshTrigger}
      />
      <RecentWorkoutsList />
    </div>
  </div>
);

// ============================================================================
// CUSTOM HOOKS
// ============================================================================

const useClientDashboard = () => {
  const [state, setState] = useState<DashboardState>(INITIAL_STATE);

  // Update state helper
  const updateState = useCallback((updates: Partial<DashboardState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // Fetch user profile
  const fetchProfile = useCallback(async () => {
    try {
      setState(prev => updateLoadingState(prev, 'profile', true));
      setState(prev => updateErrorState(prev, 'profile', null));
      
      const profileData = await AuthAPI.getUserProfile();
      
      updateState({ profile: profileData });
      
    } catch (error: any) {
      console.error('Failed to load profile:', error);
      const errorMessage = error?.message || 'Failed to load profile data';
      setState(prev => updateErrorState(prev, 'profile', errorMessage));
      showErrorToast(error, 'Failed to load profile data');
    } finally {
      setState(prev => updateLoadingState(prev, 'profile', false));
    }
  }, [updateState]);

  // Fetch measurements and calculate stats
  const fetchMeasurementsAndStats = useCallback(async () => {
    try {
      setState(prev => ({
        ...updateLoadingState(prev, 'measurements', true),
        ...updateLoadingState(prev, 'stats', true)
      }));
      
      setState(prev => ({
        ...updateErrorState(prev, 'measurements', null),
        ...updateErrorState(prev, 'stats', null)
      }));

      // Fetch measurements
      const clientMeasurements = await ClientAPI.getClientMeasurements(30);
      
      updateState({ measurements: clientMeasurements || [] });
      
      // Calculate stats if we have measurements
      if (clientMeasurements && clientMeasurements.length > 0) {
        const stats = await ClientAPI.getClientStats();
        updateState({ clientStats: stats || INITIAL_STATS });
      } else {
        updateState({ clientStats: INITIAL_STATS });
      }
      
    } catch (error: any) {
      console.error('Failed to load measurements:', error);
      const errorMessage = error?.message || 'Failed to load measurements';
      
      setState(prev => ({
        ...updateErrorState(prev, 'measurements', errorMessage),
        ...updateErrorState(prev, 'stats', errorMessage)
      }));
      
      showErrorToast(error, 'Failed to load client data');
      
      // Set fallback data
      updateState({ 
        measurements: [],
        clientStats: INITIAL_STATS 
      });
      
    } finally {
      setState(prev => ({
        ...updateLoadingState(prev, 'measurements', false),
        ...updateLoadingState(prev, 'stats', false)
      }));
    }
  }, [updateState]);

  // Add new measurement
  const handleAddMeasurement = useCallback(async (measurementData: any) => {
    try {
      const success = await ClientAPI.addMeasurement(measurementData);
      
      if (success) {
        // Refresh data and trigger chart refresh
        await fetchMeasurementsAndStats();
        updateState({ refreshTrigger: state.refreshTrigger + 1 });
        showSuccessToast('Measurement added successfully');
      } else {
        throw new Error('Failed to add measurement');
      }
    } catch (error: any) {
      console.error('Error adding measurement:', error);
      showErrorToast(error, 'Failed to add measurement');
      throw error; // Re-throw so the form can handle it
    }
  }, [fetchMeasurementsAndStats, state.refreshTrigger, updateState]);

  // Trigger refresh for charts
  const triggerRefresh = useCallback(() => {
    updateState({ refreshTrigger: state.refreshTrigger + 1 });
  }, [state.refreshTrigger, updateState]);

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

  return {
    ...state,
    handleAddMeasurement,
    triggerRefresh,
    refetchProfile: fetchProfile,
    refetchMeasurements: fetchMeasurementsAndStats
  };
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const ClientDashboard: React.FC = () => {
  const {
    profile,
    measurements,
    clientStats,
    refreshTrigger,
    loading,
    error,
    handleAddMeasurement,
    triggerRefresh
  } = useClientDashboard();

  return (
    <DashboardLayout userType={USER_TYPES.CLIENT}>
      <div className="space-y-6">
        {/* Welcome Section */}
        <WelcomeSection 
          profile={profile}
          isLoading={loading.profile}
          error={error.profile}
        />

        {/* Stats Overview */}
        <StatsOverview 
          currentWeight={clientStats.currentWeight}
          bodyFat={clientStats.bodyFat}
          muscleGain={clientStats.muscleGain}
          isLoading={loading.stats}
        />
        
        {/* Main Dashboard Grid */}
        <DashboardGrid
          measurements={measurements}
          clientStats={clientStats}
          refreshTrigger={refreshTrigger}
          isStatsLoading={loading.stats}
          isMeasurementsLoading={loading.measurements}
          onAddMeasurement={handleAddMeasurement}
          onRefreshTrigger={triggerRefresh}
        />
      </div>
    </DashboardLayout>
  );
};

export default ClientDashboard;