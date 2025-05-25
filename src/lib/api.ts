// src/lib/api.ts - Complete Simplified API
import { supabase } from '@/lib/supabaseClient';
import { UserProfile, UserType, SubscriptionTier } from '@/lib/types';

// ============================================================================
// SIMPLIFIED TYPE DEFINITIONS
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

// Simplified Exercise - just name, series, and description
export interface Exercise {
  id: string;
  trainer_id: string;
  exercise_name: string;
  series: string; // e.g., "3 sets x 12 reps"
  series_description: string;
  created_at: string;
  updated_at: string;
}

// Simplified Workout - day-based with exercises
export interface Workout {
  id: string;
  trainer_id: string;
  workout_name: string;
  workout_day: string; // e.g., "Monday", "Day 1"
  description?: string;
  created_at: string;
  updated_at: string;
  exercises?: Exercise[];
  exercise_count?: number;
}

export interface WorkoutExercise {
  id: string;
  workout_id: string;
  exercise_id: string;
  exercise_order: number;
  notes?: string;
  exercise?: Exercise;
}

export interface ClientWorkout {
  id: string;
  client_id: string;
  workout_id: string;
  assigned_date: string;
  status: 'assigned' | 'in_progress' | 'completed';
  trainer_notes?: string;
  created_at: string;
  updated_at: string;
  workout?: Workout;
}

export interface CreateExerciseData {
  exercise_name: string;
  series: string;
  series_description: string;
}

export interface CreateWorkoutData {
  workout_name: string;
  workout_day: string;
  description?: string;
  selected_exercise_ids: string[];
}

