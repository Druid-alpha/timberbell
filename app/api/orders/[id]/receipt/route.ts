import { NextRequest } from 'next/server'
import { ObjectId } from 'mongodb'
import { getDb } from '@/lib/db'
import { getUserFromRequest } from '@/lib/authServer'
import { isAdminRequest } from '@/lib/admin'
import { createSimplePdf } from '@/lib/utils/pdf'
<<<<<<< HEAD
import { formatPdfMoney } from '@/lib/utils/format'
=======
import { formatMoney } from '@/lib/utils/format'
>>>>>>> e7cd282d2482ffba0f0273ec98994b171c5c5efe

export async function GET(
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
    return Response.json({ message: 'Invalid order id' }, { status: 400 })
  }

  const db = await getDb()
<<<<<<< HEAD
  const documentType = request.nextUrl.searchParams.get('document') === 'invoice' ? 'invoice' : 'receipt'
=======
>>>>>>> e7cd282d2482ffba0f0273ec98994b171c5c5efe
  const order = await db.collection('orders').findOne({ _id: new ObjectId(id) })
  if (!order) {
    return Response.json({ message: 'Order not found' }, { status: 404 })
  }

  if (!admin && order.userId !== user?.id) {
    return Response.json({ message: 'Forbidden' }, { status: 403 })
  }

  const pdfLines = [
    { text: 'TIMBERBELL', x: 50, y: 800, size: 20 },
<<<<<<< HEAD
    { text: documentType === 'invoice' ? 'Commercial Invoice' : 'Receipt', x: 50, y: 780, size: 13 },
=======
    { text: 'Receipt / Invoice', x: 50, y: 780, size: 13 },
>>>>>>> e7cd282d2482ffba0f0273ec98994b171c5c5efe
    { text: `Order Ref: ${id.slice(-6).toUpperCase()}`, x: 50, y: 744, size: 11 },
    { text: `Date: ${new Date(order.createdAt).toLocaleDateString('en-NG')}`, x: 50, y: 726, size: 11 },
    { text: `Customer: ${order.customer?.name || order.customer?.email || 'Customer'}`, x: 50, y: 708, size: 11 },
    { text: `Status: ${String(order.status || 'pending').replace('_', ' ')}`, x: 50, y: 690, size: 11 },
<<<<<<< HEAD
    { text: `Subtotal: ${formatPdfMoney(Number(order.subtotal || 0))}`, x: 50, y: 654, size: 11 },
    { text: `Discount: ${formatPdfMoney(Number(order.discountTotal || 0))}`, x: 50, y: 636, size: 11 },
    { text: `Total: ${formatPdfMoney(Number(order.total || 0))}`, x: 50, y: 618, size: 13 },
=======
    { text: `Subtotal: ${formatMoney(Number(order.subtotal || 0))}`, x: 50, y: 654, size: 11 },
    { text: `Discount: ${formatMoney(Number(order.discountTotal || 0))}`, x: 50, y: 636, size: 11 },
    { text: `Total: ${formatMoney(Number(order.total || 0))}`, x: 50, y: 618, size: 13 },
>>>>>>> e7cd282d2482ffba0f0273ec98994b171c5c5efe
    { text: 'Items', x: 50, y: 582, size: 12 },
    ...((order.items || []) as any[]).flatMap((item, index) => {
      const y = 558 - index * 20
      return [
        { text: `${item.name || 'Item'} x${item.quantity}`, x: 50, y, size: 10 },
<<<<<<< HEAD
        { text: formatPdfMoney((item.price || 0) * item.quantity), x: 430, y, size: 10 },
=======
        { text: formatMoney((item.price || 0) * item.quantity), x: 430, y, size: 10 },
>>>>>>> e7cd282d2482ffba0f0273ec98994b171c5c5efe
      ]
    }),
    { text: 'Thank you for shopping with Timberbell.', x: 50, y: 90, size: 11 },
    { text: 'Lagos, Nigeria', x: 50, y: 72, size: 10 },
  ]

  const pdf = createSimplePdf(pdfLines)
  return new Response(pdf, {
    headers: {
      'Content-Type': 'application/pdf',
<<<<<<< HEAD
      'Content-Disposition': `attachment; filename="timberbell-${documentType}-${id.slice(-6).toUpperCase()}.pdf"`,
      'Cache-Control': 'no-store, max-age=0',
      Pragma: 'no-cache',
      Expires: '0',
=======
      'Content-Disposition': `attachment; filename="timberbell-receipt-${id.slice(-6).toUpperCase()}.pdf"`,
>>>>>>> e7cd282d2482ffba0f0273ec98994b171c5c5efe
    },
  })
}
