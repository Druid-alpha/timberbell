import { NextRequest } from 'next/server'
import { ObjectId } from 'mongodb'
import { getUserFromRequest } from '@/lib/authServer'
import { clearCart, getCartByUserId } from '@/lib/services/cart'

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

  const priceMap = new Map<string, number>()
  products.forEach((product) => {
    priceMap.set(product._id.toString(), product.price)
    if (product.slug) {
      priceMap.set(product.slug, product.price)
    }
  })

  let total = 0
  const normalizedItems = cart.items.map((item) => {
    const price = priceMap.get(item.productId) ?? 0
    total += price * item.quantity
    return { ...item, price }
  })

  const result = await db.collection('orders').insertOne({
    userId: user.id,
    items: normalizedItems,
    total,
    status: 'pending',
    customer: body.customer ?? null,
    createdAt: new Date(),
  })

  await clearCart(user.id)

  return Response.json({ id: result.insertedId.toString(), total }, { status: 201 })
}
