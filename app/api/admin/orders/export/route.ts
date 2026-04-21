import type { NextRequest } from 'next/server'
import { isAdminRequest } from '@/lib/admin'
import { getDb } from '@/lib/db'

function escapeCsv(value: unknown) {
  const text = String(value ?? '')
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`
  }
  return text
}

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return Response.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const db = await getDb()
  const orders = await db.collection('orders').find({}).sort({ createdAt: -1 }).limit(500).toArray()

  const header = [
    'Order ID',
    'Date',
    'Customer',
    'Email',
    'Status',
    'Payment Status',
    'Subtotal',
    'Catalog Discount',
    'Coupon Discount',
    'Total Discount',
    'Total',
    'Items',
  ]

  const rows = orders.map((order) => [
    order._id.toString(),
    order.createdAt ? new Date(order.createdAt).toISOString() : '',
    order.customer?.name || '',
    order.customer?.email || '',
    order.status || '',
    order.paymentStatus || '',
    Number(order.subtotal || 0),
    Number(order.catalogDiscountTotal || 0),
    Number(order.couponDiscountTotal || 0),
    Number(order.discountTotal || 0),
    Number(order.total || 0),
    Array.isArray(order.items)
      ? order.items
          .map((item: any) =>
            `${item.name || 'Item'} x${item.quantity || 1}${item.purchaseType === 'variant' ? ` (${item.variantName || 'Variant'})` : ' (Main)'}`
          )
          .join(' | ')
      : '',
  ])

  const csv = [header, ...rows].map((row) => row.map(escapeCsv).join(',')).join('\n')

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="timberbell-orders-export.csv"',
      'Cache-Control': 'no-store',
    },
  })
}
