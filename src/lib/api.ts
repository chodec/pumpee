import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/pages/features/auth/hooks/useAuth'
import { Toaster } from 'sonner'
import '../styles/index.css'

// Main App Component
import App from '@/pages/App'

// Authentication Pages
import Login from '@/pages/features/auth/pages/Login'
import Register from '@/pages/features/auth/pages/Register'
import UserTypeSelection from '@/pages/features/auth/pages/UserTypeSelection'
import AuthCallback from '@/pages/features/auth/components/AuthCallback'

// Client Pages
import ClientDashboard from '@/pages/client/pages/ClientDashboard'

// Trainer Pages
import TrainerDashboard from '@/pages/trainer/pages/TrainerDashboard'
import TrainerSubscriptions from '@/pages/trainer/pages/TrainerSubscriptions'
import TrainerMenus from '@/pages/trainer/pages/TrainerMenus'
import TrainerWorkouts from '@/pages/trainer/pages/TrainerWorkouts'

// Static Pages
import Legal from '@/pages/Legal'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Main App Route */}
          <Route path="/" element={<App />} />
          
          {/* Authentication Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/user-type-selection" element={<UserTypeSelection />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          
          {/* Client Routes */}
          <Route path="/client/dashboard" element={<ClientDashboard />} />
          
          {/* Trainer Routes */}
          <Route path="/trainer/dashboard" element={<TrainerDashboard />} />
          <Route path="/trainer/subscriptions" element={<TrainerSubscriptions />} />
          <Route path="/trainer/menus" element={<TrainerMenus />} />
          <Route path="/trainer/workouts" element={<TrainerWorkouts />} />
          
          {/* Static Pages */}
          <Route path="/legal" element={<Legal />} />
          
          {/* Catch-all route - redirects to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        
        {/* Global Toast Notifications */}
        <Toaster position="top-right" richColors />
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>,
)
import { supabase } from '@/lib/supabaseClient';
import { UserProfile, UserType, SubscriptionTier } from '@/lib/types';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface ClientProgress {
  id: string;
  client_id: string;
  date: string;
  body_weight: number | null;
  chest_size: number | null;
  waist_size: number | null;
  biceps_size: number | null;
  thigh_size: number | null;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Exercise {
  id: string;
  trainer_id: string;
  exercise_name: string;
  exercise_type: string;
  muscle_groups: string[];
  equipment?: string | null;
  difficulty_level: string;
  instructions: string;
  sets?: number | null;
  reps?: number | null;
  duration_minutes?: number | null;
  rest_seconds?: number | null;
  calories_per_minute?: number | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface WorkoutExercise {
  id: string;
  workout_id: string;
  exercise_id: string;
  exercise_order: number;
  sets?: number | null;
  reps?: number | null;
  duration_minutes?: number | null;
  rest_seconds?: number | null;
  notes?: string | null;
  exercise?: Exercise;
}

export interface Workout {
  id: string;
  trainer_id: string;
  workout_name: string;
  workout_type: string;
  difficulty_level: string;
  estimated_duration: number;
  total_exercises: number;
  estimated_calories: number;
  description?: string | null;
  created_at: string;
  updated_at: string;
  workout_exercises?: WorkoutExercise[];
  exercises?: Exercise[];
  exercise_count?: number;
}

export interface ClientWorkout {
  id: string;
  client_id: string;
  workout_id: string;
  assigned_date: string;
  scheduled_date?: string | null;
  status: string;
  completed_at?: string | null;
  actual_duration?: number | null;
  client_notes?: string | null;
  trainer_notes?: string | null;
  created_at: string;
  updated_at: string;
  workout?: Workout;
}

export interface CreateExerciseData {
  exercise_name: string;
  exercise_type: string;
  muscle_groups: string[];
  equipment?: string;
  difficulty_level: string;
  instructions: string;
  sets?: number;
  reps?: number;
  duration_minutes?: number;
  rest_seconds?: number;
  calories_per_minute?: number;
  notes?: string;
}

export interface CreateWorkoutData {
  workout_name: string;
  workout_type: string;
  difficulty_level: string;
  estimated_duration: number;
  description?: string;
  selected_exercise_ids: string[];
  exercise_overrides?: {
    exercise_id: string;
    sets?: number;
    reps?: number;
    duration_minutes?: number;
    rest_seconds?: number;
    notes?: string;
  }[];
}

export interface Menu {
  id: string;
  trainer_id: string;
  meal_type: string;
  food_details: string;
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  note?: string | null;
  created_at: string;
  updated_at: string;
}

export interface MenuPlanItem {
  id: string;
  menu_plan_id: string;
  menu_id: string;
  meal_order: number;
  menu?: Menu;
}

export interface MenuPlan {
  id: string;
  trainer_id: string;
  plan_name: string;
  total_calories: number;
  total_protein: number;
  total_carbohydrates: number;
  total_fat: number;
  created_at: string;
  updated_at: string;
  menu_plan_items?: MenuPlanItem[];
  meals?: Menu[];
  meal_count?: number;
}

export interface CreateMenuData {
  meal_type: string;
  food_details: string;
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  note?: string;
}

export interface CreateMenuPlanData {
  plan_name: string;
  selected_meal_ids: string[];
}

// ============================================================================
// AUTHENTICATION API
// ============================================================================

export const AuthAPI = {
  /**
   * Get the current user's profile data
   */
  getUserProfile: async (): Promise<UserProfile | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (error) throw error;
      
      return data as UserProfile;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  },
  
  /**
   * Get the current user's type (client or trainer)
   */
  getUserType: async (): Promise<UserType | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('users')
        .select('user_type')
        .eq('id', user.id)
        .single();
        
      if (error) throw error;
      
      return data?.user_type as UserType;
    } catch (error) {
      console.error('Error fetching user type:', error);
      return null;
    }
  },
  
  /**
   * Check if email exists in the database
   */
  checkEmailExists: async (email: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('email')
        .eq('email', email)
        .maybeSingle();
        
      if (error) throw error;
      
      return !!data;
    } catch (error) {
      console.error('Error checking email:', error);
      return false;
    }
  },

  /**
   * Update user type and create appropriate profile
   */
  updateUserType: async (userId: string, userType: UserType): Promise<boolean> => {
    try {
      // Update user type
      const { error: updateError } = await supabase
        .from('users')
        .update({ user_type: userType })
        .eq('id', userId);
        
      if (updateError) throw updateError;
      
      // Create profile based on user type
      if (userType === 'client') {
        const { error: clientError } = await supabase
          .from('clients')
          .upsert({ user_id: userId });
          
        if (clientError) throw clientError;
      } else {
        // For trainers, get basic subscription tier
        const { data: basicTier, error: tierError } = await supabase
          .from('subscription_tiers')
          .select('id')
          .eq('name', 'Basic')
          .single();
          
        if (tierError) throw tierError;
        
        const { error: trainerError } = await supabase
          .from('trainers')
          .upsert({ 
            user_id: userId,
            subscription_tier_id: basicTier.id 
          });
          
        if (trainerError) throw trainerError;
      }
      
      return true;
    } catch (error) {
      console.error('Error updating user type:', error);
      return false;
    }
  }
};

