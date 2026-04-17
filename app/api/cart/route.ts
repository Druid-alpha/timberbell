import { NextRequest } from 'next/server'
import { ObjectId } from 'mongodb'
import { getUserFromRequest } from '@/lib/authServer'
import {
  addCartItemForUser,
  clearCart,
  getCartByUserId,
  replaceCartItems,
} from '@/lib/services/cart'
import { computeFinalPrice } from '@/lib/utils/pricing'

export async function GET(request: NextRequest) {
  const user = getUserFromRequest(request)

  if (!user) {
    return Response.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const db = await (await import('@/lib/db')).getDb()
  const cart = await getCartByUserId(user.id)

  if (!cart) {
    return Response.json({ cart: null })
  }

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

  const productMap = new Map<string, any>()
  products.forEach((product) => {
    productMap.set(product._id.toString(), product)
    if (product.slug) {
      productMap.set(product.slug, product)
    }
  })

  const items = cart.items.map((item) => {
    const product = productMap.get(item.productId) || null
    if (!product) {
      return { ...item, product: null }
    }
    const selectedVariant = Array.isArray(product.variants)
      ? product.variants.find((variant: any) => variant.id === item.variantId)
      : null
    const basePrice = typeof selectedVariant?.price === 'number' ? selectedVariant.price : product.price
    const finalPrice = computeFinalPrice({
      price: basePrice,
      discountType: product.discountType,
      discountValue: product.discountValue,
      saleDiscount: product.saleDiscount,
      saleStartAt: product.saleStartAt,
      saleEndAt: product.saleEndAt,
    })
    return {
      ...item,
      product: {
        ...product,
        finalPrice,
        inventoryCount: selectedVariant?.stockCount ?? product.inventoryCount,
        stockStatus: selectedVariant?.stockStatus ?? product.stockStatus,
      },
      selectedVariant,
    }
  })

  return Response.json({ cart: { id: cart.id, items } })
}

export async function POST(request: NextRequest) {
  const user = getUserFromRequest(request)

  if (!user) {
    return Response.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => null)

  if (!body?.productId || typeof body.quantity !== 'number') {
    return Response.json({ message: 'productId and quantity are required' }, { status: 400 })
  }

  const cart = await addCartItemForUser(user.id, {
    productId: body.productId,
    variantId: body.variantId ? String(body.variantId) : undefined,
    variantName: body.variantName ? String(body.variantName) : undefined,
    color: body.color ? String(body.color) : undefined,
    quantity: body.quantity,
  })

  return Response.json({ cart })
}

export async function PUT(request: NextRequest) {
  const user = getUserFromRequest(request)

  if (!user) {
    return Response.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  if (!Array.isArray(body?.items)) {
    return Response.json({ message: 'items array required' }, { status: 400 })
  }

  const cart = await replaceCartItems(user.id, body.items)
  return Response.json({ cart })
}

export async function DELETE(request: NextRequest) {
  const user = getUserFromRequest(request)

  if (!user) {
    return Response.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const cart = await clearCart(user.id)
  return Response.json({ cart })
}
