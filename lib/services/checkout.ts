import 'server-only'
import { ObjectId } from 'mongodb'
import { getDb } from '@/lib/db'
import { getCartByUserId, clearActiveCartItems } from '@/lib/services/cart'
import { computeFinalPrice } from '@/lib/utils/pricing'

type CheckoutInput = {
  userId: string
  customer?: unknown
  notes?: string
  couponCode?: string
}

export async function buildOrderDraft(input: CheckoutInput) {
  const couponCodeRaw = String(input.couponCode || '').trim()
  const cart = await getCartByUserId(input.userId)
  const activeItems = (cart?.items || []).filter((item: any) => !item.saved)

  if (!activeItems.length) {
    throw new Error('Cart is empty')
  }

  const db = await getDb()
  const productIds = activeItems.map((item) => item.productId)
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
  const normalizedItems = activeItems.map((item: any) => {
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

  return {
    db,
    cart,
    items: normalizedItems,
    subtotal,
    discountTotal,
    total,
    customer: input.customer ?? null,
    notes: input.notes ?? '',
    coupon,
  }
}

export async function incrementCouponUsage(coupon: any) {
  if (!coupon?._id) return
  const db = await getDb()
  await db.collection('coupons').updateOne({ _id: coupon._id }, { $inc: { usedCount: 1 } })
}

export async function fulfillPaidOrder(order: any) {
  if (!order?._id || order.fulfillmentApplied) return

  const db = await getDb()
  const items = Array.isArray(order.items) ? order.items : []

  for (const item of items) {
    if (!item.productId) continue
    const query = ObjectId.isValid(item.productId)
      ? { _id: new ObjectId(item.productId) }
      : { slug: item.productId }

    await db.collection('products').updateOne(query, { $inc: { inventoryCount: -item.quantity } })
  }

  await clearActiveCartItems(order.userId)

  await db.collection('orders').updateOne(
    { _id: order._id },
    { $set: { fulfillmentApplied: true, fulfillmentAppliedAt: new Date(), updatedAt: new Date() } }
  )
}
