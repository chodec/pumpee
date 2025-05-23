// src/components/features/client/MeasurementTracker.tsx
import React, { useState } from 'react';
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

/**
 * Form schema for validating measurement input
 * Requires at least one measurement to be provided
 */
const measurementSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  body_weight: z.string().optional()
    .transform(val => val === '' ? null : parseFloat(val))
    .refine(val => val === null || !isNaN(val), { message: 'Weight must be a valid number' }),
  chest_size: z.string().optional()
    .transform(val => val === '' ? null : parseFloat(val))
    .refine(val => val === null || !isNaN(val), { message: 'Chest size must be a valid number' }),
  waist_size: z.string().optional()
    .transform(val => val === '' ? null : parseFloat(val))
    .refine(val => val === null || !isNaN(val), { message: 'Waist size must be a valid number' }),
  biceps_size: z.string().optional()
    .transform(val => val === '' ? null : parseFloat(val))
    .refine(val => val === null || !isNaN(val), { message: 'Biceps size must be a valid number' }),
  thigh_size: z.string().optional()
    .transform(val => val === '' ? null : parseFloat(val))
    .refine(val => val === null || !isNaN(val), { message: 'Thigh size must be a valid number' }),
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

// Type for form values derived from the schema
type MeasurementFormValues = z.infer<typeof measurementSchema>;

// Interface for client progress data from the database
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

// Props for the MeasurementTracker component
export interface MeasurementTrackerProps {
  measurements: ClientProgress[];
  onAddMeasurement: (measurement: MeasurementFormValues) => Promise<void>;
  isLoading?: boolean;
}

/**
 * MeasurementTracker Component
 * Displays client body measurements and allows adding new measurements
 */
export const MeasurementTracker: React.FC<MeasurementTrackerProps> = ({
  measurements = [],
  onAddMeasurement,
  isLoading = false
}) => {
  // Component state
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Setup form with validation
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

  /**
   * Handle form submission
   */
  const onSubmit = async (data: MeasurementFormValues) => {
    try {
      setSubmitting(true);
      await onAddMeasurement(data);
      showSuccessToast('Measurement added successfully');
      form.reset();
      setShowForm(false);
    } catch (error) {
      console.error('Form submission error:', error);
      showErrorToast(error, 'Failed to add measurement');
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Get human-readable label for measurement type
   */
  const getMeasurementLabel = (type: string): string => {
    const labels: Record<string, string> = {
      body_weight: 'Weight',
      chest_size: 'Chest',
      waist_size: 'Waist',
      biceps_size: 'Arms',
      thigh_size: 'Legs'
    };
    
    return labels[type] || type;
  };
  
  /**
   * Format date for display
   */
  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (e) {
      console.error("Invalid date format:", dateString);
      return dateString;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Body Measurements</CardTitle>
        <Button 
          variant={showForm ? "outline" : "blue"} 
          size="sm"
          onClick={() => setShowForm(!showForm)}
          disabled={submitting}
        >
          {showForm ? 'Cancel' : 'Add Measurement'}
        </Button>
      </CardHeader>
      <CardContent>
        {/* Loading state */}
        {isLoading ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <LoadingSpinner size="md" />
            <p className="ml-3 text-gray-500">Loading measurements...</p>
          </div>
        ) : showForm ? (
          /* Measurement input form */
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Date input */}
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
              
              {/* Weight and chest size */}
              <div className="grid grid-cols-2 gap-4">
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
              </div>
              
              {/* Waist and biceps size */}
              <div className="grid grid-cols-2 gap-4">
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
              </div>
              
              {/* Thigh size */}
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
              
              {/* Notes field */}
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
              
              {/* Submit button */}
              <Button type="submit" variant="blue" className="w-full" isLoading={submitting}>
                Save Measurements
              </Button>
            </form>
          </Form>
        ) : (
          <>
            {/* Measurements list or empty state */}
            {measurements && measurements.length > 0 ? (
              <div className="space-y-2">
                {/* Display up to 5 measurements */}
                {measurements.map((measurement) => (
                  <div 
                    key={measurement.id} 
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                  >
                    <div className="flex items-center">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-[#007bff] mr-3">
                        <Icon name="chart-line" size={16} />
                      </div>
                      <div>
                        <p className="font-medium">
                          {formatDate(measurement.date)} Data
                        </p>
                        <p className="text-xs text-gray-500">
                          {/* Display available measurements with labels */}
                          {[
                            measurement.body_weight !== null ? `Weight: ${measurement.body_weight}kg` : null,
                            measurement.chest_size !== null ? `Chest: ${measurement.chest_size}cm` : null,
                            measurement.waist_size !== null ? `Waist: ${measurement.waist_size}cm` : null,
                            measurement.biceps_size !== null ? `Arms: ${measurement.biceps_size}cm` : null,
                            measurement.thigh_size !== null ? `Legs: ${measurement.thigh_size}cm` : null
                          ].filter(Boolean).join(', ')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* View all button for more than 5 measurements */}
                {measurements.length > 5 && (
                  <Button variant="outline" size="sm" className="w-full mt-2">
                    View All Measurements
                  </Button>
                )}
              </div>
            ) : (
              /* Empty state when no measurements exist */
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
                <Button variant="blue" size="sm" onClick={() => setShowForm(true)}>
                  Add Your First Measurement
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default MeasurementTracker;