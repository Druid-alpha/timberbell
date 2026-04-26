import ProductFilterClient from '@/app/(site)/_components/ProductFilterClient'
import { getCategories, searchProducts } from '@/lib/services/catalog'

type SearchParamsInput = {
  q?: string
  category?: string
  minPrice?: string
  maxPrice?: string
  colors?: string
  materials?: string
  finishes?: string
  sort?: string
  page?: string
}

const parseList = (value?: string) =>
  value ? value.split(',').map((item) => item.trim()).filter(Boolean) : undefined

export default async function ProductFilterPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParamsInput>
}) {
  const params = (await searchParams) || {}
  const query = params.q || ''
  const category = params.category || ''
  const minPriceParam = params.minPrice || ''
  const maxPriceParam = params.maxPrice || ''
  const colorsParam = params.colors || ''
  const materialsParam = params.materials || ''
  const sortParam = params.sort || 'newest'
  const pageParam = params.page || '1'
  const page = Math.max(1, Number(pageParam) || 1)

  const filters = {
    category: category || undefined,
    query: query || undefined,
    minPrice: minPriceParam ? Number(minPriceParam) : undefined,
    maxPrice: maxPriceParam ? Number(maxPriceParam) : undefined,
    colors: parseList(colorsParam),
    materials: parseList(materialsParam),
    finishes: parseList(params.finishes),
    sort: sortParam as 'price_asc' | 'price_desc' | 'newest' | 'rating',
    page,
    limit: 12,
  }

  const [categories, result] = await Promise.all([
    getCategories(),
    searchProducts(filters),
  ])

  return (
    <ProductFilterClient
      categories={categories}
      products={result.products}
      facets={result.facets}
      total={result.total}
      query={query}
      category={category}
      minPriceParam={minPriceParam}
      maxPriceParam={maxPriceParam}
      colorsParam={colorsParam}
      materialsParam={materialsParam}
      sortParam={sortParam}
      pageParam={pageParam}
    />
  )
}
