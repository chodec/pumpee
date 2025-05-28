import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/organisms/DashboardLayout';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import Icon from '@/components/atoms/Icon';
import LoadingSpinner from '@/components/atoms/LoadingSpinner';
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
import { USER_TYPES } from '@/lib/constants';
import { TrainerAPI, TrainerSubscriptionTier, CreateTrainerSubscriptionData } from '@/lib/api';

// Schema
const createSubscriptionSchema = z.object({
  name: z.string().min(1, 'Plan name is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.string()
    .min(1, 'Price is required')
    .transform(val => parseFloat(val))
    .refine(val => val > 0, 'Price must be greater than 0'),
  yearly_price: z.string()
    .optional()
    .transform(val => val === '' || val === undefined ? null : parseFloat(val))
    .refine(val => val === null || val > 0, 'Yearly price must be greater than 0'),
  billing_cycle: z.enum(['monthly', 'yearly'])
});

type CreateSubscriptionFormValues = z.infer<typeof createSubscriptionSchema>;

export default function TrainerSubscriptionPlans() {
  const [subscriptions, setSubscriptions] = useState<TrainerSubscriptionTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const form = useForm<CreateSubscriptionFormValues>({
    resolver: zodResolver(createSubscriptionSchema),
    defaultValues: {
      name: '',
      description: '',
      price: '',
      yearly_price: '',
      billing_cycle: 'monthly'
    }
  });

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const data = await TrainerAPI.getTrainerSubscriptionTiers();
      setSubscriptions(data);
    } catch (error) {
      showErrorToast(error, 'Failed to load subscription plans');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const handleCreateSubscription = async (data: CreateSubscriptionFormValues) => {
    try {
      setSubmitting(true);
      
      const subscriptionData: CreateTrainerSubscriptionData = {
        name: data.name,
        description: data.description,
        price: data.price,
        yearly_price: data.yearly_price,
        billing_cycle: data.billing_cycle
      };
      
      if (editingId) {
        const updated = await TrainerAPI.updateTrainerSubscriptionTier(editingId, subscriptionData);
        setSubscriptions(prev => prev.map(sub => sub.id === editingId ? updated : sub));
        showSuccessToast('Subscription plan updated successfully');
        setEditingId(null);
      } else {
        const newSubscription = await TrainerAPI.createTrainerSubscriptionTier(subscriptionData);
        setSubscriptions(prev => [newSubscription, ...prev]);
        showSuccessToast('Subscription plan created successfully');
      }
      
      form.reset();
      setShowForm(false);
    } catch (error) {
      showErrorToast(error, 'Failed to save subscription plan');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubscription = (subscription: TrainerSubscriptionTier) => {
    form.reset({
      name: subscription.name,
      description: subscription.description,
      price: subscription.price.toString(),
      yearly_price: subscription.yearly_price?.toString() || '',
      billing_cycle: subscription.billing_cycle
    });
    setEditingId(subscription.id);
    setShowForm(true);
  };

  const handleDeleteSubscription = async (id: string) => {
    if (!confirm('Are you sure you want to delete this subscription plan? This action cannot be undone.')) return;
    
    try {
      await TrainerAPI.deleteTrainerSubscriptionTier(id);
      setSubscriptions(prev => prev.filter(sub => sub.id !== id));
      showSuccessToast('Subscription plan deleted successfully');
    } catch (error) {
      showErrorToast(error, 'Failed to delete subscription plan');
    }
  };

  const handleCancelForm = () => {
    form.reset();
    setShowForm(false);
    setEditingId(null);
  };

  const formatPrice = (subscription: TrainerSubscriptionTier) => {
    if (subscription.billing_cycle === 'yearly' && subscription.yearly_price) {
      return `${subscription.yearly_price} CZK/year`;
    }
    return `${subscription.price} CZK/${subscription.billing_cycle === 'monthly' ? 'month' : 'year'}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getBillingInfo = (subscription: TrainerSubscriptionTier) => {
    const monthlyPrice = `${subscription.price} CZK/month`;
    const yearlyPrice = subscription.yearly_price ? `${subscription.yearly_price} CZK/year` : null;
    
    if (subscription.billing_cycle === 'yearly' && yearlyPrice) {
      return yearlyPrice;
    } else if (yearlyPrice) {
      return `${monthlyPrice} • ${yearlyPrice}`;
    } else {
      return monthlyPrice;
    }
  };

  if (loading) {
    return (
      <DashboardLayout userType={USER_TYPES.TRAINER}>
        <div className="flex justify-center items-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType={USER_TYPES.TRAINER}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#040b07]">My Subscription Plans</h1>
            <p className="text-gray-600">Create subscription plans that clients can purchase</p>
          </div>
          <Button 
            variant="blue" 
            onClick={() => setShowForm(true)} 
            disabled={showForm}
          >
            <Icon name="credit-card" size={16} className="mr-2" />
            Create Plan
          </Button>
        </div>

        {/* Create/Edit Form */}
        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>{editingId ? 'Edit Subscription Plan' : 'Create New Subscription Plan'}</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleCreateSubscription)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Plan Name</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g., Premium Coaching" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="billing_cycle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Billing Cycle</FormLabel>
                          <FormControl>
                            <select 
                              {...field} 
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            >
                              <option value="monthly">Monthly</option>
                              <option value="yearly">Yearly</option>
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Monthly Price (CZK)</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" placeholder="500" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="yearly_price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Yearly Price (CZK) - Optional</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" placeholder="5000" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <textarea 
                            {...field}
                            className="flex h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            placeholder="Describe what's included in this plan..."
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
                      onClick={handleCancelForm} 
                      disabled={submitting}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      variant="blue" 
                      isLoading={submitting}
                    >
                      {editingId ? 'Update Plan' : 'Create Plan'}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}

        {/* Subscription Plans List */}
        {subscriptions.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 mb-4">
                <Icon name="credit-card" size={24} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Subscription Plans</h3>
              <p className="text-gray-600 mb-6">Create subscription plans that clients can purchase to work with you.</p>
              <Button variant="blue" onClick={() => setShowForm(true)}>
                <Icon name="credit-card" size={16} className="mr-2" />
                Create Your First Plan
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subscriptions.map((subscription) => (
              <Card key={subscription.id} className="hover:shadow-md transition-shadow duration-200">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-lg mb-1">
                        {subscription.name}
                      </h3>
                      <div className="text-lg font-bold text-[#007bff] mb-2">
                        {getBillingInfo(subscription)}
                      </div>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {subscription.billing_cycle === 'monthly' ? 'Monthly' : 'Yearly'} Billing
                      </span>
                    </div>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleEditSubscription(subscription)}
                        className="p-2 text-gray-400 hover:text-[#007bff] transition-colors"
                        title="Edit plan"
                      >
                        <Icon name="user" size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteSubscription(subscription.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete plan"
                      >
                        <Icon name="x" size={16} />
                      </button>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {subscription.description}
                  </p>

                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center text-xs text-gray-500 mb-2">
                      <span>Created {formatDate(subscription.created_at)}</span>
                      <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-800 font-medium">
                        Active
                      </span>
                    </div>
                    <button 
                      onClick={async () => {
                        try {
                          const clients = await TrainerAPI.getClientsForSubscriptionTier(subscription.id);
                          if (clients.length === 0) {
                            showSuccessToast('No clients subscribed to this plan yet');
                          } else {
                            showSuccessToast(`${clients.length} client(s) subscribed to this plan`);
                          }
                        } catch (error) {
                          showErrorToast(error, 'Failed to load subscribers');
                        }
                      }}
                      className="text-xs text-[#007bff] hover:underline"
                    >
                      View Subscribers
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}