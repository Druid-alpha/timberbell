import { NextRequest } from 'next/server'
import { ObjectId } from 'mongodb'
import { isAdminRequest } from '@/lib/admin'

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return Response.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const db = await (await import('@/lib/db')).getDb()
  const users = await db.collection('users').find({}).sort({ createdAt: -1 }).limit(50).toArray()
  const userIds = users.map((user) => user._id.toString())
  const orders = await db
    .collection('orders')
    .find({ userId: { $in: userIds } })
    .toArray()

  const orderStats = new Map<string, { count: number; lastOrderAt: Date | null }>()
  orders.forEach((order) => {
    const userId = String(order.userId)
    const entry = orderStats.get(userId) || { count: 0, lastOrderAt: null }
    entry.count += 1
    if (order.createdAt) {
      const createdAt = new Date(order.createdAt)
      if (!entry.lastOrderAt || createdAt > entry.lastOrderAt) {
        entry.lastOrderAt = createdAt
      }
    }
    orderStats.set(userId, entry)
  })

  return Response.json({
    users: users.map((user) => ({
      id: user._id.toString(),
      ...user,
      _id: undefined,
      passwordHash: undefined,
      email: String(user.email || '').toLowerCase(),
      ordersCount: orderStats.get(user._id.toString())?.count ?? 0,
      lastOrderAt: orderStats.get(user._id.toString())?.lastOrderAt ?? null,
    })),
  })
}

export async function PATCH(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return Response.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const id = body?.id ? String(body.id) : ''
  const role = body?.role ? String(body.role) : ''
  const phone = body?.phone ? String(body.phone) : undefined
  const avatarUrl = body?.avatarUrl ? String(body.avatarUrl) : undefined

  if (!id) {
    return Response.json({ message: 'id required' }, { status: 400 })
  }

  if (!role && !phone && !avatarUrl) {
    return Response.json({ message: 'No updates provided' }, { status: 400 })
  }

  if (role && role !== 'admin' && role !== 'user') {
    return Response.json({ message: 'Invalid role' }, { status: 400 })
  }

  const db = await (await import('@/lib/db')).getDb()
  if (!ObjectId.isValid(id)) {
    return Response.json({ message: 'Invalid user id' }, { status: 400 })
  }

  const update: Record<string, any> = { updatedAt: new Date() }
  if (role) update.role = role
  if (phone !== undefined) update.phone = phone
  if (avatarUrl !== undefined) update.avatarUrl = avatarUrl

  await db.collection('users').updateOne({ _id: new ObjectId(id) }, { $set: update })

  return Response.json({ ok: true })
}
