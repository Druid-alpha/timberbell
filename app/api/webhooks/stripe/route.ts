import { headers } from 'next/headers'
import { getStripe } from '@/lib/stripe'
import { ObjectId } from 'mongodb'

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    return Response.json({ message: 'Missing STRIPE_WEBHOOK_SECRET' }, { status: 500 })
  }

  const headerList = await headers()
  const signature = headerList.get('stripe-signature')
  if (!signature) {
    return Response.json({ message: 'Missing Stripe signature' }, { status: 400 })
  }

  const payload = await request.text()

  const stripe = getStripe()
  let event
  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret)
  } catch (error) {
    return Response.json({ message: 'Webhook signature verification failed' }, { status: 400 })
  }

  const db = await (await import('@/lib/db')).getDb()

  if (event.type === 'payment_intent.succeeded') {
    const intent = event.data.object
    const orderId = intent.metadata?.orderId

    if (orderId && ObjectId.isValid(orderId)) {
      await db.collection('orders').updateOne(
        { _id: new ObjectId(orderId) },
        {
          $set: {
            status: 'paid',
            paymentStatus: 'succeeded',
            paymentIntentId: intent.id,
            updatedAt: new Date(),
          },
        }
      )
    }
  }

  if (event.type === 'payment_intent.payment_failed') {
    const intent = event.data.object
    const orderId = intent.metadata?.orderId

    if (orderId && ObjectId.isValid(orderId)) {
      await db.collection('orders').updateOne(
        { _id: new ObjectId(orderId) },
        {
          $set: {
            status: 'payment_failed',
            paymentStatus: 'failed',
            paymentIntentId: intent.id,
            updatedAt: new Date(),
          },
        }
      )
    }
  }

  return Response.json({ received: true })
}
