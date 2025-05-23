// src/components/features/trainer/MenuPlansOverview.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Plus } from 'lucide-react';
import LoadingSpinner from '@/components/atoms/LoadingSpinner';
import { Button } from '@/components/atoms/Button';
import { TrainerAPI } from '@/lib/api';
import { showErrorToast } from '@/lib/errors';

// Types for menu plans
interface MenuPlan {
  id: string;
  plan_name: string;
  total_calories: number;
  total_protein: number;
  total_carbohydrates: number;
  total_fat: number;
  created_at: string;
  menu_count?: number;
}

interface MenuPlansStats {
  totalPlans: number;
  totalMenus: number;
  recentPlans: MenuPlan[];
}

export default function MenuPlansOverview() {
  const [stats, setStats] = useState<MenuPlansStats>({
    totalPlans: 0,
    totalMenus: 0,
    recentPlans: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMenuStats() {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch menu plans and individual menus
        const [menuPlans, individualMenus] = await Promise.all([
          TrainerAPI.getMenuPlans?.() || Promise.resolve([]),
          TrainerAPI.getMenus() || Promise.resolve([])
        ]);

        // Calculate statistics
        const totalPlans = menuPlans.length;
        const totalMenus = individualMenus.length;

        // Get recent plans (last 3)
        const recentPlans = menuPlans
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 3);

        setStats({
          totalPlans,
          totalMenus,
          recentPlans
        });

      } catch (error) {
        console.error('Error fetching menu stats:', error);
        setError('Failed to load menu statistics');
        showErrorToast(error, 'Failed to load menu plans');
      } finally {
        setIsLoading(false);
      }
    }

    fetchMenuStats();
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="rounded-lg bg-white p-6 shadow-sm h-full">
        <div className="flex flex-col items-center justify-center flex-grow space-y-4">
          <LoadingSpinner size="md" color="primary" />
          <p className="text-sm text-gray-500">Loading menu plans...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="rounded-lg bg-white p-6 shadow-sm h-full">
        <h3 className="text-lg font-medium text-[#040b07] mb-6">Menu Plans</h3>
        <div className="p-4 border border-red-200 rounded-md bg-red-50 text-red-600 mb-4">
          <p>Unable to load menu plans.</p>
          <p className="text-sm mt-1">Please try again later.</p>
        </div>
        <Link 
          to="/trainer/menus"
          className="flex justify-between items-center w-full mt-6 py-2 px-4 text-center text-white bg-[#007bff] rounded-md hover:bg-blue-600 transition-colors group"
        >
          <span>Manage menu plans</span>
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-white p-6 shadow-sm h-full flex flex-col">
      <h3 className="text-lg font-medium text-[#040b07] mb-6">Menu Plans</h3>
      
      {stats.totalPlans === 0 ? (
        // Empty state
        <div className="flex-grow flex flex-col items-center justify-center text-center py-8">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-gray-400">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          
          <h4 className="text-xl font-semibold text-gray-900 mb-2">No Menu Plans</h4>
          <p className="text-gray-600 mb-8 max-w-sm mx-auto">
            Create your first menu plan to start organizing meals for your clients.
          </p>
          
          <Link to="/trainer/menus">
            <Button variant="blue" size="sm" className="inline-flex items-center px-6 py-2">
              <Plus className="h-4 w-4 mr-2" />
              Create Menu Plan
            </Button>
          </Link>
        </div>
      ) : (
        // Has data state
        <div className="flex-grow space-y-6">
          {/* Statistics grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-[#007bff] mb-1">{stats.totalPlans}</div>
              <div className="text-sm text-gray-600">Menu Plans</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-[#ff7f0e] mb-1">{stats.totalMenus}</div>
              <div className="text-sm text-gray-600">Individual Menus</div>
            </div>
          </div>

          {/* Recent plans */}
          {stats.recentPlans.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Recent Plans</h4>
              <div className="space-y-3">
                {stats.recentPlans.map((plan) => (
                  <div key={plan.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 truncate">
                        {plan.plan_name}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Created {new Date(plan.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="font-semibold text-gray-900">
                        {plan.total_calories} kcal
                      </p>
                      <p className="text-xs text-gray-500">
                        P: {plan.total_protein}g | C: {plan.total_carbohydrates}g | F: {plan.total_fat}g
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Action button */}
      <Link 
        to="/trainer/menus"
        className="flex justify-between items-center w-full mt-6 py-3 px-4 text-center text-white bg-[#007bff] rounded-md hover:bg-blue-600 transition-colors group"
      >
        <span className="font-medium">Manage menu plans</span>
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </Link>
    </div>
  );
}