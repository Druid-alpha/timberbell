import { NextRequest } from 'next/server'
import { verifyPaystackTransaction } from '@/lib/paystack'
import { getDb } from '@/lib/db'
import { fulfillPaidOrder, incrementCouponUsage } from '@/lib/services/checkout'

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
      await db.collection('orders').updateOne(
        { _id: order._id },
        {
          $set: {
            status: 'payment_failed',
            paymentStatus,
            paymentGatewayResponse: paystack.data.gateway_response || null,
            updatedAt: new Date(),
          },
        }
      )

      return Response.json({ ok: false, status: paymentStatus, message: paystack.message }, { status: 400 })
    }

    await db.collection('orders').updateOne(
      { _id: order._id },
      {
        $set: {
          status: 'paid',
          paymentStatus: 'paid',
          paidAt: paystack.data.paid_at ? new Date(paystack.data.paid_at) : new Date(),
          paymentGatewayResponse: paystack.data.gateway_response || null,
          paymentChannel: paystack.data.channel || null,
          updatedAt: new Date(),
        },
      }
    )

    if (order.couponCode && !order.couponUsageAppliedAt) {
      const coupon = await db.collection('coupons').findOne({ code: order.couponCode })
      await incrementCouponUsage(coupon)
      await db.collection('orders').updateOne(
        { _id: order._id },
        { $set: { couponUsageAppliedAt: new Date(), updatedAt: new Date() } }
      )
    }

    await fulfillPaidOrder({ ...order, paymentStatus: 'paid' })

    return Response.json({
      ok: true,
      orderId: order._id.toString(),
      reference,
      status: 'paid',
    })
  } catch (error: any) {
    await db.collection('orders').updateOne(
      { _id: order._id },
      {
        $set: {
          status: 'payment_failed',
          paymentStatus: 'failed',
          paymentFailureReason: error?.message || 'Payment verification failed',
          updatedAt: new Date(),
        },
      }
    )

    return Response.json({ message: error?.message || 'Payment verification failed' }, { status: 500 })
  }
}
