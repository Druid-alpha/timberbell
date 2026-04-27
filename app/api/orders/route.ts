import { NextRequest } from 'next/server'
import { getUserFromRequest } from '@/lib/authServer'
import { buildOrderDraft } from '@/lib/services/checkout'
import { getOrderProgressFromStatus } from '@/lib/orderTracking'
import { findUserById } from '@/lib/services/users'

export async function GET(request: NextRequest) {
  const user = getUserFromRequest(request)

  if (!user) {
    return Response.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const db = await (await import('@/lib/db')).getDb()
  const orders = await db
    .collection('orders')
    .find({ userId: user.id })
    .sort({ createdAt: -1 })
    .toArray()

  return Response.json({
    orders: orders.map((order) => ({
      id: order._id.toString(),
      ...order,
      _id: undefined,
    })),
  })
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
    return Response.json({ message: 'Please verify your email before placing an order.' }, { status: 403 })
  }

  const body = await request.json().catch(() => ({}))
  let draft
  try {
    draft = await buildOrderDraft({
      userId: user.id,
      customer: body.customer,
      delivery: body.delivery,
      notes: body.notes,
      couponCode: body.couponCode,
    })
  } catch (error: unknown) {
    return Response.json({ message: error instanceof Error ? error.message : 'Cart is empty' }, { status: 400 })
  }

  const progress = getOrderProgressFromStatus('pending')
  const result = await draft.db.collection('orders').insertOne({
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
    status: 'pending',
    paymentProvider: 'manual',
    paymentStatus: 'unpaid',
    trackingStage: progress.trackingStage,
    trackingUpdatedAt: new Date(),
    customer: draft.customer,
    notes: draft.notes,
    createdAt: new Date(),
    updatedAt: new Date(),
  })

  return Response.json({ id: result.insertedId.toString(), total: draft.total }, { status: 201 })
}
