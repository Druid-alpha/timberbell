import { NextRequest } from 'next/server'
import { ObjectId } from 'mongodb'
import { isAdminRequest } from '@/lib/admin'
import {
  getOrderProgressFromStatus,
  getOrderStatusForTrackingStage,
  normalizeTrackingStage,
} from '@/lib/orderTracking'

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
  const hasTrackingStage = typeof body?.trackingStage !== 'undefined'
  const nextTrackingStage = hasTrackingStage ? normalizeTrackingStage(body?.trackingStage) : null
  const note = typeof body?.trackingNote === 'string' ? body.trackingNote.trim() : ''

  if (!id) {
    return Response.json({ message: 'id required' }, { status: 400 })
  }

  if (!status && !hasTrackingStage) {
    return Response.json({ message: 'status or trackingStage required' }, { status: 400 })
  }

  const db = await (await import('@/lib/db')).getDb()
  if (!ObjectId.isValid(id)) {
    return Response.json({ message: 'Invalid order id' }, { status: 400 })
  }
  const query = { _id: new ObjectId(id) }
  const update: Record<string, unknown> = {
    updatedAt: new Date(),
  }

  if (status) {
    const progress = getOrderProgressFromStatus(status)
    update.status = progress.orderStatus
    update.trackingStage = progress.trackingStage
    update.trackingUpdatedAt = new Date()
  }

  if (nextTrackingStage) {
    update.trackingStage = nextTrackingStage
    update.trackingUpdatedAt = new Date()
    update.status = getOrderStatusForTrackingStage(nextTrackingStage)
  }

  if (note) {
    update.trackingNote = note
  }

  const result = await db.collection('orders').findOneAndUpdate(
    query,
    { $set: update },
    { returnDocument: 'after' }
  )

  const updatedOrder = result && typeof result === 'object' && 'value' in result ? result.value : result
  if (!updatedOrder) {
    return Response.json({ message: 'Order not found' }, { status: 404 })
  }

  return Response.json({
    id: updatedOrder._id.toString(),
    ...updatedOrder,
    _id: undefined,
  })
}

export async function DELETE(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return Response.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const id = body?.id ? String(body.id) : ''

  if (!id) {
    return Response.json({ message: 'id required' }, { status: 400 })
  }

  const db = await (await import('@/lib/db')).getDb()
  if (!ObjectId.isValid(id)) {
    return Response.json({ message: 'Invalid order id' }, { status: 400 })
  }

  const result = await db.collection('orders').deleteOne({ _id: new ObjectId(id) })

  if (!result.deletedCount) {
    return Response.json({ message: 'Order not found' }, { status: 404 })
  }

  return Response.json({ ok: true })
}
