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
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const product = req.query.product as string | undefined
  if (!product) {
    return res.status(400).json({ error: 'Missing product query parameter' })
  }

  try {
    const prices = await stripe.prices.list({ product, active: true, limit: 100 })
    return res.status(200).json(prices.data)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return res.status(500).json({ error: message })
  }
}
