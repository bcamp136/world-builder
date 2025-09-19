import type { VercelRequest, VercelResponse } from '@vercel/node'
import Stripe from 'stripe'

// Lazily validate and construct Stripe client so we can surface a clearer error
const secretKey = process.env.STRIPE_SECRET_KEY || ''
const stripe = new Stripe(secretKey, { apiVersion: '2023-10-16' })

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Basic CORS handling
  const allowedOrigins = (process.env.CORS_ALLOWED_ORIGINS || process.env.VITE_APP_URL || '')
    .split(',')
    .map(o => o.trim())
    .filter(Boolean)
  const requestOrigin = req.headers.origin as string | undefined
  if (requestOrigin && (allowedOrigins.length === 0 || allowedOrigins.includes(requestOrigin) || allowedOrigins.includes('*'))) {
    res.setHeader('Access-Control-Allow-Origin', requestOrigin)
  } else if (allowedOrigins.includes('*')) {
    res.setHeader('Access-Control-Allow-Origin', '*')
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,Stripe-Signature')
  res.setHeader('Access-Control-Allow-Credentials', 'true')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!secretKey) {
    console.error('Stripe secret key (STRIPE_SECRET_KEY) is missing')
    return res.status(500).json({ error: 'Server misconfiguration: STRIPE_SECRET_KEY not set' })
  }

  const { priceId: rawPriceId, customerId, successUrl, cancelUrl } = (req.body || {}) as {
    priceId?: string
    customerId?: string
    successUrl?: string
    cancelUrl?: string
  }

  // Provide sane fallbacks if client forgot to send URLs
  const appOrigin = process.env.VITE_APP_URL || process.env.APP_URL || 'http://localhost:5173'
  const resolvedSuccessUrl = successUrl || `${appOrigin}/account?session_id={CHECKOUT_SESSION_ID}`
  const resolvedCancelUrl = cancelUrl || `${appOrigin}/pricing`

  if (!rawPriceId) {
    return res.status(400).json({ error: 'Missing priceId' })
  }
  let resolvedPriceId = rawPriceId
  // Allow passing a product id (prod_) and resolve to its first active recurring price
  if (resolvedPriceId.startsWith('prod_')) {
    try {
      // Try product.default_price first
      const product = await stripe.products.retrieve(resolvedPriceId, { expand: ['default_price'] })
      const dp: any = (product as any).default_price
      if (dp && typeof dp === 'object' && dp.id) {
        resolvedPriceId = dp.id
      } else {
        // Fallback: list prices
        const priceList = await stripe.prices.list({ product: resolvedPriceId, active: true, limit: 10 })
        const recurring = priceList.data.find(p => p.type === 'recurring') || priceList.data[0]
        if (recurring) {
          resolvedPriceId = recurring.id
        } else {
          return res.status(400).json({
            error: `No active prices found for product ${resolvedPriceId}. Create a recurring price in Stripe dashboard.`,
          })
        }
      }
    } catch (e: any) {
      return res.status(400).json({ error: `Failed to resolve product to price: ${e?.message || 'unknown error'}` })
    }
  }

  if (!resolvedPriceId.startsWith('price_')) {
    return res.status(400).json({ error: `Invalid priceId format: ${resolvedPriceId}` })
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
  line_items: [{ price: resolvedPriceId, quantity: 1 }],
      mode: 'subscription',
      success_url: resolvedSuccessUrl,
      cancel_url: resolvedCancelUrl,
      ...(customerId ? { customer: customerId } : {}),
      // Expand for potential future logic (e.g. display line items / subscription)
      // expand: ['line_items'],
    })

    return res.status(200).json({ id: session.id, url: session.url })
  } catch (error: unknown) {
    const err: any = error
    // Stripe errors include type / code for better telemetry
    console.error('Stripe checkout session creation failed:', {
      message: err?.message,
      type: err?.type,
      code: err?.code,
      stack: err?.stack,
    })
    const message = err?.message || 'Unknown error'
    return res.status(500).json({
      error: message,
      stripeError: err?.type ? { type: err.type, code: err.code } : undefined,
    })
  }
}
