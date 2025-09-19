import type { VercelRequest, VercelResponse } from '@vercel/node'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
})

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const allowedOrigins = (process.env.CORS_ALLOWED_ORIGINS || process.env.VITE_APP_URL || '')
    .split(',')
    .map(o => o.trim())
    .filter(Boolean)
  const origin = req.headers.origin as string | undefined
  if (origin && (allowedOrigins.length === 0 || allowedOrigins.includes(origin) || allowedOrigins.includes('*'))) {
    res.setHeader('Access-Control-Allow-Origin', origin)
  } else if (allowedOrigins.includes('*')) {
    res.setHeader('Access-Control-Allow-Origin', '*')
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization')
  res.setHeader('Access-Control-Allow-Credentials', 'true')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { subscriptionId } = req.body as { subscriptionId?: string }
  if (!subscriptionId) {
    return res.status(400).json({ error: 'Missing subscriptionId' })
  }

  try {
    await stripe.subscriptions.cancel(subscriptionId)
    return res.status(200).json({ success: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return res.status(500).json({ error: message })
  }
}
