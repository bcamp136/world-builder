import { useState } from 'react';
import { Button, Loader } from '@mantine/core';
import { useStripe } from '@stripe/react-stripe-js';
import { notifications } from '@mantine/notifications';
import { createCheckoutSession } from '../lib/stripe';

interface CheckoutButtonProps {
  priceId: string;
  customerId?: string;
  planName: string;
}

export const CheckoutButton: React.FC<CheckoutButtonProps> = ({
  priceId,
  customerId,
  planName,
}) => {
  const stripe = useStripe();
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = async () => {
    if (!stripe) {
      notifications.show({
        title: 'Error',
        message: 'Stripe has not been initialized',
        color: 'red',
      });
      return;
    }

    setIsLoading(true);

    try {
      // Create a checkout session
      const session = await createCheckoutSession(priceId, customerId);
      
      if (!session || !session.url) {
        throw new Error('Failed to create checkout session');
      }

      // Redirect to the checkout page
      window.location.href = session.url;
    } catch (error) {
      console.error('Error starting checkout:', error);
      notifications.show({
        title: 'Error',
        message: 'There was an error starting the checkout process. Please try again.',
        color: 'red',
      });
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleCheckout}
      loading={isLoading}
      disabled={!stripe || isLoading}
      color="blue"
      size="md"
      fullWidth
    >
      {isLoading ? <Loader size="sm" /> : `Subscribe to ${planName}`}
    </Button>
  );
};
