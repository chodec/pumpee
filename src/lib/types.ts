// src/lib/types.ts - Consolidated all types here
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
  series: string;
  series_description: string;
  created_at: string;
  updated_at: string;
}

export interface Workout {
  id: string;
  trainer_id: string;
  workout_name: string;
  workout_day: string;
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

// Authentication types
export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone_number?: string;
  registration_method?: string;
  user_type: UserType;
  created_at?: string;
  updated_at?: string;
}

export type UserType = 'client' | 'trainer';

export interface LoginFormValues {
  email: string;
  password: string;
}

export interface RegistrationFormValues {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthData {
  session: any;
  user: any;
  isLoading: boolean;
  error: Error | null;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signUp: (email: string, password: string, userData: { fullName: string }) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  getUserType: () => Promise<UserType | null>;
  getUserProfile: () => Promise<UserProfile | null>;
}

// Subscription types
export interface SubscriptionTier {
  id: string;
  name: string;
  description?: string;
  price: number | null;
  yearly_price?: number | null;
  sale_price?: number | null;
  billing_cycle: string;
  client_limit: number | null;
  justification?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface TrainerSubscriptionTier {
  id: string;
  trainer_id: string;
  name: string;
  description: string;
  price: number;
  yearly_price?: number | null;
  billing_cycle: 'monthly' | 'yearly';
  created_at: string;
  updated_at: string;
}

export interface CreateTrainerSubscriptionData {
  name: string;
  description: string;
  price: number;
  yearly_price?: number | null;
  billing_cycle: 'monthly' | 'yearly';
}