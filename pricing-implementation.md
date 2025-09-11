# World Builder - Pricing Plans Implementation

This document outlines the implementation of subscription pricing plans for the World Builder application using Vercel, Stripe, and Upstash.

## Subscription Tiers

The application offers three subscription tiers:

### Basic Plan ($9.99/month)

- 1,000 AI requests per month
- Access to basic AI models only (gpt-4o-mini)
- 1 GB storage limit
- 100 world elements maximum
- Rate limit: 5 requests/minute

### Pro Plan ($19.99/month)

- 20,000 AI requests per month
- Access to standard and advanced AI models
- 20 GB storage limit
- 2,000 world elements maximum
- Rate limit: 20 requests/minute

### Enterprise Plan ($49.99/month)

- Unlimited AI requests
- Access to all AI models including premium ones
- 200 GB storage limit
- Unlimited world elements
- Rate limit: 60 requests/minute

## Implementation Architecture

### Core Components

1. **Stripe Integration**
   - `lib/stripe.ts`: Initializes the Stripe client, manages subscription products/prices
   - Webhook handlers for subscription events (create, update, cancel)
   - Checkout session creation for subscription purchases

2. **Usage Tracking**
   - `lib/usage.ts`: Tracks and manages user usage metrics
   - Counters for API calls, tokens, storage, and world elements
   - Methods to reset daily/monthly counters

3. **Usage Enforcement Middleware**
   - `middleware/usage.ts`: Validates AI requests against user's plan limits
   - Enforces model access restrictions
   - Implements rate limiting and quota enforcement

4. **Storage Service**
   - `lib/storage-service.ts`: Manages file uploads with Vercel Blob
   - Tracks and limits storage usage based on user's plan

5. **Account Management UI**
   - `components/AccountPage.tsx`: User interface for plan selection and upgrades
   - Usage dashboard and analytics

### Usage Flow

1. User attempts to make an AI request (generate or stream)
2. Middleware checks if the request is allowed based on:
   - User's current plan tier
   - Monthly/daily request quota remaining
   - Rate limiting (requests per minute)
   - Model access permissions
3. If allowed, the request proceeds and usage metrics are updated
4. If not allowed, user receives an error with upgrade instructions

## Implementation Steps

1. Add Stripe API keys and webhook endpoint
2. Create subscription products and prices in Stripe
3. Implement user authentication and account management
4. Add database schema for storing user plans and usage
5. Implement usage tracking middleware
6. Connect AI generation methods to the usage enforcement system
7. Create billing portal and subscription management UI
8. Set up webhooks to handle subscription lifecycle events
9. Add analytics dashboard for usage monitoring

## Environment Variables

```
# API Keys
VITE_OPENAI_API_KEY=your_openai_api_key
VITE_ANTHROPIC_API_KEY=your_anthropic_api_key

# Stripe Integration
VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key
VITE_STRIPE_SECRET_KEY=your_stripe_secret_key
VITE_APP_URL=http://localhost:5173

# Upstash Redis (for rate limiting)
VITE_UPSTASH_REDIS_REST_URL=your_upstash_redis_rest_url
VITE_UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_rest_token

# Vercel Blob Storage
VITE_BLOB_READ_WRITE_TOKEN=your_blob_read_write_token
```

## Database Schema

In a production environment, you would need to store:

1. **User Plans**:
   - User ID
   - Plan type (basic, pro, enterprise)
   - Subscription ID from Stripe
   - Subscription status
   - Start date / renewal date

2. **Usage Metrics**:
   - User ID
   - Monthly requests counter
   - Daily requests counter
   - Token usage
   - Storage usage
   - World element count
   - Request history (for rate limiting)

## Deployment Considerations

1. **Webhooks**: Ensure Stripe webhooks are properly configured
2. **Security**: Protect API routes that modify subscription status
3. **Edge Functions**: Use Vercel Edge Functions for globally distributed rate limiting
4. **Error Handling**: Graceful degradation if usage services are unavailable
5. **Monitoring**: Set up alerts for unusual usage patterns

## Future Enhancements

1. Add team/multi-user plans
2. Implement usage notifications (80% of quota reached, etc.)
3. Add annual billing options with discount
4. Create custom enterprise plans
5. Implement granular usage analytics
