import { NextRequest } from 'next/server'
import { searchProducts } from '@/lib/services/catalog'

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

  const result = await searchProducts({
    category,
    query,
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    colors: parseList(colors),
    materials: parseList(materials),
    finishes: parseList(finishes),
    sort: sort as any,
    limit: limitParam ? Number(limitParam) : undefined,
    page: pageParam ? Number(pageParam) : undefined,
  })
  return Response.json({
    total: result.total,
    count: result.products.length,
    page: result.page,
    limit: result.limit,
    products: result.products,
    facets: result.facets,
  })
}

