// src/lib/api/client.ts - Debug version with console logs
import { supabase } from '@/lib/supabaseClient';
import { ClientProgress } from '../types';

export const ClientAPI = {
  getClientProfile: async (): Promise<any | null> => {
    try {
      console.log('🔍 ClientAPI.getClientProfile - Starting...');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('❌ No authenticated user found');
        return null;
      }
      console.log('✅ User found:', user.id);
      
      const { data, error } = await supabase
        .from('clients')
        .select('*, users(*)')
        .eq('user_id', user.id)
        .single();
        
      if (error) {
        console.log('❌ Error fetching client profile:', error);
        throw error;
      }
      console.log('✅ Client profile fetched:', data);
      return data;
    } catch (error) {
      console.error('❌ Error fetching client profile:', error);
      return null;
    }
  },

  getClientMeasurements: async (limit = 10): Promise<ClientProgress[]> => {
    try {
      console.log('🔍 ClientAPI.getClientMeasurements - Starting with limit:', limit);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error("❌ No authenticated user found");
        return [];
      }
      console.log('✅ User found:', user.id);
      
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('id')
        .eq('user_id', user.id)
        .single();
        
      if (clientError) {
        console.log('⚠️ Client not found, error:', clientError);
        if (clientError.code === 'PGRST116') {
          console.log('📝 Creating new client record...');
          const { data: newClient, error: createError } = await supabase
            .from('clients')
            .insert({ user_id: user.id })
            .select()
            .single();
            
          if (createError) {
            console.error('❌ Error creating client:', createError);
            throw createError;
          }
          console.log('✅ New client created:', newClient);
          return [];
        } else {
          throw clientError;
        }
      }
      
      console.log('✅ Client found:', clientData);
      
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
        console.error('❌ Error fetching measurements:', error);
        throw error;
      }
      
      console.log('✅ Measurements fetched:', data);
      console.log('📊 Number of measurements:', data?.length || 0);
      
      return data || [];
    } catch (error) {
      console.error('❌ Error in getClientMeasurements:', error);
      return [];
    }
  },

  addMeasurement: async (measurementData: any): Promise<boolean> => {
    try {
      console.log('🔍 ClientAPI.addMeasurement - Starting with data:', measurementData);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error("❌ No authenticated user found");
        return false;
      }
      console.log('✅ User found:', user.id);
      
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('id')
        .eq('user_id', user.id)
        .single();
      
      let clientId: string;
      
      if (clientError) {
        if (clientError.code === 'PGRST116') {
          console.log('📝 Creating new client record...');
          const { data: newClient, error: createError } = await supabase
            .from('clients')
            .insert({ user_id: user.id })
            .select()
            .single();
            
          if (createError) {
            console.error('❌ Error creating client:', createError);
            throw createError;
          }
          console.log('✅ New client created:', newClient);
          clientId = newClient.id;
        } else {
          console.error('❌ Client error:', clientError);
          throw clientError;
        }
      } else {
        console.log('✅ Client found:', clientData);
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
      
      console.log('📝 Measurement to insert:', measurementToInsert);
      
      const { error } = await supabase
        .from('client_progress')
        .insert(measurementToInsert);
        
      if (error) {
        console.error('❌ Error inserting measurement:', error);
        throw error;
      }
      
      console.log('✅ Measurement added successfully');
      return true;
    } catch (error) {
      console.error('❌ Error adding measurement:', error);
      return false;
    }
  },

  getClientStats: async (): Promise<any> => {
    try {
      console.log('🔍 ClientAPI.getClientStats - Starting...');
      
      const measurements = await ClientAPI.getClientMeasurements(10);
      
      if (!measurements || measurements.length === 0) {
        console.log('📊 No measurements found, returning default stats');
        return {
          currentWeight: { value: 0, change: 0, unit: 'kg' },
          bodyFat: { value: 0, change: 0, unit: '%' },
          muscleGain: { value: 0, change: 0, unit: 'kg' }
        };
      }
      
      console.log('📊 Calculating stats from measurements:', measurements.length);
      
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
      
      const stats = {
        currentWeight,
        bodyFat,
        muscleGain
      };
      
      console.log('✅ Stats calculated:', stats);
      return stats;
    } catch (error) {
      console.error('❌ Error calculating client stats:', error);
      return {
        currentWeight: { value: 0, change: 0, unit: 'kg' },
        bodyFat: { value: 0, change: 0, unit: '%' },
        muscleGain: { value: 0, change: 0, unit: 'kg' }
      };
    }
  },

  getAssignedTrainer: async (): Promise<any | null> => {
    try {
      console.log('🔍 ClientAPI.getAssignedTrainer - Starting...');
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('❌ No user found');
        return null;
      }
      
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('id')
        .eq('user_id', user.id)
        .single();
        
      if (clientError) {
        console.log('❌ Client not found:', clientError);
        return null;
      }
      
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
      
      if (relationError) {
        console.log('❌ No trainer relationship found:', relationError);
        return null;
      }
      
      console.log('✅ Trainer found:', relationData);
      
      return {
        id: relationData.trainer.id,
        full_name: relationData.trainer.user.full_name,
        email: relationData.trainer.user.email,
        subscription_name: relationData.trainer_subscription_tier?.name,
        subscription_price: relationData.trainer_subscription_tier?.price,
        start_date: relationData.subscription_start
      };
    } catch (error) {
      console.error('❌ Error fetching assigned trainer:', error);
      return null;
    }
  }
};

// Helper functions
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