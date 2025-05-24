// src/pages/trainer/pages/TrainerWorkouts.tsx - Complete Implementation
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
import { TrainerAPI, Exercise, Workout, CreateExerciseData, CreateWorkoutData } from '@/lib/api';
import { showSuccessToast, showErrorToast } from '@/lib/errors';
import { USER_TYPES } from '@/lib/constants';

// ============================================================================
// FORM SCHEMAS & TYPES
// ============================================================================

const createExerciseSchema = z.object({
  exercise_name: z.string().min(1, 'Exercise name is required'),
  exercise_type: z.string().min(1, 'Exercise type is required'),
  muscle_groups: z.array(z.string()).min(1, 'At least one muscle group is required'),
  equipment: z.string().optional(),
  difficulty_level: z.string().min(1, 'Difficulty level is required'),
  instructions: z.string().min(1, 'Instructions are required'),
  sets: z.string().optional()
    .transform(val => val === '' ? undefined : parseInt(val))
    .refine(val => val === undefined || val > 0, 'Sets must be positive'),
  reps: z.string().optional()
    .transform(val => val === '' ? undefined : parseInt(val))
    .refine(val => val === undefined || val > 0, 'Reps must be positive'),
  duration_minutes: z.string().optional()
    .transform(val => val === '' ? undefined : parseInt(val))
    .refine(val => val === undefined || val > 0, 'Duration must be positive'),
  rest_seconds: z.string().optional()
    .transform(val => val === '' ? undefined : parseInt(val))
    .refine(val => val === undefined || val >= 0, 'Rest time must be non-negative'),
  calories_per_minute: z.string().optional()
    .transform(val => val === '' ? undefined : parseInt(val))
    .refine(val => val === undefined || val > 0, 'Calories per minute must be positive'),
  notes: z.string().optional()
});

const createWorkoutSchema = z.object({
  workout_name: z.string().min(1, 'Workout name is required'),
  workout_type: z.string().min(1, 'Workout type is required'),
  difficulty_level: z.string().min(1, 'Difficulty level is required'),
  estimated_duration: z.string()
    .min(1, 'Estimated duration is required')
    .transform(val => parseInt(val))
    .refine(val => val > 0, 'Duration must be positive'),
  description: z.string().optional(),
  selected_exercise_ids: z.array(z.string()).min(1, 'At least one exercise must be selected')
});

type CreateExerciseFormValues = z.infer<typeof createExerciseSchema>;
type CreateWorkoutFormValues = z.infer<typeof createWorkoutSchema>;

// ============================================================================
// CONSTANTS
// ============================================================================

const EXERCISE_TYPES = [
  'Strength',
  'Cardio',
  'Flexibility',
  'Sports',
  'Other'
];

const MUSCLE_GROUPS = [
  'Chest',
  'Back',
  'Shoulders',
  'Arms',
  'Legs',
  'Core',
  'Full Body'
];

const WORKOUT_TYPES = [
  'Strength',
  'Cardio',
  'HIIT',
  'Circuit',
  'Stretching',
  'Mixed'
];

const DIFFICULTY_LEVELS = [
  'Beginner',
  'Intermediate',
  'Advanced'
];

