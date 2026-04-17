import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q')?.toLowerCase()

  if (!query) {
    return Response.json({ results: [] })
  }

  const db = await (await import('@/lib/db')).getDb()
  const results = await db
    .collection('products')
    .find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
      ],
    })
    .toArray()

  return Response.json({
    results: results.map((product) => ({
      id: product._id.toString(),
      ...product,
      _id: undefined,
    })),
  })
}
