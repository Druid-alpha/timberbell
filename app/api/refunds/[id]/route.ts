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
  const user = getUserFromRequest(request)
  const admin = isAdminRequest(request)

  if (!user && !admin) {
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
  const refund = await db.collection('refunds').findOne({ _id: new ObjectId(id) })
  if (!refund) {
    return Response.json({ message: 'Refund request not found' }, { status: 404 })
  }

  if (!admin && refund.userId !== user?.id) {
    return Response.json({ message: 'Forbidden' }, { status: 403 })
  }

  const message = typeof body.message === 'string' ? body.message.trim() : ''
  const status = typeof body.status === 'string' ? body.status.trim() : ''
  const adminMessage = typeof body.adminMessage === 'string' ? body.adminMessage.trim() : ''

  const update: Record<string, unknown> = {
    updatedAt: new Date(),
  }
  const conversation = Array.isArray(refund.conversation) ? [...refund.conversation] : []
  let outgoingEmailMessage = ''

  if (admin) {
    if (status) {
      update.status = status
    }

    if (adminMessage) {
      update.adminMessage = adminMessage
      outgoingEmailMessage = adminMessage
      conversation.push({
        sender: 'admin',
        message: adminMessage,
        createdAt: new Date(),
      })
    }
  } else {
    if (!message) {
      return Response.json({ message: 'Message required' }, { status: 400 })
    }

    conversation.push({
      sender: 'customer',
      message,
      createdAt: new Date(),
    })
  }

  update.conversation = conversation

  const result = await db.collection('refunds').findOneAndUpdate(
    { _id: refund._id },
    { $set: update },
    { returnDocument: 'after' }
  )

  const updatedRefund = result && typeof result === 'object' && 'value' in result ? result.value : result
  if (!updatedRefund) {
    return Response.json({ message: 'Refund request not found' }, { status: 404 })
  }

  if (admin && updatedRefund.customerEmail) {
    await sendEmail({
      to: updatedRefund.customerEmail,
      subject: `Refund update for order ${String(updatedRefund.orderId).slice(-6).toUpperCase()}`,
      html: refundStatusEmailTemplate({
        customerName: updatedRefund.customerName || 'Customer',
        orderId: updatedRefund.orderId,
        status: updatedRefund.status,
        adminMessage: outgoingEmailMessage || updatedRefund.adminMessage,
      }),
    }).catch(() => null)
  }

  return Response.json({
    id: updatedRefund._id.toString(),
    ...updatedRefund,
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
