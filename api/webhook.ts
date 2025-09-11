import type { VercelRequest, VercelResponse } from '@vercel/node'
import Stripe from 'stripe'

// We need the raw body to validate the signature
export const config = {
  api: {
    bodyParser: false,
  },
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2023-10-16' })

async function getRawBody(req: VercelRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', chunk => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const signature = req.headers['stripe-signature'] as string | undefined
  if (!signature) {
    return res.status(400).json({ error: 'Missing Stripe signature header' })
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET not configured')
    return res.status(500).json({ error: 'Webhook secret not configured' })
  }

  let event: Stripe.Event
  try {
    const rawBody = await getRawBody(req)
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Invalid signature'
    return res.status(400).json({ error: `Webhook signature verification failed: ${message}` })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        // const session = event.data.object as Stripe.Checkout.Session;
        // TODO: mark subscription as active / store reference
        break
      }
      case 'invoice.paid': {
        // const invoice = event.data.object as Stripe.Invoice;
        // TODO: ensure user's subscription remains active
        break
      }
      case 'invoice.payment_failed': {
        // const invoice = event.data.object as Stripe.Invoice;
        // TODO: notify user / flag account
        break
      }
      case 'customer.subscription.updated': {
        // const subscription = event.data.object as Stripe.Subscription;
        // TODO: sync plan / period end
        break
      }
      case 'customer.subscription.deleted': {
        // const subscription = event.data.object as Stripe.Subscription;
        // TODO: downgrade user to BASIC plan
        break
      }
      default:
        // Unhandled event type; log for future use
        console.log(`Unhandled event type: ${event.type}`)
    }

    return res.status(200).json({ received: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Processing error'
    console.error('Webhook handler error:', message)
    return res.status(500).json({ error: message })
  }
}
