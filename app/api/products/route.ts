import { NextRequest } from 'next/server'
import { getProducts } from '@/lib/services/catalog'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const category = searchParams.get('category') || undefined
  const query = searchParams.get('q') || undefined

  const products = await getProducts({ category, query })
  return Response.json({ count: products.length, products })
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)

  if (!body?.name || typeof body.price !== 'number' || !body?.category) {
    return Response.json({ message: 'name, price, and category are required' }, { status: 400 })
  }

  const db = await (await import('@/lib/db')).getDb()
  const result = await db.collection('products').insertOne({
    name: body.name,
    slug: body.slug,
    price: body.price,
    compareAt: body.compareAt,
    category: body.category,
    description: body.description ?? '',
    materials: body.materials ?? [],
    finishes: body.finishes ?? [],
    badge: body.badge,
    rating: body.rating ?? 0,
    reviewCount: body.reviewCount ?? 0,
    leadTime: body.leadTime ?? 'TBD',
    dimensions: body.dimensions ?? 'TBD',
    palette: body.palette ?? [],
    images: body.images ?? [],
    createdAt: new Date(),
    updatedAt: new Date(),
  })

  return Response.json({ id: result.insertedId.toString() }, { status: 201 })
}
