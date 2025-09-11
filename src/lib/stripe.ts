// Stripe.js integration for React
import { loadStripe } from '@stripe/stripe-js';
import type { Stripe } from '@stripe/stripe-js';

// Initialize Stripe with your publishable key
// This should be your actual publishable key from Stripe Dashboard
// The key should be stored in an environment variable (VITE_STRIPE_PUBLISHABLE_KEY)
let stripePromise: Promise<Stripe | null> | null = null;

// Function to get the Stripe instance
export const getStripe = () => {
  if (!stripePromise) {
    const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
    if (!key) {
      console.error('Stripe publishable key is not defined in environment variables');
      return null;
    }
    stripePromise = loadStripe(key);
  }
  return stripePromise;
};

// Import our API client for Stripe serverless functions
import { stripeApi } from './stripe-api';

// Define plan tiers and their entitlements
export const SUBSCRIPTION_PLANS = {
  BASIC: 'basic',
  PRO: 'pro',
  ENTERPRISE: 'enterprise'
};

// Plan entitlements configuration
export const PLAN_ENTITLEMENTS = {
  [SUBSCRIPTION_PLANS.BASIC]: {
    name: 'Basic',
    requestsPerMonth: 1000,
    requestsPerDay: 50,
    requestsPerMinute: 5,
    allowedModels: ['gpt-4o-mini'],
    storageLimit: 1 * 1024 * 1024 * 1024, // 1 GB in bytes
    elements: 100, // Max number of world elements
  },
  [SUBSCRIPTION_PLANS.PRO]: {
    name: 'Pro',
    requestsPerMonth: 20000,
    requestsPerDay: 500,
    requestsPerMinute: 20,
    allowedModels: ['gpt-4o-mini', 'gpt-4o', 'claude-3-sonnet-20240620'],
    storageLimit: 20 * 1024 * 1024 * 1024, // 20 GB in bytes
    elements: 2000, // Max number of world elements
  },
  [SUBSCRIPTION_PLANS.ENTERPRISE]: {
    name: 'Enterprise',
    requestsPerMonth: Number.MAX_SAFE_INTEGER, // Unlimited
    requestsPerDay: Number.MAX_SAFE_INTEGER, // Unlimited
    requestsPerMinute: 60,
    allowedModels: ['gpt-4o-mini', 'gpt-4o', 'gpt-4-turbo', 'claude-3-opus-20240229', 'claude-3-sonnet-20240620', 'claude-3-5-sonnet-20240620'],
    storageLimit: 200 * 1024 * 1024 * 1024, // 200 GB in bytes
    elements: Number.MAX_SAFE_INTEGER, // Unlimited elements
  }
};

// This is now handled by the backend/serverless functions
// Helper function to fetch subscription products from Stripe
export const fetchSubscriptionProducts = async () => {
  try {
    const products = await stripeApi.getProducts();
    console.log('Subscription products fetched successfully');
    return products;
  } catch (error) {
    console.error('Error fetching subscription products:', error);
    return [];
  }
};

// Function to create a checkout session for subscription
export const createCheckoutSession = async (priceId: string, customerId?: string) => {
  try {
    const session = await stripeApi.createCheckoutSession(priceId, customerId);
    return session;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return null;
  }
};

// Function to get a customer's subscription information
export const getCustomerSubscription = async (customerId: string) => {
  try {
    const subscription = await stripeApi.getCustomerSubscription(customerId);
    return subscription;
  } catch (error) {
    console.error('Error fetching customer subscription:', error);
    return null;
  }
};

// Function to cancel a subscription
export const cancelSubscription = async (subscriptionId: string) => {
  try {
    const success = await stripeApi.cancelSubscription(subscriptionId);
    return success;
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    return false;
  }
};

// Create a StripeFunctions object that exports all the functions
const StripeFunctions = {
  getStripe,
  fetchSubscriptionProducts,
  createCheckoutSession,
  getCustomerSubscription,
  cancelSubscription
};

export default StripeFunctions;
