// src/components/features/client/ProgressGraph.tsx - Refactored Version
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/organisms/Card';
import { Button } from '@/components/atoms/Button';
import LoadingSpinner from '@/components/atoms/LoadingSpinner';
import { ClientAPI, ClientProgress } from '@/lib/api';
import { showErrorToast } from '@/lib/errors';
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

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface ProgressGraphProps {
  refreshTrigger?: number;
}

interface ChartDataPoint {
  date: string;
  originalDate: string;
  weight?: number | null;
  waist?: number | null;
  chest?: number | null;
  arms?: number | null;
  legs?: number | null;
  value?: number; // For single measurement charts
}

interface MeasurementConfig {
  id: keyof ClientProgress;
  label: string;
  unit: string;
  color: string;
  chartKey: string;
}

interface ProgressStats {
  value: number;
  change: number;
}

interface GraphState {
  selectedType: MeasurementType;
  timeRange: TimeRange;
  measurements: ClientProgress[];
  loading: boolean;
  error: string | null;
  hasData: boolean;
}

type MeasurementType = 'body_weight' | 'waist_size' | 'chest_size' | 'biceps_size' | 'thigh_size' | 'all';
type TimeRange = '1m' | '3m' | '6m' | '1y';

// ============================================================================
// CONSTANTS
// ============================================================================

const MEASUREMENT_CONFIGS: Record<string, MeasurementConfig> = {
  body_weight: { 
    id: 'body_weight', 
    label: 'Weight', 
    unit: 'kg', 
    color: '#ff7f0e',
    chartKey: 'weight'
  },
  waist_size: { 
    id: 'waist_size', 
    label: 'Waist', 
    unit: 'cm', 
    color: '#007bff',
    chartKey: 'waist'
  },
  chest_size: { 
    id: 'chest_size', 
    label: 'Chest', 
    unit: 'cm', 
    color: '#7690cd',
    chartKey: 'chest'
  },
  biceps_size: { 
    id: 'biceps_size', 
    label: 'Arms', 
    unit: 'cm', 
    color: '#2ca02c',
    chartKey: 'arms'
  },
  thigh_size: { 
    id: 'thigh_size', 
    label: 'Legs', 
    unit: 'cm', 
    color: '#d62728',
    chartKey: 'legs'
  }
};

const TIME_RANGE_OPTIONS = [
  { value: '1m' as const, label: '1M', months: 1 },
  { value: '3m' as const, label: '3M', months: 3 },
  { value: '6m' as const, label: '6M', months: 6 },
  { value: '1y' as const, label: '1Y', months: 12 }
];

