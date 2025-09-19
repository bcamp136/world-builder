import type { VercelRequest, VercelResponse } from '@vercel/node'
import Stripe from 'stripe'
import { getFirebase } from '../src/lib/firebase'
import { getUser, updateUser } from '../src/lib/user-store'

// NOTE: This endpoint expects an Authorization: Bearer <uid> header as a simple demo.
// In production you'd verify a Firebase ID token. Here we keep it lightweight.

const stripeSecretKey = process.env.STRIPE_SECRET_KEY
const stripe = stripeSecretKey ? new Stripe(stripeSecretKey, { apiVersion: '2023-10-16' }) : null

function cors(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization')
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(res)
  if (req.method === 'OPTIONS') return res.status(200).end()

  if (!stripe) {
    return res.status(500).json({ error: 'Stripe secret key not configured' })
  }
  try {
    const authHeader = req.headers.authorization
    if (!authHeader) return res.status(401).json({ error: 'Missing Authorization header' })
    const [, uid] = authHeader.split(' ')
    if (!uid) return res.status(401).json({ error: 'Invalid Authorization header' })

    // Load user document
    const userDoc = await getUser(uid)
    if (userDoc?.stripeCustomerId) {
      return res.status(200).json({ stripeCustomerId: userDoc.stripeCustomerId, reused: true })
    }

    // Create new Stripe customer
    const customer = await stripe.customers.create({
      email: userDoc?.email || undefined,
      metadata: { uid },
    })
    await updateUser(uid, { stripeCustomerId: customer.id })
    return res.status(200).json({ stripeCustomerId: customer.id, reused: false })
  } catch (err: any) {
    console.error('create-stripe-customer error', err)
    return res.status(500).json({ error: err.message || 'Internal error' })
  }
}
