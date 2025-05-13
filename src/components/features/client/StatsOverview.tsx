// src/components/features/client/StatsOverview.tsx
import React from 'react';
import { Card, CardContent } from '@/components/organisms/Card';

export interface ClientStat {
  value: number;
  change: number;
  unit: string;
}

export interface StatsOverviewProps {
  currentWeight: ClientStat;
  bodyFat: ClientStat;
  muscleGain: ClientStat;
  isLoading?: boolean;
}

const StatsOverview: React.FC<StatsOverviewProps> = ({
  currentWeight,
  bodyFat,
  muscleGain,
  isLoading = false
}) => {
  // Helper function to determine change indicator color
  const getChangeColor = (change: number, isPositiveGood: boolean = false) => {
    // For weight and body fat, negative change is good
    // For muscle gain, positive change is good
    const isPositive = change > 0;
    const isGood = isPositiveGood ? isPositive : !isPositive;
    
    return isGood ? 'text-green-600' : 'text-red-600';
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse flex space-x-4">
                <div className="rounded-full bg-slate-200 h-12 w-12"></div>
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-2 bg-slate-200 rounded w-1/2"></div>
                  <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Current Weight Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-[#007bff]">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 6h-2c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h2"/>
                <path d="M18 6h2c1.1 0 2 .9 2 2v8c0 1.1-.9 2-2 2h-2"/>
                <path d="M6 12h12"/>
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Current Weight</h3>
              <div className="flex items-baseline">
                <p className="text-lg font-semibold text-gray-800">{currentWeight.value} {currentWeight.unit}</p>
                <span className={`ml-2 text-sm ${getChangeColor(currentWeight.change)}`}>
                  {currentWeight.change > 0 ? '+' : ''}{currentWeight.change} {currentWeight.unit}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Body Fat Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-[#ff7f0e]">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Body Fat</h3>
              <div className="flex items-baseline">
                <p className="text-lg font-semibold text-gray-800">{bodyFat.value}{bodyFat.unit}</p>
                <span className={`ml-2 text-sm ${getChangeColor(bodyFat.change)}`}>
                  {bodyFat.change > 0 ? '+' : ''}{bodyFat.change}{bodyFat.unit}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Muscle Gain Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-[#7690cd]">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 18a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v12z"></path>
                <path d="M17 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"></path>
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Muscle Gain</h3>
              <div className="flex items-baseline">
                <p className="text-lg font-semibold text-gray-800">{muscleGain.value} {muscleGain.unit}</p>
                <span className={`ml-2 text-sm ${getChangeColor(muscleGain.change, true)}`}>
                  {muscleGain.change > 0 ? '+' : ''}{muscleGain.change} {muscleGain.unit}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsOverview;