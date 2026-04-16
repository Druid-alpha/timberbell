import { NextRequest } from 'next/server'
import { verifyPaystackTransaction } from '@/lib/paystack'
import { getDb } from '@/lib/db'
import { markOrderPaid, markOrderPaymentFailed } from '@/lib/services/checkout'

export async function GET(request: NextRequest) {
  const reference = request.nextUrl.searchParams.get('reference')

  if (!reference) {
    return Response.json({ message: 'reference is required' }, { status: 400 })
  }

  const db = await getDb()
  const order = await db.collection('orders').findOne({ paymentReference: reference })

  if (!order) {
    return Response.json({ message: 'Order not found for reference' }, { status: 404 })
  }

  try {
    const paystack = await verifyPaystackTransaction(reference)
    const paymentStatus = paystack.data.status

    if (paymentStatus !== 'success') {
      await markOrderPaymentFailed({
        orderId: order._id,
        paymentStatus,
        gatewayResponse: paystack.data.gateway_response || null,
      })

      return Response.json({ ok: false, status: paymentStatus, message: paystack.message }, { status: 400 })
    }

    await markOrderPaid({
      order,
      paidAt: paystack.data.paid_at,
      gatewayResponse: paystack.data.gateway_response || null,
      channel: paystack.data.channel || null,
    })

    return Response.json({
      ok: true,
      orderId: order._id.toString(),
      reference,
      status: 'paid',
    })
  } catch (error: any) {
    await markOrderPaymentFailed({
      orderId: order._id,
      paymentStatus: 'failed',
      failureReason: error?.message || 'Payment verification failed',
    })

    return Response.json({ message: error?.message || 'Payment verification failed' }, { status: 500 })
  }
}