// Menu types remain the same
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

  updateUserType: async (userId: string, userType: UserType): Promise<boolean> => {
    try {
      const { error: updateError } = await supabase
        .from('users')
        .update({ user_type: userType })
        .eq('id', userId);
        
      if (updateError) throw updateError;
      
      if (userType === 'client') {
        const { error: clientError } = await supabase
          .from('clients')
          .upsert({ user_id: userId });
          
        if (clientError) throw clientError;
      } else {
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

  getClientMeasurements: async (limit = 10): Promise<ClientProgress[]> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error("No authenticated user found");
        return [];
      }
      
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('id')
        .eq('user_id', user.id)
        .single();
        
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

  addMeasurement: async (measurementData: any): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error("No authenticated user found");
        return false;
      }
      
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
      
      const currentWeight = {
        value: parseFloat(latest.body_weight?.toString() || '0') || 0,
        change: oldest ? (parseFloat(latest.body_weight?.toString() || '0') - parseFloat(oldest.body_weight?.toString() || '0')) : 0,
        unit: 'kg'
      };
      
      const latestBodyFat = estimateBodyFat(latest);
      const oldestBodyFat = oldest ? estimateBodyFat(oldest) : latestBodyFat;
      
      const bodyFat = {
        value: latestBodyFat,
        change: latestBodyFat - oldestBodyFat,
        unit: '%'
      };
      
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
// TRAINER API - SIMPLIFIED
// ============================================================================

export const TrainerAPI = {
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

  // ========================================================================
  // SIMPLIFIED EXERCISES
  // ========================================================================
  
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

  createExercise: async (exerciseData: CreateExerciseData): Promise<Exercise | null> => {
    try {
      const trainerId = await TrainerAPI.getTrainerId();
      if (!trainerId) throw new Error('Trainer not found');
      
      const { data, error } = await supabase
        .from('exercises')
        .insert({
          trainer_id: trainerId,
          exercise_name: exerciseData.exercise_name,
          series: exerciseData.series,
          series_description: exerciseData.series_description
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

  // ========================================================================
  // SIMPLIFIED WORKOUTS
  // ========================================================================
  
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
            notes,
            exercises(*)
          )
        `)
        .eq('trainer_id', trainerId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      const workoutsWithExercises = (data || []).map(workout => {
        const sortedItems = workout.workout_exercises?.sort((a, b) => a.exercise_order - b.exercise_order) || [];
        const exercises = sortedItems.map(item => item.exercises).filter(Boolean) as Exercise[];
        
        return {
          ...workout,
          exercises,
          exercise_count: exercises.length
        } as Workout;
      });
      
      return workoutsWithExercises;
    } catch (error) {
      console.error('Error fetching workouts:', error);
      return [];
    }
  },

  createWorkout: async (workoutData: CreateWorkoutData): Promise<Workout | null> => {
    try {
      const trainerId = await TrainerAPI.getTrainerId();
      if (!trainerId) throw new Error('Trainer not found');
      
      const { data: workout, error: workoutError } = await supabase
        .from('workouts')
        .insert({
          trainer_id: trainerId,
          workout_name: workoutData.workout_name,
          workout_day: workoutData.workout_day,
          description: workoutData.description || null
        })
        .select()
        .single();
        
      if (workoutError) throw workoutError;
      
      if (workoutData.selected_exercise_ids.length > 0) {
        const workoutExerciseItems = workoutData.selected_exercise_ids.map((exerciseId, index) => ({
          workout_id: workout.id,
          exercise_id: exerciseId,
          exercise_order: index + 1
        }));
        
        const { error: itemsError } = await supabase
          .from('workout_exercises')
          .insert(workoutExerciseItems);
          
        if (itemsError) throw itemsError;
      }
      
      return workout as Workout;
    } catch (error) {
      console.error('Error creating workout:', error);
      return null;
    }
  },

  deleteWorkout: async (workoutId: string): Promise<boolean> => {
    try {
      const { error: itemsError } = await supabase
        .from('workout_exercises')
        .delete()
        .eq('workout_id', workoutId);
        
      if (itemsError) throw itemsError;
      
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

  assignWorkoutToClient: async (clientId: string, workoutId: string, trainerNotes?: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('client_workouts')
        .insert({
          client_id: clientId,
          workout_id: workoutId,
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

  // ========================================================================
  // MENU FUNCTIONS (UNCHANGED)
  // ========================================================================

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
      
      const menuPlansWithMenus = (data || []).map(plan => {
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

  createMenuPlan: async (planData: CreateMenuPlanData): Promise<MenuPlan | null> => {
    try {
      const trainerId = await TrainerAPI.getTrainerId();
      if (!trainerId) throw new Error('Trainer not found');
      
      const { data: selectedMeals, error: mealsError } = await supabase
        .from('menus')
        .select('*')
        .in('id', planData.selected_meal_ids);
        
      if (mealsError) throw mealsError;
      
      const totals = selectedMeals.reduce((acc, meal) => ({
        calories: acc.calories + meal.calories,
        protein: acc.protein + meal.protein,
        carbohydrates: acc.carbohydrates + meal.carbohydrates,
        fat: acc.fat + meal.fat
      }), { calories: 0, protein: 0, carbohydrates: 0, fat: 0 });
      
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
      
      const menuPlanItems = planData.selected_meal_ids.map((menuId, index) => ({
        menu_plan_id: menuPlan.id,
        menu_id: menuId,
        meal_order: index + 1
      }));
      
      const { error: itemsError } = await supabase
        .from('menu_plan_items')
        .insert(menuPlanItems);
        
      if (itemsError) throw itemsError;
      
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

  deleteMenuPlan: async (menuPlanId: string): Promise<boolean> => {
    try {
      const { error: itemsError } = await supabase
        .from('menu_plan_items')
        .delete()
        .eq('menu_plan_id', menuPlanId);
        
      if (itemsError) throw itemsError;
      
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
  }
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function estimateBodyFat(measurement: ClientProgress): number {
  if (!measurement) return 0;
  
  const waist = parseFloat(measurement.waist_size?.toString() || '0') || 0;
  const chest = parseFloat(measurement.chest_size?.toString() || '0') || 0;
  
  if (waist === 0 || chest === 0) return 0;
  
  const ratio = waist / chest;
  let bodyFat = (ratio * 100) - 30;
  
  bodyFat = Math.max(5, Math.min(bodyFat, 35));
  
  return parseFloat(bodyFat.toFixed(1));
}

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