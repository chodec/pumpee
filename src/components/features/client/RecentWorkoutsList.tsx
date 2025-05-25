// src/components/features/client/RecentWorkoutsList.tsx - Refactored Version
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/organisms/Card';
import { Button } from '@/components/atoms/Button';
import Icon from '@/components/atoms/Icon';
import LoadingSpinner from '@/components/atoms/LoadingSpinner';
import { Link } from 'react-router-dom';
import { DASHBOARD_ROUTES } from '@/lib/constants';
import { ClientAPI } from '@/lib/api';
import { showErrorToast } from '@/lib/errors';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface Exercise {
  id: string;
  exercise_name: string;
  series: string;
  series_description: string;
}

interface Workout {
  id: string;
  workout_name: string;
  workout_day: string;
  description?: string;
  exercises?: Exercise[];
  exercise_count?: number;
}

interface ClientWorkout {
  id: string;
  client_id: string;
  workout_id: string;
  assigned_date: string;
  status: 'assigned' | 'in_progress' | 'completed';
  trainer_notes?: string;
  completion_date?: string;
  workout?: Workout;
}

interface WorkoutWithStatus extends ClientWorkout {
  isToday: boolean;
  isUpcoming: boolean;
  isMissed: boolean;
  daysFromToday: number;
}

interface WorkoutsState {
  workouts: ClientWorkout[];
  loading: boolean;
  error: string | null;
  hasData: boolean;
}

type FilterType = 'all' | 'completed' | 'upcoming' | 'today';

// ============================================================================
// CONSTANTS
// ============================================================================

const INITIAL_STATE: WorkoutsState = {
  workouts: [],
  loading: true,
  error: null,
  hasData: false
};

const FILTER_OPTIONS: { value: FilterType; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'today', label: 'Today' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'completed', label: 'Completed' }
];

// Mock data for development (since API might not be ready)
const MOCK_WORKOUTS: ClientWorkout[] = [
  {
    id: '1',
    client_id: 'client-1',
    workout_id: 'workout-1',
    assigned_date: new Date().toISOString().split('T')[0], // Today
    status: 'assigned',
    workout: {
      id: 'workout-1',
      workout_name: 'Full Body Strength',
      workout_day: 'Monday',
      description: 'Complete body workout focusing on strength',
      exercise_count: 8,
      exercises: [
        { id: '1', exercise_name: 'Push-ups', series: '3 sets x 12 reps', series_description: 'Standard push-ups' },
        { id: '2', exercise_name: 'Squats', series: '3 sets x 15 reps', series_description: 'Bodyweight squats' }
      ]
    }
  },
  {
    id: '2',
    client_id: 'client-1',
    workout_id: 'workout-2',
    assigned_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 days ago
    status: 'completed',
    completion_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    workout: {
      id: 'workout-2',
      workout_name: 'HIIT Cardio',
      workout_day: 'Wednesday',
      description: 'High intensity interval training',
      exercise_count: 6,
      exercises: [
        { id: '3', exercise_name: 'Burpees', series: '4 rounds x 30 seconds', series_description: 'High intensity burpees' }
      ]
    }
  },
  {
    id: '3',
    client_id: 'client-1',
    workout_id: 'workout-3',
    assigned_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Tomorrow
    status: 'assigned',
    workout: {
      id: 'workout-3',
      workout_name: 'Upper Body Focus',
      workout_day: 'Friday',
      description: 'Focus on upper body strength',
      exercise_count: 9
    }
  },
  {
    id: '4',
    client_id: 'client-1',
    workout_id: 'workout-4',
    assigned_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 5 days ago
    status: 'assigned', // Missed workout
    workout: {
      id: 'workout-4',
      workout_name: 'Yoga & Mobility',
      workout_day: 'Tuesday',
      description: 'Flexibility and mobility work',
      exercise_count: 10
    }
  }
];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  });
};

