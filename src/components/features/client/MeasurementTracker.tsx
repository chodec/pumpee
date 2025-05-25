// src/components/features/client/MeasurementTracker.tsx - Refactored Version
import React, { useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import Icon from '@/components/atoms/Icon';
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
import { showSuccessToast, showErrorToast } from '@/lib/errors';
import LoadingSpinner from '@/components/atoms/LoadingSpinner';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface ClientProgress {
  id: string;
  client_id: string;
  date: string;
  body_weight: number | null;
  chest_size: number | null;
  waist_size: number | null;
  biceps_size: number | null;
  thigh_size: number | null;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface MeasurementTrackerProps {
  measurements: ClientProgress[];
  onAddMeasurement: (measurement: MeasurementFormValues) => Promise<void>;
  isLoading?: boolean;
}

interface MeasurementField {
  key: keyof ClientProgress;
  label: string;
  unit: string;
  placeholder: string;
  icon: React.ReactNode;
}

interface MeasurementDisplay {
  label: string;
  value: string;
  hasValue: boolean;
}

// ============================================================================
// FORM SCHEMA & VALIDATION
// ============================================================================

const measurementSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  body_weight: z.string().optional()
    .transform(val => val === '' ? null : parseFloat(val))
    .refine(val => val === null || (!isNaN(val) && val > 0), { 
      message: 'Weight must be a positive number' 
    }),
  chest_size: z.string().optional()
    .transform(val => val === '' ? null : parseFloat(val))
    .refine(val => val === null || (!isNaN(val) && val > 0), { 
      message: 'Chest size must be a positive number' 
    }),
  waist_size: z.string().optional()
    .transform(val => val === '' ? null : parseFloat(val))
    .refine(val => val === null || (!isNaN(val) && val > 0), { 
      message: 'Waist size must be a positive number' 
    }),
  biceps_size: z.string().optional()
    .transform(val => val === '' ? null : parseFloat(val))
    .refine(val => val === null || (!isNaN(val) && val > 0), { 
      message: 'Arms size must be a positive number' 
    }),
  thigh_size: z.string().optional()
    .transform(val => val === '' ? null : parseFloat(val))
    .refine(val => val === null || (!isNaN(val) && val > 0), { 
      message: 'Legs size must be a positive number' 
    }),
  notes: z.string().optional()
}).refine(data => {
  // At least one measurement must be provided
  return data.body_weight !== null || 
         data.chest_size !== null || 
         data.waist_size !== null || 
         data.biceps_size !== null || 
         data.thigh_size !== null;
}, {
  message: "At least one measurement must be provided",
  path: ["body_weight"]
});

export type MeasurementFormValues = z.infer<typeof measurementSchema>;

// ============================================================================
// CONSTANTS
// ============================================================================

const MEASUREMENT_FIELDS: MeasurementField[] = [
  {
    key: 'body_weight',
    label: 'Weight',
    unit: 'kg',
    placeholder: '0.0',
    icon: <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  },
  {
    key: 'chest_size',
    label: 'Chest',
    unit: 'cm',
    placeholder: '0.0',
    icon: <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  },
  {
    key: 'waist_size',
    label: 'Waist',
    unit: 'cm',
    placeholder: '0.0',
    icon: <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" />
      <path d="M8 12h8" />
    </svg>
  },
  {
    key: 'biceps_size',
    label: 'Arms',
    unit: 'cm',
    placeholder: '0.0',
    icon: <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM17 21a4 4 0 004-4V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4z" />
    </svg>
  },
  {
    key: 'thigh_size',
    label: 'Legs',
    unit: 'cm',
    placeholder: '0.0',
    icon: <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 4v12l-4 2-4-2V4M6 18L4 16v-4M18 18l2-2v-4" />
    </svg>
  }
];

