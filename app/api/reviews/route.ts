import { NextRequest } from 'next/server'

export async function GET() {
  const db = await (await import('@/lib/db')).getDb()
  const reviews = await db.collection('reviews').find({}).sort({ createdAt: -1 }).toArray()

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
  const body = await request.json().catch(() => null)

  if (!body?.productId || !body?.customer || typeof body.rating !== 'number' || !body?.message) {
    return Response.json({ message: 'productId, customer, rating, and message required' }, { status: 400 })
  }

  const db = await (await import('@/lib/db')).getDb()
  const result = await db.collection('reviews').insertOne({
    productId: body.productId,
    customer: body.customer,
    location: body.location,
    rating: body.rating,
    message: body.message,
    createdAt: new Date(),
  })

  return Response.json({ id: result.insertedId.toString() }, { status: 201 })
}