// ============================================================================
// CLIENT API
// ============================================================================

export const ClientAPI = {
  /**
   * Get client's profile data
   */
  getClientProfile: async (): Promise<any | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('clients')
        .select('*, users(*)')
        .eq('user_id', user.id)
        .single();
        
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error fetching client profile:', error);
      return null;
    }
  },

  /**
   * Get client's measurements with proper error handling
   */
  getClientMeasurements: async (limit = 10): Promise<ClientProgress[]> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error("No authenticated user found");
        return [];
      }
      
      // First get the client ID using the user ID
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('id')
        .eq('user_id', user.id)
        .single();
        
      // Handle client record errors
      if (clientError) {
        if (clientError.code === 'PGRST116') {
          const { data: newClient, error: createError } = await supabase
            .from('clients')
            .insert({ user_id: user.id })
            .select()
            .single();
            
          if (createError) throw createError;
          return [];
        } else {
          throw clientError;
        }
      }
      
      // Use the client ID to get the measurements
      const { data, error } = await supabase
        .from('client_progress')
        .select(`
          id, 
          client_id, 
          date, 
          body_weight, 
          chest_size, 
          waist_size, 
          biceps_size, 
          thigh_size, 
          notes, 
          created_at, 
          updated_at
        `)
        .eq('client_id', clientData.id)
        .order('date', { ascending: false })
        .limit(limit);
        
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Error fetching client measurements:', error);
      return [];
    }
  },

  /**
   * Add a new measurement for the current client
   */
  addMeasurement: async (measurementData: any): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error("No authenticated user found");
        return false;
      }
      
      // Get client ID or create client record if needed
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('id')
        .eq('user_id', user.id)
        .single();
      
      let clientId: string;
      
      if (clientError) {
        if (clientError.code === 'PGRST116') {
          const { data: newClient, error: createError } = await supabase
            .from('clients')
            .insert({ user_id: user.id })
            .select()
            .single();
            
          if (createError) throw createError;
          clientId = newClient.id;
        } else {
          throw clientError;
        }
      } else {
        clientId = clientData.id;
      }
      
      // Prepare the measurement data with proper type conversion
      const measurementToInsert = {
        client_id: clientId,
        date: measurementData.date,
        body_weight: measurementData.body_weight !== null ? Number(measurementData.body_weight) : null,
        chest_size: measurementData.chest_size !== null ? Number(measurementData.chest_size) : null,
        waist_size: measurementData.waist_size !== null ? Number(measurementData.waist_size) : null,
        biceps_size: measurementData.biceps_size !== null ? Number(measurementData.biceps_size) : null,
        thigh_size: measurementData.thigh_size !== null ? Number(measurementData.thigh_size) : null,
        notes: measurementData.notes || null
      };
      
      // Insert measurement into the database
      const { error } = await supabase
        .from('client_progress')
        .insert(measurementToInsert);
        
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error adding measurement:', error);
      return false;
    }
  },

  /**
   * Get client's statistics for dashboard
   */
  getClientStats: async (): Promise<any> => {
    try {
      const measurements = await ClientAPI.getClientMeasurements(10);
      
      if (!measurements || measurements.length === 0) {
        return {
          currentWeight: { value: 0, change: 0, unit: 'kg' },
          bodyFat: { value: 0, change: 0, unit: '%' },
          muscleGain: { value: 0, change: 0, unit: 'kg' }
        };
      }
      
      const latest = measurements[0]; 
      const oldest = measurements.length > 1 ? measurements[measurements.length - 1] : null;
      
      // Calculate weight change
      const currentWeight = {
        value: parseFloat(latest.body_weight?.toString() || '0') || 0,
        change: oldest ? (parseFloat(latest.body_weight?.toString() || '0') - parseFloat(oldest.body_weight?.toString() || '0')) : 0,
        unit: 'kg'
      };
      
      // Calculate estimated body fat (based on measurements)
      const latestBodyFat = estimateBodyFat(latest);
      const oldestBodyFat = oldest ? estimateBodyFat(oldest) : latestBodyFat;
      
      const bodyFat = {
        value: latestBodyFat,
        change: latestBodyFat - oldestBodyFat,
        unit: '%'
      };
      
      // Calculate estimated muscle gain
      const muscleGain = estimateMuscleGain(latest, oldest);
      
      return {
        currentWeight,
        bodyFat,
        muscleGain
      };
    } catch (error) {
      console.error('Error calculating client stats:', error);
      return {
        currentWeight: { value: 0, change: 0, unit: 'kg' },
        bodyFat: { value: 0, change: 0, unit: '%' },
        muscleGain: { value: 0, change: 0, unit: 'kg' }
      };
    }
  },

  /**
   * Get client's assigned trainer
   */
  getAssignedTrainer: async (): Promise<any | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return null;
      
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('id')
        .eq('user_id', user.id)
        .single();
        
      if (clientError) return null;
      
      // Get trainer relationship
      const { data: relationData, error: relationError } = await supabase
        .from('client_trainers')
        .select(`
          *,
          trainer:trainers(
            id,
            user:users(full_name, email)
          ),
          trainer_subscription_tier:trainer_subscription_tiers(
            name,
            price
          )
        `)
        .eq('client_id', clientData.id)
        .eq('status', 'active')
        .single();
      
      if (relationError) return null;
      
      return {
        id: relationData.trainer.id,
        full_name: relationData.trainer.user.full_name,
        email: relationData.trainer.user.email,
        subscription_name: relationData.trainer_subscription_tier?.name,
        subscription_price: relationData.trainer_subscription_tier?.price,
        start_date: relationData.subscription_start
      };
    } catch (error) {
      console.error('Error fetching assigned trainer:', error);
      return null;
    }
  }
};

