import { NextRequest } from 'next/server'
import { getUserFromRequest } from '@/lib/authServer'
import { getDb } from '@/lib/db'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const productId = searchParams.get('productId')

  const db = await getDb()
  const filter = productId ? { productId } : {}
  const reviews = await db.collection('reviews').find(filter).sort({ createdAt: -1 }).toArray()

  return Response.json({
    count: reviews.length,
    reviews: reviews.map((review) => ({
      id: review._id.toString(),
      ...review,
      _id: undefined,
    })),
  })
}

export async function POST(request: NextRequest) {
  const user = getUserFromRequest(request)
  if (!user) {
    return Response.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  if (!body?.productId || typeof body.rating !== 'number' || !body?.message) {
    return Response.json({ message: 'productId, rating, and message required' }, { status: 400 })
  }

  const db = await getDb()
  const result = await db.collection('reviews').insertOne({
    productId: body.productId,
    userId: user.id,
    customer: (user as any).name || (user as any).email?.split('@')[0] || 'Anonymous',
    rating: body.rating,
    message: body.message,
    createdAt: new Date(),
  })

  return Response.json({ id: result.insertedId.toString() }, { status: 201 })
}
