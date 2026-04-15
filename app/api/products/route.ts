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

