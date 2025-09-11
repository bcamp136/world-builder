# Setting Up Stripe Integration for World Builder

This guide explains how to set up the serverless functions needed for Stripe integration with the World Builder application.

## Prerequisites

1. Node.js 18+ installed
2. A Stripe account (sign up at [stripe.com](https://stripe.com))
3. The World Builder codebase

## Getting Your Stripe API Keys

1. Log in to your [Stripe Dashboard](https://dashboard.stripe.com/)
2. Navigate to Developers > API keys
3. You'll need:
   - Publishable key (starts with `pk_test_` or `pk_live_`)
   - Secret key (starts with `sk_test_` or `sk_live_`)

## Setting Up Environment Variables

1. Copy the `.env.example` file to `.env` if you haven't already
2. Update the following variables:

```
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
VITE_API_BASE_URL=http://localhost:3000/api
VITE_APP_URL=http://localhost:5173
```

## Creating Stripe Products and Price IDs

1. Log in to your [Stripe Dashboard](https://dashboard.stripe.com/)
2. Navigate to Products > Add Product
3. Create three products matching our plans:

### Basic Plan

- Name: World Builder Basic
- Description: Access to essential world building features with 1,000 AI requests per month.
- Price: $9.99/month recurring
- Add metadata: `plan_type: basic`

### Pro Plan

- Name: World Builder Pro
- Description: Advanced world building features with 20,000 AI requests per month.
- Price: $19.99/month recurring
- Add metadata: `plan_type: pro`

### Enterprise Plan

- Name: World Builder Enterprise
- Description: Unlimited world building capabilities with advanced AI models.
- Price: $49.99/month recurring
- Add metadata: `plan_type: enterprise`

4. After creating each product, copy the Price IDs to your `.env` file:

```
VITE_STRIPE_PRICE_ID_BASIC=price_your_basic_price_id
VITE_STRIPE_PRICE_ID_PRO=price_your_pro_price_id
VITE_STRIPE_PRICE_ID_ENTERPRISE=price_your_enterprise_price_id
```

## Setting Up Serverless Functions

You can set up serverless functions using any of these approaches:

### Option 1: Using Vercel Serverless Functions

The repo now includes TypeScript Vercel function handlers in the `/api` directory:

| Endpoint                                      | File                           | Method | Purpose                              |
| --------------------------------------------- | ------------------------------ | ------ | ------------------------------------ |
| /api/products                                 | api/products.ts                | GET    | List active products                 |
| /api/prices?product=prod_123                  | api/prices.ts                  | GET    | List prices for a product            |
| /api/create-checkout-session                  | api/create-checkout-session.ts | POST   | Create subscription checkout session |
| /api/customer-subscription?customerId=cus_123 | api/customer-subscription.ts   | GET    | Fetch active subscription            |
| /api/cancel-subscription                      | api/cancel-subscription.ts     | POST   | Cancel an active subscription        |
| /api/webhook                                  | api/webhook.ts                 | POST   | Receives Stripe webhook events       |

These are deployed automatically by Vercel (no additional configuration needed). Ensure `STRIPE_SECRET_KEY` is configured in your Vercel project settings (Environment Variables -> STRIPE_SECRET_KEY).

Example `curl` tests (after deployment):

```bash
curl https://your-app.vercel.app/api/products
curl "https://your-app.vercel.app/api/prices?product=prod_123"
curl -X POST https://your-app.vercel.app/api/create-checkout-session \
  -H 'Content-Type: application/json' \
  -d '{"priceId":"price_123","successUrl":"https://your-app.vercel.app/account?session_id={CHECKOUT_SESSION_ID}","cancelUrl":"https://your-app.vercel.app/pricing"}'
```

Local dev note: Vercel CLI can emulate these with `vercel dev`.

Webhook setup:

1. Create a webhook in Stripe Dashboard pointing to `https://your-app.vercel.app/api/webhook`
2. Subscribe to events listed below (or all for testing)
3. Add the signing secret (starts with `whsec_`) to Vercel env as `STRIPE_WEBHOOK_SECRET`
4. For local testing:

```bash
stripe listen --forward-to localhost:3000/api/webhook
```

5. Copy the printed `webhook signing secret` into your local `.env` as `STRIPE_WEBHOOK_SECRET`

### Option 2: Using Netlify Functions

If you're deploying on Netlify, you can use Netlify Functions by creating a `netlify/functions` directory and implementing the same logic.

### Option 3: Using Express Server

For local development, you can create a simple Express server:

1. Create a `server` directory
2. Install dependencies:

```bash
npm install express stripe cors dotenv
```

3. Create a `server/index.js` file:

```javascript
const express = require('express')
const cors = require('cors')
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
require('dotenv').config()

const app = express()
const port = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

// Get all products
app.get('/api/products', async (req, res) => {
  try {
    const products = await stripe.products.list({
      active: true,
      limit: 100,
    })
    res.status(200).json(products.data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get prices for a product
app.get('/api/prices', async (req, res) => {
  try {
    const { product } = req.query
    const prices = await stripe.prices.list({
      product,
      active: true,
      limit: 100,
    })
    res.status(200).json(prices.data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Create checkout session
app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const { priceId, customerId, successUrl, cancelUrl } = req.body
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      ...(customerId ? { customer: customerId } : {}),
    })
    res.status(200).json({ id: session.id, url: session.url })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get customer subscription
app.get('/api/customer-subscription/:customerId', async (req, res) => {
  try {
    const { customerId } = req.params
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'active',
      expand: ['data.plan.product'],
    })

    if (subscriptions.data.length === 0) {
      return res.status(404).json({ error: 'No active subscriptions found' })
    }

    res.status(200).json(subscriptions.data[0])
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Cancel subscription
app.post('/api/cancel-subscription/:subscriptionId', async (req, res) => {
  try {
    const { subscriptionId } = req.params
    await stripe.subscriptions.cancel(subscriptionId)
    res.status(200).json({ success: true })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})
```

4. Start the server:

```bash
node server/index.js
```

## Testing Your Integration

1. Fill in your Stripe API keys in the `.env` file
2. Start the server (if using Express option)
3. Run the World Builder application
4. Try subscribing to a plan using the Checkout button
5. After successful payment, you should be redirected back to the application

## Webhook Integration (Optional, for Production)

For full integration, you should set up webhooks to handle subscription events (cancellations, renewals, etc.):

1. In the Stripe Dashboard, go to Developers > Webhooks
2. Add an endpoint for your production URL
3. Subscribe to events:
   - `checkout.session.completed`
   - `invoice.paid`
   - `invoice.payment_failed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Create a webhook handler endpoint in your serverless functions
