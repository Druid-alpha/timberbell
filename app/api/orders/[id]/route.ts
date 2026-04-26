import { NextRequest } from 'next/server'
import { ObjectId } from 'mongodb'
import { getUserFromRequest } from '@/lib/authServer'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getUserFromRequest(request)
  if (!user) {
    return Response.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  if (!ObjectId.isValid(id)) {
    return Response.json({ message: 'Invalid order id' }, { status: 400 })
  }

  const db = await (await import('@/lib/db')).getDb()
  const query = { _id: new ObjectId(id), userId: user.id }

  const order = await db.collection('orders').findOne(query)
  if (!order) {
    return Response.json({ message: 'Order not found' }, { status: 404 })
  }

  return Response.json({ id: order._id.toString(), ...order, _id: undefined })
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return Response.json({ message: 'Order updates are not supported from this endpoint' }, { status: 405 })
}
