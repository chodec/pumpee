// src/components/features/client/MeasurementTracker.tsx - Cleaned and refactored
import React, { useState, useCallback } from 'react';
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
import { ClientProgress } from '@/lib/types';

// ============================================================================
// FORM SCHEMA & VALIDATION
// ============================================================================

const measurementSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  body_weight: z.string().optional()
    .transform(val => val === '' || val === undefined ? null : parseFloat(val))
    .refine(val => val === null || (!isNaN(val) && val > 0), { 
      message: 'Weight must be a positive number' 
    }),
  chest_size: z.string().optional()
    .transform(val => val === '' || val === undefined ? null : parseFloat(val))
    .refine(val => val === null || (!isNaN(val) && val > 0), { 
      message: 'Chest size must be a positive number' 
    }),
  waist_size: z.string().optional()
    .transform(val => val === '' || val === undefined ? null : parseFloat(val))
    .refine(val => val === null || (!isNaN(val) && val > 0), { 
      message: 'Waist size must be a positive number' 
    }),
  biceps_size: z.string().optional()
    .transform(val => val === '' || val === undefined ? null : parseFloat(val))
    .refine(val => val === null || (!isNaN(val) && val > 0), { 
      message: 'Arms size must be a positive number' 
    }),
  thigh_size: z.string().optional()
    .transform(val => val === '' || val === undefined ? null : parseFloat(val))
    .refine(val => val === null || (!isNaN(val) && val > 0), { 
      message: 'Legs size must be a positive number' 
    }),
  notes: z.string().optional()
}).refine(data => {
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
// TYPES & INTERFACES
// ============================================================================

export interface MeasurementTrackerProps {
  measurements: ClientProgress[];
  onAddMeasurement: (measurement: MeasurementFormValues) => Promise<void>;
  isLoading?: boolean;
}

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

// ============================================================================
// COMPONENT PARTS
// ============================================================================

const LoadingState: React.FC = () => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between">
      <CardTitle>Body Measurements</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="flex justify-center items-center min-h-[200px]">
        <LoadingSpinner size="md" />
        <p className="ml-3 text-gray-500">Loading measurements...</p>
      </div>
    </CardContent>
  </Card>
);

interface EmptyStateProps {
  onCreateFirst: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ onCreateFirst }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between">
      <CardTitle>Body Measurements</CardTitle>
      <Button variant="blue" size="sm" onClick={onCreateFirst}>
        Add Measurement
      </Button>
    </CardHeader>
    <CardContent>
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
        <Button variant="blue" size="sm" onClick={onCreateFirst}>
          Add Your First Measurement
        </Button>
      </div>
    </CardContent>
  </Card>
);

interface MeasurementFormProps {
  onSubmit: (data: MeasurementFormValues) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

const MeasurementForm: React.FC<MeasurementFormProps> = ({ onSubmit, onCancel, isSubmitting }) => {
  const form = useForm<MeasurementFormValues>({
    resolver: zodResolver(measurementSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      body_weight: '',
      chest_size: '',
      waist_size: '',
      biceps_size: '',
      thigh_size: '',
      notes: ''
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Measurement</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="body_weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weight (kg)</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" step="0.1" min="0" placeholder="0.0" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="chest_size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chest (cm)</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" step="0.1" min="0" placeholder="0.0" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="waist_size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Waist (cm)</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" step="0.1" min="0" placeholder="0.0" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="biceps_size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Arms (cm)</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" step="0.1" min="0" placeholder="0.0" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="thigh_size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Legs (cm)</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" step="0.1" min="0" placeholder="0.0" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
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

interface MeasurementListProps {
  measurements: ClientProgress[];
  onAddNew: () => void;
}

const MeasurementList: React.FC<MeasurementListProps> = ({ measurements, onAddNew }) => {
  const displayMeasurements = measurements.slice(0, 5);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Body Measurements</CardTitle>
        <Button variant="blue" size="sm" onClick={onAddNew}>
          Add Measurement
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {displayMeasurements.map((measurement) => {
            const displays = [];
            if (measurement.body_weight) displays.push(`Weight: ${measurement.body_weight}kg`);
            if (measurement.chest_size) displays.push(`Chest: ${measurement.chest_size}cm`);
            if (measurement.waist_size) displays.push(`Waist: ${measurement.waist_size}cm`);
            if (measurement.biceps_size) displays.push(`Arms: ${measurement.biceps_size}cm`);
            if (measurement.thigh_size) displays.push(`Legs: ${measurement.thigh_size}cm`);

            return (
              <div key={measurement.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors">
                <div className="flex items-center">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-[#007bff] mr-3">
                    <Icon name="chart-line" size={16} />
                  </div>
                  <div>
                    <p className="font-medium">
                      {formatDate(measurement.date)} 
                    </p>
                    <p className="text-xs text-gray-500">
                      {displays.join(', ')}
                    </p>
                    {measurement.notes && (
                      <p className="text-xs text-gray-400 mt-1 italic">
                        Note: {measurement.notes}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          
          {measurements.length > 5 && (
            <Button variant="outline" size="sm" className="w-full mt-3">
              View All {measurements.length} Measurements
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const MeasurementTracker: React.FC<MeasurementTrackerProps> = ({
  measurements = [],
  onAddMeasurement,
  isLoading = false
}) => {
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
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [onAddMeasurement]);

  const handleCancel = useCallback(() => {
    setShowForm(false);
  }, []);

  const handleShowForm = useCallback(() => {
    setShowForm(true);
  }, []);

  // Loading state
  if (isLoading) {
    return <LoadingState />;
  }

  // Form state
  if (showForm) {
    return (
      <MeasurementForm 
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
      />
    );
  }

  // Empty state
  if (measurements.length === 0) {
    return <EmptyState onCreateFirst={handleShowForm} />;
  }

  // List state
  return <MeasurementList measurements={measurements} onAddNew={handleShowForm} />;
};

export default MeasurementTracker;