const getDaysFromToday = (dateString: string): number => {
  const today = new Date();
  const workoutDate = new Date(dateString);
  const diffTime = workoutDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const enrichWorkoutWithStatus = (workout: ClientWorkout): WorkoutWithStatus => {
  const daysFromToday = getDaysFromToday(workout.assigned_date);
  const isToday = daysFromToday === 0;
  const isUpcoming = daysFromToday > 0;
  const isMissed = daysFromToday < 0 && workout.status === 'assigned';

  return {
    ...workout,
    isToday,
    isUpcoming,
    isMissed,
    daysFromToday
  };
};

const filterWorkouts = (workouts: WorkoutWithStatus[], filter: FilterType): WorkoutWithStatus[] => {
  switch (filter) {
    case 'all':
      return workouts;
    case 'completed':
      return workouts.filter(w => w.status === 'completed');
    case 'upcoming':
      return workouts.filter(w => w.isUpcoming || w.isToday);
    case 'today':
      return workouts.filter(w => w.isToday);
    default:
      return workouts;
  }
};

const sortWorkouts = (workouts: WorkoutWithStatus[]): WorkoutWithStatus[] => {
  return [...workouts].sort((a, b) => {
    // Priority order: Today > Upcoming > Missed > Completed
    if (a.isToday && !b.isToday) return -1;
    if (!a.isToday && b.isToday) return 1;
    
    if (a.isUpcoming && !b.isUpcoming) return -1;
    if (!a.isUpcoming && b.isUpcoming) return 1;
    
    if (a.isMissed && !b.isMissed) return -1;
    if (!a.isMissed && b.isMissed) return 1;
    
    // Within same category, sort by date (most recent first for completed, closest first for upcoming)
    if (a.status === 'completed' && b.status === 'completed') {
      return new Date(b.completion_date || b.assigned_date).getTime() - new Date(a.completion_date || a.assigned_date).getTime();
    }
    
    return new Date(a.assigned_date).getTime() - new Date(b.assigned_date).getTime();
  });
};

// ============================================================================
// COMPONENT PARTS
// ============================================================================

interface HeaderProps {
  filter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  workoutCounts: Record<FilterType, number>;
}

const Header: React.FC<HeaderProps> = ({ filter, onFilterChange, workoutCounts }) => (
  <CardHeader className="flex flex-row items-center justify-between">
    <CardTitle>Recent Workouts</CardTitle>
    <div className="flex space-x-2">
      {FILTER_OPTIONS.map((option) => (
        <Button 
          key={option.value}
          variant={filter === option.value ? 'blue' : 'outline'} 
          size="sm"
          onClick={() => onFilterChange(option.value)}
        >
          {option.label}
          {option.value !== 'all' && workoutCounts[option.value] > 0 && (
            <span className="ml-1 bg-white bg-opacity-20 rounded-full px-1.5 py-0.5 text-xs">
              {workoutCounts[option.value]}
            </span>
          )}
        </Button>
      ))}
    </div>
  </CardHeader>
);

const LoadingState: React.FC = () => (
  <div className="flex justify-center items-center py-12">
    <LoadingSpinner size="md" />
    <span className="ml-3 text-gray-500">Loading workouts...</span>
  </div>
);

interface ErrorStateProps {
  error: string;
  onRetry: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({ error, onRetry }) => (
  <div className="text-center py-8">
    <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
    <h3 className="text-lg font-medium text-red-800 mb-2">Failed to load workouts</h3>
    <p className="text-red-600 mb-4 text-sm">{error}</p>
    <Button variant="outline" size="sm" onClick={onRetry}>
      Try Again
    </Button>
  </div>
);

interface EmptyStateProps {
  filter: FilterType;
}

const EmptyState: React.FC<EmptyStateProps> = ({ filter }) => {
  const getEmptyMessage = () => {
    switch (filter) {
      case 'completed':
        return "You haven't completed any workouts yet.";
      case 'upcoming':
        return "You don't have any upcoming workouts.";
      case 'today':
        return "No workouts scheduled for today.";
      default:
        return "You don't have any workouts yet.";
    }
  };

  return (
    <div className="text-center py-8">
      <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 mb-4">
        <Icon name="dumbbell" size={24} className="text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-800 mb-2">No workouts found</h3>
      <p className="text-gray-600 mb-6">
        {getEmptyMessage()}
      </p>
      <Link to={DASHBOARD_ROUTES.CLIENT.WORKOUTS}>
        <Button variant="blue" size="sm">
          Browse Workouts
        </Button>
      </Link>
    </div>
  );
};

interface StatusBadgeProps {
  workout: WorkoutWithStatus;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ workout }) => {
  if (workout.status === 'completed') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        Completed
      </span>
    );
  }
  
  if (workout.isToday) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
        Today
      </span>
    );
  }
  
  if (workout.isUpcoming) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
        Upcoming
      </span>
    );
  }
  
  if (workout.isMissed) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        Missed
      </span>
    );
  }
  
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
      Scheduled
    </span>
  );
};

interface DifficultyBadgeProps {
  exerciseCount: number;
}

