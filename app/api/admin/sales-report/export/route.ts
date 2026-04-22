import type { NextRequest } from 'next/server'
import { isAdminRequest } from '@/lib/admin'
import { getDb } from '@/lib/db'

function csv(value: unknown) {
  const text = String(value ?? '')
  if (text.includes(',') || text.includes('"') || text.includes('\n')) {
    return `"${text.replace(/"/g, '""')}"`
  }
  return text
}

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return Response.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const db = await getDb()
  const orders = await db.collection('orders').find({}).sort({ createdAt: -1 }).toArray()
  const refunds = await db.collection('refunds').find({}).toArray()
  const refundByOrderId = new Map<string, { status: string; updatedAt: string; count: number }>()
  refunds
    .filter((refund) => refund.orderId)
    .forEach((refund) => {
      const orderId = String(refund.orderId)
      const existing = refundByOrderId.get(orderId)
      const candidateTime = new Date(refund.updatedAt || refund.createdAt || 0).getTime()
      const existingTime = existing ? new Date(existing.updatedAt || 0).getTime() : 0
      if (!existing || candidateTime >= existingTime) {
        refundByOrderId.set(orderId, {
          status: refund.status || 'requested',
          updatedAt: refund.updatedAt ? new Date(refund.updatedAt).toISOString() : '',
          count: (existing?.count || 0) + 1,
        })
        return
      }
      existing.count += 1
    })

  const rows = [
    ['Order ID', 'Date', 'Customer', 'Email', 'Order Status', 'Payment Status', 'Refund Status', 'Refund Updated At', 'Refund Count', 'Subtotal', 'Delivery Fee', 'Catalog Discount', 'Coupon Discount', 'Total Discount', 'Total', 'Items'],
    ...orders.map((order) => [
      refundByOrderId.get(order._id.toString()),
    ].flatMap((refundInfo) => [
      order._id.toString(),
      order.createdAt ? new Date(order.createdAt).toISOString() : '',
      order.customer?.name || '',
      order.customer?.email || '',
      order.status || '',
      order.paymentStatus || '',
      refundInfo?.status || 'none',
      refundInfo?.updatedAt || '',
      refundInfo?.count || 0,
      Number(order.subtotal || 0).toFixed(2),
      Number(order.deliveryFee || 0).toFixed(2),
      Number(order.catalogDiscountTotal || 0).toFixed(2),
      Number(order.couponDiscountTotal || 0).toFixed(2),
      Number(order.discountTotal || 0).toFixed(2),
      Number(order.total || 0).toFixed(2),
      Number(Array.isArray(order.items) ? order.items.length : 0),
    ])),
  ]

  const body = rows.map((row) => row.map(csv).join(',')).join('\n')

  return new Response(body, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="timberbell-sales-report.csv"`,
    },
  })
}