// ============================================================================
// TRAINER API
// ============================================================================

export const TrainerAPI = {
  /**
   * Get current trainer ID
   */
  getTrainerId: async (): Promise<string | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      const { data: trainerData, error } = await supabase
        .from('trainers')
        .select('id')
        .eq('user_id', user.id)
        .single();
        
      if (error) throw error;
      return trainerData.id;
    } catch (error) {
      console.error('Error getting trainer ID:', error);
      return null;
    }
  },

  /**
   * Get trainer's subscription details
   */
  getSubscription: async (): Promise<SubscriptionTier | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return null;
      
      const { data: trainerData, error: trainerError } = await supabase
        .from('trainers')
        .select('subscription_tier_id')
        .eq('user_id', user.id)
        .single();
        
      if (trainerError) throw trainerError;
      
      const { data: subscription, error: subscriptionError } = await supabase
        .from('subscription_tiers')
        .select('*')
        .eq('id', trainerData.subscription_tier_id)
        .single();
        
      if (subscriptionError) throw subscriptionError;
      
      return subscription as SubscriptionTier;
    } catch (error) {
      console.error('Error fetching subscription:', error);
      return null;
    }
  },
  
  /**
   * Update trainer's subscription
   */
  updateSubscription: async (tierId: string): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return false;
      
      const { error } = await supabase
        .from('trainers')
        .update({ subscription_tier_id: tierId })
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error updating subscription:', error);
      return false;
    }
  },
  
  /**
   * Get count of trainer's clients
   */
  getClientCount: async (): Promise<number> => {
    try {
      const trainerId = await TrainerAPI.getTrainerId();
      if (!trainerId) return 0;
      
      const { count, error } = await supabase
        .from('client_trainers')
        .select('*', { count: 'exact', head: true })
        .eq('trainer_id', trainerId)
        .eq('status', 'active');
        
      if (error) throw error;
      
      return count || 0;
    } catch (error) {
      console.error('Error fetching client count:', error);
      return 0;
    }
  },
  
  /**
   * Get all subscription tiers
   */
  getAllSubscriptionTiers: async (): Promise<SubscriptionTier[]> => {
    try {
      const { data, error } = await supabase
        .from('subscription_tiers')
        .select('*')
        .order('price', { ascending: true });
        
      if (error) throw error;
      
      return data as SubscriptionTier[];
    } catch (error) {
      console.error('Error fetching subscription tiers:', error);
      return [];
    }
  },

  /**
   * Get trainer's individual menus
   */
  getMenus: async (): Promise<Menu[]> => {
    try {
      const trainerId = await TrainerAPI.getTrainerId();
      if (!trainerId) return [];
      
      const { data, error } = await supabase
        .from('menus')
        .select('*')
        .eq('trainer_id', trainerId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      return data as Menu[];
    } catch (error) {
      console.error('Error fetching menus:', error);
      return [];
    }
  },

  /**
   * Create a new menu
   */
  createMenu: async (menuData: CreateMenuData): Promise<Menu | null> => {
    try {
      const trainerId = await TrainerAPI.getTrainerId();
      if (!trainerId) throw new Error('Trainer not found');
      
      const { data, error } = await supabase
        .from('menus')
        .insert({
          trainer_id: trainerId,
          meal_type: menuData.meal_type,
          food_details: menuData.food_details,
          calories: menuData.calories,
          protein: menuData.protein,
          carbohydrates: menuData.carbohydrates,
          fat: menuData.fat,
          note: menuData.note || null
        })
        .select()
        .single();
        
      if (error) throw error;
      
      return data as Menu;
    } catch (error) {
      console.error('Error creating menu:', error);
      return null;
    }
  },

  /**
   * Get trainer's menu plans with properly ordered meals
   */
  getMenuPlans: async (): Promise<MenuPlan[]> => {
    try {
      const trainerId = await TrainerAPI.getTrainerId();
      if (!trainerId) return [];
      
      const { data, error } = await supabase
        .from('menu_plans')
        .select(`
          *,
          menu_plan_items(
            id,
            menu_id,
            meal_order,
            menus(*)
          )
        `)
        .eq('trainer_id', trainerId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      // Transform data to include properly ordered meals
      const menuPlansWithMenus = (data || []).map(plan => {
        // Sort menu items by meal_order and extract meals
        const sortedItems = plan.menu_plan_items?.sort((a, b) => a.meal_order - b.meal_order) || [];
        const meals = sortedItems.map(item => item.menus).filter(Boolean) as Menu[];
        
        return {
          ...plan,
          meals,
          meal_count: meals.length,
          menu_plan_items: sortedItems
        } as MenuPlan;
      });
      
      return menuPlansWithMenus;
    } catch (error) {
      console.error('Error fetching menu plans:', error);
      return [];
    }
  },

  /**
   * Create a new menu plan with selected meals
   */
  createMenuPlan: async (planData: CreateMenuPlanData): Promise<MenuPlan | null> => {
    try {
      const trainerId = await TrainerAPI.getTrainerId();
      if (!trainerId) throw new Error('Trainer not found');
      
      // Get selected meals to calculate totals
      const { data: selectedMeals, error: mealsError } = await supabase
        .from('menus')
        .select('*')
        .in('id', planData.selected_meal_ids);
        
      if (mealsError) throw mealsError;
      
      // Calculate nutrition totals
      const totals = selectedMeals.reduce((acc, meal) => ({
        calories: acc.calories + meal.calories,
        protein: acc.protein + meal.protein,
        carbohydrates: acc.carbohydrates + meal.carbohydrates,
        fat: acc.fat + meal.fat
      }), { calories: 0, protein: 0, carbohydrates: 0, fat: 0 });
      
      // Create menu plan
      const { data: menuPlan, error: planError } = await supabase
        .from('menu_plans')
        .insert({
          trainer_id: trainerId,
          plan_name: planData.plan_name,
          total_calories: totals.calories,
          total_protein: totals.protein,
          total_carbohydrates: totals.carbohydrates,
          total_fat: totals.fat
        })
        .select()
        .single();
        
      if (planError) throw planError;
      
      // Create menu plan items with proper ordering
      const menuPlanItems = planData.selected_meal_ids.map((menuId, index) => ({
        menu_plan_id: menuPlan.id,
        menu_id: menuId,
        meal_order: index + 1
      }));
      
      const { error: itemsError } = await supabase
        .from('menu_plan_items')
        .insert(menuPlanItems);
        
      if (itemsError) throw itemsError;
      
      // Return the created plan with meals
      const createdPlan: MenuPlan = {
        ...menuPlan,
        meals: selectedMeals,
        meal_count: selectedMeals.length
      };
      
      return createdPlan;
    } catch (error) {
      console.error('Error creating menu plan:', error);
      return null;
    }
  },

  /**
   * Delete a menu
   */
  deleteMenu: async (menuId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('menus')
        .delete()
        .eq('id', menuId);
        
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error deleting menu:', error);
      return false;
    }
  },

  /**
   * Delete a menu plan
   */
  deleteMenuPlan: async (menuPlanId: string): Promise<boolean> => {
    try {
      // Delete menu plan items first (due to foreign key constraint)
      const { error: itemsError } = await supabase
        .from('menu_plan_items')
        .delete()
        .eq('menu_plan_id', menuPlanId);
        
      if (itemsError) throw itemsError;
      
      // Delete the menu plan
      const { error: planError } = await supabase
        .from('menu_plans')
        .delete()
        .eq('id', menuPlanId);
        
      if (planError) throw planError;
      
      return true;
    } catch (error) {
      console.error('Error deleting menu plan:', error);
      return false;
    }
  },

  /**
   * Assign menu plan to client
   */
  assignMenuPlanToClient: async (clientId: string, menuPlanId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('client_menu_plans')
        .insert({
          client_id: clientId,
          menu_plan_id: menuPlanId
        });
        
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error assigning menu plan to client:', error);
      return false;
    }
  },

  /**
   * Get trainer's individual exercises
   */
  getExercises: async (): Promise<Exercise[]> => {
    try {
      const trainerId = await TrainerAPI.getTrainerId();
      if (!trainerId) return [];
      
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .eq('trainer_id', trainerId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      return data as Exercise[];
    } catch (error) {
      console.error('Error fetching exercises:', error);
      return [];
    }
  },

  /**
   * Create a new exercise
   */
  createExercise: async (exerciseData: CreateExerciseData): Promise<Exercise | null> => {
    try {
      const trainerId = await TrainerAPI.getTrainerId();
      if (!trainerId) throw new Error('Trainer not found');
      
      const { data, error } = await supabase
        .from('exercises')
        .insert({
          trainer_id: trainerId,
          exercise_name: exerciseData.exercise_name,
          exercise_type: exerciseData.exercise_type,
          muscle_groups: exerciseData.muscle_groups,
          equipment: exerciseData.equipment || null,
          difficulty_level: exerciseData.difficulty_level,
          instructions: exerciseData.instructions,
          sets: exerciseData.sets || null,
          reps: exerciseData.reps || null,
          duration_minutes: exerciseData.duration_minutes || null,
          rest_seconds: exerciseData.rest_seconds || null,
          calories_per_minute: exerciseData.calories_per_minute || null,
          notes: exerciseData.notes || null
        })
        .select()
        .single();
        
      if (error) throw error;
      
      return data as Exercise;
    } catch (error) {
      console.error('Error creating exercise:', error);
      return null;
    }
  },

  /**
   * Get trainer's workouts with properly ordered exercises
   */
  getWorkouts: async (): Promise<Workout[]> => {
    try {
      const trainerId = await TrainerAPI.getTrainerId();
      if (!trainerId) return [];
      
      const { data, error } = await supabase
        .from('workouts')
        .select(`
          *,
          workout_exercises(
            id,
            exercise_id,
            exercise_order,
            sets,
            reps,
            duration_minutes,
            rest_seconds,
            notes,
            exercises(*)
          )
        `)
        .eq('trainer_id', trainerId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      // Transform data to include properly ordered exercises
      const workoutsWithExercises = (data || []).map(workout => {
        // Sort exercises by exercise_order and extract exercise data
        const sortedItems = workout.workout_exercises?.sort((a, b) => a.exercise_order - b.exercise_order) || [];
        const exercises = sortedItems.map(item => item.exercises).filter(Boolean) as Exercise[];
        
        return {
          ...workout,
          exercises,
          exercise_count: exercises.length,
          workout_exercises: sortedItems
        } as Workout;
      });
      
      return workoutsWithExercises;
    } catch (error) {
      console.error('Error fetching workouts:', error);
      return [];
    }
  },

  /**
   * Create a new workout with selected exercises
   */
  createWorkout: async (workoutData: CreateWorkoutData): Promise<Workout | null> => {
    try {
      const trainerId = await TrainerAPI.getTrainerId();
      if (!trainerId) throw new Error('Trainer not found');
      
      // Get selected exercises to calculate totals
      const { data: selectedExercises, error: exercisesError } = await supabase
        .from('exercises')
        .select('*')
        .in('id', workoutData.selected_exercise_ids);
        
      if (exercisesError) throw exercisesError;
      
      // Calculate estimated calories
      const estimatedCalories = selectedExercises.reduce((acc, exercise) => {
        const exerciseOverride = workoutData.exercise_overrides?.find(
          override => override.exercise_id === exercise.id
        );
        
        const duration = exerciseOverride?.duration_minutes || exercise.duration_minutes || 0;
        const sets = exerciseOverride?.sets || exercise.sets || 1;
        const caloriesPerMinute = exercise.calories_per_minute || 5;
        
        if (duration > 0) {
          return acc + (duration * caloriesPerMinute);
        } else {
          // For strength exercises, estimate based on sets
          return acc + (sets * caloriesPerMinute * 0.5);
        }
      }, 0);
      
      // Create workout
      const { data: workout, error: workoutError } = await supabase
        .from('workouts')
        .insert({
          trainer_id: trainerId,
          workout_name: workoutData.workout_name,
          workout_type: workoutData.workout_type,
          difficulty_level: workoutData.difficulty_level,
          estimated_duration: workoutData.estimated_duration,
          total_exercises: workoutData.selected_exercise_ids.length,
          estimated_calories: Math.round(estimatedCalories),
          description: workoutData.description || null
        })
        .select()
        .single();
        
      if (workoutError) throw workoutError;
      
      // Create workout exercise items with proper ordering and overrides
      const workoutExerciseItems = workoutData.selected_exercise_ids.map((exerciseId, index) => {
        const override = workoutData.exercise_overrides?.find(
          override => override.exercise_id === exerciseId
        );
        
        return {
          workout_id: workout.id,
          exercise_id: exerciseId,
          exercise_order: index + 1,
          sets: override?.sets || null,
          reps: override?.reps || null,
          duration_minutes: override?.duration_minutes || null,
          rest_seconds: override?.rest_seconds || null,
          notes: override?.notes || null
        };
      });
      
      const { error: itemsError } = await supabase
        .from('workout_exercises')
        .insert(workoutExerciseItems);
        
      if (itemsError) throw itemsError;
      
      // Return the created workout with exercises
      const createdWorkout: Workout = {
        ...workout,
        exercises: selectedExercises,
        exercise_count: selectedExercises.length
      };
      
      return createdWorkout;
    } catch (error) {
      console.error('Error creating workout:', error);
      return null;
    }
  },

  /**
   * Delete an exercise
   */
  deleteExercise: async (exerciseId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('exercises')
        .delete()
        .eq('id', exerciseId);
        
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error deleting exercise:', error);
      return false;
    }
  },

  /**
   * Delete a workout
   */
  deleteWorkout: async (workoutId: string): Promise<boolean> => {
    try {
      // Delete workout exercises first (due to foreign key constraint)
      const { error: itemsError } = await supabase
        .from('workout_exercises')
        .delete()
        .eq('workout_id', workoutId);
        
      if (itemsError) throw itemsError;
      
      // Delete the workout
      const { error: workoutError } = await supabase
        .from('workouts')
        .delete()
        .eq('id', workoutId);
        
      if (workoutError) throw workoutError;
      
      return true;
    } catch (error) {
      console.error('Error deleting workout:', error);
      return false;
    }
  },

  /**
   * Assign workout to client
   */
  assignWorkoutToClient: async (clientId: string, workoutId: string, scheduledDate?: string, trainerNotes?: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('client_workouts')
        .insert({
          client_id: clientId,
          workout_id: workoutId,
          scheduled_date: scheduledDate || null,
          trainer_notes: trainerNotes || null,
          status: 'assigned'
        });
        
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error assigning workout to client:', error);
      return false;
    }
  },

  /**
   * Get client's assigned workouts
   */
  getClientWorkouts: async (clientId: string): Promise<ClientWorkout[]> => {
    try {
      const { data, error } = await supabase
        .from('client_workouts')
        .select(`
          *,
          workout:workouts(
            *,
            workout_exercises(
              *,
              exercises(*)
            )
          )
        `)
        .eq('client_id', clientId)
        .order('assigned_date', { ascending: false });
        
      if (error) throw error;
      
      return data as ClientWorkout[];
    } catch (error) {
      console.error('Error fetching client workouts:', error);
      return [];
    }
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Estimate body fat percentage based on measurements
 */
function estimateBodyFat(measurement: ClientProgress): number {
  if (!measurement) return 0;
  
  const waist = parseFloat(measurement.waist_size?.toString() || '0') || 0;
  const chest = parseFloat(measurement.chest_size?.toString() || '0') || 0;
  
  if (waist === 0 || chest === 0) return 0;
  
  // Simple formula for estimation (not medically accurate)
  const ratio = waist / chest;
  let bodyFat = (ratio * 100) - 30;
  
  // Ensure it's in a reasonable range
  bodyFat = Math.max(5, Math.min(bodyFat, 35));
  
  return parseFloat(bodyFat.toFixed(1));
}

/**
 * Estimate muscle gain
 */
function estimateMuscleGain(latest: ClientProgress, oldest: ClientProgress | null): any {
  if (!latest || !oldest) {
    return {
      value: 0,
      change: 0,
      unit: 'kg'
    };
  }
  
  const weightChange = parseFloat(latest.body_weight?.toString() || '0') - parseFloat(oldest.body_weight?.toString() || '0');
  const latestBodyFat = estimateBodyFat(latest);
  const oldestBodyFat = estimateBodyFat(oldest);
  const bodyFatChange = latestBodyFat - oldestBodyFat;
  
  let muscleGain = 0;
  
  if (weightChange > 0 && bodyFatChange <= 0) {
    muscleGain = weightChange;
  } else if (weightChange < 0 && bodyFatChange < -2) {
    muscleGain = Math.abs(bodyFatChange) * 0.3;
  }
  
  return {
    value: parseFloat(muscleGain.toFixed(1)),
    change: parseFloat(muscleGain.toFixed(1)),
    unit: 'kg'
  };
}