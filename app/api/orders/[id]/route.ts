import { NextRequest } from 'next/server'
import { ObjectId } from 'mongodb'
import { getUserFromRequest } from '@/lib/authServer'

export async function GET(request: NextRequest, ctx: RouteContext<'/api/orders/[id]'>) {
  const user = getUserFromRequest(request)
  if (!user) {
    return Response.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await ctx.params
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

export async function PUT(request: NextRequest, ctx: RouteContext<'/api/orders/[id]'>) {
  const user = getUserFromRequest(request)
  if (!user) {
    return Response.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await ctx.params
  if (!ObjectId.isValid(id)) {
    return Response.json({ message: 'Invalid order id' }, { status: 400 })
  }

  const body = await request.json().catch(() => null)
  if (!body) {
    return Response.json({ message: 'Body required' }, { status: 400 })
  }

  const db = await (await import('@/lib/db')).getDb()
  const query = { _id: new ObjectId(id), userId: user.id }

  const result = await db.collection('orders').findOneAndUpdate(
    query,
    { $set: { ...body, updatedAt: new Date() } },
    { returnDocument: 'after' }
  )

  if (!result || !result.value) {
    return Response.json({ message: 'Order not found' }, { status: 404 })
  }

  return Response.json({ id: result.value._id.toString(), ...result.value, _id: undefined })
}
