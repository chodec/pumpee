// src/components/features/client/RecentWorkoutsList.tsx
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/organisms/Card';
import { Button } from '@/components/atoms/Button';
import Icon from '@/components/atoms/Icon';
import { Link } from 'react-router-dom';
import { DASHBOARD_ROUTES } from '@/lib/constants';

// Sample workout data (in a real app, would fetch from API)
const sampleWorkouts = [
  {
    id: 1,
    title: 'Full Body Strength',
    date: '2025-05-12',
    completed: true,
    duration: 45,
    exercises: 8,
    difficulty: 'Intermediate'
  },
  {
    id: 2,
    title: 'HIIT Cardio',
    date: '2025-05-10',
    completed: true,
    duration: 30,
    exercises: 6,
    difficulty: 'Advanced'
  },
  {
    id: 3,
    title: 'Yoga & Mobility',
    date: '2025-05-08',
    completed: true,
    duration: 40,
    exercises: 10,
    difficulty: 'Beginner'
  },
  {
    id: 4,
    title: 'Upper Body Focus',
    date: '2025-05-15',
    completed: false,
    duration: 50,
    exercises: 9,
    difficulty: 'Intermediate'
  }
];

export const RecentWorkoutsList: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'completed' | 'upcoming'>('all');
  
  // Filter workouts based on selected filter
  const filteredWorkouts = sampleWorkouts.filter(workout => {
    if (filter === 'all') return true;
    if (filter === 'completed') return workout.completed;
    if (filter === 'upcoming') return !workout.completed;
    return true;
  });
  
  // Sort workouts - upcoming first, then most recent completed
  const sortedWorkouts = [...filteredWorkouts].sort((a, b) => {
    // First sort by completion status (upcoming first)
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    
    // Then sort by date (most recent first)
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
  
  // Format date to display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  // Get status badge based on completion and date
  const getStatusBadge = (workout: typeof sampleWorkouts[0]) => {
    const today = new Date();
    const workoutDate = new Date(workout.date);
    
    if (workout.completed) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Completed
        </span>
      );
    }
    
    if (workoutDate.setHours(0, 0, 0, 0) === today.setHours(0, 0, 0, 0)) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          Today
        </span>
      );
    }
    
    if (workoutDate > today) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
          Upcoming
        </span>
      );
    }
    
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        Missed
      </span>
    );
  };
  
  // Get difficulty badge
  const getDifficultyBadge = (difficulty: string) => {
    let bgColor = 'bg-gray-100 text-gray-800';
    
    if (difficulty === 'Beginner') {
      bgColor = 'bg-green-50 text-green-700';
    } else if (difficulty === 'Intermediate') {
      bgColor = 'bg-blue-50 text-blue-700';
    } else if (difficulty === 'Advanced') {
      bgColor = 'bg-orange-50 text-orange-700';
    }
    
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${bgColor}`}>
        {difficulty}
      </span>
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Workouts</CardTitle>
        <div className="flex space-x-2">
          <Button 
            variant={filter === 'all' ? 'blue' : 'outline'} 
            size="sm"
            onClick={() => setFilter('all')}
          >
            All
          </Button>
          <Button 
            variant={filter === 'completed' ? 'blue' : 'outline'} 
            size="sm"
            onClick={() => setFilter('completed')}
          >
            Completed
          </Button>
          <Button 
            variant={filter === 'upcoming' ? 'blue' : 'outline'} 
            size="sm"
            onClick={() => setFilter('upcoming')}
          >
            Upcoming
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {sortedWorkouts.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {sortedWorkouts.map((workout) => (
              <div key={workout.id} className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col md:flex-row md:items-center md:space-x-4">
                    <h3 className="text-lg font-medium text-gray-800">
                      {workout.title}
                    </h3>
                    <div className="flex items-center space-x-2 mt-1 md:mt-0">
                      {getStatusBadge(workout)}
                      {getDifficultyBadge(workout.difficulty)}
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
                <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-gray-500">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {formatDate(workout.date)}
                  </div>
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {workout.duration} minutes
                  </div>
                  <div className="flex items-center col-span-2 md:col-span-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    {workout.exercises} exercises
                  </div>
                </div>
                
                {!workout.completed && (
                  <div className="mt-3">
                    <Button variant="blue" size="sm">
                      Start Workout
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="text-gray-400 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </div>
            <h3 className="text-lg font-medium">No workouts found</h3>
            <p className="text-gray-500 mt-1 mb-4">
              {filter === 'all' 
                ? "You don't have any workouts yet." 
                : filter === 'completed' 
                ? "You haven't completed any workouts yet." 
                : "You don't have any upcoming workouts."}
            </p>
            <Button variant="blue" size="sm">
              <Link to={DASHBOARD_ROUTES.CLIENT.WORKOUTS}>
                Browse Workouts
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentWorkoutsList;