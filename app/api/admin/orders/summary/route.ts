import type { NextRequest } from 'next/server'
import { isAdminRequest } from '@/lib/admin'
import { getDb } from '@/lib/db'

function toDate(value: unknown) {
  if (!value) return null
  const date = new Date(String(value))
  return Number.isNaN(date.getTime()) ? null : date
}

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return Response.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const sinceOrdersParam = request.nextUrl.searchParams.get('sinceOrders')
  const sinceRefundsParam = request.nextUrl.searchParams.get('sinceRefunds')
  const sinceUsersParam = request.nextUrl.searchParams.get('sinceUsers')
  const sinceOrdersDate = sinceOrdersParam ? toDate(sinceOrdersParam) : null
  const sinceRefundsDate = sinceRefundsParam ? toDate(sinceRefundsParam) : null
  const sinceUsersDate = sinceUsersParam ? toDate(sinceUsersParam) : null
  const db = await getDb()

  const [latestOrder, latestRefund, latestUser] = await Promise.all([
    db.collection('orders').find({}).sort({ createdAt: -1 }).limit(1).next(),
    db.collection('refunds').find({}).sort({ createdAt: -1 }).limit(1).next(),
    db.collection('users').find({}).sort({ createdAt: -1 }).limit(1).next(),
  ])

  const counts = await Promise.all([
    sinceOrdersDate ? db.collection('orders').countDocuments({ createdAt: { $gt: sinceOrdersDate } }) : db.collection('orders').countDocuments({}),
    sinceRefundsDate ? db.collection('refunds').countDocuments({ createdAt: { $gt: sinceRefundsDate } }) : db.collection('refunds').countDocuments({}),
    sinceUsersDate ? db.collection('users').countDocuments({ createdAt: { $gt: sinceUsersDate } }) : db.collection('users').countDocuments({}),
  ])

  const latestDates = [latestOrder?.createdAt, latestRefund?.createdAt, latestUser?.createdAt]
    .map(toDate)
    .filter((value): value is Date => Boolean(value))
    .sort((left, right) => right.getTime() - left.getTime())

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
    latestRefund: latestRefund
      ? {
          id: latestRefund._id.toString(),
          customerName: latestRefund.customerName || latestRefund.customerEmail || 'Customer',
          createdAt: latestRefund.createdAt,
          status: latestRefund.status || 'pending',
        }
      : null,
    latestUser: latestUser
      ? {
          id: latestUser._id.toString(),
          name: latestUser.name || latestUser.email || 'User',
          email: latestUser.email || '',
          createdAt: latestUser.createdAt,
        }
      : null,
    newCounts: {
      orders: Number(counts[0] || 0),
      refunds: Number(counts[1] || 0),
      users: Number(counts[2] || 0),
      total: Number(counts[0] || 0) + Number(counts[1] || 0) + Number(counts[2] || 0),
    },
    lastActivityAt: latestDates[0]?.toISOString() || null,
  })
}
