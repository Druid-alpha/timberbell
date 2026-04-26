import { NextRequest } from 'next/server'
import { searchProductsPreview } from '@/lib/services/catalog'

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q') || ''

  if (!query.trim()) {
    return Response.json({ results: [] })
  }

  const results = await searchProductsPreview({
    query,
    limit: 8,
  })

  return Response.json({
    results,
  })
}