const DEFAULT_FORM_VALUES = {
  date: new Date().toISOString().split('T')[0],
  body_weight: '',
  chest_size: '',
  waist_size: '',
  biceps_size: '',
  thigh_size: '',
  notes: ''
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const formatDate = (dateString: string): string => {
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch (e) {
    console.error("Invalid date format:", dateString);
    return dateString;
  }
};

const getMeasurementDisplays = (measurement: ClientProgress): MeasurementDisplay[] => {
  return MEASUREMENT_FIELDS.map(field => {
    const value = measurement[field.key];
    const hasValue = value !== null && value !== undefined;
    
    return {
      label: field.label,
      value: hasValue ? `${field.label}: ${value}${field.unit}` : '',
      hasValue
    };
  }).filter(display => display.hasValue);
};

// ============================================================================
// COMPONENT PARTS
// ============================================================================

interface HeaderProps {
  showForm: boolean;
  onToggleForm: () => void;
  isSubmitting: boolean;
}

const Header: React.FC<HeaderProps> = ({ showForm, onToggleForm, isSubmitting }) => (
  <CardHeader className="flex flex-row items-center justify-between">
    <CardTitle>Body Measurements</CardTitle>
    <Button 
      variant={showForm ? "outline" : "blue"} 
      size="sm"
      onClick={onToggleForm}
      disabled={isSubmitting}
    >
      {showForm ? 'Cancel' : 'Add Measurement'}
    </Button>
  </CardHeader>
);

interface LoadingStateProps {
  message?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({ message = "Loading measurements..." }) => (
  <div className="flex justify-center items-center min-h-[200px]">
    <LoadingSpinner size="md" />
    <p className="ml-3 text-gray-500">{message}</p>
  </div>
);

interface MeasurementFormProps {
  onSubmit: (data: MeasurementFormValues) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

const MeasurementForm: React.FC<MeasurementFormProps> = ({ 
  onSubmit, 
  onCancel, 
  isSubmitting 
}) => {
  const form = useForm<MeasurementFormValues>({
    resolver: zodResolver(measurementSchema),
    defaultValues: DEFAULT_FORM_VALUES
  });

  const handleSubmit = async (data: MeasurementFormValues) => {
    try {
      await onSubmit(data);
      form.reset(DEFAULT_FORM_VALUES);
    } catch (error) {
      // Error is handled by parent component
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Measurement</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Date Field */}
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input {...field} type="date" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Measurement Fields Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {MEASUREMENT_FIELDS.map((fieldConfig) => (
                <FormField
                  key={fieldConfig.key}
                  control={form.control}
                  name={fieldConfig.key as keyof MeasurementFormValues}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center space-x-2">
                        <span className="text-gray-500">{fieldConfig.icon}</span>
                        <span>{fieldConfig.label} ({fieldConfig.unit})</span>
                      </FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="number" 
                          step="0.1" 
                          min="0" 
                          placeholder={fieldConfig.placeholder}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>
            
            {/* Notes Field */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (optional)</FormLabel>
                  <FormControl>
                    <textarea 
                      {...field}
                      className="flex h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Optional notes about your measurements"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Action Buttons */}
            <div className="flex justify-end space-x-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="blue" 
                isLoading={isSubmitting}
                className="min-w-[120px]"
              >
                Save Measurements
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

interface MeasurementItemProps {
  measurement: ClientProgress;
}

const MeasurementItem: React.FC<MeasurementItemProps> = ({ measurement }) => {
  const displays = useMemo(() => getMeasurementDisplays(measurement), [measurement]);
  
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors">
      <div className="flex items-center">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-[#007bff] mr-3">
          <Icon name="chart-line" size={16} />
        </div>
        <div>
          <p className="font-medium">
            {formatDate(measurement.date)} Measurements
          </p>
          <p className="text-xs text-gray-500">
            {displays.map(display => display.value).join(', ')}
          </p>
          {measurement.notes && (
            <p className="text-xs text-gray-400 mt-1 italic">
              Note: {measurement.notes}
            </p>
          )}
        </div>
      </div>
      <div className="text-right">
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          {displays.length} measurement{displays.length !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  );
};

interface MeasurementsListProps {
  measurements: ClientProgress[];
  maxDisplay?: number;
}

const MeasurementsList: React.FC<MeasurementsListProps> = ({ 
  measurements, 
  maxDisplay = 5 
}) => {
  const displayedMeasurements = measurements.slice(0, maxDisplay);
  const hasMore = measurements.length > maxDisplay;

  return (
    <div className="space-y-2">
      {displayedMeasurements.map((measurement) => (
        <MeasurementItem key={measurement.id} measurement={measurement} />
      ))}
      
      {hasMore && (
        <Button variant="outline" size="sm" className="w-full mt-3">
          View All {measurements.length} Measurements
        </Button>
      )}
    </div>
  );
};

const EmptyState: React.FC<{ onAddFirst: () => void }> = ({ onAddFirst }) => (
  <div className="text-center py-8">
    <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 mb-4">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-gray-500">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    </div>
    <h3 className="text-lg font-medium text-gray-800 mb-2">No Measurements</h3>
    <p className="text-gray-600 mb-6">
      Start tracking your body measurements to see your progress over time.
    </p>
    <Button variant="blue" size="sm" onClick={onAddFirst}>
      Add Your First Measurement
    </Button>
  </div>
);

// ============================================================================
// CUSTOM HOOK
// ============================================================================

const useMeasurementTracker = (onAddMeasurement: (measurement: MeasurementFormValues) => Promise<void>) => {
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = useCallback(async (data: MeasurementFormValues) => {
    try {
      setIsSubmitting(true);
      await onAddMeasurement(data);
      setShowForm(false);
      showSuccessToast('Measurement added successfully');
    } catch (error) {
      console.error('Form submission error:', error);
      showErrorToast(error, 'Failed to add measurement');
      throw error; // Re-throw so form can handle it
    } finally {
      setIsSubmitting(false);
    }
  }, [onAddMeasurement]);

  const handleToggleForm = useCallback(() => {
    setShowForm(prev => !prev);
  }, []);

  const handleCancelForm = useCallback(() => {
    setShowForm(false);
  }, []);

  const handleAddFirst = useCallback(() => {
    setShowForm(true);
  }, []);

  return {
    showForm,
    isSubmitting,
    handleSubmit,
    handleToggleForm,
    handleCancelForm,
    handleAddFirst
  };
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const MeasurementTracker: React.FC<MeasurementTrackerProps> = ({
  measurements = [],
  onAddMeasurement,
  isLoading = false
}) => {
  const {
    showForm,
    isSubmitting,
    handleSubmit,
    handleToggleForm,
    handleCancelForm,
    handleAddFirst
  } = useMeasurementTracker(onAddMeasurement);

  return (
    <Card>
      <Header 
        showForm={showForm}
        onToggleForm={handleToggleForm}
        isSubmitting={isSubmitting}
      />
      
      <CardContent>
        {isLoading ? (
          <LoadingState />
        ) : showForm ? (
          <MeasurementForm
            onSubmit={handleSubmit}
            onCancel={handleCancelForm}
            isSubmitting={isSubmitting}
          />
        ) : measurements.length > 0 ? (
          <MeasurementsList measurements={measurements} />
        ) : (
          <EmptyState onAddFirst={handleAddFirst} />
        )}
      </CardContent>
    </Card>
  );
};

export default MeasurementTracker;