const INITIAL_STATE: GraphState = {
  selectedType: 'all',
  timeRange: '3m',
  measurements: [],
  loading: true,
  error: null,
  hasData: false
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const formatDateForDisplay = (dateString: string): string => {
  const date = new Date(dateString);
  return `${date.getMonth() + 1}/${date.getDate()}`;
};

const filterMeasurementsByTimeRange = (
  measurements: ClientProgress[], 
  timeRange: TimeRange
): ClientProgress[] => {
  if (!measurements || measurements.length === 0) return [];

  const now = new Date();
  const cutoffDate = new Date();
  const rangeConfig = TIME_RANGE_OPTIONS.find(option => option.value === timeRange);
  
  if (rangeConfig) {
    cutoffDate.setMonth(now.getMonth() - rangeConfig.months);
  }

  return measurements.filter(measurement => {
    const measurementDate = new Date(measurement.date);
    return measurementDate >= cutoffDate;
  });
};

const calculateProgressStats = (
  measurements: ClientProgress[],
  measurementType: keyof ClientProgress
): ProgressStats => {
  const relevantMeasurements = measurements.filter(m => 
    m[measurementType] !== null && m[measurementType] !== undefined
  );

  if (relevantMeasurements.length < 2) {
    return { value: 0, change: 0 };
  }

  const firstValue = Number(relevantMeasurements[0][measurementType]) || 0;
  const lastValue = Number(relevantMeasurements[relevantMeasurements.length - 1][measurementType]) || 0;
  const diff = lastValue - firstValue;

  return {
    value: Math.abs(diff),
    change: diff
  };
};

// ============================================================================
// DATA PROCESSING FUNCTIONS
// ============================================================================

const createSingleMeasurementChartData = (
  measurements: ClientProgress[],
  measurementType: keyof ClientProgress,
  timeRange: TimeRange
): ChartDataPoint[] => {
  const filteredMeasurements = filterMeasurementsByTimeRange(measurements, timeRange);
  
  const relevantMeasurements = filteredMeasurements.filter(measurement => 
    measurement[measurementType] !== null && measurement[measurementType] !== undefined
  );

  return relevantMeasurements.map(measurement => ({
    date: formatDateForDisplay(measurement.date),
    originalDate: measurement.date,
    value: Number(measurement[measurementType]) || 0
  }));
};

const createAllMeasurementsChartData = (
  measurements: ClientProgress[],
  timeRange: TimeRange
): ChartDataPoint[] => {
  const filteredMeasurements = filterMeasurementsByTimeRange(measurements, timeRange);
  
  return filteredMeasurements.map(measurement => ({
    date: formatDateForDisplay(measurement.date),
    originalDate: measurement.date,
    weight: measurement.body_weight,
    waist: measurement.waist_size,
    chest: measurement.chest_size,
    arms: measurement.biceps_size,
    legs: measurement.thigh_size
  }));
};

// ============================================================================
// COMPONENT PARTS
// ============================================================================

interface ControlsProps {
  selectedType: MeasurementType;
  timeRange: TimeRange;
  onTypeChange: (type: MeasurementType) => void;
  onTimeRangeChange: (range: TimeRange) => void;
}

const Controls: React.FC<ControlsProps> = ({
  selectedType,
  timeRange,
  onTypeChange,
  onTimeRangeChange
}) => (
  <>
    {/* Time Range Controls */}
    <div className="flex space-x-2">
      {TIME_RANGE_OPTIONS.map((option) => (
        <Button 
          key={option.value}
          variant={timeRange === option.value ? 'blue' : 'outline'} 
          size="sm"
          onClick={() => onTimeRangeChange(option.value)}
        >
          {option.label}
        </Button>
      ))}
    </div>
  </>
);

interface MeasurementFiltersProps {
  selectedType: MeasurementType;
  onTypeChange: (type: MeasurementType) => void;
}

const MeasurementFilters: React.FC<MeasurementFiltersProps> = ({
  selectedType,
  onTypeChange
}) => (
  <div className="flex flex-wrap gap-2 mb-6">
    <Button
      variant={selectedType === 'all' ? 'blue' : 'outline'}
      size="sm"
      onClick={() => onTypeChange('all')}
    >
      All Measurements
    </Button>
    {Object.values(MEASUREMENT_CONFIGS).map((config) => (
      <Button
        key={config.id}
        variant={selectedType === config.id ? 'blue' : 'outline'}
        size="sm"
        onClick={() => onTypeChange(config.id)}
      >
        {config.label}
      </Button>
    ))}
  </div>
);

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({ 
  title, 
  description, 
  icon 
}) => (
  <div className="flex flex-col items-center justify-center h-64 text-center">
    <div className="text-gray-400 mb-2">
      {icon || (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )}
    </div>
    <h3 className="text-lg font-medium">{title}</h3>
    <p className="text-gray-500 mt-1">{description}</p>
  </div>
);

interface ProgressIndicatorProps {
  progress: ProgressStats;
  measurementConfig: MeasurementConfig;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  progress,
  measurementConfig
}) => (
  <div className="flex justify-end mb-4">
    <div className="flex items-center bg-gray-50 px-4 py-2 rounded-md">
      <div>
        <p className="text-sm text-gray-500">Change</p>
        <p className="text-lg font-bold text-orange-600">
          {progress.change >= 0 ? '+' : ''}{progress.change.toFixed(1)} {measurementConfig.unit}
        </p>
      </div>
    </div>
  </div>
);

interface SingleMeasurementChartProps {
  data: ChartDataPoint[];
  measurementType: keyof ClientProgress;
  measurements: ClientProgress[];
}

const SingleMeasurementChart: React.FC<SingleMeasurementChartProps> = ({
  data,
  measurementType,
  measurements
}) => {
  const measurementConfig = MEASUREMENT_CONFIGS[measurementType];
  const progress = useMemo(() => 
    calculateProgressStats(measurements, measurementType), 
    [measurements, measurementType]
  );

  if (data.length === 0) {
    return (
      <EmptyState
        title={`No ${measurementConfig.label.toLowerCase()} data`}
        description={`No ${measurementConfig.label.toLowerCase()} measurements found for the selected time period`}
      />
    );
  }

  if (data.length === 1) {
    return (
      <EmptyState
        title="One measurement found"
        description={`Current ${measurementConfig.label.toLowerCase()}: ${data[0].value} ${measurementConfig.unit}. Add more measurements to see progress trends.`}
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        }
      />
    );
  }

  return (
    <>
      <ProgressIndicator progress={progress} measurementConfig={measurementConfig} />
      
      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
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
                value: measurementConfig.unit, 
                angle: -90, 
                position: 'insideLeft' 
              }}
              tick={{ fontSize: 12 }}
            />
            <Tooltip 
              formatter={(value: number) => [`${value} ${measurementConfig.unit}`, measurementConfig.label]}
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
              stroke={measurementConfig.color}
              strokeWidth={3}
              dot={{ fill: measurementConfig.color, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: measurementConfig.color, strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </>
  );
};

