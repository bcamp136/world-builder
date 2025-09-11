// This file contains functions for making API calls to our backend serverless functions
// that interact with the Stripe API

// Base URL for API calls - should be your serverless function endpoint
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Types for Stripe API responses
type StripeProduct = {
  id: string;
  name: string;
  description?: string;
  active: boolean;
  metadata: Record<string, string>;
};

type StripePrice = {
  id: string;
  product: string;
  unit_amount: number;
  currency: string;
  recurring: {
    interval: string;
  };
  metadata: Record<string, string>;
};

type CheckoutSession = {
  id: string;
  url: string;
};

type CustomerSubscription = {
  id: string;
  status: string;
  current_period_end: number;
  current_period_start: number;
  plan: {
    id: string;
    nickname: string;
    amount: number;
    interval: string;
    product: string;
  };
  metadata: Record<string, string>;
};

// API functions for Stripe operations
export const stripeApi = {
  // Get all subscription products
  getProducts: async (): Promise<StripeProduct[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/products`);
      if (!response.ok) throw new Error('Failed to fetch products');
      return response.json();
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  },

  // Get prices for a specific product
  getPrices: async (productId: string): Promise<StripePrice[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/prices?product=${productId}`);
      if (!response.ok) throw new Error('Failed to fetch prices');
      return response.json();
    } catch (error) {
      console.error('Error fetching prices:', error);
      return [];
    }
  },

  // Create a checkout session for subscription
  createCheckoutSession: async (priceId: string, customerId?: string): Promise<CheckoutSession | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          customerId,
          successUrl: `${window.location.origin}/account?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/pricing`,
        }),
      });
      
      if (!response.ok) throw new Error('Failed to create checkout session');
      return response.json();
    } catch (error) {
      console.error('Error creating checkout session:', error);
      return null;
    }
  },

  // Get customer subscription details
  getCustomerSubscription: async (customerId: string): Promise<CustomerSubscription | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/customer-subscription/${customerId}`);
      if (!response.ok) throw new Error('Failed to fetch subscription');
      return response.json();
    } catch (error) {
      console.error('Error fetching subscription:', error);
      return null;
    }
  },

  // Cancel a subscription
  cancelSubscription: async (subscriptionId: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/cancel-subscription/${subscriptionId}`, {
        method: 'POST',
      });
      return response.ok;
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      return false;
    }
  }
};
