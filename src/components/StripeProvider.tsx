import React from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { getStripe } from '../lib/stripe';

interface StripeProviderProps {
  children: React.ReactNode;
}

export const StripeProvider: React.FC<StripeProviderProps> = ({ children }) => {
  // Get the stripe instance
  const stripePromise = getStripe();

  return (
    <Elements stripe={stripePromise}>
      {children}
    </Elements>
  );
};
