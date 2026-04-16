import { NextRequest } from 'next/server'
import { ObjectId } from 'mongodb'
import { getDb } from '@/lib/db'
import { getUserFromRequest } from '@/lib/authServer'
import { isAdminRequest } from '@/lib/admin'

export async function GET(request: NextRequest) {
  const user = getUserFromRequest(request)
  const admin = isAdminRequest(request)

  if (!user && !admin) {
    return Response.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const db = await getDb()
  const query = admin ? {} : { userId: user?.id }
  const refunds = await db.collection('refunds').find(query).sort({ createdAt: -1 }).toArray()

  return Response.json({
    refunds: refunds.map((refund) => ({
      id: refund._id.toString(),
      ...refund,
      _id: undefined,
    })),
  })
}

export async function POST(request: NextRequest) {
  const user = getUserFromRequest(request)
  if (!user) {
    return Response.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  if (!body?.orderId || !body?.reason || !body?.message) {
    return Response.json({ message: 'orderId, reason, and message are required' }, { status: 400 })
  }

  const db = await getDb()
  const orderQuery = ObjectId.isValid(String(body.orderId))
    ? { _id: new ObjectId(String(body.orderId)), userId: user.id }
    : null

  if (!orderQuery) {
    return Response.json({ message: 'Invalid order id' }, { status: 400 })
  }

  const order = await db.collection('orders').findOne(orderQuery)
  if (!order) {
    return Response.json({ message: 'Order not found' }, { status: 404 })
  }

  const existing = await db.collection('refunds').findOne({ orderId: String(body.orderId), userId: user.id })
  if (existing) {
    return Response.json({ message: 'A refund request already exists for this order.' }, { status: 409 })
  }

  const result = await db.collection('refunds').insertOne({
    orderId: String(body.orderId),
    userId: user.id,
    customerName: body.customerName || (user as any).name || user.email,
    customerEmail: body.customerEmail || user.email,
    reason: String(body.reason),
    message: String(body.message),
    attachments: Array.isArray(body.attachments) ? body.attachments.slice(0, 3) : [],
    status: 'pending',
    adminMessage: '',
    createdAt: new Date(),
    updatedAt: new Date(),
  })

  return Response.json({ id: result.insertedId.toString() }, { status: 201 })
}
