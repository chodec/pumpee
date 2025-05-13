// src/pages/client/pages/ClientDashboard.tsx
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/organisms/DashboardLayout';
import { Button } from '@/components/atoms/Button';
import Icon from '@/components/atoms/Icon';
import LoadingSpinner from '@/components/atoms/LoadingSpinner';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/organisms/Card';
import { ClientAPI, AuthAPI } from '@/lib/api';
import { showErrorToast } from '@/lib/errors';
import { USER_TYPES } from '@/lib/constants';
import { UserProfile } from '@/lib/types';

// Directly import the component files
// Note: If you prefer to create the components first and then import, you can update this part later
import { ClientSubscriptionBox } from '@/components/features/client/ClientSubscriptionBox';
import { MeasurementTracker } from '@/components/features/client/MeasurementTracker';
import { ProgressGraph } from '@/components/features/client/ProgressGraph';
import { RecentWorkoutsList } from '@/components/features/client/RecentWorkoutsList';

// Fallback components in case the imports fail (you can remove these once the imports work)
// const ClientSubscriptionBox = () => <div>Subscription Box</div>;
// const MeasurementTracker = () => <div>Measurement Tracker</div>;
// const ProgressGraph = () => <div>Progress Graph</div>;
// const RecentWorkoutsList = () => <div>Recent Workouts List</div>;

export default function ClientDashboard() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    completedWorkouts: 12,
    streak: 3,
    nextWorkout: 'Tomorrow, 9:00 AM'
  });

  useEffect(() => {
    async function fetchProfileData() {
      try {
        setLoading(true);
        // In a real implementation, this would fetch actual profile data
        // const profileData = await AuthAPI.getUserProfile();
        // setProfile(profileData);
        
        // For now, use mock data
        setProfile({
          id: '1',
          email: 'client@example.com',
          full_name: 'John Doe',
          user_type: 'client'
        });
        
        // In a real app, you would fetch client stats here
        // const clientStats = await ClientAPI.getClientStats();
        // setStats(clientStats);
        
        // Simulate API delay
        setTimeout(() => setLoading(false), 500);
      } catch (error) {
        console.error('Failed to load profile data:', error);
        // showErrorToast(error, 'Failed to load profile data');
        setLoading(false);
      }
    }
    
    fetchProfileData();
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-[#007bff]">
                  <Icon name="dumbbell" size={24} />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">Completed Workouts</h3>
                  <p className="text-lg font-semibold text-gray-800">{stats.completedWorkouts}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-[#ff7f0e]">
                  <Icon name="calendar" size={24} />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">Current Streak</h3>
                  <p className="text-lg font-semibold text-gray-800">{stats.streak} days</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-[#7690cd]">
                  <Icon name="chart-line" size={24} />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">Next Workout</h3>
                  <p className="text-lg font-semibold text-gray-800">{stats.nextWorkout}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Main Content - Responsive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Subscription Box & Measurements */}
          <div className="lg:col-span-1 space-y-6">
            <ClientSubscriptionBox />
            <MeasurementTracker />
          </div>
          
          {/* Right Column - Progress Graph & Recent Workouts */}
          <div className="lg:col-span-2 space-y-6">
            <ProgressGraph />
            <RecentWorkoutsList />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}