const EQUIPMENT_OPTIONS = [
  'None',
  'Dumbbells',
  'Barbell',
  'Machine',
  'Bodyweight',
  'Resistance Bands',
  'Kettlebell',
  'Cable',
  'Medicine Ball'
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function TrainerWorkouts() {
  // ========================================================================
  // STATE MANAGEMENT
  // ========================================================================
  
  const [activeTab, setActiveTab] = useState<'exercises' | 'workouts'>('exercises');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [showExerciseForm, setShowExerciseForm] = useState(false);
  const [showWorkoutForm, setShowWorkoutForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // ========================================================================
  // FORM SETUP
  // ========================================================================
  
  const exerciseForm = useForm<CreateExerciseFormValues>({
    resolver: zodResolver(createExerciseSchema),
    defaultValues: {
      exercise_name: '',
      exercise_type: '',
      muscle_groups: [],
      equipment: '',
      difficulty_level: '',
      instructions: '',
      sets: '',
      reps: '',
      duration_minutes: '',
      rest_seconds: '',
      calories_per_minute: '',
      notes: ''
    }
  });

  const workoutForm = useForm<CreateWorkoutFormValues>({
    resolver: zodResolver(createWorkoutSchema),
    defaultValues: {
      workout_name: '',
      workout_type: '',
      difficulty_level: '',
      estimated_duration: '',
      description: '',
      selected_exercise_ids: []
    }
  });

  // ========================================================================
  // DATA FETCHING
  // ========================================================================
  
  const fetchData = async () => {
    try {
      setLoading(true);
      const [exercisesData, workoutsData] = await Promise.all([
        TrainerAPI.getExercises(),
        TrainerAPI.getWorkouts()
      ]);
      setExercises(exercisesData || []);
      setWorkouts(workoutsData || []);
    } catch (error) {
      showErrorToast(error, 'Failed to load workout data');
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
  
  const handleCreateExercise = async (data: CreateExerciseFormValues) => {
    try {
      setSubmitting(true);
      
      const exerciseData: CreateExerciseData = {
        exercise_name: data.exercise_name,
        exercise_type: data.exercise_type,
        muscle_groups: data.muscle_groups,
        equipment: data.equipment || undefined,
        difficulty_level: data.difficulty_level,
        instructions: data.instructions,
        sets: data.sets || undefined,
        reps: data.reps || undefined,
        duration_minutes: data.duration_minutes || undefined,
        rest_seconds: data.rest_seconds || undefined,
        calories_per_minute: data.calories_per_minute || undefined,
        notes: data.notes || undefined
      };
      
      const newExercise = await TrainerAPI.createExercise(exerciseData);
      
      if (newExercise) {
        setExercises(prev => [newExercise, ...prev]);
        showSuccessToast('Exercise created successfully');
        exerciseForm.reset();
        setShowExerciseForm(false);
      } else {
        throw new Error('Failed to create exercise');
      }
    } catch (error) {
      showErrorToast(error, 'Failed to create exercise');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateWorkout = async (data: CreateWorkoutFormValues) => {
    try {
      setSubmitting(true);
      
      const workoutData: CreateWorkoutData = {
        workout_name: data.workout_name,
        workout_type: data.workout_type,
        difficulty_level: data.difficulty_level,
        estimated_duration: data.estimated_duration,
        description: data.description || undefined,
        selected_exercise_ids: data.selected_exercise_ids
      };

      const newWorkout = await TrainerAPI.createWorkout(workoutData);
      
      if (newWorkout) {
        setWorkouts(prev => [newWorkout, ...prev]);
        showSuccessToast('Workout created successfully');
        workoutForm.reset();
        setShowWorkoutForm(false);
      } else {
        throw new Error('Failed to create workout');
      }
    } catch (error) {
      showErrorToast(error, 'Failed to create workout');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteExercise = async (exerciseId: string) => {
    if (!confirm('Are you sure you want to delete this exercise?')) return;
    
    try {
      const success = await TrainerAPI.deleteExercise(exerciseId);
      if (success) {
        setExercises(prev => prev.filter(exercise => exercise.id !== exerciseId));
        showSuccessToast('Exercise deleted successfully');
      } else {
        throw new Error('Failed to delete exercise');
      }
    } catch (error) {
      showErrorToast(error, 'Failed to delete exercise');
    }
  };

  const handleDeleteWorkout = async (workoutId: string) => {
    if (!confirm('Are you sure you want to delete this workout?')) return;
    
    try {
      const success = await TrainerAPI.deleteWorkout(workoutId);
      if (success) {
        setWorkouts(prev => prev.filter(workout => workout.id !== workoutId));
        showSuccessToast('Workout deleted successfully');
      } else {
        throw new Error('Failed to delete workout');
      }
    } catch (error) {
      showErrorToast(error, 'Failed to delete workout');
    }
  };

  // ========================================================================
  // UTILITY FUNCTIONS
  // ========================================================================
  
  const getDifficultyBadgeColor = (difficulty: string) => {
    const colors: Record<string, string> = {
      'Beginner': 'bg-green-100 text-green-800 border-green-200',
      'Intermediate': 'bg-blue-100 text-blue-800 border-blue-200',
      'Advanced': 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[difficulty] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getExerciseTypeBadgeColor = (exerciseType: string) => {
    const colors: Record<string, string> = {
      'Strength': 'bg-purple-100 text-purple-800 border-purple-200',
      'Cardio': 'bg-blue-100 text-blue-800 border-blue-200',
      'Flexibility': 'bg-green-100 text-green-800 border-green-200',
      'Sports': 'bg-orange-100 text-orange-800 border-orange-200',
      'Other': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[exerciseType] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getWorkoutTypeBadgeColor = (workoutType: string) => {
    const colors: Record<string, string> = {
      'Strength': 'bg-purple-100 text-purple-800',
      'Cardio': 'bg-blue-100 text-blue-800',
      'HIIT': 'bg-red-100 text-red-800',
      'Circuit': 'bg-orange-100 text-orange-800',
      'Stretching': 'bg-green-100 text-green-800',
      'Mixed': 'bg-gray-100 text-gray-800'
    };
    return colors[workoutType] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatMuscleGroups = (muscleGroups: string[]) => {
    if (muscleGroups.length <= 2) {
      return muscleGroups.join(', ');
    }
    return `${muscleGroups.slice(0, 2).join(', ')} +${muscleGroups.length - 2}`;
  };

  // ========================================================================
  // RENDER COMPONENTS
  // ========================================================================
  
  const renderExerciseCard = (exercise: Exercise) => (
    <Card key={exercise.id} className="hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex flex-wrap gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getExerciseTypeBadgeColor(exercise.exercise_type)}`}>
              {exercise.exercise_type}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getDifficultyBadgeColor(exercise.difficulty_level)}`}>
              {exercise.difficulty_level}
            </span>
          </div>
          <button 
            onClick={() => handleDeleteExercise(exercise.id)}
            className="text-red-400 hover:text-red-600 transition-colors"
            title="Delete exercise"
          >
            <Icon name="x" size={16} />
          </button>
        </div>
        
        <h3 className="font-semibold text-gray-900 mb-2">{exercise.exercise_name}</h3>
        
        <div className="text-sm text-gray-600 mb-3">
          <p className="font-medium">Muscle Groups: {formatMuscleGroups(exercise.muscle_groups)}</p>
          {exercise.equipment && <p>Equipment: {exercise.equipment}</p>}
        </div>

        <div className="text-sm text-gray-600 mb-3">
          {exercise.sets && exercise.reps && (
            <p>{exercise.sets} sets × {exercise.reps} reps</p>
          )}
          {exercise.duration_minutes && (
            <p>Duration: {exercise.duration_minutes} minutes</p>
          )}
          {exercise.rest_seconds && (
            <p>Rest: {exercise.rest_seconds}s</p>
          )}
        </div>
        
        <p className="text-xs text-gray-500 mb-3 line-clamp-2 bg-gray-50 p-2 rounded">
          {exercise.instructions}
        </p>
        
        {exercise.notes && (
          <p className="text-xs text-gray-500 mb-3 line-clamp-2 bg-blue-50 p-2 rounded">
            Note: {exercise.notes}
          </p>
        )}
        
        <div className="text-xs text-gray-400">
          Created {formatDate(exercise.created_at)}
        </div>
      </CardContent>
    </Card>
  );

  const renderWorkoutCard = (workout: Workout) => (
    <Card key={workout.id} className="hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="font-semibold text-gray-900 text-lg">{workout.workout_name}</h3>
          <button 
            onClick={() => handleDeleteWorkout(workout.id)}
            className="text-red-400 hover:text-red-600 transition-colors"
            title="Delete workout"
          >
            <Icon name="x" size={16} />
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <span className={`px-3 py-1 rounded text-xs font-medium ${getWorkoutTypeBadgeColor(workout.workout_type)}`}>
            {workout.workout_type}
          </span>
          <span className={`px-3 py-1 rounded text-xs font-medium border ${getDifficultyBadgeColor(workout.difficulty_level)}`}>
            {workout.difficulty_level}
          </span>
        </div>
        
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-100">
            <div className="text-lg font-bold text-[#007bff]">{workout.estimated_duration}</div>
            <div className="text-xs text-gray-600">Minutes</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="text-lg font-bold text-gray-700">{workout.exercise_count || 0}</div>
            <div className="text-xs text-gray-600">Exercises</div>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg border border-orange-100">
            <div className="text-lg font-bold text-[#ff7f0e]">{workout.estimated_calories}</div>
            <div className="text-xs text-gray-600">Calories</div>
          </div>
        </div>
        
        {workout.description && (
          <div className="text-sm text-gray-600 mb-4 p-2 bg-gray-50 rounded">
            <p>{workout.description}</p>
          </div>
        )}
        
        {workout.exercises && workout.exercises.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Exercises in this workout:</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {workout.exercises.map((exercise, index) => (
                <div key={exercise.id} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded border">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500 font-mono w-6">#{index + 1}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getExerciseTypeBadgeColor(exercise.exercise_type)}`}>
                      {exercise.exercise_type}
                    </span>
                    <span className="font-medium truncate">{exercise.exercise_name}</span>
                  </div>
                  <div className="text-xs text-gray-500 ml-2">
                    {exercise.muscle_groups.slice(0, 2).join(', ')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
          <span className="text-xs text-gray-400">
            Created {formatDate(workout.created_at)}
          </span>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              Edit Workout
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
            <h1 className="text-2xl font-bold text-[#040b07]">Workout Management</h1>
            <p className="text-gray-600">Create exercises and organize them into workouts for your clients</p>
          </div>
          <div className="flex space-x-3">
            {activeTab === 'exercises' && (
              <Button 
                variant="blue" 
                onClick={() => setShowExerciseForm(true)}
                disabled={showExerciseForm}
              >
                <Icon name="dumbbell" size={16} className="mr-2" />
                Create Exercise
              </Button>
            )}
            {activeTab === 'workouts' && (
              <Button 
                variant="blue" 
                onClick={() => setShowWorkoutForm(true)}
                disabled={showWorkoutForm || exercises.length === 0}
              >
                <Icon name="calendar" size={16} className="mr-2" />
                Create Workout
              </Button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('exercises')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'exercises'
                  ? 'border-[#007bff] text-[#007bff]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Individual Exercises ({exercises.length})
            </button>
            <button
              onClick={() => setActiveTab('workouts')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'workouts'
                  ? 'border-[#007bff] text-[#007bff]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Workouts ({workouts.length})
            </button>
          </nav>
        </div>

        {/* EXERCISES TAB */}
        {activeTab === 'exercises' && (
          <div className="space-y-6">
            {/* Create Exercise Form */}
            {showExerciseForm && (
              <Card>
                <CardHeader>
                  <CardTitle>Create New Exercise</CardTitle>
                </CardHeader>
                <CardContent>
                  <Form {...exerciseForm}>
                    <form onSubmit={exerciseForm.handleSubmit(handleCreateExercise)} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={exerciseForm.control}
                          name="exercise_name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Exercise Name</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="e.g., Push-ups" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={exerciseForm.control}
                          name="exercise_type"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Exercise Type</FormLabel>
                              <FormControl>
                                <select 
                                  {...field}
                                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                >
                                  <option value="">Select type</option>
                                  {EXERCISE_TYPES.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                  ))}
                                </select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={exerciseForm.control}
                          name="difficulty_level"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Difficulty Level</FormLabel>
                              <FormControl>
                                <select 
                                  {...field}
                                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                >
                                  <option value="">Select difficulty</option>
                                  {DIFFICULTY_LEVELS.map(level => (
                                    <option key={level} value={level}>{level}</option>
                                  ))}
                                </select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={exerciseForm.control}
                          name="equipment"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Equipment (optional)</FormLabel>
                              <FormControl>
                                <select 
                                  {...field}
                                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                >
                                  <option value="">Select equipment</option>
                                  {EQUIPMENT_OPTIONS.map(equipment => (
                                    <option key={equipment} value={equipment}>{equipment}</option>
                                  ))}
                                </select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium">Muscle Groups</label>
                        <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2">
                          {MUSCLE_GROUPS.map((muscle) => (
                            <label key={muscle} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                value={muscle}
                                {...exerciseForm.register('muscle_groups')}
                                className="rounded border-gray-300"
                              />
                              <span className="text-sm">{muscle}</span>
                            </label>
                          ))}
                        </div>
                        {exerciseForm.formState.errors.muscle_groups && (
                          <p className="text-sm font-medium text-destructive mt-2">
                            {exerciseForm.formState.errors.muscle_groups.message}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <FormField
                          control={exerciseForm.control}
                          name="sets"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Sets</FormLabel>
                              <FormControl>
                                <Input {...field} type="number" placeholder="3" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={exerciseForm.control}
                          name="reps"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Reps</FormLabel>
                              <FormControl>
                                <Input {...field} type="number" placeholder="10" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={exerciseForm.control}
                          name="duration_minutes"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Duration (min)</FormLabel>
                              <FormControl>
                                <Input {...field} type="number" placeholder="5" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={exerciseForm.control}
                          name="rest_seconds"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Rest (sec)</FormLabel>
                              <FormControl>
                                <Input {...field} type="number" placeholder="60" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={exerciseForm.control}
                          name="calories_per_minute"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Cal/min</FormLabel>
                              <FormControl>
                                <Input {...field} type="number" placeholder="5" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={exerciseForm.control}
                        name="instructions"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Instructions</FormLabel>
                            <FormControl>
                              <textarea 
                                {...field}
                                className="flex h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                placeholder="Describe how to perform this exercise..."
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={exerciseForm.control}
                        name="notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Notes (optional)</FormLabel>
                            <FormControl>
                              <textarea 
                                {...field}
                                className="flex h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                placeholder="Any additional notes about this exercise..."
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
                          onClick={() => setShowExerciseForm(false)}
                          disabled={submitting}
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit" 
                          variant="blue" 
                          isLoading={submitting}
                        >
                          Create Exercise
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            )}

            {/* Exercises List */}
            {exercises.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 mb-4">
                    <Icon name="dumbbell" size={24} className="text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Exercises Created</h3>
                  <p className="text-gray-600 mb-6">
                    Start by creating individual exercises that you can later organize into workouts.
                  </p>
                  <Button variant="blue" onClick={() => setShowExerciseForm(true)}>
                    <Icon name="dumbbell" size={16} className="mr-2" />
                    Create Your First Exercise
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {exercises.map(renderExerciseCard)}
              </div>
            )}
          </div>
        )}

        {/* WORKOUTS TAB */}
        {activeTab === 'workouts' && (
          <div className="space-y-6">
            {/* Create Workout Form */}
            {showWorkoutForm && (
              <Card>
                <CardHeader>
                  <CardTitle>Create New Workout</CardTitle>
                </CardHeader>
                <CardContent>
                  <Form {...workoutForm}>
                    <form onSubmit={workoutForm.handleSubmit(handleCreateWorkout)} className="space-y-4">
                      <FormField
                        control={workoutForm.control}
                        name="workout_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Workout Name</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="e.g., Upper Body Strength" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={workoutForm.control}
                          name="workout_type"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Workout Type</FormLabel>
                              <FormControl>
                                <select 
                                  {...field}
                                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                >
                                  <option value="">Select type</option>
                                  {WORKOUT_TYPES.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                  ))}
                                </select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={workoutForm.control}
                          name="difficulty_level"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Difficulty Level</FormLabel>
                              <FormControl>
                                <select 
                                  {...field}
                                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                >
                                  <option value="">Select difficulty</option>
                                  {DIFFICULTY_LEVELS.map(level => (
                                    <option key={level} value={level}>{level}</option>
                                  ))}
                                </select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={workoutForm.control}
                          name="estimated_duration"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Duration (minutes)</FormLabel>
                              <FormControl>
                                <Input {...field} type="number" placeholder="45" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={workoutForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description (optional)</FormLabel>
                            <FormControl>
                              <textarea 
                                {...field}
                                className="flex h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                placeholder="Describe this workout..."
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div>
                        <label className="text-sm font-medium">Select Exercises</label>
                        <div className="mt-2 max-h-64 overflow-y-auto border border-gray-200 rounded-md p-3">
                          {exercises.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">
                              No exercises available. Create some exercises first.
                            </p>
                          ) : (
                            <div className="space-y-2">
                              {exercises.map((exercise) => (
                                <label key={exercise.id} className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                                  <input
                                    type="checkbox"
                                    value={exercise.id}
                                    {...workoutForm.register('selected_exercise_ids')}
                                    className="mt-1"
                                  />
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-1">
                                      <span className={`px-2 py-0.5 rounded text-xs border ${getExerciseTypeBadgeColor(exercise.exercise_type)}`}>
                                        {exercise.exercise_type}
                                      </span>
                                      <span className={`px-2 py-0.5 rounded text-xs border ${getDifficultyBadgeColor(exercise.difficulty_level)}`}>
                                        {exercise.difficulty_level}
                                      </span>
                                      <span className="font-medium">{exercise.exercise_name}</span>
                                    </div>
                                    <p className="text-sm text-gray-600">
                                      {formatMuscleGroups(exercise.muscle_groups)}
                                      {exercise.sets && exercise.reps && ` • ${exercise.sets}×${exercise.reps}`}
                                      {exercise.duration_minutes && ` • ${exercise.duration_minutes} min`}
                                    </p>
                                  </div>
                                </label>
                              ))}
                            </div>
                          )}
                        </div>
                        {workoutForm.formState.errors.selected_exercise_ids && (
                          <p className="text-sm font-medium text-destructive mt-2">
                            {workoutForm.formState.errors.selected_exercise_ids.message}
                          </p>
                        )}
                      </div>

                      <div className="flex justify-end space-x-3">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setShowWorkoutForm(false)}
                          disabled={submitting}
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit" 
                          variant="blue" 
                          isLoading={submitting}
                          disabled={exercises.length === 0}
                        >
                          Create Workout
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            )}

            {/* Workouts List */}
            {workouts.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 mb-4">
                    <Icon name="calendar" size={24} className="text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Workouts Created</h3>
                  <p className="text-gray-600 mb-6">
                    {exercises.length === 0 
                      ? "Create some individual exercises first, then organize them into workouts."
                      : "Organize your exercises into comprehensive workouts for your clients."
                    }
                  </p>
                  {exercises.length === 0 ? (
                    <Button variant="outline" onClick={() => setActiveTab('exercises')}>
                      Create Exercises First
                    </Button>
                  ) : (
                    <Button variant="blue" onClick={() => setShowWorkoutForm(true)}>
                      <Icon name="calendar" size={16} className="mr-2" />
                      Create Your First Workout
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {workouts.map(renderWorkoutCard)}
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}