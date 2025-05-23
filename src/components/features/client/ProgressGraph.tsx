// src/components/features/client/ProgressGraph.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/organisms/Card';
import { Button } from '@/components/atoms/Button';
import LoadingSpinner from '@/components/atoms/LoadingSpinner';
import { ClientAPI } from '@/lib/api';
import { showErrorToast } from '@/lib/errors';

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

// Interface for client measurements from the database
interface ClientMeasurement {
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

// Props interface for the component
interface ProgressGraphProps {
  refreshTrigger?: number; // Used to trigger refresh when measurements are added
}

// Measurement types and their labels
const measurementTypes = [
  { id: 'body_weight', label: 'Weight', unit: 'kg', color: '#ff7f0e' },
  { id: 'waist_size', label: 'Waist', unit: 'cm', color: '#ff7f0e' },
  { id: 'chest_size', label: 'Chest', unit: 'cm', color: '#ff7f0e' },
  { id: 'biceps_size', label: 'Arms', unit: 'cm', color: '#ff7f0e' },
  { id: 'thigh_size', label: 'Legs', unit: 'cm', color: '#ff7f0e' }
];

type MeasurementType = 'body_weight' | 'waist_size' | 'chest_size' | 'biceps_size' | 'thigh_size' | 'all';

export const ProgressGraph: React.FC<ProgressGraphProps> = ({ refreshTrigger }) => {
  const [selectedType, setSelectedType] = useState<MeasurementType>('all');
  const [timeRange, setTimeRange] = useState<'1m' | '3m' | '6m' | '1y'>('3m');
  const [loading, setLoading] = useState(false);
  const [measurements, setMeasurements] = useState<ClientMeasurement[]>([]);
  const [hasData, setHasData] = useState(false);
  
  /**
   * Format date for display on the chart
   */
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  /**
   * Filter measurements based on selected time range
   */
  const filterMeasurementsByTimeRange = (measurements: ClientMeasurement[], range: '1m' | '3m' | '6m' | '1y') => {
    if (!measurements || measurements.length === 0) return [];

    const now = new Date();
    const cutoffDate = new Date();

    switch (range) {
      case '1m':
        cutoffDate.setMonth(now.getMonth() - 1);
        break;
      case '3m':
        cutoffDate.setMonth(now.getMonth() - 3);
        break;
      case '6m':
        cutoffDate.setMonth(now.getMonth() - 6);
        break;
      case '1y':
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        cutoffDate.setMonth(now.getMonth() - 3);
    }

    return measurements.filter(measurement => {
      const measurementDate = new Date(measurement.date);
      return measurementDate >= cutoffDate;
    });
  };

  /**
   * Fetch client measurements from the API
   */
  const fetchMeasurements = async () => {
    try {
      setLoading(true);
      
      // Fetch measurements from the API (get more data for different time ranges)
      const allMeasurements = await ClientAPI.getClientMeasurements(100);
      
      if (allMeasurements && allMeasurements.length > 0) {
        // Sort measurements by date (oldest first for the chart)
        const sortedMeasurements = allMeasurements.sort((a, b) => 
          new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        
        setMeasurements(sortedMeasurements);
        setHasData(true);
      } else {
        setMeasurements([]);
        setHasData(false);
      }
    } catch (error) {
      console.error('Error fetching measurements:', error);
      showErrorToast(error, 'Failed to load progress data');
      setMeasurements([]);
      setHasData(false);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get chart data for single measurement type
   */
  const getSingleMeasurementChartData = (measurementType: Exclude<MeasurementType, 'all'>) => {
    const filteredMeasurements = filterMeasurementsByTimeRange(measurements, timeRange);
    
    // Filter out measurements that don't have the selected measurement type
    const relevantMeasurements = filteredMeasurements.filter(measurement => 
      measurement[measurementType] !== null && measurement[measurementType] !== undefined
    );

    return relevantMeasurements.map(measurement => ({
      date: formatDate(measurement.date),
      originalDate: measurement.date,
      value: measurement[measurementType] as number
    }));
  };

  /**
   * Get chart data for all measurements combined
   */
  const getAllMeasurementsChartData = () => {
    const filteredMeasurements = filterMeasurementsByTimeRange(measurements, timeRange);
    
    return filteredMeasurements.map(measurement => ({
      date: formatDate(measurement.date),
      originalDate: measurement.date,
      weight: measurement.body_weight,
      waist: measurement.waist_size,
      chest: measurement.chest_size,
      arms: measurement.biceps_size,
      legs: measurement.thigh_size
    }));
  };

  /**
   * Calculate progress for single measurement type
   */
  const calculateSingleProgress = (measurementType: Exclude<MeasurementType, 'all'>) => {
    const chartData = getSingleMeasurementChartData(measurementType);
    
    if (chartData.length < 2) return { value: 0, change: 0 };
    
    const firstValue = chartData[0].value;
    const lastValue = chartData[chartData.length - 1].value;
    const diff = lastValue - firstValue;
    
    return {
      value: Math.abs(diff),
      change: diff
    };
  };

  // Load measurements when component mounts or when refresh is triggered
  useEffect(() => {
    fetchMeasurements();
  }, [refreshTrigger]);

  // Update chart when time range changes
  useEffect(() => {
    // Data is already loaded, just update the display
    if (measurements.length > 0) {
      setLoading(false);
    }
  }, [timeRange, measurements.length]);

  const renderSingleMeasurementChart = (measurementType: Exclude<MeasurementType, 'all'>) => {
    const chartData = getSingleMeasurementChartData(measurementType);
    const progress = calculateSingleProgress(measurementType);
    const measurementInfo = measurementTypes.find(t => t.id === measurementType);

    if (chartData.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <div className="text-gray-400 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium">No {measurementInfo?.label.toLowerCase()} data</h3>
          <p className="text-gray-500 mt-1">
            No {measurementInfo?.label.toLowerCase()} measurements found for the selected time period
          </p>
        </div>
      );
    }

    if (chartData.length === 1) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <div className="text-blue-400 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium">One measurement found</h3>
          <p className="text-gray-500 mt-1">
            Current {measurementInfo?.label.toLowerCase()}: {chartData[0].value} {measurementInfo?.unit}
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Add more measurements to see progress trends
          </p>
        </div>
      );
    }

    return (
      <>
        {/* Progress indicator for single measurement */}
        <div className="flex justify-end mb-4">
          <div className="flex items-center bg-gray-50 px-4 py-2 rounded-md">
            <div>
              <p className="text-sm text-gray-500">Change</p>
              <p className={`text-lg font-bold ${progress.change >= 0 ? 'text-orange-600' : 'text-orange-600'}`}>
                {progress.change >= 0 ? '+' : ''}{progress.change.toFixed(1)} {measurementInfo?.unit}
              </p>
            </div>
          </div>
        </div>
        
        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                domain={['auto', 'auto']}
                label={{ 
                  value: measurementInfo?.unit || '', 
                  angle: -90, 
                  position: 'insideLeft' 
                }}
                tick={{ fontSize: 12 }}
              />
              <Tooltip 
                formatter={(value: number) => [`${value} ${measurementInfo?.unit}`, measurementInfo?.label]}
                labelFormatter={(label) => `Date: ${label}`}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #ccc',
                  borderRadius: '6px'
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#ff7f0e"
                strokeWidth={3}
                dot={{ fill: "#ff7f0e", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: "#ff7f0e", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </>
    );
  };

  const renderAllMeasurementsChart = () => {
    const chartData = getAllMeasurementsChartData();
    
    if (chartData.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <div className="text-gray-400 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium">No measurements found</h3>
          <p className="text-gray-500 mt-1">
            No measurements found for the selected time period
          </p>
        </div>
      );
    }

    return (
      <div className="w-full h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
            />
            <Tooltip 
              formatter={(value: number, name: string) => {
                if (value === null || value === undefined) return ['-', name];
                const unit = name === 'weight' ? 'kg' : 'cm';
                return [`${value} ${unit}`, name];
              }}
              labelFormatter={(label) => `Date: ${label}`}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #ccc',
                borderRadius: '6px'
              }}
            />
            <Legend />
            
            {/* Weight line */}
            <Line
              type="monotone"
              dataKey="weight"
              stroke="#ff7f0e"
              strokeWidth={2}
              dot={{ fill: "#ff7f0e", strokeWidth: 1, r: 3 }}
              connectNulls={false}
              name="Weight (kg)"
            />
            
            {/* Waist line */}
            <Line
              type="monotone"
              dataKey="waist"
              stroke="#007bff"
              strokeWidth={2}
              dot={{ fill: "#007bff", strokeWidth: 1, r: 3 }}
              connectNulls={false}
              name="Waist (cm)"
            />
            
            {/* Chest line */}
            <Line
              type="monotone"
              dataKey="chest"
              stroke="#7690cd"
              strokeWidth={2}
              dot={{ fill: "#7690cd", strokeWidth: 1, r: 3 }}
              connectNulls={false}
              name="Chest (cm)"
            />
            
            {/* Arms line */}
            <Line
              type="monotone"
              dataKey="arms"
              stroke="#2ca02c"
              strokeWidth={2}
              dot={{ fill: "#2ca02c", strokeWidth: 1, r: 3 }}
              connectNulls={false}
              name="Arms (cm)"
            />
            
            {/* Legs line */}
            <Line
              type="monotone"
              dataKey="legs"
              stroke="#d62728"
              strokeWidth={2}
              dot={{ fill: "#d62728", strokeWidth: 1, r: 3 }}
              connectNulls={false}
              name="Legs (cm)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  };

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
        <div className="flex flex-wrap gap-2 mb-6">
          <Button
            variant={selectedType === 'all' ? 'blue' : 'outline'}
            size="sm"
            onClick={() => setSelectedType('all')}
          >
            All Measurements
          </Button>
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
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        ) : !hasData ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="text-gray-400 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium">No measurements available</h3>
            <p className="text-gray-500 mt-1">
              Add measurements to see your progress over time
            </p>
          </div>
        ) : selectedType === 'all' ? (
          renderAllMeasurementsChart()
        ) : (
          renderSingleMeasurementChart(selectedType as Exclude<MeasurementType, 'all'>)
        )}
      </CardContent>
    </Card>
  );
};

export default ProgressGraph;