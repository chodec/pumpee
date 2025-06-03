// src/components/features/trainer/StripePaymentModal.tsx
import React, { useState, useEffect } from 'react';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/atoms/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/organisms/Card';
import { getStripe } from '@/lib/stripe';
import { showSuccessToast, showErrorToast } from '@/lib/errors';

interface PaymentFormProps {
  clientSecret: string;
  onSuccess: () => void;
  onCancel: () => void;
  planName: string;
  amount: number;
  billingCycle: string;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ 
  clientSecret, 
  onSuccess, 
  onCancel, 
  planName, 
  amount, 
  billingCycle 
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/trainer/subscriptions?success=true`,
        },
        redirect: 'if_required',
      });

      if (error) {
        showErrorToast(error, 'Payment failed');
      } else {
        showSuccessToast('Payment successful! Your subscription is now active.');
        onSuccess();
      }
    } catch (error: any) {
      showErrorToast(error, 'Payment processing failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Complete Your Subscription</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-900">{planName}</h3>
          <p className="text-blue-700">
            {amount} CZK/{billingCycle === 'yearly' ? 'year' : 'month'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <PaymentElement />
          
          <div className="flex space-x-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              disabled={isProcessing}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="blue" 
              isLoading={isProcessing}
              disabled={!stripe || isProcessing}
              className="flex-1"
            >
              {isProcessing ? 'Processing...' : 'Subscribe'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

interface StripePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  clientSecret: string;
  planName: string;
  amount: number;
  billingCycle: string;
}

const StripePaymentModal: React.FC<StripePaymentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  clientSecret,
  planName,
  amount,
  billingCycle
}) => {
  const [stripePromise, setStripePromise] = useState<any>(null);

  useEffect(() => {
    setStripePromise(getStripe());
  }, []);

  if (!isOpen || !clientSecret) return null;

  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: '#007bff',
      },
    },
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-auto">
        {stripePromise && (
          <Elements stripe={stripePromise} options={options}>
            <PaymentForm
              clientSecret={clientSecret}
              onSuccess={onSuccess}
              onCancel={onClose}
              planName={planName}
              amount={amount}
              billingCycle={billingCycle}
            />
          </Elements>
        )}
      </div>
    </div>
  );
};

export default StripePaymentModal;