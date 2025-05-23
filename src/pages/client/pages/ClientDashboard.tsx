// src/pages/client/pages/ClientDashboard.tsx
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/organisms/DashboardLayout';
import LoadingSpinner from '@/components/atoms/LoadingSpinner';
import { Card, CardContent } from '@/components/organisms/Card';
import StatsOverview from '@/components/features/client/StatsOverview';
import { ClientAPI, AuthAPI } from '@/lib/api';
import { showSuccessToast, showErrorToast } from '@/lib/errors';
import { USER_TYPES } from '@/lib/constants';
import { UserProfile } from '@/lib/types';

// Import components
import { ClientSubscriptionBox } from '@/components/features/client/ClientSubscriptionBox';
import { MeasurementTracker } from '@/components/features/client/MeasurementTracker';
import { ProgressGraph } from '@/components/features/client/ProgressGraph';
import { RecentWorkoutsList } from '@/components/features/client/RecentWorkoutsList';

// Types for measurements and stats
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

interface ClientMeasurement {
  id: string;
  client_id: string;
  date: string;
  body_weight: number | null;
  chest_size: number | null;
  waist_size: number | null;
  biceps_size: number | null;
  thigh_size: number | null;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

/**
 * ClientDashboard Component
 * Main dashboard for client users showing progress, measurements and workouts
 */
export default function ClientDashboard() {
  // Component state
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [statsLoading, setStatsLoading] = useState<boolean>(true);
  const [measurements, setMeasurements] = useState<ClientMeasurement[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0); // Add refresh trigger
  const [clientStats, setClientStats] = useState<ClientStats>({
    currentWeight: {
      value: 0,
      change: 0,
      unit: 'kg'
    },
    bodyFat: {
      value: 0,
      change: 0,
      unit: '%'
    },
    muscleGain: {
      value: 0,
      change: 0,
      unit: 'kg'
    }
  });

  /**
   * Fetch user profile data
   */
  const fetchProfileData = async (): Promise<void> => {
    try {
      setLoading(true);
      const profileData = await AuthAPI.getUserProfile();
      
      setProfile(profileData || {
        id: '1',
        email: 'client@example.com',
        full_name: 'John Doe',
        user_type: 'client'
      });

      setTimeout(() => setLoading(false), 500);
    } catch (error) {
      console.error('Failed to load profile data:', error);
      showErrorToast(error, 'Failed to load profile data');
      setLoading(false);
    }
  };
  
  /**
   * Fetch client measurements and calculate stats
   */
  const fetchClientMeasurements = async (): Promise<void> => {
    try {
      setStatsLoading(true);
      
      // Fetch all client measurements
      const clientMeasurements = await ClientAPI.getClientMeasurements(30);
      setMeasurements(clientMeasurements || []);
      
      if (clientMeasurements && clientMeasurements.length > 0) {
        // Calculate client stats from measurements
        const stats = await ClientAPI.getClientStats();
        setClientStats(stats);
      }
      
      setStatsLoading(false);
    } catch (error) {
      console.error('Failed to load client measurements:', error);
      showErrorToast(error, 'Failed to load client measurements');
      setStatsLoading(false);
    }
  };

  /**
   * Handle adding a new measurement
   */
  const handleAddMeasurement = async (newMeasurement: any): Promise<void> => {
    try {
      // Add the measurement using the API
      const success = await ClientAPI.addMeasurement(newMeasurement);
      
      if (success) {
        // Refresh measurements after adding new one
        await fetchClientMeasurements();
        // Trigger refresh for the progress graph
        setRefreshTrigger(prev => prev + 1);
        showSuccessToast('Measurement added successfully');
      } else {
        showErrorToast(null, 'Failed to add measurement');
      }
    } catch (error) {
      console.error('Error adding measurement:', error);
      showErrorToast(error, 'Failed to add measurement');
    }
  };

  // Load data when component mounts
  useEffect(() => {
    fetchProfileData();
    fetchClientMeasurements();
  }, []);

  return (
    <DashboardLayout userType={USER_TYPES.CLIENT}>
      <div className="space-y-6">
        {/* Welcome Section */}
        <Card>
          <CardContent className="p-6">
            {loading ? (
              <div className="flex items-center space-x-4">
                <LoadingSpinner size="sm" />
                <p>Loading profile...</p>
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

        {/* Stats Overview */}
        <StatsOverview 
          currentWeight={clientStats.currentWeight}
          bodyFat={clientStats.bodyFat}
          muscleGain={clientStats.muscleGain}
          isLoading={statsLoading}
        />
        
        {/* Main Content - Responsive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Subscription Box & Measurements */}
          <div className="lg:col-span-1 space-y-6">
            <ClientSubscriptionBox />
            <MeasurementTracker 
              measurements={measurements}
              onAddMeasurement={handleAddMeasurement}
              isLoading={statsLoading}
            />
          </div>
          
          {/* Right Column - Progress Graph & Recent Workouts */}
          <div className="lg:col-span-2 space-y-6">
            <ProgressGraph refreshTrigger={refreshTrigger} />
            <RecentWorkoutsList />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}