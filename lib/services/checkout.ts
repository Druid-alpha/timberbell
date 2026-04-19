/* eslint-disable @typescript-eslint/no-explicit-any */
import 'server-only'
import { ObjectId } from 'mongodb'
import { getDb } from '@/lib/db'
import { getCartByUserId, clearActiveCartItems } from '@/lib/services/cart'
import { computeFinalPrice } from '@/lib/utils/pricing'
import { getOrderProgressFromStatus } from '@/lib/orderTracking'

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
    const selectedVariant = Array.isArray(product?.variants)
      ? product.variants.find((variant: any) => variant.id === item.variantId)
      : null
    const unitPrice = product
      ? computeFinalPrice({
          price: typeof selectedVariant?.price === 'number' ? selectedVariant.price : product.price,
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
      name: selectedVariant?.name ? `${product?.name ?? 'Product'} - ${selectedVariant.name}` : product?.name ?? 'Product',
      slug: product?.slug ?? null,
      category: product?.category ?? null,
      image: selectedVariant?.image?.url ?? product?.images?.[0]?.url ?? null,
      variantName: item.variantName ?? selectedVariant?.name ?? null,
      color: item.color ?? selectedVariant?.color ?? null,
      variantId: item.variantId ?? null,
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
    const product = await db.collection('products').findOne(query)
    if (!product) continue

    if (item.variantId && Array.isArray(product.variants)) {
      const variantIndex = product.variants.findIndex((variant: any) => variant.id === item.variantId)
      if (variantIndex >= 0) {
        const currentCount = Number(product.variants[variantIndex]?.stockCount || 0)
        const nextCount = Math.max(0, currentCount - item.quantity)
        const nextVariants = [...product.variants]
        nextVariants[variantIndex] = {
          ...nextVariants[variantIndex],
          stockCount: nextCount,
          stockStatus:
            nextCount <= 0
              ? 'out_of_stock'
              : nextCount <= 3
                ? 'low_stock'
                : nextVariants[variantIndex]?.stockStatus || 'in_stock',
        }
        await db.collection('products').updateOne(query, { $set: { variants: nextVariants, updatedAt: new Date() } })
        continue
      }
    }

    const currentInventory = Number(product.inventoryCount || 0)
    const nextInventory = Math.max(0, currentInventory - item.quantity)
    await db.collection('products').updateOne(query, {
      $set: {
        inventoryCount: nextInventory,
        stockStatus: nextInventory <= 0 ? 'out_of_stock' : nextInventory <= 3 ? 'low_stock' : product.stockStatus || 'in_stock',
        updatedAt: new Date(),
      },
    })
  }

  await clearActiveCartItems(order.userId)

  await db.collection('orders').updateOne(
    { _id: order._id },
    { $set: { fulfillmentApplied: true, fulfillmentAppliedAt: new Date(), updatedAt: new Date() } }
  )
}

export async function markOrderPaymentFailed(input: {
  orderId: any
  paymentStatus: string
  gatewayResponse?: string | null
  failureReason?: string | null
}) {
  const db = await getDb()
  await db.collection('orders').updateOne(
    { _id: input.orderId },
    {
      $set: {
        status: 'payment_failed',
        paymentStatus: input.paymentStatus,
        trackingStage: 'processing',
        trackingUpdatedAt: new Date(),
        paymentGatewayResponse: input.gatewayResponse || null,
        paymentFailureReason: input.failureReason || null,
        updatedAt: new Date(),
      },
    }
  )
}

export async function markOrderPaid(input: {
  order: any
  paidAt?: string | Date
  gatewayResponse?: string | null
  channel?: string | null
}) {
  const db = await getDb()

  await db.collection('orders').updateOne(
    { _id: input.order._id },
    {
      $set: {
        status: 'processing',
        paymentStatus: 'paid',
        trackingStage: getOrderProgressFromStatus('processing').trackingStage,
        trackingUpdatedAt: new Date(),
        paidAt: input.paidAt ? new Date(input.paidAt) : new Date(),
        paymentGatewayResponse: input.gatewayResponse || null,
        paymentChannel: input.channel || null,
        updatedAt: new Date(),
      },
    }
  )

  if (input.order.couponCode && !input.order.couponUsageAppliedAt) {
    const coupon = await db.collection('coupons').findOne({ code: input.order.couponCode })
    await incrementCouponUsage(coupon)
    await db.collection('orders').updateOne(
      { _id: input.order._id },
      { $set: { couponUsageAppliedAt: new Date(), updatedAt: new Date() } }
    )
  }

  await fulfillPaidOrder({ ...input.order, paymentStatus: 'paid' })
}