const DifficultyBadge: React.FC<DifficultyBadgeProps> = ({ exerciseCount }) => {
  const getDifficulty = (count: number) => {
    if (count <= 4) return { label: 'Beginner', color: 'bg-green-50 text-green-700' };
    if (count <= 8) return { label: 'Intermediate', color: 'bg-blue-50 text-blue-700' };
    return { label: 'Advanced', color: 'bg-orange-50 text-orange-700' };
  };

  const difficulty = getDifficulty(exerciseCount);

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${difficulty.color}`}>
      {difficulty.label}
    </span>
  );
};

interface WorkoutItemProps {
  workout: WorkoutWithStatus;
}

const WorkoutItem: React.FC<WorkoutItemProps> = ({ workout }) => {
  const workoutData = workout.workout;
  if (!workoutData) return null;

  return (
    <div className="py-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex flex-col md:flex-row md:items-center md:space-x-4">
          <h3 className="text-lg font-medium text-gray-800">
            {workoutData.workout_name}
          </h3>
          <div className="flex items-center space-x-2 mt-1 md:mt-0">
            <StatusBadge workout={workout} />
            <DifficultyBadge exerciseCount={workoutData.exercise_count || 0} />
          </div>
        </div>
        <div className="text-right">
          <Link 
            to={`${DASHBOARD_ROUTES.CLIENT.WORKOUTS}/${workout.id}`}
            className="text-[#007bff] text-sm hover:underline"
          >
            View Details
          </Link>
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-gray-500 mb-3">
        <div className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {formatDate(workout.assigned_date)}
        </div>
        <div className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          {workoutData.exercise_count || 0} exercises
        </div>
        <div className="flex items-center col-span-2 md:col-span-1">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700">
            {workoutData.workout_day}
          </span>
        </div>
      </div>
      
      {workoutData.description && (
        <p className="text-sm text-gray-600 mb-3">{workoutData.description}</p>
      )}
      
      {workout.trainer_notes && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
          <p className="text-sm text-blue-800">
            <span className="font-medium">Trainer Note:</span> {workout.trainer_notes}
          </p>
        </div>
      )}
      
      {/* Action Buttons */}
      {workout.status !== 'completed' && (
        <div className="flex space-x-2">
          <Button variant="blue" size="sm">
            {workout.status === 'in_progress' ? 'Continue Workout' : 'Start Workout'}
          </Button>
          {workout.status === 'assigned' && (
            <Button variant="outline" size="sm">
              Schedule
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

interface WorkoutsListProps {
  workouts: WorkoutWithStatus[];
}

const WorkoutsList: React.FC<WorkoutsListProps> = ({ workouts }) => (
  <div className="divide-y divide-gray-200">
    {workouts.map((workout) => (
      <WorkoutItem key={workout.id} workout={workout} />
    ))}
  </div>
);

// ============================================================================
// CUSTOM HOOK
// ============================================================================

const useRecentWorkouts = () => {
  const [state, setState] = useState<WorkoutsState>(INITIAL_STATE);
  const [filter, setFilter] = useState<FilterType>('all');

  const updateState = useCallback((updates: Partial<WorkoutsState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const fetchWorkouts = useCallback(async () => {
    try {
      updateState({ loading: true, error: null });
      
      // For now, use mock data since the client workout API might not be ready
      // TODO: Replace with actual API call when ready
      // const workouts = await ClientAPI.getClientWorkouts();
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const workouts = MOCK_WORKOUTS;
      
      updateState({
        workouts,
        hasData: workouts.length > 0,
        loading: false
      });
      
    } catch (error: any) {
      console.error('Error fetching workouts:', error);
      const errorMessage = error?.message || 'Failed to load workouts';
      
      updateState({
        workouts: [],
        hasData: false,
        error: errorMessage,
        loading: false
      });
      
      showErrorToast(error, 'Failed to load workouts');
    }
  }, [updateState]);

  const enrichedWorkouts = useMemo(() => {
    return state.workouts.map(enrichWorkoutWithStatus);
  }, [state.workouts]);

  const filteredWorkouts = useMemo(() => {
    return filterWorkouts(enrichedWorkouts, filter);
  }, [enrichedWorkouts, filter]);

  const sortedWorkouts = useMemo(() => {
    return sortWorkouts(filteredWorkouts);
  }, [filteredWorkouts]);

  const workoutCounts = useMemo(() => {
    const counts: Record<FilterType, number> = {
      all: enrichedWorkouts.length,
      completed: enrichedWorkouts.filter(w => w.status === 'completed').length,
      upcoming: enrichedWorkouts.filter(w => w.isUpcoming || w.isToday).length,
      today: enrichedWorkouts.filter(w => w.isToday).length
    };
    return counts;
  }, [enrichedWorkouts]);

  useEffect(() => {
    fetchWorkouts();
  }, [fetchWorkouts]);

  return {
    ...state,
    filter,
    sortedWorkouts,
    workoutCounts,
    setFilter,
    refetch: fetchWorkouts
  };
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const RecentWorkoutsList: React.FC = () => {
  const {
    loading,
    error,
    hasData,
    filter,
    sortedWorkouts,
    workoutCounts,
    setFilter,
    refetch
  } = useRecentWorkouts();

  return (
    <Card>
      <Header 
        filter={filter}
        onFilterChange={setFilter}
        workoutCounts={workoutCounts}
      />
      <CardContent>
        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : !hasData ? (
          <EmptyState filter={filter} />
        ) : sortedWorkouts.length === 0 ? (
          <EmptyState filter={filter} />
        ) : (
          <WorkoutsList workouts={sortedWorkouts} />
        )}
      </CardContent>
    </Card>
  );
};

export default RecentWorkoutsList;