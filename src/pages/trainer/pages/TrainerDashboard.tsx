// src/pages/trainer/pages/TrainerDashboard.tsx - Updated to include WorkoutsOverview
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/organisms/DashboardLayout";
import SubscriptionBox from "@/components/features/trainer/SubscriptionBox";
import MenuPlansOverview from "@/components/features/trainer/MenuPlansOverview";
import WorkoutsOverview from "@/components/features/trainer/WorkoutsOverview";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/organisms/Card";
import { TrainerAPI, AuthAPI } from "@/lib/api";
import { Button } from "@/components/atoms/Button";
import Icon from "@/components/atoms/Icon";
import LoadingSpinner from "@/components/atoms/LoadingSpinner";
import { showErrorToast } from "@/lib/errors";
import { USER_TYPES } from "@/lib/constants";
import { UserProfile } from "@/lib/types";

// Client summary interface 
interface ClientSummary {
  id: string;
  full_name: string;
  last_workout: string;
  progress: number;
}

export default function TrainerDashboard() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
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
        setLoading(true);
        const profileData = await AuthAPI.getUserProfile();
        setProfile(profileData);
      } catch (error) {
        showErrorToast(error, 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    }
    
    fetchProfile();
  }, []);

  return (
    <DashboardLayout userType={USER_TYPES.TRAINER}>
      <div className="space-y-6">
        {/* Welcome card - spans full width */}
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

        {/* Four equal boxes in a row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Subscription Box */}
          <div className="col-span-1">
            <SubscriptionBox />
          </div>

          {/* Active Clients Card */}
          <div className="col-span-1">
            <Card className="h-full">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-purple-500">
                    <Icon name="users" size={24} />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-500">Active Clients</h3>
                    <p className="text-lg font-semibold text-gray-800">{clients.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Workouts Overview */}
          <div className="col-span-1">
            <WorkoutsOverview />
          </div>

          {/* Menu Plans Overview */}
          <div className="col-span-1">
            <MenuPlansOverview />
          </div>
        </div>

        {/* Client list - spans full width below */}
        <Card>
          <CardHeader className="p-6 pb-0 flex items-center justify-between">
            <CardTitle>Clients Overview</CardTitle>
            <Button variant="link" size="sm">View All</Button>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
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
                          aria-valuenow={client.progress}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          role="progressbar"
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/organisms/DashboardLayout';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import Icon from '@/components/atoms/Icon';
import LoadingSpinner from '@/components/atoms/LoadingSpinner';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/organisms/Card';
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/molecules/Form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TrainerAPI, Menu, MenuPlan, CreateMenuData, CreateMenuPlanData } from '@/lib/api';
import { showSuccessToast, showErrorToast } from '@/lib/errors';
import { USER_TYPES } from '@/lib/constants';

// ============================================================================
// FORM SCHEMAS & TYPES
// ============================================================================

const createMealSchema = z.object({
  meal_type: z.string().min(1, 'Meal type is required'),
  food_details: z.string().min(1, 'Food details are required'),
  calories: z.string()
    .min(1, 'Calories are required')
    .transform(val => parseInt(val))
    .refine(val => val > 0, 'Calories must be positive'),
  protein: z.string()
    .min(1, 'Protein is required')
    .transform(val => parseInt(val))
    .refine(val => val >= 0, 'Protein must be non-negative'),
  carbohydrates: z.string()
    .min(1, 'Carbohydrates are required')
    .transform(val => parseInt(val))
    .refine(val => val >= 0, 'Carbohydrates must be non-negative'),
  fat: z.string()
    .min(1, 'Fat is required')
    .transform(val => parseInt(val))
    .refine(val => val >= 0, 'Fat must be non-negative'),
  note: z.string().optional()
});

const createMenuPlanSchema = z.object({
  plan_name: z.string().min(1, 'Plan name is required'),
  selected_meal_ids: z.array(z.string()).min(1, 'At least one meal must be selected')
});

type CreateMealFormValues = z.infer<typeof createMealSchema>;
type CreateMenuPlanFormValues = z.infer<typeof createMenuPlanSchema>;

// ============================================================================
// CONSTANTS
// ============================================================================

