// src/pages/trainer/pages/TrainerMenus.tsx
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
import { TrainerAPI } from '@/lib/api';
import { showSuccessToast, showErrorToast } from '@/lib/errors';
import { USER_TYPES } from '@/lib/constants';

// Types
interface Meal {
  id: string;
  trainer_id: string;
  meal_type: string;
  food_details: string;
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  note?: string;
  created_at: string;
  updated_at: string;
}

interface MenuPlan {
  id: string;
  trainer_id: string;
  plan_name: string;
  total_calories: number;
  total_protein: number;
  total_carbohydrates: number;
  total_fat: number;
  created_at: string;
  updated_at: string;
  meals?: Meal[];
}

// Form schemas
const mealSchema = z.object({
  meal_type: z.string().min(1, 'Meal type is required'),
  food_details: z.string().min(1, 'Food details are required'),
  calories: z.string().transform(val => parseInt(val)).refine(val => val > 0, 'Calories must be positive'),
  protein: z.string().transform(val => parseInt(val)).refine(val => val >= 0, 'Protein must be non-negative'),
  carbohydrates: z.string().transform(val => parseInt(val)).refine(val => val >= 0, 'Carbohydrates must be non-negative'),
  fat: z.string().transform(val => parseInt(val)).refine(val => val >= 0, 'Fat must be non-negative'),
  note: z.string().optional()
});

const menuPlanSchema = z.object({
  plan_name: z.string().min(1, 'Plan name is required'),
  selected_meals: z.array(z.string()).min(1, 'At least one meal must be selected')
});

type MealFormValues = z.infer<typeof mealSchema>;
type MenuPlanFormValues = z.infer<typeof menuPlanSchema>;

