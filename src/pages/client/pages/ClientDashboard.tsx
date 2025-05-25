// src/pages/client/pages/ClientDashboard.tsx - Debug version to isolate the issue
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

const INITIAL_STATS: ClientStats = {
  currentWeight: { value: 0, change: 0, unit: 'kg' },
  bodyFat: { value: 0, change: 0, unit: '%' },
  muscleGain: { value: 0, change: 0, unit: 'kg' }
};

const ClientDashboard: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [measurements, setMeasurements] = useState<ClientProgress[]>([]);
  const [clientStats, setClientStats] = useState<ClientStats>(INITIAL_STATS);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [loading, setLoading] = useState({
    profile: true,
    measurements: true,
    stats: true
  });

  console.log('🔍 ClientDashboard render:', {
    profileLoading: loading.profile,
    measurementsLoading: loading.measurements,
    statsLoading: loading.stats,
    measurementsCount: measurements.length,
    profile: profile?.full_name
  });

  // Fetch user profile
  const fetchProfile = useCallback(async () => {
    try {
      console.log('🔍 Fetching profile...');
      setLoading(prev => ({ ...prev, profile: true }));
      
      const profileData = await AuthAPI.getUserProfile();
      console.log('✅ Profile fetched:', profileData);
      setProfile(profileData);
      
    } catch (error: any) {
      console.error('❌ Failed to load profile:', error);
      showErrorToast(error, 'Failed to load profile data');
    } finally {
      setLoading(prev => ({ ...prev, profile: false }));
    }
  }, []);

  // Fetch measurements and calculate stats
  const fetchMeasurementsAndStats = useCallback(async () => {
    try {
      console.log('🔍 Fetching measurements and stats...');
      setLoading(prev => ({ ...prev, measurements: true, stats: true }));

      // Fetch measurements
      console.log('📊 Calling ClientAPI.getClientMeasurements...');
      const clientMeasurements = await ClientAPI.getClientMeasurements(30);
      console.log('📊 Measurements received:', clientMeasurements);
      
      setMeasurements(clientMeasurements || []);
      
      // Calculate stats if we have measurements
      if (clientMeasurements && clientMeasurements.length > 0) {
        console.log('📊 Calculating stats...');
        const stats = await ClientAPI.getClientStats();
        console.log('📊 Stats calculated:', stats);
        setClientStats(stats || INITIAL_STATS);
      } else {
        console.log('📊 No measurements, using default stats');
        setClientStats(INITIAL_STATS);
      }
      
    } catch (error: any) {
      console.error('❌ Failed to load measurements:', error);
      showErrorToast(error, 'Failed to load client data');
      setMeasurements([]);
      setClientStats(INITIAL_STATS);
    } finally {
      setLoading(prev => ({ ...prev, measurements: false, stats: false }));
    }
  }, []);

  // Add new measurement
  const handleAddMeasurement = useCallback(async (measurementData: MeasurementFormValues) => {
    try {
      console.log('📝 Adding measurement:', measurementData);
      
      // Convert the form data to the format expected by the API
      const apiData = {
        date: measurementData.date,
        body_weight: measurementData.body_weight,
        chest_size: measurementData.chest_size,
        waist_size: measurementData.waist_size,
        biceps_size: measurementData.biceps_size,
        thigh_size: measurementData.thigh_size,
        notes: measurementData.notes || null
      };

      console.log('📝 API data prepared:', apiData);
      const success = await ClientAPI.addMeasurement(apiData);
      
      if (success) {
        console.log('✅ Measurement added, refreshing data...');
        // Refresh data and trigger chart refresh
        await fetchMeasurementsAndStats();
        setRefreshTrigger(prev => prev + 1);
        showSuccessToast('Measurement added successfully');
      } else {
        throw new Error('Failed to add measurement');
      }
    } catch (error: any) {
      console.error('❌ Error adding measurement:', error);
      showErrorToast(error, 'Failed to add measurement');
      throw error; // Re-throw so the form can handle it
    }
  }, [fetchMeasurementsAndStats]);

  // Initialize data on mount
  useEffect(() => {
    console.log('🔍 ClientDashboard mounted, initializing data...');
    const initializeData = async () => {
      await Promise.all([
        fetchProfile(),
        fetchMeasurementsAndStats()
      ]);
    };
    
    initializeData();
  }, [fetchProfile, fetchMeasurementsAndStats]);

  return (
    <DashboardLayout userType={USER_TYPES.CLIENT}>
      <div className="space-y-6">
        {/* Welcome Section */}
        <Card>
          <CardContent className="p-6">
            {loading.profile ? (
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

        {/* Debug Info */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Debug Information</h3>
            <div className="space-y-2 text-sm">
              <p><strong>Profile Loading:</strong> {loading.profile ? 'Yes' : 'No'}</p>
              <p><strong>Measurements Loading:</strong> {loading.measurements ? 'Yes' : 'No'}</p>
              <p><strong>Stats Loading:</strong> {loading.stats ? 'Yes' : 'No'}</p>
              <p><strong>Measurements Count:</strong> {measurements.length}</p>
              <p><strong>Profile Name:</strong> {profile?.full_name || 'Not loaded'}</p>
              <p><strong>Refresh Trigger:</strong> {refreshTrigger}</p>
            </div>
          </CardContent>
        </Card>

        {/* Stats Overview */}
        <StatsOverview 
          currentWeight={clientStats.currentWeight}
          bodyFat={clientStats.bodyFat}
          muscleGain={clientStats.muscleGain}
          isLoading={loading.stats}
        />
        
        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Subscription Box & Measurements */}
          <div className="lg:col-span-1 space-y-6">
            <ClientSubscriptionBox />
            
            {/* Measurement Tracker with Debug */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Measurement Tracker Debug</h3>
                <div className="space-y-2 text-sm mb-4">
                  <p><strong>Is Loading:</strong> {loading.measurements ? 'Yes' : 'No'}</p>
                  <p><strong>Measurements Array:</strong> {JSON.stringify(measurements, null, 2)}</p>
                  <p><strong>Handler Type:</strong> {typeof handleAddMeasurement}</p>
                </div>
                
                <MeasurementTracker 
                  measurements={measurements}
                  onAddMeasurement={handleAddMeasurement}
                  isLoading={loading.measurements}
                />
              </CardContent>
            </Card>
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
};

export default ClientDashboard;