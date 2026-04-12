import { NextRequest } from 'next/server'
import { ObjectId } from 'mongodb'
import { getUserFromRequest } from '@/lib/authServer'
import { getCartByUserId } from '@/lib/services/cart'
import { getStripe } from '@/lib/stripe'

const currency = process.env.STRIPE_CURRENCY || 'usd'

export async function POST(request: NextRequest) {
  const user = getUserFromRequest(request)

  if (!user) {
    return Response.json({ message: 'Unauthorized' }, { status: 401 })
  }

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

  if (total <= 0) {
    return Response.json({ message: 'Invalid cart total' }, { status: 400 })
  }

  const orderResult = await db.collection('orders').insertOne({
    userId: user.id,
    items: normalizedItems,
    total,
    status: 'pending',
    paymentStatus: 'requires_payment',
    createdAt: new Date(),
  })

  const orderId = orderResult.insertedId.toString()

  const stripe = getStripe()
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(total * 100),
    currency,
    automatic_payment_methods: { enabled: true },
    metadata: {
      orderId,
      userId: user.id,
    },
  })

  await db.collection('orders').updateOne(
    { _id: new ObjectId(orderId) },
    { $set: { paymentIntentId: paymentIntent.id, updatedAt: new Date() } }
  )

  return Response.json({
    clientSecret: paymentIntent.client_secret,
    orderId,
  })
}
