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

// Directly import the component files
import { ClientSubscriptionBox } from '@/components/features/client/ClientSubscriptionBox';
import { MeasurementTracker } from '@/components/features/client/MeasurementTracker';
import { ProgressGraph } from '@/components/features/client/ProgressGraph';
import { RecentWorkoutsList } from '@/components/features/client/RecentWorkoutsList';

export default function ClientDashboard() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [measurements, setMeasurements] = useState([]);
  const [clientStats, setClientStats] = useState({
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

  useEffect(() => {
    async function fetchProfileData() {
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
    }
    
    async function fetchClientMeasurements() {
      try {
        setStatsLoading(true);
        
        // Fetch all client measurements
        const clientMeasurements = await ClientAPI.getClientMeasurements(30);
        setMeasurements(clientMeasurements || []);
        
        if (clientMeasurements && clientMeasurements.length > 0) {
          // Calculate client stats from measurements
          const stats = calculateClientStats(clientMeasurements);
          setClientStats(stats);
        }
        
        setStatsLoading(false);
      } catch (error) {
        console.error('Failed to load client measurements:', error);
        showErrorToast(error, 'Failed to load client measurements');
        setStatsLoading(false);
      }
    }
    
    fetchProfileData();
    fetchClientMeasurements();
  }, []);

  // Helper function to calculate client stats from measurements
  const calculateClientStats = (measurementData) => {
    if (!measurementData || measurementData.length === 0) {
      return {
        currentWeight: { value: 0, change: 0, unit: 'kg' },
        bodyFat: { value: 0, change: 0, unit: '%' },
        muscleGain: { value: 0, change: 0, unit: 'kg' }
      };
    }
    
    // Get latest and oldest measurements to calculate changes
    const latest = measurementData[0];
    const oldest = measurementData.length > 1 ? measurementData[measurementData.length - 1] : null;
    
    // Calculate weight stats
    const currentWeight = {
      value: parseFloat(latest.body_weight) || 0,
      change: oldest ? parseFloat(latest.body_weight) - parseFloat(oldest.body_weight) : 0,
      unit: 'kg'
    };
    
    // Calculate body fat (using a simple estimation)
    const estimateBodyFat = (measurement) => {
      if (!measurement) return 0;
      
      const waist = parseFloat(measurement.waist_size) || 0;
      const chest = parseFloat(measurement.chest_size) || 0;
      
      if (waist === 0 || chest === 0) return 0;
      
      // Simple formula (not medically accurate)
      const ratio = waist / chest;
      let bodyFat = (ratio * 100) - 30;
      
      // Ensure reasonable range
      bodyFat = Math.max(5, Math.min(bodyFat, 35));
      
      return parseFloat(bodyFat.toFixed(1));
    };
    
    const latestBodyFat = estimateBodyFat(latest);
    const oldestBodyFat = oldest ? estimateBodyFat(oldest) : latestBodyFat;
    
    const bodyFat = {
      value: latestBodyFat,
      change: latestBodyFat - oldestBodyFat,
      unit: '%'
    };
    
    // Calculate muscle gain
    const calculateMuscleGain = () => {
      if (!latest || !oldest) return { value: 0, change: 0, unit: 'kg' };
      
      const weightChange = parseFloat(latest.body_weight) - parseFloat(oldest.body_weight);
      const bodyFatChange = latestBodyFat - oldestBodyFat;
      
      let muscleGain = 0;
      
      // If weight increased but body fat decreased, it's likely muscle gain
      if (weightChange > 0 && bodyFatChange <= 0) {
        muscleGain = weightChange;
      } 
      // If weight decreased but body fat decreased more, there might still be muscle gain
      else if (weightChange < 0 && bodyFatChange < -2) {
        muscleGain = Math.abs(bodyFatChange) * 0.3;
      }
      
      return {
        value: parseFloat(muscleGain.toFixed(1)),
        change: parseFloat(muscleGain.toFixed(1)),
        unit: 'kg'
      };
    };
    
    const muscleGain = calculateMuscleGain();
    
    return {
      currentWeight,
      bodyFat,
      muscleGain
    };
  };

  // Handle adding new measurements
  const handleAddMeasurement = async (newMeasurement) => {
    try {
      // Add the measurement using the API
      const success = await ClientAPI.addMeasurement(newMeasurement);
      
      if (success) {
        // Refresh measurements after adding new one
        const updatedMeasurements = await ClientAPI.getClientMeasurements(30);
        setMeasurements(updatedMeasurements || []);
        
        // Recalculate stats
        if (updatedMeasurements && updatedMeasurements.length > 0) {
          const stats = calculateClientStats(updatedMeasurements);
          setClientStats(stats);
        }
        
        showSuccessToast('Measurement added successfully');
      } else {
        showErrorToast(null, 'Failed to add measurement');
      }
    } catch (error) {
      console.error('Error adding measurement:', error);
      showErrorToast(error, 'Failed to add measurement');
    }
  };

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
            <ProgressGraph 
              measurements={measurements}
              isLoading={statsLoading}
            />
            <RecentWorkoutsList />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}