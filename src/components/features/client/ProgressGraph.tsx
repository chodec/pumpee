// src/components/features/client/ProgressGraph.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/organisms/Card';
import { Button } from '@/components/atoms/Button';
import LoadingSpinner from '@/components/atoms/LoadingSpinner';

// Import for the React component mode
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

// Sample measurement data (in a real app, would fetch from API)
const sampleMeasurements = {
  weight: [
    { date: '2025-04-02', value: 80 },
    { date: '2025-04-09', value: 79.5 },
    { date: '2025-04-16', value: 78.7 },
    { date: '2025-04-23', value: 78.3 },
    { date: '2025-04-30', value: 77.8 },
    { date: '2025-05-07', value: 77.2 },
    { date: '2025-05-10', value: 76.8 },
  ],
  waist: [
    { date: '2025-04-02', value: 88 },
    { date: '2025-04-09', value: 87 },
    { date: '2025-04-16', value: 86.5 },
    { date: '2025-04-23', value: 86 },
    { date: '2025-04-30', value: 85 },
    { date: '2025-05-07', value: 84 },
    { date: '2025-05-10', value: 83.5 },
  ],
  chest: [
    { date: '2025-04-02', value: 95 },
    { date: '2025-04-16', value: 95.5 },
    { date: '2025-04-30', value: 96 },
    { date: '2025-05-10', value: 97 },
  ],
  arms: [
    { date: '2025-04-02', value: 32 },
    { date: '2025-04-16', value: 32.5 },
    { date: '2025-04-30', value: 33 },
    { date: '2025-05-10', value: 33.5 },
  ],
  legs: [
    { date: '2025-04-02', value: 55 },
    { date: '2025-04-16', value: 56 },
    { date: '2025-04-30', value: 56.5 },
    { date: '2025-05-10', value: 57 },
  ]
};

// Measurement types and their labels
const measurementTypes = [
  { id: 'weight', label: 'Weight', unit: 'kg', color: '#007bff' },
  { id: 'waist', label: 'Waist', unit: 'cm', color: '#ff7f0e' },
  { id: 'chest', label: 'Chest', unit: 'cm', color: '#7690cd' },
  { id: 'arms', label: 'Arms', unit: 'cm', color: '#2ca02c' },
  { id: 'legs', label: 'Legs', unit: 'cm', color: '#d62728' }
];

type MeasurementType = 'weight' | 'waist' | 'chest' | 'arms' | 'legs';

export const ProgressGraph: React.FC = () => {
  const [selectedType, setSelectedType] = useState<MeasurementType>('weight');
  const [timeRange, setTimeRange] = useState<'1m' | '3m' | '6m' | '1y'>('1m');
  const [loading, setLoading] = useState(false);
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };
  
  // Get data for selected measurement type
  const data = sampleMeasurements[selectedType].map(item => ({
    date: formatDate(item.date),
    originalDate: item.date,
    value: item.value
  }));

  // Calculate progress (comparing first and last measurement)
  const calculateProgress = () => {
    if (data.length < 2) return { value: 0, isPositive: true };
    
    const firstValue = data[0].value;
    const lastValue = data[data.length - 1].value;
    const diff = lastValue - firstValue;
    
    // For weight and waist, negative change is positive progress
    const isPositiveProgress = selectedType === 'weight' || selectedType === 'waist' 
      ? diff < 0 
      : diff > 0;
    
    return {
      value: Math.abs(diff),
      isPositive: isPositiveProgress
    };
  };
  
  const progress = calculateProgress();
  const measurementInfo = measurementTypes.find(t => t.id === selectedType);

  // Function to fetch data based on selected time range
  // In a real app, this would fetch from an API
  const fetchData = (type: MeasurementType, range: '1m' | '3m' | '6m' | '1y') => {
    setLoading(true);
    
    // Simulate API request
    setTimeout(() => {
      // Data is already loaded in sampleMeasurements
      setLoading(false);
    }, 500);
  };
  
  // Update data when selection changes
  useEffect(() => {
    fetchData(selectedType, timeRange);
  }, [selectedType, timeRange]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Progress Tracker</CardTitle>
        <div className="flex space-x-2">
          <Button 
            variant={timeRange === '1m' ? 'blue' : 'outline'} 
            size="sm"
            onClick={() => setTimeRange('1m')}
          >
            1M
          </Button>
          <Button 
            variant={timeRange === '3m' ? 'blue' : 'outline'} 
            size="sm"
            onClick={() => setTimeRange('3m')}
          >
            3M
          </Button>
          <Button 
            variant={timeRange === '6m' ? 'blue' : 'outline'} 
            size="sm"
            onClick={() => setTimeRange('6m')}
          >
            6M
          </Button>
          <Button 
            variant={timeRange === '1y' ? 'blue' : 'outline'} 
            size="sm"
            onClick={() => setTimeRange('1y')}
          >
            1Y
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row md:justify-between mb-6">
          <div className="flex flex-wrap gap-2 mb-4 md:mb-0">
            {measurementTypes.map((type) => (
              <Button
                key={type.id}
                variant={selectedType === type.id ? 'blue' : 'outline'}
                size="sm"
                onClick={() => setSelectedType(type.id as MeasurementType)}
              >
                {type.label}
              </Button>
            ))}
          </div>
          
          <div className="flex items-center bg-gray-50 px-4 py-2 rounded-md">
            <div>
              <p className="text-sm text-gray-500">Progress</p>
              <p className={`text-lg font-bold ${progress.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {progress.isPositive ? '+' : '-'}{progress.value.toFixed(1)} {measurementInfo?.unit}
              </p>
            </div>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        ) : data.length > 0 ? (
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis 
                  domain={['auto', 'auto']}
                  label={{ 
                    value: measurementInfo?.unit || '', 
                    angle: -90, 
                    position: 'insideLeft' 
                  }}
                />
                <Tooltip 
                  formatter={(value) => [`${value} ${measurementInfo?.unit}`, measurementInfo?.label]}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={measurementInfo?.color || '#007bff'}
                  strokeWidth={2}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="text-gray-400 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium">No data available</h3>
            <p className="text-gray-500 mt-1">
              Add measurements to see your progress over time
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProgressGraph;