import { NextRequest } from 'next/server'
import { isAdminRequest } from '@/lib/admin'
import { FURNITURE_CATEGORY_NAMES, FURNITURE_CATEGORY_SLUGS, isSupportedFurnitureCategory } from '@/lib/catalog-taxonomy'

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return Response.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = request.nextUrl
  const q = String(searchParams.get('q') || '').trim()
  const category = String(searchParams.get('category') || '').trim()
  const page = Math.max(1, Number(searchParams.get('page') || 1))
  const limit = Math.min(24, Math.max(1, Number(searchParams.get('limit') || 12)))
  const db = await (await import('@/lib/db')).getDb()
  const filter: Record<string, any> = {
    category: { $in: [...FURNITURE_CATEGORY_SLUGS, ...FURNITURE_CATEGORY_NAMES] },
  }
  const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

  if (category) {
    filter.category = category
  }

  if (q) {
    const tokens = q.split(/\s+/).map((token) => token.trim()).filter(Boolean)
    filter.$and = tokens.map((token) => {
      const term = { $regex: escapeRegex(token), $options: 'i' }
      return {
        $or: [
          { name: term },
          { description: term },
          { slug: term },
          { category: term },
          { badge: term },
          { materials: term },
          { finishes: term },
          { dimensions: term },
          { 'variants.name': term },
          { 'variants.sku': term },
        ],
      }
    })
  }

  const total = await db.collection('products').countDocuments(filter)
  const products = await db
    .collection('products')
    .find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .toArray()

  return Response.json({
    total,
    page,
    limit,
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

  if (!isSupportedFurnitureCategory(body.category)) {
    return Response.json({ message: 'Only living room, bedroom, dining, and entryway are supported.' }, { status: 400 })
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
    category: body.category,
    description: body.description ?? '',
    materials: body.materials ?? [],
    finishes: body.finishes ?? [],
    badge: body.badge,
    rating: body.rating ?? 0,
    reviewCount: body.reviewCount ?? 0,
    dimensions: body.dimensions ?? 'TBD',
    palette: body.palette ?? [],
    images: body.images ?? [],
    variants: body.variants ?? [],
    createdAt: new Date(),
    updatedAt: new Date(),
  })

  return Response.json({ id: result.insertedId.toString() }, { status: 201 })
}
