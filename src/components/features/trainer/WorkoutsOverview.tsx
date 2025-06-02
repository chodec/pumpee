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
}

export default function WorkoutsOverview() {
  const [stats, setStats] = useState<WorkoutsStats>({
    totalWorkouts: 0,
    totalExercises: 0
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

      setStats({ totalWorkouts, totalExercises });
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
          <Button variant="outline" size="sm" onClick={fetchWorkoutStats}>
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center text-lg">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 mr-3">
            <Icon name="dumbbell" size={16} className="text-purple-600" />
          </div>
          Workouts
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex flex-col flex-1">
        <div className="flex-1 flex items-center justify-center min-h-[120px]">
          {stats.totalWorkouts === 0 && stats.totalExercises === 0 ? (
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
            <div className="grid grid-cols-2 gap-4 w-full">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-[#007bff] mb-1">{stats.totalWorkouts}</div>
                <div className="text-sm text-gray-600">Workouts</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-[#ff7f0e] mb-1">{stats.totalExercises}</div>
                <div className="text-sm text-gray-600">Exercises</div>
              </div>
            </div>
          )}
        </div>

        <div className="pt-6">
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