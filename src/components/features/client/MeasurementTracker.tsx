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
import { RadioGroup, RadioGroupItem } from '@/components/molecules/RadioGroup';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { showSuccessToast, showErrorToast } from '@/lib/errors';

// Define the measurement types
const measurementTypes = [
  { id: 'weight', label: 'Weight', unit: 'kg', icon: 'user' },
  { id: 'waist', label: 'Waist', unit: 'cm', icon: 'user' },
  { id: 'chest', label: 'Chest', unit: 'cm', icon: 'user' },
  { id: 'arms', label: 'Arms', unit: 'cm', icon: 'user' },
  { id: 'legs', label: 'Legs', unit: 'cm', icon: 'user' }
];

// Form schema
const measurementSchema = z.object({
  type: z.string().min(1, 'Please select a measurement type'),
  value: z.string().min(1, 'Value is required').refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
    { message: 'Please enter a valid number greater than 0' }
  ),
  date: z.string().min(1, 'Date is required')
});

type MeasurementFormValues = z.infer<typeof measurementSchema>;

export const MeasurementTracker: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [measurements, setMeasurements] = useState<any[]>([
    // Mock data for example - in a real app, would fetch from API
    { id: 1, type: 'weight', value: 78.5, unit: 'kg', date: '2025-05-10' },
    { id: 2, type: 'waist', value: 82, unit: 'cm', date: '2025-05-10' }
  ]);

  const form = useForm<MeasurementFormValues>({
    resolver: zodResolver(measurementSchema),
    defaultValues: {
      type: '',
      value: '',
      date: new Date().toISOString().split('T')[0]
    }
  });

  const onSubmit = async (data: MeasurementFormValues) => {
    try {
      // In a real app, you would save to database
      // await ClientAPI.addMeasurement(data);
      
      // Add to local state
      const measurementType = measurementTypes.find(m => m.id === data.type);
      const newMeasurement = {
        id: Date.now(),
        type: data.type,
        value: parseFloat(data.value),
        unit: measurementType?.unit || '',
        date: data.date
      };
      
      setMeasurements([newMeasurement, ...measurements]);
      form.reset();
      setShowForm(false);
      showSuccessToast('Measurement added successfully');
    } catch (error) {
      showErrorToast(error, 'Failed to add measurement');
    }
  };

  const getMeasurementLabel = (type: string) => {
    return measurementTypes.find(m => m.id === type)?.label || type;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Body Measurements</CardTitle>
        <Button 
          variant={showForm ? "outline" : "blue"} 
          size="sm"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : 'Add Measurement'}
        </Button>
      </CardHeader>
      <CardContent>
        {showForm ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Measurement Type</FormLabel>
                    <div className="grid grid-cols-2 gap-2">
                      {measurementTypes.map((type) => (
                        <div key={type.id} className="flex items-center">
                          <input
                            type="radio"
                            id={`type-${type.id}`}
                            className="sr-only"
                            {...field}
                            value={type.id}
                            checked={field.value === type.id}
                          />
                          <label
                            htmlFor={`type-${type.id}`}
                            className={`flex-1 cursor-pointer rounded-md border p-2 text-center text-sm ${
                              field.value === type.id
                                ? 'border-[#007bff] bg-blue-50 text-[#007bff]'
                                : 'border-gray-200 hover:border-[#007bff]/50'
                            }`}
                          >
                            {type.label}
                          </label>
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Value</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" step="0.1" min="0" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
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
              </div>
              
              <Button type="submit" variant="blue" className="w-full">
                Save Measurement
              </Button>
            </form>
          </Form>
        ) : (
          <>
            {measurements.length > 0 ? (
              <div className="space-y-2">
                {measurements.map((measurement) => (
                  <div 
                    key={measurement.id} 
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                  >
                    <div className="flex items-center">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-[#007bff] mr-3">
                        <Icon name="user" size={16} />
                      </div>
                      <div>
                        <p className="font-medium">
                          {getMeasurementLabel(measurement.type)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(measurement.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="font-bold">
                      {measurement.value} {measurement.unit}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
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