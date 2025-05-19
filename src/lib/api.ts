// src/lib/api.ts
import { supabase } from '@/lib/supabaseClient';
import { UserProfile, UserType, SubscriptionTier } from '@/lib/types';

/**
 * Authentication related API functions
 */
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

/**
 * Client related API functions
 */
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
   * Get client's assigned trainer
   */
  getAssignedTrainer: async (): Promise<any | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return null;
      
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('id, trainer_id')
        .eq('user_id', user.id)
        .single();
        
      if (clientError || !clientData?.trainer_id) return null;
      
      // Get trainer info
      const { data: trainerData, error: trainerError } = await supabase
        .from('trainers')
        .select('*, users(*)')
        .eq('id', clientData.trainer_id)
        .single();
        
      if (trainerError) throw trainerError;
      
      // Get subscription details from client_trainers
      const { data: relationData, error: relationError } = await supabase
        .from('client_trainers')
        .select('*, trainer_subscription_tier:trainer_subscription_tier_id(*)')
        .eq('client_id', clientData.id)
        .eq('trainer_id', clientData.trainer_id)
        .single();
      
      if (relationError) {
        // If no relation found, return basic trainer info
        return {
          id: trainerData.id,
          full_name: trainerData.users.full_name,
          email: trainerData.users.email,
          subscription_name: null,
          subscription_price: null,
          start_date: null
        };
      }
      
      // Return complete trainer info with subscription details
      return {
        id: trainerData.id,
        full_name: trainerData.users.full_name,
        email: trainerData.users.email,
        subscription_name: relationData.trainer_subscription_tier?.name,
        subscription_price: relationData.trainer_subscription_tier?.price,
        start_date: relationData.subscription_start
      };
    } catch (error) {
      console.error('Error fetching assigned trainer:', error);
      return null;
    }
  },
  /**
   * Get client's statistics for dashboard
   */
  getClientStats: async (): Promise<any> => {
    try {
      // Get recent measurements to calculate trends
      const measurements = await ClientAPI.getClientMeasurements(10);
      
      if (!measurements || measurements.length === 0) {
        return {
          currentWeight: { value: 0, change: 0, unit: 'kg' },
          bodyFat: { value: 0, change: 0, unit: '%' },
          muscleGain: { value: 0, change: 0, unit: 'kg' }
        };
      }
      
      // Get the most recent and oldest measurements from our dataset
      const latest = measurements[0]; 
      const oldest = measurements.length > 1 ? measurements[measurements.length - 1] : null;
      
      // Calculate weight change
      const currentWeight = {
        value: parseFloat(latest.body_weight) || 0,
        change: oldest ? parseFloat(latest.body_weight) - parseFloat(oldest.body_weight) : 0,
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
 * Get client's measurements with proper error handling
 * Fetches measurements from client_progress table
 * 
 * @param limit - Maximum number of measurements to return
 * @returns Array of client measurements
 */
getClientMeasurements: async (limit = 10): Promise<any[]> => {
  try {
    // Get current authenticated user
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
      // If no client record exists, create one
      if (clientError.code === 'PGRST116') {
        const { data: newClient, error: createError } = await supabase
          .from('clients')
          .insert({ user_id: user.id })
          .select()
          .single();
          
        if (createError) {
          throw createError;
        }
        
        // Return empty array since no measurements exist for new client
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
      
    if (error) {
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error fetching client measurements:', error);
    return [];
  }
},

/**
 * Add a new measurement for the current client
 * Handles creating client record if needed
 * 
 * @param measurementData - The measurement data to add
 * @returns Boolean indicating success or failure
 */
addMeasurement: async (measurementData: any): Promise<boolean> => {
  try {
    // Get current authenticated user
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
    
    // Handle client record errors
    if (clientError) {
      // If no client record exists, create one
      if (clientError.code === 'PGRST116') {
        const { data: newClient, error: createError } = await supabase
          .from('clients')
          .insert({ user_id: user.id })
          .select()
          .single();
          
        if (createError) {
          throw createError;
        }
        
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
      
    if (error) {
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error adding measurement:', error);
    return false;
  }
}
};

/**
 * Trainer related API functions
 */
export const TrainerAPI = {
  /**
   * Get trainer's subscription details
   */
  getSubscription: async (): Promise<SubscriptionTier | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return null;
      
      // Get trainer's subscription tier ID
      const { data: trainerData, error: trainerError } = await supabase
        .from('trainers')
        .select('subscription_tier_id')
        .eq('user_id', user.id)
        .single();
        
      if (trainerError) throw trainerError;
      
      // Get subscription tier details
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
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return 0;
      
      // Get trainer ID
      const { data: trainerData, error: trainerError } = await supabase
        .from('trainers')
        .select('id')
        .eq('user_id', user.id)
        .single();
        
      if (trainerError) throw trainerError;
      
      // Count clients
      const { count, error } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true })
        .eq('trainer_id', trainerData.id);
        
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
   * Get trainer's clients
   */
  getClients: async (page = 1, limit = 10): Promise<any> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return { data: [], count: 0 };
      
      // Get trainer ID
      const { data: trainerData, error: trainerError } = await supabase
        .from('trainers')
        .select('id')
        .eq('user_id', user.id)
        .single();
        
      if (trainerError) throw trainerError;
      
      // Calculate pagination offsets
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      
      // Get clients with pagination
      const { data, count, error } = await supabase
        .from('clients')
        .select(`
          *,
          users:user_id(*),
          client_progress(*)
        `, { count: 'exact' })
        .eq('trainer_id', trainerData.id)
        .order('created_at', { ascending: false })
        .range(from, to);
        
      if (error) throw error;
      
      return {
        data: data || [],
        count: count || 0
      };
    } catch (error) {
      console.error('Error fetching clients:', error);
      return { data: [], count: 0 };
    }
  },
  
  /**
   * Create menu for clients
   */
  createMenu: async (menuData: any): Promise<any> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return null;
      
      // Get trainer ID
      const { data: trainerData, error: trainerError } = await supabase
        .from('trainers')
        .select('id')
        .eq('user_id', user.id)
        .single();
        
      if (trainerError) throw trainerError;
      
      // Create menu
      const { data, error } = await supabase
        .from('menus')
        .insert({
          trainer_id: trainerData.id,
          meal_type: menuData.meal_type,
          food_details: menuData.food_details,
          calories: menuData.calories,
          protein: menuData.protein,
          carbohydrates: menuData.carbohydrates,
          fat: menuData.fat,
          note: menuData.note
        })
        .select()
        .single();
        
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error creating menu:', error);
      return null;
    }
  },
  
  /**
   * Create menu plan (collection of menus)
   */
  createMenuPlan: async (planData: any, menuIds: string[]): Promise<any> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return null;
      
      // Get trainer ID
      const { data: trainerData, error: trainerError } = await supabase
        .from('trainers')
        .select('id')
        .eq('user_id', user.id)
        .single();
        
      if (trainerError) throw trainerError;
      
      // Create menu plan
      const { data: menuPlan, error: planError } = await supabase
        .from('menu_plans')
        .insert({
          trainer_id: trainerData.id,
          plan_name: planData.plan_name,
          total_calories: planData.total_calories,
          total_protein: planData.total_protein,
          total_carbohydrates: planData.total_carbohydrates,
          total_fat: planData.total_fat
        })
        .select()
        .single();
        
      if (planError) throw planError;
      
      // Create menu plan items (linking menus to the plan)
      const menuPlanItems = menuIds.map((menuId, index) => ({
        menu_plan_id: menuPlan.id,
        menu_id: menuId,
        meal_order: index + 1
      }));
      
      const { error: itemsError } = await supabase
        .from('menu_plan_items')
        .insert(menuPlanItems);
        
      if (itemsError) throw itemsError;
      
      return menuPlan;
    } catch (error) {
      console.error('Error creating menu plan:', error);
      return null;
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
   * Get trainer's created menus
   */
  getMenus: async (): Promise<any[]> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return [];
      
      // Get trainer ID
      const { data: trainerData, error: trainerError } = await supabase
        .from('trainers')
        .select('id')
        .eq('user_id', user.id)
        .single();
        
      if (trainerError) throw trainerError;
      
      // Get menus
      const { data, error } = await supabase
        .from('menus')
        .select('*')
        .eq('trainer_id', trainerData.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Error fetching menus:', error);
      return [];
    }
  }
};

