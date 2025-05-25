// src/components/features/trainer/WorkoutsOverview.tsx - Refactored and simplified
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/organisms/Card';
import { Button } from '@/components/atoms/Button';
import LoadingSpinner from '@/components/atoms/LoadingSpinner';
import Icon from '@/components/atoms/Icon';
import { TrainerAPI, Exercise, Workout } from '@/lib/api';
import { showErrorToast } from '@/lib/errors';

interface WorkoutsStats {
  totalWorkouts: number;
  totalExercises: number;
  recentWorkouts: Workout[];
}

export default function WorkoutsOverview() {
  const [stats, setStats] = useState<WorkoutsStats>({
    totalWorkouts: 0,
    totalExercises: 0,
    recentWorkouts: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkoutStats = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const [workouts, exercises] = await Promise.all([
        TrainerAPI.getWorkouts(),
        TrainerAPI.getExercises()
      ]);

      const totalWorkouts = workouts?.length || 0;
      const totalExercises = exercises?.length || 0;

      // Get recent workouts (last 3)
      const recentWorkouts = (workouts || [])
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 3);

      setStats({ totalWorkouts, totalExercises, recentWorkouts });
    } catch (error) {
      console.error('Error fetching workout stats:', error);
      setError('Failed to load workout statistics');
      showErrorToast(error, 'Failed to load workouts');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkoutStats();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardContent className="flex flex-col items-center justify-center p-8 min-h-[280px]">
          <LoadingSpinner size="md" color="primary" />
          <p className="text-sm text-gray-500 mt-4">Loading workouts...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="h-full border-red-200 bg-red-50">
        <CardContent className="flex flex-col items-center justify-center p-8 min-h-[280px]">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
            <Icon name="x" size={24} className="text-red-600" />
          </div>
          <h3 className="font-medium text-red-800 mb-2">Unable to load workouts</h3>
          <p className="text-sm text-red-600 text-center mb-6">Please try refreshing the page</p>
          <Button variant="outline" size="sm">
            <Link to="/trainer/workouts">Try Again</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center text-lg">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 mr-3">
            <Icon name="dumbbell" size={16} className="text-purple-600" />
          </div>
          Workouts
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {stats.totalWorkouts === 0 ? (
          <div className="text-center py-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 mx-auto mb-4">
              <Icon name="dumbbell" size={24} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">No Workouts</h3>
            <p className="text-gray-600 text-sm mb-6">Create your first workout to help your clients achieve their goals</p>
            <Link to="/trainer/workouts">
              <Button variant="blue" size="sm">Create Workout</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Statistics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-[#007bff] mb-1">{stats.totalWorkouts}</div>
                <div className="text-sm text-gray-600">Workouts</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-[#ff7f0e] mb-1">{stats.totalExercises}</div>
                <div className="text-sm text-gray-600">Exercises</div>
              </div>
            </div>

            {/* Recent workouts */}
            {stats.recentWorkouts.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Recent Workouts</h4>
                <div className="space-y-3">
                  {stats.recentWorkouts.map((workout) => (
                    <div key={workout.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 truncate">{workout.workout_name}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              {workout.workout_day}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {workout.exercise_count || 0} exercises • Created {formatDate(workout.created_at)}
                          </p>
                        </div>
                      </div>
                      
                      {/* Show first few exercises in the workout */}
                      {workout.exercises && workout.exercises.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          <div className="flex flex-wrap gap-1">
                            {workout.exercises.slice(0, 2).map((exercise, index) => (
                              <span 
                                key={exercise.id}
                                className="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-100 text-blue-800 font-medium"
                              >
                                #{index + 1} {exercise.exercise_name}
                              </span>
                            ))}
                            {workout.exercises.length > 2 && (
                              <span className="text-xs text-gray-500 px-2 py-1">
                                +{workout.exercises.length - 2} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Button */}
        <div className="pt-2">
          <Link to="/trainer/workouts" className="block">
            <Button variant="blue" size="full" className="group">
              <span>Manage Workouts</span>
              <svg className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}