interface AllMeasurementsChartProps {
  data: ChartDataPoint[];
}

const AllMeasurementsChart: React.FC<AllMeasurementsChartProps> = ({ data }) => {
  if (data.length === 0) {
    return (
      <EmptyState
        title="No measurements found"
        description="No measurements found for the selected time period"
      />
    );
  }

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
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
            formatter={(value: number | null, name: string) => {
              if (value === null || value === undefined) return ['-', name];
              const config = Object.values(MEASUREMENT_CONFIGS).find(c => c.chartKey === name);
              const unit = config?.unit || (name === 'weight' ? 'kg' : 'cm');
              return [`${value} ${unit}`, config?.label || name];
            }}
            labelFormatter={(label) => `Date: ${label}`}
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #ccc',
              borderRadius: '6px'
            }}
          />
          <Legend />
          
          {Object.values(MEASUREMENT_CONFIGS).map((config) => (
            <Line
              key={config.chartKey}
              type="monotone"
              dataKey={config.chartKey}
              stroke={config.color}
              strokeWidth={2}
              dot={{ fill: config.color, strokeWidth: 1, r: 3 }}
              connectNulls={false}
              name={`${config.label} (${config.unit})`}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

// ============================================================================
// CUSTOM HOOK
// ============================================================================

const useProgressGraph = (refreshTrigger?: number) => {
  const [state, setState] = useState<GraphState>(INITIAL_STATE);

  const updateState = useCallback((updates: Partial<GraphState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const fetchMeasurements = useCallback(async () => {
    try {
      updateState({ loading: true, error: null });
      
      const allMeasurements = await ClientAPI.getClientMeasurements(100);
      
      if (allMeasurements && allMeasurements.length > 0) {
        const sortedMeasurements = allMeasurements.sort((a, b) => 
          new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        
        updateState({ 
          measurements: sortedMeasurements,
          hasData: true,
          loading: false
        });
      } else {
        updateState({ 
          measurements: [],
          hasData: false,
          loading: false
        });
      }
    } catch (error: any) {
      console.error('Error fetching measurements:', error);
      showErrorToast(error, 'Failed to load progress data');
      updateState({ 
        measurements: [],
        hasData: false,
        error: error?.message || 'Failed to load progress data',
        loading: false
      });
    }
  }, [updateState]);

  // Fetch data on mount and when refreshTrigger changes
  useEffect(() => {
    fetchMeasurements();
  }, [fetchMeasurements, refreshTrigger]);

  return {
    ...state,
    updateState,
    refetch: fetchMeasurements
  };
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const ProgressGraph: React.FC<ProgressGraphProps> = ({ refreshTrigger }) => {
  const {
    selectedType,
    timeRange,
    measurements,
    loading,
    error,
    hasData,
    updateState
  } = useProgressGraph(refreshTrigger);

  // Generate chart data based on current selections
  const chartData = useMemo(() => {
    if (selectedType === 'all') {
      return createAllMeasurementsChartData(measurements, timeRange);
    } else {
      return createSingleMeasurementChartData(measurements, selectedType, timeRange);
    }
  }, [measurements, selectedType, timeRange]);

  const handleTypeChange = useCallback((type: MeasurementType) => {
    updateState({ selectedType: type });
  }, [updateState]);

  const handleTimeRangeChange = useCallback((range: TimeRange) => {
    updateState({ timeRange: range });
  }, [updateState]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Progress Tracker</CardTitle>
        <Controls
          selectedType={selectedType}
          timeRange={timeRange}
          onTypeChange={handleTypeChange}
          onTimeRangeChange={handleTimeRangeChange}
        />
      </CardHeader>
      <CardContent>
        <MeasurementFilters
          selectedType={selectedType}
          onTypeChange={handleTypeChange}
        />
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <EmptyState
            title="Error loading data"
            description={error}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
        ) : !hasData ? (
          <EmptyState
            title="No measurements available"
            description="Add measurements to see your progress over time"
          />
        ) : selectedType === 'all' ? (
          <AllMeasurementsChart data={chartData} />
        ) : (
          <SingleMeasurementChart 
            data={chartData}
            measurementType={selectedType}
            measurements={measurements}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default ProgressGraph;