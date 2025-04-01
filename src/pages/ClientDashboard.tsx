// src/pages/ClientDashboard.tsx
import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/ui/DashboardLayout';
import { supabase } from '@/lib/supabaseClient';

// Define an interface for the client profile
interface ClientProfile {
  user_id: string;
  full_name: string;
  // Add other properties from your clients table
  email?: string;
  // ... other fields as needed
}

export default function ClientDashboard() {
  // Use the ClientProfile type with nullable initial state
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      try {
        // Get current user ID
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          throw new Error('No user found');
        }
        
        // Get client profile data
        const { data, error } = await supabase
          .from('clients')
          .select('*')
          .eq('user_id', user.id)
          .single();
          
        if (error) {
          throw error;
        }
        
        setProfile(data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchProfile();
  }, []);

  // Client dashboard content
  const dashboardContent = (
    <div>
      <h1>Client Dashboard</h1>
      {loading ? (
        <p>Loading your profile...</p>
      ) : (
        <p>Welcome, {profile?.full_name || 'Client'}</p>
      )}
      {/* Add more dashboard content here */}
    </div>
  );

  // Wrap the content in the DashboardLayout
  return (
    <DashboardLayout userType="client">
      {dashboardContent}
    </DashboardLayout>
  );
}