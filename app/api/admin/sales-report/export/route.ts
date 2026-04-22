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

  const rows = [
    ['Order ID', 'Date', 'Customer', 'Email', 'Status', 'Subtotal', 'Catalog Discount', 'Coupon Discount', 'Total Discount', 'Total', 'Items'],
    ...orders.map((order) => [
      order._id.toString(),
      order.createdAt ? new Date(order.createdAt).toISOString() : '',
      order.customer?.name || '',
      order.customer?.email || '',
      order.status || '',
      Number(order.subtotal || 0).toFixed(2),
      Number(order.catalogDiscountTotal || 0).toFixed(2),
      Number(order.couponDiscountTotal || 0).toFixed(2),
      Number(order.discountTotal || 0).toFixed(2),
      Number(order.total || 0).toFixed(2),
      Number(Array.isArray(order.items) ? order.items.length : 0),
    ]),
  ]

  const body = rows.map((row) => row.map(csv).join(',')).join('\n')

  return new Response(body, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="timberbell-sales-report.csv"`,
    },
  })
}
