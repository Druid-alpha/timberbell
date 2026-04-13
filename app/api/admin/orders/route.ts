import { NextRequest } from 'next/server'
import { ObjectId } from 'mongodb'
import { isAdminRequest } from '@/lib/admin'

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return Response.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const db = await (await import('@/lib/db')).getDb()
  const orders = await db.collection('orders').find({}).sort({ createdAt: -1 }).limit(50).toArray()

  return Response.json({
    orders: orders.map((order) => ({
      id: order._id.toString(),
      ...order,
      _id: undefined,
    })),
  })
}

export async function PATCH(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return Response.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const id = body?.id ? String(body.id) : ''
  const status = body?.status ? String(body.status) : ''

  if (!id || !status) {
    return Response.json({ message: 'id and status required' }, { status: 400 })
  }

  const db = await (await import('@/lib/db')).getDb()
  if (!ObjectId.isValid(id)) {
    return Response.json({ message: 'Invalid order id' }, { status: 400 })
  }
  const query = { _id: new ObjectId(id) }
  const result = await db.collection('orders').findOneAndUpdate(
    query,
    { $set: { status, updatedAt: new Date() } },
    { returnDocument: 'after' }
  )

  if (!result || !result.value) {
    return Response.json({ message: 'Order not found' }, { status: 404 })
  }

  return Response.json({
    id: result.value._id.toString(),
    ...result.value,
    _id: undefined,
  })
}
