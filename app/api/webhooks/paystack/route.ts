import { NextRequest } from 'next/server'
import { getDb } from '@/lib/db'
import { verifyPaystackSignature } from '@/lib/paystack'
import { markOrderPaid, markOrderPaymentFailed } from '@/lib/services/checkout'

export async function POST(request: NextRequest) {
  const rawBody = await request.text()
  const signature = request.headers.get('x-paystack-signature')

  if (!verifyPaystackSignature(rawBody, signature)) {
    return Response.json({ message: 'Invalid Paystack signature' }, { status: 401 })
  }

  const event = JSON.parse(rawBody)
  const eventType = String(event?.event || '')
  const data = event?.data || {}
  const reference = String(data?.reference || '')

  if (!reference) {
    return Response.json({ message: 'Missing payment reference' }, { status: 400 })
  }

  const db = await getDb()
  const order = await db.collection('orders').findOne({ paymentReference: reference })

  if (!order) {
    return Response.json({ message: 'Order not found' }, { status: 404 })
  }

  if (eventType === 'charge.success') {
    await markOrderPaid({
      order,
      paidAt: data?.paid_at,
      gatewayResponse: data?.gateway_response || null,
      channel: data?.channel || null,
    })

    return Response.json({ ok: true, status: 'paid' })
  }

  if (eventType === 'charge.failed') {
    await markOrderPaymentFailed({
      orderId: order._id,
      paymentStatus: 'failed',
      gatewayResponse: data?.gateway_response || null,
      failureReason: data?.message || 'Paystack reported a failed charge',
    })

    return Response.json({ ok: true, status: 'failed' })
  }

  return Response.json({ ok: true, ignored: true, event: eventType })
}
