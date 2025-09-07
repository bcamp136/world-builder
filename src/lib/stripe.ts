// For frontend/development we're just defining types and constants
// A real implementation would use the Stripe SDK on the server side
// This is a simplified mock of the Stripe SDK for development purposes

// Initialize Stripe client - mock implementation for frontend
const stripe = {
  apiVersion: '2023-10-16',
  products: {
    create: async (options: any) => ({ id: 'mock-product-id', ...options })
  },
  prices: {
    create: async (options: any) => ({ id: 'mock-price-id', ...options })
  },
  checkout: {
    sessions: {
      create: async (options: any) => ({ 
        id: 'mock-session-id',
        url: 'https://example.com/checkout',
        ...options
      })
    }
  }
};

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

// Helper function to create subscription products in Stripe
export const createSubscriptionProducts = async () => {
  try {
    // Create Basic product
    const basicProduct = await stripe.products.create({
      name: 'World Builder Basic',
      description: 'Access to essential world building features with 1,000 AI requests per month.',
    });

    await stripe.prices.create({
      product: basicProduct.id,
      unit_amount: 999, // $9.99
      currency: 'usd',
      recurring: {
        interval: 'month',
      },
      metadata: {
        plan_type: SUBSCRIPTION_PLANS.BASIC,
      },
    });

    // Create Pro product
    const proProduct = await stripe.products.create({
      name: 'World Builder Pro',
      description: 'Advanced world building features with 20,000 AI requests per month.',
    });

    await stripe.prices.create({
      product: proProduct.id,
      unit_amount: 1999, // $19.99
      currency: 'usd',
      recurring: {
        interval: 'month',
      },
      metadata: {
        plan_type: SUBSCRIPTION_PLANS.PRO,
      },
    });

    // Create Enterprise product
    const enterpriseProduct = await stripe.products.create({
      name: 'World Builder Enterprise',
      description: 'Unlimited world building capabilities with advanced AI models.',
    });

    await stripe.prices.create({
      product: enterpriseProduct.id,
      unit_amount: 4999, // $49.99
      currency: 'usd',
      recurring: {
        interval: 'month',
      },
      metadata: {
        plan_type: SUBSCRIPTION_PLANS.ENTERPRISE,
      },
    });

    console.log('Subscription products created successfully');
    return true;
  } catch (error) {
    console.error('Error creating subscription products:', error);
    return false;
  }
};

// Function to create a checkout session for subscription
export const createCheckoutSession = async (priceId: string, customerId: string) => {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: `${import.meta.env.VITE_APP_URL}/account?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${import.meta.env.VITE_APP_URL}/pricing`,
    customer: customerId,
  });

  return session;
};

// Function to handle Stripe webhooks
export const handleStripeWebhook = async (event: { type: string; data: { object: Record<string, unknown> } }) => {
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        // Handle successful checkout
        // const checkoutSession = event.data.object;
        // Access event.data.object when implementing the user subscription update
        // TODO: Update user's subscription status in database
        break;
      }

      case 'invoice.paid': {
        // Handle successful invoice payment
        // const invoice = event.data.object;
        // Access event.data.object when implementing the subscription status update
        // TODO: Update user's subscription status in database
        break;
      }

      case 'invoice.payment_failed': {
        // Handle failed invoice payment
        // TODO: Notify user of payment failure and possibly downgrade plan
        break;
      }

      case 'customer.subscription.updated': {
        // Handle subscription updates
        // const subscription = event.data.object;
        // Access event.data.object when implementing the subscription update
        // TODO: Update user's subscription details in database
        break;
      }

      case 'customer.subscription.deleted':
        // Handle subscription cancellation
        // TODO: Downgrade user to free plan
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return true;
  } catch (error) {
    console.error('Error handling Stripe webhook:', error);
    return false;
  }
};

export default stripe;
