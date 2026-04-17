import { NextRequest } from 'next/server'
import { getRelatedProducts } from '@/lib/services/catalog'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const productId = searchParams.get('productId')
  const category = searchParams.get('category')
  const limit = parseInt(searchParams.get('limit') || '4')

  if (!productId || !category) {
    return Response.json({ message: 'productId and category required' }, { status: 400 })
  }

  try {
    const products = await getRelatedProducts(productId, category, limit)
    return Response.json({ products })
  } catch (error) {
    return Response.json({ message: 'Error fetching related products' }, { status: 500 })
  }
}