/**
 * Common data fetching functions
 */
export const CommonAPI = {
  /**
   * Get app settings
   */
  getAppSettings: async (): Promise<any> => {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('*')
        .single();
        
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error fetching app settings:', error);
      return null;
    }
  }
};

/**
 * Helper function to estimate body fat percentage based on measurements
 * Note: This is a simplified estimation for demonstration
 */
function estimateBodyFat(measurement: any): number {
  if (!measurement) return 0;
  
  // Using waist-to-height ratio as a simple formula
  // Real app would use more sophisticated methods
  const waist = parseFloat(measurement.waist_size) || 0;
  const chest = parseFloat(measurement.chest_size) || 0;
  
  if (waist === 0 || chest === 0) return 0;
  
  // Simple formula for estimation (not medically accurate)
  const ratio = waist / chest;
  let bodyFat = (ratio * 100) - 30;
  
  // Ensure it's in a reasonable range
  bodyFat = Math.max(5, Math.min(bodyFat, 35));
  
  return parseFloat(bodyFat.toFixed(1));
}

/**
 * Helper function to estimate muscle gain
 */
function estimateMuscleGain(latest: any, oldest: any): any {
  if (!latest || !oldest) {
    return {
      value: 0,
      change: 0,
      unit: 'kg'
    };
  }
  
  // Weight change
  const weightChange = parseFloat(latest.body_weight) - parseFloat(oldest.body_weight);
  
  // Estimated body fat change
  const latestBodyFat = estimateBodyFat(latest);
  const oldestBodyFat = estimateBodyFat(oldest);
  const bodyFatChange = latestBodyFat - oldestBodyFat;
  
  let muscleGain = 0;
  
  // If weight increased but body fat decreased or stayed same, it's likely muscle gain
  if (weightChange > 0 && bodyFatChange <= 0) {
    muscleGain = weightChange;
  } 
  // If weight decreased but body fat decreased more significantly, there might still be some muscle gain
  else if (weightChange < 0 && bodyFatChange < -2) {
    // Estimate: Some portion of fat loss converted to muscle
    muscleGain = Math.abs(bodyFatChange) * 0.3;
  }
  
  return {
    value: parseFloat(muscleGain.toFixed(1)),
    change: parseFloat(muscleGain.toFixed(1)),
    unit: 'kg'
  };
}