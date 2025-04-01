import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/ui/DashboardLayout';
import { supabase } from '@/lib/supabaseClient';

interface TrainerProfile {
  full_name: string;
  email: string;
}

interface ClientSummary {
  id: string;
  full_name: string;
  last_workout: string;
  progress: number;
}

export default function TrainerDashboard() {
  const [profile, setProfile] = useState<TrainerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Mock data for clients - in a real app, this would come from the database
  const [clients] = useState<ClientSummary[]>([
    { id: '1', full_name: 'John Smith', last_workout: '2 days ago', progress: 85 },
    { id: '2', full_name: 'Maria Garcia', last_workout: 'Today', progress: 92 },
    { id: '3', full_name: 'Ahmed Khan', last_workout: 'Yesterday', progress: 78 },
  ]);

  useEffect(() => {
    async function fetchProfile() {
      try {
        // Get current user ID
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          throw new Error('No user found');
        }
        
        // Get trainer profile data
        const { data, error } = await supabase
          .from('trainers')
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

  return (
    <DashboardLayout userType="trainer">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Welcome card */}
        <div className="col-span-1 md:col-span-2 lg:col-span-3">
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-800">
              {loading ? 'Loading...' : `Welcome, ${profile?.full_name || 'Trainer'}`}
            </h2>
            <p className="mt-2 text-gray-600">
              Here's an overview of your clients and schedule.
            </p>
          </div>
        </div>

        {/* Statistics cards */}
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <div className="flex items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-purple-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Active Clients</h3>
              <p className="text-lg font-semibold text-gray-800">{clients.length}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-sm">
          <div className="flex items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Sessions Today</h3>
              <p className="text-lg font-semibold text-gray-800">4</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-sm">
          <div className="flex items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="20" x2="12" y2="10"></line>
                <line x1="18" y1="20" x2="18" y2="4"></line>
                <line x1="6" y1="20" x2="6" y2="16"></line>
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Avg. Client Progress</h3>
              <p className="text-lg font-semibold text-gray-800">
                {clients.length ? `${Math.round(clients.reduce((acc, client) => acc + client.progress, 0) / clients.length)}%` : '0%'}
              </p>
            </div>
          </div>
        </div>

        {/* Today's Schedule */}
        <div className="col-span-1 md:col-span-2">
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800">Today's Schedule</h3>
            <div className="mt-4 space-y-3">
              <div className="rounded-md border border-gray-200 p-3">
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium text-gray-800">Maria Garcia</p>
                    <p className="text-sm text-gray-600">HIIT Training</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-800">9:00 AM - 10:00 AM</p>
                    <p className="text-sm text-green-600">Confirmed</p>
                  </div>
                </div>
              </div>
              <div className="rounded-md border border-gray-200 p-3">
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium text-gray-800">John Smith</p>
                    <p className="text-sm text-gray-600">Strength Training</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-800">11:30 AM - 12:30 PM</p>
                    <p className="text-sm text-green-600">Confirmed</p>
                  </div>
                </div>
              </div>
              <div className="rounded-md border border-gray-200 p-3">
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium text-gray-800">Ahmed Khan</p>
                    <p className="text-sm text-gray-600">Nutrition Consultation</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-800">2:00 PM - 2:45 PM</p>
                    <p className="text-sm text-yellow-600">Pending</p>
                  </div>
                </div>
              </div>
              <div className="rounded-md border border-gray-200 p-3">
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium text-gray-800">Group Session</p>
                    <p className="text-sm text-gray-600">Yoga Basics (5 participants)</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-800">5:30 PM - 6:30 PM</p>
                    <p className="text-sm text-green-600">Confirmed</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Client list */}
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">Clients Overview</h3>
            <button className="text-sm font-medium text-blue-600 hover:text-blue-800">
              View All
            </button>
          </div>
          
          <div className="mt-4 space-y-3">
            {clients.map((client) => (
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
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}