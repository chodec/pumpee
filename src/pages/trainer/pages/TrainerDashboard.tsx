// src/pages/trainer/pages/TrainerDashboard.tsx - Updated with Subscription Plans card
import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/organisms/DashboardLayout";
import SubscriptionBox from "@/components/features/trainer/SubscriptionBox";
import MenuPlansOverview from "@/components/features/trainer/MenuPlansOverview";
import WorkoutsOverview from "@/components/features/trainer/WorkoutsOverview";
import TrainerSubscriptionPlansOverview from "@/components/features/trainer/TrainerSubscriptionPlansOverview";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/organisms/Card";
import { Button } from "@/components/atoms/Button";
import LoadingSpinner from "@/components/atoms/LoadingSpinner";
import { AuthAPI } from "@/lib/api";
import { showErrorToast } from "@/lib/errors";
import { USER_TYPES } from "@/lib/constants";
import { UserProfile } from "@/lib/types";

interface ClientSummary {
  id: string;
  full_name: string;
  last_workout: string;
  progress: number;
}

// Mock client data - in real app this would come from API
const MOCK_CLIENTS: ClientSummary[] = [
  { id: '1', full_name: 'John Smith', last_workout: '2 days ago', progress: 85 },
  { id: '2', full_name: 'Maria Garcia', last_workout: 'Today', progress: 92 },
  { id: '3', full_name: 'Ahmed Khan', last_workout: 'Yesterday', progress: 78 },
];

export default function TrainerDashboard() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [clients] = useState<ClientSummary[]>(MOCK_CLIENTS);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const profileData = await AuthAPI.getUserProfile();
      setProfile(profileData);
    } catch (error) {
      showErrorToast(error, 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const renderClientRow = (client: ClientSummary) => (
    <div key={client.id} className="flex items-center justify-between rounded-md border border-gray-200 p-3">
      <div className="flex items-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-gray-600">
          {client.full_name.charAt(0)}
        </div>
        <div className="ml-3">
          <p className="font-medium text-gray-800">{client.full_name}</p>
          <p className="text-xs text-gray-500">Last workout: {client.last_workout}</p>
        </div>
      </div>
      <div className="text-right">
        <div className="flex items-center">
          <span className="mr-2 text-sm font-medium text-gray-700">{client.progress}%</span>
          <div className="h-2 w-16 rounded-full bg-gray-200">
            <div 
              className="h-2 rounded-full bg-green-600" 
              style={{ width: `${client.progress}%` }}
              aria-valuenow={client.progress}
              aria-valuemin={0}
              aria-valuemax={100}
              role="progressbar"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderWelcomeCard = () => (
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
              Welcome, {profile?.full_name || 'Trainer'}
            </h2>
            <p className="mt-2 text-gray-600">
              Here's an overview of your clients, workouts, and menu plans.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );

  const renderOverviewCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="col-span-1">
        <SubscriptionBox />
      </div>
      <div className="col-span-1">
        <WorkoutsOverview />
      </div>
      <div className="col-span-1">
        <MenuPlansOverview />
      </div>
      <div className="col-span-1">
        <TrainerSubscriptionPlansOverview />
      </div>
    </div>
  );

  const renderClientsOverview = () => (
    <Card>
      <CardHeader className="p-6 pb-0 flex items-center justify-between">
        <CardTitle>Clients Overview</CardTitle>
        <Button variant="link" size="sm">View All</Button>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-3">
          {clients.map(renderClientRow)}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <DashboardLayout userType={USER_TYPES.TRAINER}>
      <div className="space-y-6">
        {renderWelcomeCard()}
        {renderOverviewCards()}
        {renderClientsOverview()}
      </div>
    </DashboardLayout>
  );
}