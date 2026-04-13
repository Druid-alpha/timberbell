import { NextRequest } from 'next/server'
import { isAdminRequest } from '@/lib/admin'

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return Response.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const db = await (await import('@/lib/db')).getDb()
  const products = await db.collection('products').find({}).sort({ createdAt: -1 }).limit(50).toArray()

  return Response.json({
    products: products.map((product) => ({
      id: product._id.toString(),
      ...product,
      _id: undefined,
    })),
  })
}

export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return Response.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => null)

  if (!body?.name || typeof body.price !== 'number' || !body?.category) {
    return Response.json({ message: 'name, price, and category are required' }, { status: 400 })
  }

  const db = await (await import('@/lib/db')).getDb()
  const result = await db.collection('products').insertOne({
    name: body.name,
    slug: body.slug,
    price: body.price,
    inventoryCount: body.inventoryCount ?? null,
    stockStatus: body.stockStatus ?? 'in_stock',
    discountType: body.discountType ?? null,
    discountValue: body.discountValue ?? null,
    saleDiscount: body.saleDiscount ?? null,
    saleStartAt: body.saleStartAt ? new Date(body.saleStartAt) : null,
    saleEndAt: body.saleEndAt ? new Date(body.saleEndAt) : null,
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
    variants: body.variants ?? [],
    createdAt: new Date(),
    updatedAt: new Date(),
  })

  return Response.json({ id: result.insertedId.toString() }, { status: 201 })
}