export default function TrainerMenus() {
  // State
  const [activeTab, setActiveTab] = useState<'meals' | 'plans'>('meals');
  const [meals, setMeals] = useState<Meal[]>([]);
  const [menuPlans, setMenuPlans] = useState<MenuPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMealForm, setShowMealForm] = useState(false);
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Forms
  const mealForm = useForm<MealFormValues>({
    resolver: zodResolver(mealSchema),
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

  const planForm = useForm<MenuPlanFormValues>({
    resolver: zodResolver(menuPlanSchema),
    defaultValues: {
      plan_name: '',
      selected_meals: []
    }
  });

  // Constants
  const mealTypes = [
    'Breakfast',
    'Morning Snack',
    'Lunch', 
    'Afternoon Snack',
    'Dinner',
    'Evening Snack'
  ];

  // Functions
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
      showErrorToast(error, 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMeal = async (data: MealFormValues) => {
    try {
      setSubmitting(true);
      const newMeal = await TrainerAPI.createMenu(data);
      
      if (newMeal) {
        setMeals(prev => [newMeal, ...prev]);
        showSuccessToast('Meal created successfully');
        mealForm.reset();
        setShowMealForm(false);
      }
    } catch (error) {
      showErrorToast(error, 'Failed to create meal');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateMenuPlan = async (data: MenuPlanFormValues) => {
    try {
      setSubmitting(true);
      
      const selectedMealObjects = meals.filter(meal => 
        data.selected_meals.includes(meal.id)
      );
      
      const totals = selectedMealObjects.reduce((acc, meal) => ({
        calories: acc.calories + meal.calories,
        protein: acc.protein + meal.protein,
        carbohydrates: acc.carbohydrates + meal.carbohydrates,
        fat: acc.fat + meal.fat
      }), { calories: 0, protein: 0, carbohydrates: 0, fat: 0 });

      const planData = {
        plan_name: data.plan_name,
        total_calories: totals.calories,
        total_protein: totals.protein,
        total_carbohydrates: totals.carbohydrates,
        total_fat: totals.fat
      };

      const newPlan = await TrainerAPI.createMenuPlan(planData, data.selected_meals);
      
      if (newPlan) {
        setMenuPlans(prev => [newPlan, ...prev]);
        showSuccessToast('Menu plan created successfully');
        planForm.reset();
        setShowPlanForm(false);
      }
    } catch (error) {
      showErrorToast(error, 'Failed to create menu plan');
    } finally {
      setSubmitting(false);
    }
  };

  const formatNutrition = (meal: Meal) => {
    return `${meal.calories}kcal | P: ${meal.protein}g | C: ${meal.carbohydrates}g | F: ${meal.fat}g`;
  };

  const getMealTypeBadge = (mealType: string) => {
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

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <DashboardLayout userType={USER_TYPES.TRAINER}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
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
                Create Meal
              </Button>
            )}
            {activeTab === 'plans' && (
              <Button 
                variant="blue" 
                onClick={() => setShowPlanForm(true)}
                disabled={showPlanForm || meals.length === 0}
              >
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
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'meals'
                  ? 'border-[#007bff] text-[#007bff]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Individual Meals ({meals.length})
            </button>
            <button
              onClick={() => setActiveTab('plans')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'plans'
                  ? 'border-[#007bff] text-[#007bff]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Menu Plans ({menuPlans.length})
            </button>
          </nav>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <>
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
                                      {mealTypes.map(type => (
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
                                    <Input {...field} placeholder="e.g., Spaghetti with Beef" />
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
                        Create Your First Meal
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {meals.map((meal) => (
                      <Card key={meal.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMealTypeBadge(meal.meal_type)}`}>
                              {meal.meal_type}
                            </span>
                            <button className="text-gray-400 hover:text-gray-600">
                              <Icon name="menu" size={16} />
                            </button>
                          </div>
                          
                          <h3 className="font-semibold text-gray-900 mb-2">{meal.food_details}</h3>
                          
                          <div className="text-sm text-gray-600 mb-3">
                            <p className="font-medium">{formatNutrition(meal)}</p>
                          </div>
                          
                          {meal.note && (
                            <p className="text-xs text-gray-500 mb-3 line-clamp-2">{meal.note}</p>
                          )}
                          
                          <div className="text-xs text-gray-400">
                            Created {new Date(meal.created_at).toLocaleDateString()}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
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
                                    <label key={meal.id} className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded">
                                      <input
                                        type="checkbox"
                                        value={meal.id}
                                        {...planForm.register('selected_meals')}
                                        className="mt-1"
                                      />
                                      <div className="flex-1">
                                        <div className="flex items-center space-x-2">
                                          <span className={`px-2 py-0.5 rounded text-xs ${getMealTypeBadge(meal.meal_type)}`}>
                                            {meal.meal_type}
                                          </span>
                                          <span className="font-medium">{meal.food_details}</span>
                                        </div>
                                        <p className="text-sm text-gray-600 mt-1">{formatNutrition(meal)}</p>
                                      </div>
                                    </label>
                                  ))}
                                </div>
                              )}
                            </div>
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
                          Create Your First Plan
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {menuPlans.map((plan) => (
                      <Card key={plan.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <h3 className="font-semibold text-gray-900 mb-4">{plan.plan_name}</h3>
                          
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="text-center p-3 bg-blue-50 rounded-lg">
                              <div className="text-lg font-bold text-[#007bff]">{plan.total_calories}</div>
                              <div className="text-xs text-gray-600">Total Calories</div>
                            </div>
                            <div className="text-center p-3 bg-gray-50 rounded-lg">
                              <div className="text-lg font-bold text-gray-700">{plan.meals?.length || 0}</div>
                              <div className="text-xs text-gray-600">Meals</div>
                            </div>
                          </div>
                          
                          <div className="text-sm text-gray-600 mb-4">
                            <p>P: {plan.total_protein}g | C: {plan.total_carbohydrates}g | F: {plan.total_fat}g</p>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-400">
                              Created {new Date(plan.created_at).toLocaleDateString()}
                            </span>
                            <Button variant="outline" size="sm">
                              Assign to Client
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}