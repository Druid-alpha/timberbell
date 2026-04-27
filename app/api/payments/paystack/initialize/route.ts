import { NextRequest } from 'next/server'
import { getUserFromRequest } from '@/lib/authServer'
import { buildOrderDraft } from '@/lib/services/checkout'
import { initializePaystackTransaction } from '@/lib/paystack'
import { getOrderProgressFromStatus } from '@/lib/orderTracking'
import { findUserById } from '@/lib/services/users'

function createReference(userId: string) {
  return `timberbell_${userId}_${Date.now()}`
}

export async function POST(request: NextRequest) {
  const user = getUserFromRequest(request)
  if (!user) {
    return Response.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const profile = await findUserById(user.id)
  if (!profile) {
    return Response.json({ message: 'User not found' }, { status: 404 })
  }
  if (!profile.emailVerified) {
    return Response.json({ message: 'Please verify your email before checkout.' }, { status: 403 })
  }

  const body = await request.json().catch(() => ({}))
  const email = String(body?.customer?.email || user.email || '').trim()

  if (!email) {
    return Response.json({ message: 'Customer email is required' }, { status: 400 })
  }

  let draft
  try {
    draft = await buildOrderDraft({
      userId: user.id,
      customer: {
        ...(body.customer || {}),
        email,
      },
      delivery: body.delivery,
      notes: body.notes,
      couponCode: body.couponCode,
    })
  } catch (error: unknown) {
    return Response.json({ message: error instanceof Error ? error.message : 'Cart is empty' }, { status: 400 })
  }

  const reference = createReference(user.id)
  const progress = getOrderProgressFromStatus('pending_payment')

  const orderInsert = await draft.db.collection('orders').insertOne({
    userId: user.id,
    items: draft.items,
    subtotal: draft.subtotal,
    catalogDiscountTotal: draft.catalogDiscountTotal,
    couponDiscountTotal: draft.couponDiscountTotal,
    discountTotal: draft.discountTotal,
    deliveryFee: draft.deliveryFee,
    deliveryMethod: draft.deliveryMethod,
    deliveryZone: draft.deliveryZone,
    deliveryEta: draft.deliveryEta,
    couponCode: draft.coupon?.code || null,
    total: draft.total,
    status: 'pending_payment',
    paymentProvider: 'paystack',
    paymentStatus: 'initialized',
    paymentReference: reference,
    trackingStage: progress.trackingStage,
    trackingUpdatedAt: new Date(),
    customer: draft.customer,
    notes: draft.notes,
    createdAt: new Date(),
    updatedAt: new Date(),
  })

  try {
    const appUrl = process.env.APP_URL || request.nextUrl.origin
    const callbackUrl = `${appUrl}/checkout/success?reference=${encodeURIComponent(reference)}`

    const paystack = await initializePaystackTransaction({
      email,
      amount: draft.total,
      reference,
      callbackUrl,
      metadata: {
        orderId: orderInsert.insertedId.toString(),
        userId: user.id,
      },
    })

    await draft.db.collection('orders').updateOne(
      { _id: orderInsert.insertedId },
      {
        $set: {
          paymentAccessCode: paystack.data.access_code,
          paymentAuthorizationUrl: paystack.data.authorization_url,
          updatedAt: new Date(),
        },
      }
    )

    return Response.json({
      orderId: orderInsert.insertedId.toString(),
      reference,
      authorizationUrl: paystack.data.authorization_url,
    })
  } catch (error: unknown) {
    await draft.db.collection('orders').updateOne(
      { _id: orderInsert.insertedId },
      {
        $set: {
          status: 'payment_failed',
          paymentStatus: 'failed',
          paymentFailureReason: error instanceof Error ? error.message : 'Unable to initialize Paystack payment',
          updatedAt: new Date(),
        },
      }
    )

    return Response.json({ message: error instanceof Error ? error.message : 'Unable to initialize payment' }, { status: 500 })
  }
}
