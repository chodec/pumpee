// src/components/features/trainer/MenuPlansOverview.tsx - Refactored and simplified
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/organisms/Card';
import { Button } from '@/components/atoms/Button';
import LoadingSpinner from '@/components/atoms/LoadingSpinner';
import Icon from '@/components/atoms/Icon';
import { TrainerAPI, Menu, MenuPlan } from '@/lib/api';
import { showErrorToast } from '@/lib/errors';

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

  const fetchMenuStats = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const [menuPlans, individualMenus] = await Promise.all([
        TrainerAPI.getMenuPlans(),
        TrainerAPI.getMenus()
      ]);

      const totalPlans = menuPlans?.length || 0;
      const totalMenus = individualMenus?.length || 0;

      // Get recent plans (last 3)
      const recentPlans = (menuPlans || [])
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 3);

      setStats({ totalPlans, totalMenus, recentPlans });
    } catch (error) {
      console.error('Error fetching menu stats:', error);
      setError('Failed to load menu statistics');
      showErrorToast(error, 'Failed to load menu plans');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuStats();
  }, []);

  const getMealTypeBadgeColor = (mealType: string) => {
    const colors: Record<string, string> = {
      'Breakfast': 'bg-yellow-100 text-yellow-800',
      'Morning Snack': 'bg-green-100 text-green-800',
      'Lunch': 'bg-blue-100 text-blue-800',
      'Afternoon Snack': 'bg-purple-100 text-purple-800',
      'Dinner': 'bg-red-100 text-red-800',
      'Evening Snack': 'bg-gray-100 text-gray-800'
    };
    return colors[mealType] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardContent className="flex flex-col items-center justify-center p-8 min-h-[280px]">
          <LoadingSpinner size="md" color="primary" />
          <p className="text-sm text-gray-500 mt-4">Loading menu plans...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="h-full border-red-200 bg-red-50">
        <CardContent className="flex flex-col items-center justify-center p-8 min-h-[280px]">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
            <Icon name="x" size={24} className="text-red-600" />
          </div>
          <h3 className="font-medium text-red-800 mb-2">Unable to load menu plans</h3>
          <p className="text-sm text-red-600 text-center mb-6">Please try refreshing the page</p>
          <Button variant="outline" size="sm">
            <Link to="/trainer/menus">Try Again</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center text-lg">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 mr-3">
            <svg className="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          Menu Plans
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {stats.totalPlans === 0 ? (
          <div className="text-center py-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 mx-auto mb-4">
              <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">No Menu Plans</h3>
            <p className="text-gray-600 text-sm mb-6">Create your first menu plan to organize meals for your clients</p>
            <Link to="/trainer/menus">
              <Button variant="blue" size="sm">Create Menu Plan</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Statistics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-[#007bff] mb-1">{stats.totalPlans}</div>
                <div className="text-sm text-gray-600">Menu Plans</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-[#ff7f0e] mb-1">{stats.totalMenus}</div>
                <div className="text-sm text-gray-600">Individual Meals</div>
              </div>
            </div>

            {/* Recent plans */}
            {stats.recentPlans.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Recent Plans</h4>
                <div className="space-y-3">
                  {stats.recentPlans.map((plan) => (
                    <div key={plan.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 truncate">{plan.plan_name}</p>
                          <p className="text-xs text-gray-500">
                            {plan.meal_count || 0} meals • Created {formatDate(plan.created_at)}
                          </p>
                        </div>
                        <div className="text-right ml-4">
                          <p className="font-semibold text-gray-900">{plan.total_calories} kcal</p>
                          <p className="text-xs text-gray-500">
                            P: {plan.total_protein}g | C: {plan.total_carbohydrates}g | F: {plan.total_fat}g
                          </p>
                        </div>
                      </div>
                      
                      {/* Show first few meals in the plan */}
                      {plan.meals && plan.meals.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          <div className="flex flex-wrap gap-1">
                            {plan.meals.slice(0, 3).map((meal, index) => (
                              <span 
                                key={meal.id}
                                className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getMealTypeBadgeColor(meal.meal_type)}`}
                              >
                                #{index + 1} {meal.meal_type}: {meal.food_details}
                              </span>
                            ))}
                            {plan.meals.length > 3 && (
                              <span className="text-xs text-gray-500 px-2 py-1">+{plan.meals.length - 3} more</span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Button */}
        <div className="pt-2">
          <Link to="/trainer/menus" className="block">
            <Button variant="blue" size="full" className="group">
              <span>Manage Menu Plans</span>
              <svg className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}