const MEAL_TYPES = [
  'Breakfast',
  'Morning Snack',
  'Lunch', 
  'Afternoon Snack',
  'Dinner',
  'Evening Snack'
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function TrainerMenus() {
  // ========================================================================
  // STATE MANAGEMENT
  // ========================================================================
  
  const [activeTab, setActiveTab] = useState<'meals' | 'plans'>('meals');
  const [meals, setMeals] = useState<Menu[]>([]);
  const [menuPlans, setMenuPlans] = useState<MenuPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMealForm, setShowMealForm] = useState(false);
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // ========================================================================
  // FORM SETUP
  // ========================================================================
  
  const mealForm = useForm<CreateMealFormValues>({
    resolver: zodResolver(createMealSchema),
    defaultValues: {
      meal_type: '',
      food_details: '',
      calories: '',
      protein: '',
      carbohydrates: '',
      fat: '',
      note: ''
    }
  });

  const planForm = useForm<CreateMenuPlanFormValues>({
    resolver: zodResolver(createMenuPlanSchema),
    defaultValues: {
      plan_name: '',
      selected_meal_ids: []
    }
  });

  // ========================================================================
  // DATA FETCHING
  // ========================================================================
  
  const fetchData = async () => {
    try {
      setLoading(true);
      const [mealsData, menuPlansData] = await Promise.all([
        TrainerAPI.getMenus(),
        TrainerAPI.getMenuPlans()
      ]);
      setMeals(mealsData || []);
      setMenuPlans(menuPlansData || []);
    } catch (error) {
      showErrorToast(error, 'Failed to load menu data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ========================================================================
  // FORM HANDLERS
  // ========================================================================
  
  const handleCreateMeal = async (data: CreateMealFormValues) => {
    try {
      setSubmitting(true);
      
      const menuData: CreateMenuData = {
        meal_type: data.meal_type,
        food_details: data.food_details,
        calories: data.calories,
        protein: data.protein,
        carbohydrates: data.carbohydrates,
        fat: data.fat,
        note: data.note || undefined
      };
      
      const newMeal = await TrainerAPI.createMenu(menuData);
      
      if (newMeal) {
        setMeals(prev => [newMeal, ...prev]);
        showSuccessToast('Meal created successfully');
        mealForm.reset();
        setShowMealForm(false);
      } else {
        throw new Error('Failed to create meal');
      }
    } catch (error) {
      showErrorToast(error, 'Failed to create meal');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateMenuPlan = async (data: CreateMenuPlanFormValues) => {
    try {
      setSubmitting(true);
      
      const planData: CreateMenuPlanData = {
        plan_name: data.plan_name,
        selected_meal_ids: data.selected_meal_ids
      };

      const newPlan = await TrainerAPI.createMenuPlan(planData);
      
      if (newPlan) {
        setMenuPlans(prev => [newPlan, ...prev]);
        showSuccessToast('Menu plan created successfully');
        planForm.reset();
        setShowPlanForm(false);
      } else {
        throw new Error('Failed to create menu plan');
      }
    } catch (error) {
      showErrorToast(error, 'Failed to create menu plan');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteMeal = async (mealId: string) => {
    if (!confirm('Are you sure you want to delete this meal?')) return;
    
    try {
      const success = await TrainerAPI.deleteMenu(mealId);
      if (success) {
        setMeals(prev => prev.filter(meal => meal.id !== mealId));
        showSuccessToast('Meal deleted successfully');
      } else {
        throw new Error('Failed to delete meal');
      }
    } catch (error) {
      showErrorToast(error, 'Failed to delete meal');
    }
  };

  const handleDeleteMenuPlan = async (planId: string) => {
    if (!confirm('Are you sure you want to delete this menu plan?')) return;
    
    try {
      const success = await TrainerAPI.deleteMenuPlan(planId);
      if (success) {
        setMenuPlans(prev => prev.filter(plan => plan.id !== planId));
        showSuccessToast('Menu plan deleted successfully');
      } else {
        throw new Error('Failed to delete menu plan');
      }
    } catch (error) {
      showErrorToast(error, 'Failed to delete menu plan');
    }
  };

  // ========================================================================
  // UTILITY FUNCTIONS
  // ========================================================================
  
  const formatNutrition = (meal: Menu) => {
    return `${meal.calories}kcal | P: ${meal.protein}g | C: ${meal.carbohydrates}g | F: ${meal.fat}g`;
  };

  const getMealTypeBadgeColor = (mealType: string) => {
    const colors: Record<string, string> = {
      'Breakfast': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Morning Snack': 'bg-green-100 text-green-800 border-green-200',
      'Lunch': 'bg-blue-100 text-blue-800 border-blue-200',
      'Afternoon Snack': 'bg-purple-100 text-purple-800 border-purple-200',
      'Dinner': 'bg-red-100 text-red-800 border-red-200',
      'Evening Snack': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[mealType] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // ========================================================================
  // RENDER COMPONENTS
  // ========================================================================
  
  const renderMealCard = (meal: Menu) => (
    <Card key={meal.id} className="hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getMealTypeBadgeColor(meal.meal_type)}`}>
            {meal.meal_type}
          </span>
          <div className="flex space-x-2">
            <button 
              onClick={() => handleDeleteMeal(meal.id)}
              className="text-red-400 hover:text-red-600 transition-colors"
              title="Delete meal"
            >
              <Icon name="x" size={16} />
            </button>
          </div>
        </div>
        
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{meal.food_details}</h3>
        
        <div className="text-sm text-gray-600 mb-3">
          <p className="font-medium">{formatNutrition(meal)}</p>
        </div>
        
        {meal.note && (
          <p className="text-xs text-gray-500 mb-3 line-clamp-2 bg-gray-50 p-2 rounded">
            {meal.note}
          </p>
        )}
        
        <div className="text-xs text-gray-400">
          Created {formatDate(meal.created_at)}
        </div>
      </CardContent>
    </Card>
  );

  const renderMenuPlanCard = (plan: MenuPlan) => (
    <Card key={plan.id} className="hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="font-semibold text-gray-900 text-lg line-clamp-2">{plan.plan_name}</h3>
          <div className="flex space-x-2">
            <button 
              onClick={() => handleDeleteMenuPlan(plan.id)}
              className="text-red-400 hover:text-red-600 transition-colors"
              title="Delete menu plan"
            >
              <Icon name="x" size={16} />
            </button>
          </div>
        </div>
        
        {/* Nutrition Summary */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-100">
            <div className="text-lg font-bold text-[#007bff]">{plan.total_calories}</div>
            <div className="text-xs text-gray-600">Total Calories</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="text-lg font-bold text-gray-700">{plan.meal_count || 0}</div>
            <div className="text-xs text-gray-600">Meals</div>
          </div>
        </div>
        
        {/* Macros */}
        <div className="text-sm text-gray-600 mb-4 text-center p-2 bg-gray-50 rounded">
          <p>Protein: {plan.total_protein}g | Carbs: {plan.total_carbohydrates}g | Fat: {plan.total_fat}g</p>
        </div>
        
        {/* Meals in this plan */}
        {plan.meals && plan.meals.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Meals in this plan:</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {plan.meals.map((meal, index) => (
                <div key={meal.id} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded border">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500 font-mono w-6">#{index + 1}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getMealTypeBadgeColor(meal.meal_type)}`}>
                      {meal.meal_type}
                    </span>
                    <span className="font-medium truncate">{meal.food_details}</span>
                  </div>
                  <span className="text-xs text-gray-500 ml-2 font-medium">
                    {meal.calories}kcal
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Actions */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
          <span className="text-xs text-gray-400">
            Created {formatDate(plan.created_at)}
          </span>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              Edit Plan
            </Button>
            <Button variant="blue" size="sm">
              Assign to Client
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // ========================================================================
  // MAIN RENDER
  // ========================================================================
  
  if (loading) {
    return (
      <DashboardLayout userType={USER_TYPES.TRAINER}>
        <div className="flex justify-center items-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType={USER_TYPES.TRAINER}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#040b07]">Meal Management</h1>
            <p className="text-gray-600">Create meals and organize them into plans for your clients</p>
          </div>
          <div className="flex space-x-3">
            {activeTab === 'meals' && (
              <Button 
                variant="blue" 
                onClick={() => setShowMealForm(true)}
                disabled={showMealForm}
              >
                <Icon name="dumbbell" size={16} className="mr-2" />
                Create Meal
              </Button>
            )}
            {activeTab === 'plans' && (
              <Button 
                variant="blue" 
                onClick={() => setShowPlanForm(true)}
                disabled={showPlanForm || meals.length === 0}
              >
                <Icon name="calendar" size={16} className="mr-2" />
                Create Menu Plan
              </Button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('meals')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'meals'
                  ? 'border-[#007bff] text-[#007bff]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Individual Meals ({meals.length})
            </button>
            <button
              onClick={() => setActiveTab('plans')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'plans'
                  ? 'border-[#007bff] text-[#007bff]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Menu Plans ({menuPlans.length})
            </button>
          </nav>
        </div>

        {/* MEALS TAB */}
        {activeTab === 'meals' && (
          <div className="space-y-6">
            {/* Create Meal Form */}
            {showMealForm && (
              <Card>
                <CardHeader>
                  <CardTitle>Create New Meal</CardTitle>
                </CardHeader>
                <CardContent>
                  <Form {...mealForm}>
                    <form onSubmit={mealForm.handleSubmit(handleCreateMeal)} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={mealForm.control}
                          name="meal_type"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Meal Type</FormLabel>
                              <FormControl>
                                <select 
                                  {...field}
                                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                >
                                  <option value="">Select meal type</option>
                                  {MEAL_TYPES.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                  ))}
                                </select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={mealForm.control}
                          name="food_details"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Food Details</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="e.g., Grilled Chicken with Rice" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <FormField
                          control={mealForm.control}
                          name="calories"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Calories</FormLabel>
                              <FormControl>
                                <Input {...field} type="number" placeholder="350" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={mealForm.control}
                          name="protein"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Protein (g)</FormLabel>
                              <FormControl>
                                <Input {...field} type="number" placeholder="25" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={mealForm.control}
                          name="carbohydrates"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Carbs (g)</FormLabel>
                              <FormControl>
                                <Input {...field} type="number" placeholder="45" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={mealForm.control}
                          name="fat"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Fat (g)</FormLabel>
                              <FormControl>
                                <Input {...field} type="number" placeholder="12" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={mealForm.control}
                        name="note"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Notes (optional)</FormLabel>
                            <FormControl>
                              <textarea 
                                {...field}
                                className="flex h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                placeholder="Any additional notes about this meal..."
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex justify-end space-x-3">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setShowMealForm(false)}
                          disabled={submitting}
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit" 
                          variant="blue" 
                          isLoading={submitting}
                        >
                          Create Meal
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            )}

            {/* Meals List */}
            {meals.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 mb-4">
                    <Icon name="dumbbell" size={24} className="text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Meals Created</h3>
                  <p className="text-gray-600 mb-6">
                    Start by creating individual meals that you can later organize into plans.
                  </p>
                  <Button variant="blue" onClick={() => setShowMealForm(true)}>
                    <Icon name="dumbbell" size={16} className="mr-2" />
                    Create Your First Meal
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {meals.map(renderMealCard)}
              </div>
            )}
          </div>
        )}

        {/* MENU PLANS TAB */}
        {activeTab === 'plans' && (
          <div className="space-y-6">
            {/* Create Menu Plan Form */}
            {showPlanForm && (
              <Card>
                <CardHeader>
                  <CardTitle>Create New Menu Plan</CardTitle>
                </CardHeader>
                <CardContent>
                  <Form {...planForm}>
                    <form onSubmit={planForm.handleSubmit(handleCreateMenuPlan)} className="space-y-4">
                      <FormField
                        control={planForm.control}
                        name="plan_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Plan Name</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="e.g., Muscle Building Day 1" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div>
                        <label className="text-sm font-medium">Select Meals</label>
                        <div className="mt-2 max-h-64 overflow-y-auto border border-gray-200 rounded-md p-3">
                          {meals.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">
                              No meals available. Create some meals first.
                            </p>
                          ) : (
                            <div className="space-y-2">
                              {meals.map((meal) => (
                                <label key={meal.id} className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                                  <input
                                    type="checkbox"
                                    value={meal.id}
                                    {...planForm.register('selected_meal_ids')}
                                    className="mt-1"
                                  />
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-1">
                                      <span className={`px-2 py-0.5 rounded text-xs border ${getMealTypeBadgeColor(meal.meal_type)}`}>
                                        {meal.meal_type}
                                      </span>
                                      <span className="font-medium">{meal.food_details}</span>
                                    </div>
                                    <p className="text-sm text-gray-600">{formatNutrition(meal)}</p>
                                  </div>
                                </label>
                              ))}
                            </div>
                          )}
                        </div>
                        {planForm.formState.errors.selected_meal_ids && (
                          <p className="text-sm font-medium text-destructive mt-2">
                            {planForm.formState.errors.selected_meal_ids.message}
                          </p>
                        )}
                      </div>

                      <div className="flex justify-end space-x-3">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setShowPlanForm(false)}
                          disabled={submitting}
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit" 
                          variant="blue" 
                          isLoading={submitting}
                          disabled={meals.length === 0}
                        >
                          Create Menu Plan
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            )}

            {/* Menu Plans List */}
            {menuPlans.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 mb-4">
                    <Icon name="calendar" size={24} className="text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Menu Plans Created</h3>
                  <p className="text-gray-600 mb-6">
                    {meals.length === 0 
                      ? "Create some individual meals first, then organize them into plans."
                      : "Organize your meals into comprehensive meal plans for your clients."
                    }
                  </p>
                  {meals.length === 0 ? (
                    <Button variant="outline" onClick={() => setActiveTab('meals')}>
                      Create Meals First
                    </Button>
                  ) : (
                    <Button variant="blue" onClick={() => setShowPlanForm(true)}>
                      <Icon name="calendar" size={16} className="mr-2" />
                      Create Your First Plan
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {menuPlans.map(renderMenuPlanCard)}
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}