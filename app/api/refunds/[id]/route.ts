import { NextRequest } from 'next/server'
import { ObjectId } from 'mongodb'
import { getDb } from '@/lib/db'
import { getUserFromRequest } from '@/lib/authServer'
import { isAdminRequest } from '@/lib/admin'
import { sendEmail } from '@/lib/email'
import { refundStatusEmailTemplate } from '@/lib/emailTemplates'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdminRequest(request)) {
    return Response.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  if (!ObjectId.isValid(id)) {
    return Response.json({ message: 'Invalid refund id' }, { status: 400 })
  }

  const body = await request.json().catch(() => null)
  if (!body) {
    return Response.json({ message: 'Body required' }, { status: 400 })
  }

  const db = await getDb()
  const result = await db.collection('refunds').findOneAndUpdate(
    { _id: new ObjectId(id) },
    {
      $set: {
        status: body.status || 'pending',
        adminMessage: body.adminMessage || '',
        updatedAt: new Date(),
      },
    },
    { returnDocument: 'after' }
  )

  if (!result?.value) {
    return Response.json({ message: 'Refund request not found' }, { status: 404 })
  }

  if (result.value.customerEmail) {
    await sendEmail({
      to: result.value.customerEmail,
      subject: `Refund update for order ${String(result.value.orderId).slice(-6).toUpperCase()}`,
      html: refundStatusEmailTemplate({
        customerName: result.value.customerName || 'Customer',
        orderId: result.value.orderId,
        status: result.value.status,
        adminMessage: result.value.adminMessage,
      }),
    }).catch(() => null)
  }

  return Response.json({
    id: result.value._id.toString(),
    ...result.value,
    _id: undefined,
  })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = getUserFromRequest(request)
  const admin = isAdminRequest(request)
  if (!user && !admin) {
    return Response.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  if (!ObjectId.isValid(id)) {
    return Response.json({ message: 'Invalid refund id' }, { status: 400 })
  }

  const db = await getDb()
  const refund = await db.collection('refunds').findOne({ _id: new ObjectId(id) })
  if (!refund) {
    return Response.json({ message: 'Refund request not found' }, { status: 404 })
  }

  if (!admin && refund.userId !== user?.id) {
    return Response.json({ message: 'Forbidden' }, { status: 403 })
  }

  await db.collection('refunds').deleteOne({ _id: refund._id })
  return Response.json({ message: 'Refund request deleted' })
}
