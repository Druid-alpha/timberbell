import { NextRequest } from 'next/server'
import { getProducts } from '@/lib/services/catalog'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const category = searchParams.get('category') || undefined
  const query = searchParams.get('q') || undefined
  const minPrice = searchParams.get('minPrice')
  const maxPrice = searchParams.get('maxPrice')
  const colors = searchParams.get('colors')
  const materials = searchParams.get('materials')
  const finishes = searchParams.get('finishes')
  const sort = searchParams.get('sort') || undefined
  const limitParam = searchParams.get('limit')
  const pageParam = searchParams.get('page')

  const parseList = (value: string | null) =>
    value ? value.split(',').map((item) => item.trim()).filter(Boolean) : undefined

  const products = await getProducts({
    category,
    query,
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    colors: parseList(colors),
    materials: parseList(materials),
    finishes: parseList(finishes),
    sort: sort as any,
  })

  const limit = limitParam ? Number(limitParam) : undefined
  const page = pageParam ? Math.max(1, Number(pageParam)) : 1
  const total = products.length
  const start = limit ? (page - 1) * limit : 0
  const sliced = limit ? products.slice(start, start + limit) : products
  return Response.json({ total, count: sliced.length, page, products: sliced })
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
