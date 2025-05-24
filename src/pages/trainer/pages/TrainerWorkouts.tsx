// src/pages/trainer/pages/TrainerWorkouts.tsx - Simplified Version
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
// SIMPLIFIED FORM SCHEMAS
// ============================================================================

const createExerciseSchema = z.object({
  exercise_name: z.string().min(1, 'Exercise name is required'),
  series: z.string().min(1, 'Series is required'),
  series_description: z.string().min(1, 'Series description is required')
});

const createWorkoutSchema = z.object({
  workout_name: z.string().min(1, 'Workout name is required'),
  workout_day: z.string().min(1, 'Workout day is required'),
  description: z.string().optional(),
  selected_exercise_ids: z.array(z.string()).min(1, 'At least one exercise must be selected')
});

type CreateExerciseFormValues = z.infer<typeof createExerciseSchema>;
type CreateWorkoutFormValues = z.infer<typeof createWorkoutSchema>;

// ============================================================================
// CONSTANTS
// ============================================================================

const WORKOUT_DAYS = [
  'Monday',
  'Tuesday', 
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
  'Day 1',
  'Day 2',
  'Day 3',
  'Day 4',
  'Day 5',
  'Day 6',
  'Day 7'
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
      series: '',
      series_description: ''
    }
  });

  const workoutForm = useForm<CreateWorkoutFormValues>({
    resolver: zodResolver(createWorkoutSchema),
    defaultValues: {
      workout_name: '',
      workout_day: '',
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
        series: data.series,
        series_description: data.series_description
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
        workout_day: data.workout_day,
        description: data.description || undefined,
        selected_exercise_ids: data.selected_exercise_ids
      };

      const newWorkout = await TrainerAPI.createWorkout(workoutData);
      
      if (newWorkout) {
        // Refetch workouts to get the complete data with exercises
        await fetchData();
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
  
  const renderExerciseCard = (exercise: Exercise) => (
    <Card key={exercise.id} className="hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-semibold text-gray-900 text-lg">{exercise.exercise_name}</h3>
          <button 
            onClick={() => handleDeleteExercise(exercise.id)}
            className="text-red-400 hover:text-red-600 transition-colors"
            title="Delete exercise"
          >
            <Icon name="x" size={16} />
          </button>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
          <p className="font-medium text-blue-800 text-sm">Series:</p>
          <p className="text-blue-700">{exercise.series}</p>
        </div>
        
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-3">
          <p className="font-medium text-gray-800 text-sm">Description:</p>
          <p className="text-gray-700 text-sm">{exercise.series_description}</p>
        </div>
        
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
          <div>
            <h3 className="font-semibold text-gray-900 text-lg">{workout.workout_name}</h3>
            <div className="flex items-center mt-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                {workout.workout_day}
              </span>
            </div>
          </div>
          <button 
            onClick={() => handleDeleteWorkout(workout.id)}
            className="text-red-400 hover:text-red-600 transition-colors"
            title="Delete workout"
          >
            <Icon name="x" size={16} />
          </button>
        </div>
        
        <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200 mb-4">
          <div className="text-lg font-bold text-gray-700">{workout.exercise_count || 0}</div>
          <div className="text-xs text-gray-600">Exercises</div>
        </div>
        
        {workout.description && (
          <div className="text-sm text-gray-600 mb-4 p-2 bg-gray-50 rounded">
            <p>{workout.description}</p>
          </div>
        )}
        
        {workout.exercises && workout.exercises.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Exercises:</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {workout.exercises.map((exercise, index) => (
                <div key={exercise.id} className="flex items-start justify-between text-sm p-2 bg-gray-50 rounded border">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-xs text-gray-500 font-mono w-6">#{index + 1}</span>
                      <span className="font-medium">{exercise.exercise_name}</span>
                    </div>
                    <p className="text-xs text-gray-600 ml-8">{exercise.series}</p>
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
            <p className="text-gray-600">Create exercises and organize them into day-based workouts</p>
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
              Exercises ({exercises.length})
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
                        name="series"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Series</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="e.g., 3 sets x 12 reps, 30 seconds x 3 rounds" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={exerciseForm.control}
                        name="series_description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Series Description</FormLabel>
                            <FormControl>
                              <textarea 
                                {...field}
                                className="flex h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                placeholder="Describe how to perform this exercise..."
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
                    Start by creating exercises with simple series descriptions.
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
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={workoutForm.control}
                          name="workout_name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Workout Name</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="e.g., Week 1 Training Plan" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={workoutForm.control}
                          name="workout_day"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Workout Day</FormLabel>
                              <FormControl>
                                <select 
                                  {...field}
                                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                >
                                  <option value="">Select day</option>
                                  {WORKOUT_DAYS.map(day => (
                                    <option key={day} value={day}>{day}</option>
                                  ))}
                                </select>
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
                                      <span className="font-medium">{exercise.exercise_name}</span>
                                    </div>
                                    <p className="text-sm text-blue-600 font-medium">{exercise.series}</p>
                                    <p className="text-xs text-gray-600 mt-1">{exercise.series_description}</p>
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
                      ? "Create some exercises first, then organize them into day-based workouts."
                      : "Organize your exercises into day-based workouts for your clients."
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