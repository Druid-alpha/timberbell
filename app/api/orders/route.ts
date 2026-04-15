import { NextRequest } from 'next/server'
import { ObjectId } from 'mongodb'
import { getUserFromRequest } from '@/lib/authServer'
import { clearCart, getCartByUserId } from '@/lib/services/cart'
import { computeFinalPrice } from '@/lib/utils/pricing'

export async function GET(request: NextRequest) {
  const user = getUserFromRequest(request)

  if (!user) {
    return Response.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const db = await (await import('@/lib/db')).getDb()
  const orders = await db
    .collection('orders')
    .find({ userId: user.id })
    .sort({ createdAt: -1 })
    .toArray()

  return Response.json({
    orders: orders.map((order) => ({
      id: order._id.toString(),
      ...order,
      _id: undefined,
    })),
  })
}

export async function POST(request: NextRequest) {
  const user = getUserFromRequest(request)

  if (!user) {
    return Response.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  const couponCodeRaw = String(body?.couponCode || '').trim()
  const cart = await getCartByUserId(user.id)

  if (!cart || cart.items.length === 0) {
    return Response.json({ message: 'Cart is empty' }, { status: 400 })
  }

  const db = await (await import('@/lib/db')).getDb()
  const productIds = cart.items.map((item) => item.productId)

  const products = await db
    .collection('products')
    .find({
      $or: [
        { _id: { $in: productIds.filter((id) => ObjectId.isValid(id)).map((id) => new ObjectId(id)) } },
        { slug: { $in: productIds } },
      ],
    })
    .toArray()

  const priceMap = new Map<string, any>()
  products.forEach((product) => {
    priceMap.set(product._id.toString(), product)
    if (product.slug) {
      priceMap.set(product.slug, product)
    }
  })

  let subtotal = 0
  const normalizedItems = cart.items.map((item) => {
    const product = priceMap.get(item.productId)
    const unitPrice = product
      ? computeFinalPrice({
          price: product.price,
          discountType: product.discountType,
          discountValue: product.discountValue,
          saleDiscount: product.saleDiscount,
          saleStartAt: product.saleStartAt,
          saleEndAt: product.saleEndAt,
        })
      : 0
    subtotal += unitPrice * item.quantity
    return {
      ...item,
      price: unitPrice,
      name: product?.name ?? 'Product',
      slug: product?.slug ?? null,
      category: product?.category ?? null,
      image: product?.images?.[0]?.url ?? null,
    }
  })

  let coupon = null
  let discountTotal = 0
  if (couponCodeRaw) {
    const code = couponCodeRaw.toUpperCase()
    const now = new Date()
    const found = await db.collection('coupons').findOne({ code })
    if (found && found.isActive !== false) {
      if ((!found.startsAt || new Date(found.startsAt) <= now) && (!found.endsAt || new Date(found.endsAt) >= now)) {
        if (!found.maxUses || found.usedCount < found.maxUses) {
          const eligibleIds = Array.isArray(found.productIds) ? found.productIds.map(String) : []
          if (eligibleIds.length) {
            const discountType = found.discountType || 'percentage'
            const discountValue = Number(found.discountValue || 0)

            normalizedItems.forEach((item) => {
              const product = priceMap.get(item.productId)
              if (!product) return
              const matches = eligibleIds.includes(String(product._id)) || (product.slug && eligibleIds.includes(String(product.slug)))
              if (!matches) return
              const lineTotal = (item.price || 0) * item.quantity
              let discount = 0
              if (discountType === 'percentage') {
                discount = Math.round(lineTotal * (discountValue / 100))
              } else {
                discount = Math.round(discountValue * item.quantity)
              }
              discountTotal += Math.min(discount, lineTotal)
            })
            if (discountTotal > 0) {
              coupon = found
            }
          }
        }
      }
    }
  }

  const total = Math.max(0, subtotal - discountTotal)

  const result = await db.collection('orders').insertOne({
    userId: user.id,
    items: normalizedItems,
    subtotal,
    discountTotal,
    couponCode: coupon?.code || null,
    total,
    status: 'pending',
    customer: body.customer ?? null,
    createdAt: new Date(),
  })

  if (coupon?.code) {
    await db.collection('coupons').updateOne(
      { _id: coupon._id },
      { $inc: { usedCount: 1 } }
    )
  }

  await clearCart(user.id)

  // Stock Reduction
  try {
    for (const item of normalizedItems) {
      if (!item.productId) continue
      const query = ObjectId.isValid(item.productId) 
        ? { _id: new ObjectId(item.productId) } 
        : { slug: item.productId }
      await db.collection('products').updateOne(query, { $inc: { inventoryCount: -item.quantity } })
    }
  } catch (err) {
    console.error('Stock reduction failed:', err)
  }

  return Response.json({ id: result.insertedId.toString(), total }, { status: 201 })
}
