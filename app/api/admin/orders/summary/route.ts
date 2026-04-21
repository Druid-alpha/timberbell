import type { NextRequest } from 'next/server'
import { isAdminRequest } from '@/lib/admin'
import { getDb } from '@/lib/db'

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return Response.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const db = await getDb()
  const [latestOrder, pendingCount, newCount] = await Promise.all([
    db.collection('orders').find({}).sort({ createdAt: -1 }).limit(1).next(),
    db.collection('orders').countDocuments({ status: { $in: ['pending_payment', 'pending', 'processing'] } }),
    db.collection('orders').countDocuments({ createdAt: { $gte: new Date(Date.now() - 1000 * 60 * 60 * 24) } }),
  ])

  return Response.json({
    latestOrder: latestOrder
      ? {
          id: latestOrder._id.toString(),
          customerName: latestOrder.customer?.name || 'Customer',
          total: Number(latestOrder.total || 0),
          createdAt: latestOrder.createdAt,
          status: latestOrder.status || 'pending',
        }
      : null,
    pendingCount,
    newCount,
  })
}
