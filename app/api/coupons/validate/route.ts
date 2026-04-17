import { NextRequest } from 'next/server'
import { ObjectId } from 'mongodb'
import { computeFinalPrice } from '@/lib/utils/pricing'

const normalizeCode = (code: string) => String(code || '').trim().toUpperCase()

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}))
  const code = normalizeCode(body?.code)
  const items = Array.isArray(body?.items) ? body.items : []

  if (!code) {
    return Response.json({ valid: false, message: 'Coupon code required' }, { status: 400 })
  }

  const db = await (await import('@/lib/db')).getDb()
  const coupon = await db.collection('coupons').findOne({ code })

  if (!coupon || coupon.isActive === false) {
    return Response.json({ valid: false, message: 'Coupon not found' }, { status: 404 })
  }

  const now = new Date()
  if (coupon.startsAt && new Date(coupon.startsAt) > now) {
    return Response.json({ valid: false, message: 'Coupon not active yet' }, { status: 400 })
  }
  if (coupon.endsAt && new Date(coupon.endsAt) < now) {
    return Response.json({ valid: false, message: 'Coupon has expired' }, { status: 400 })
  }
  if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
    return Response.json({ valid: false, message: 'Coupon usage limit reached' }, { status: 400 })
  }

  const productIds = items.map((item: any) => item.productId).filter(Boolean)
  const products = await db
    .collection('products')
    .find({
      $or: [
        { _id: { $in: productIds.filter((id: string) => ObjectId.isValid(id)).map((id: string) => new ObjectId(id)) } },
        { slug: { $in: productIds } },
      ],
    })
    .toArray()

  const productMap = new Map<string, any>()
  products.forEach((product) => {
    productMap.set(product._id.toString(), product)
    if (product.slug) productMap.set(product.slug, product)
  })

  const eligibleIds = Array.isArray(coupon.productIds) ? coupon.productIds.map(String) : []
  const discountType = coupon.discountType || 'percentage'
  const discountValue = Number(coupon.discountValue || 0)

  if (!eligibleIds.length) {
    return Response.json({ valid: false, message: 'Coupon has no eligible products' }, { status: 400 })
  }

  let discountTotal = 0
  const lineDiscounts = items.map((item: any) => {
    const product = productMap.get(item.productId)
    if (!product) {
      return { productId: item.productId, discount: 0 }
    }

    const matches = eligibleIds.includes(String(product._id)) || (product.slug && eligibleIds.includes(String(product.slug)))
    if (!matches) {
      return { productId: item.productId, discount: 0 }
    }

    const basePrice = computeFinalPrice({
      price: product.price,
      discountType: product.discountType,
      discountValue: product.discountValue,
      saleDiscount: product.saleDiscount,
      saleStartAt: product.saleStartAt,
      saleEndAt: product.saleEndAt,
    })
    const qty = Math.max(1, Number(item.quantity || 1))
    const lineTotal = basePrice * qty

    let discount = 0
    if (discountType === 'percentage') {
      discount = Math.round(lineTotal * (discountValue / 100))
    } else {
      discount = Math.round(discountValue * qty)
    }
    discount = Math.min(discount, lineTotal)
    discountTotal += discount

    return { productId: item.productId, discount }
  })

  if (discountTotal <= 0) {
    return Response.json({ valid: false, message: 'Coupon does not apply to your cart' }, { status: 400 })
  }

  return Response.json({
    valid: true,
    code,
    discountTotal,
    discounts: lineDiscounts,
  })
}
