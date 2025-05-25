// src/lib/api/trainer.ts - Updated to import from consolidated types
import { supabase } from '@/lib/supabaseClient';
import { 
  SubscriptionTier, 
  Exercise, 
  Workout, 
  Menu, 
  MenuPlan, 
  CreateExerciseData, 
  CreateWorkoutData, 
  CreateMenuData, 
  CreateMenuPlanData 
} from '../types';

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

  // Exercise functions
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

  // Workout functions
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

  // Menu functions
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
  }
};