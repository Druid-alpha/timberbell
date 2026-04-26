import 'server-only'
import { ObjectId } from 'mongodb'
import { getDb } from '@/lib/db'
import type { Category, Product, ProductFacetSummary, ProductSearchResult, Review } from '@/types/catalog'
import { computeFinalPrice } from '@/lib/utils/pricing'
import { getColorFamily } from '@/lib/utils/color-name'
import { FURNITURE_CATEGORY_NAMES, FURNITURE_CATEGORY_SLUGS } from '@/lib/catalog-taxonomy'

const fallbackPalette = ['#f4e7d2', '#eab38b', '#c59a6b']
const PRODUCT_SEARCH_FIELDS = [
  'name',
  'description',
  'slug',
  'category',
  'materials',
  'finishes',
  'badge',
  'dimensions',
  'variants.name',
  'variants.sku',
  'variants.color',
] as const

const toId = (value: ObjectId) => value.toString()

const normalizeProduct = (doc: any): Product => ({
  id: toId(doc._id),
  slug: doc.slug,
  name: doc.name,
  price: doc.price,
  inventoryCount: doc.inventoryCount ?? null,
  stockStatus: doc.stockStatus ?? 'in_stock',
  discountType: doc.discountType,
  discountValue: doc.discountValue,
  saleDiscount: doc.saleDiscount,
  saleStartAt: doc.saleStartAt ?? null,
  saleEndAt: doc.saleEndAt ?? null,
  finalPrice: computeFinalPrice({
    price: doc.price,
    discountType: doc.discountType,
    discountValue: doc.discountValue,
    saleDiscount: doc.saleDiscount,
    saleStartAt: doc.saleStartAt ?? null,
    saleEndAt: doc.saleEndAt ?? null,
  }),
  compareAt: doc.compareAt,
  category: doc.category,
  description: doc.description ?? '',
  materials: doc.materials ?? [],
  finishes: doc.finishes ?? [],
  badge: doc.badge,
  rating: doc.rating ?? 0,
  reviewCount: doc.reviewCount ?? 0,
  dimensions: doc.dimensions ?? 'TBD',
  palette: doc.palette?.length ? doc.palette : fallbackPalette,
  images: doc.images ?? [],
  variants: doc.variants ?? [],
})

const normalizeCategory = (doc: any): Category => ({
  id: toId(doc._id),
  slug: doc.slug,
  name: doc.name,
  description: doc.description ?? '',
  tone: doc.tone,
})

const normalizeReview = (doc: any): Review => ({
  id: toId(doc._id),
  productId: doc.productId?.toString?.() ?? doc.productId,
  customer: doc.customer,
  location: doc.location,
  rating: doc.rating,
  message: doc.message,
  createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : undefined,
})

async function attachReviewStats(db: any, rows: any[]) {
  if (!rows.length) return rows

  const productIds = rows.map((row) => row._id.toString())
  const stats = await db
    .collection('reviews')
    .aggregate([
      { $match: { productId: { $in: productIds } } },
      {
        $group: {
          _id: '$productId',
          rating: { $avg: '$rating' },
          reviewCount: { $sum: 1 },
        },
      },
    ])
    .toArray()

  const statsMap = new Map(
    stats.map((entry: any) => [
      String(entry._id),
      {
        rating: Number(entry.rating || 0),
        reviewCount: Number(entry.reviewCount || 0),
      },
    ])
  )

  return rows.map((row) => {
    const stat = statsMap.get(row._id.toString()) as { rating: number; reviewCount: number } | undefined
    if (!stat) return row
    return { ...row, rating: stat.rating, reviewCount: stat.reviewCount }
  })
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function buildSearchFieldMatch(regex: string) {
  return PRODUCT_SEARCH_FIELDS.map((field) => ({
    [field]: { $regex: regex, $options: 'i' },
  }))
}

function buildCatalogTextSearch(query?: string) {
  const normalized = String(query || '').trim()
  if (!normalized) return null

  const escapedQuery = escapeRegex(normalized)
  const tokens = normalized
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(Boolean)
    .map(escapeRegex)

  const rules: Record<string, any>[] = [
    { $or: buildSearchFieldMatch(escapedQuery) },
  ]

  if (tokens.length > 1) {
    rules.push(
      ...tokens.map((token) => ({
        $or: buildSearchFieldMatch(token),
      }))
    )
  }

  if (rules.length === 1) {
    return rules[0]
  }

  return { $and: rules }
}

async function buildCatalogBaseFilter(
  db: any,
  params?: {
    category?: string
    query?: string
    minPrice?: number
    maxPrice?: number
    colors?: string[]
    materials?: string[]
    finishes?: string[]
  }
) {
  const filter: Record<string, any> = {
    category: { $in: [...FURNITURE_CATEGORY_SLUGS, ...FURNITURE_CATEGORY_NAMES] },
  }

  if (params?.category) {
    const categoryRows = await db
      .collection('categories')
      .find({
        $or: [
          { slug: params.category },
          { name: { $regex: `^${params.category}$`, $options: 'i' } },
        ],
      })
      .toArray()
    const categoryNames = Array.from(new Set(categoryRows.map((row: any) => row.name).filter(Boolean)))
    filter.category = categoryNames.length
      ? { $in: [params.category, ...categoryNames] }
      : params.category
  }

  if (params?.query) {
    const textSearch = buildCatalogTextSearch(params.query)
    if (textSearch?.$and) {
      filter.$and = [...(filter.$and || []), ...textSearch.$and]
    } else if (textSearch?.$or) {
      filter.$or = textSearch.$or
    }
  }

  if (typeof params?.minPrice === 'number' || typeof params?.maxPrice === 'number') {
    filter.price = {}
    if (typeof params?.minPrice === 'number') filter.price.$gte = params.minPrice
    if (typeof params?.maxPrice === 'number') filter.price.$lte = params.maxPrice
  }

  if (params?.materials?.length) {
    filter.$and = [
      ...(filter.$and || []),
      { $or: [{ materials: { $in: params.materials } }, { 'variants.materials': { $in: params.materials } }] },
    ]
  }

  if (params?.finishes?.length) {
    filter.$and = [
      ...(filter.$and || []),
      { $or: [{ finishes: { $in: params.finishes } }, { 'variants.finishes': { $in: params.finishes } }] },
    ]
  }

  return filter
}

function getCatalogSort(sort?: 'price_asc' | 'price_desc' | 'newest' | 'rating') {
  switch (sort) {
    case 'price_asc':
      return { price: 1 } as Record<string, 1 | -1>
    case 'price_desc':
      return { price: -1 } as Record<string, 1 | -1>
    case 'rating':
      return { rating: -1, createdAt: -1 } as Record<string, 1 | -1>
    case 'newest':
    default:
      return { createdAt: -1 } as Record<string, 1 | -1>
  }
}

function productMatchesColorFilters(row: any, colors?: string[]) {
  if (!colors?.length) return true

  const colorPool = [
    ...(Array.isArray(row.palette) ? row.palette : []),
    ...((Array.isArray(row.variants) ? row.variants : []).map((variant: any) => variant?.color).filter(Boolean)),
  ]
  const families = new Set(colorPool.map((color: string) => getColorFamily(color)).filter(Boolean))
  return colors.some((color) => families.has(color))
}

function buildFacetSummary(rows: Product[]): ProductFacetSummary {
  let min = Number.POSITIVE_INFINITY
  let max = 0
  const colors = new Set<string>()
  const materials = new Map<string, string>()

  rows.forEach((product) => {
    const prices = [Number(product.finalPrice ?? product.price ?? 0)]
    prices.forEach((price) => {
      if (price > 0) {
        min = Math.min(min, price)
        max = Math.max(max, price)
      }
    })

    const colorPool = [
      ...(product.palette ?? []),
      ...((product.variants ?? []).map((variant) => variant.color).filter(Boolean) as string[]),
    ]
    colorPool.forEach((color) => {
      const family = getColorFamily(color)
      if (family) colors.add(family)
    })

    const materialPool = [
      ...(product.materials ?? []),
      ...((product.variants ?? []).flatMap((variant) => variant.materials ?? [])),
    ]
    materialPool.forEach((material) => {
      const clean = String(material || '').trim()
      if (!clean) return
      const key = clean.toLowerCase()
      if (!materials.has(key)) materials.set(key, clean)
    })
  })

  return {
    priceRange: {
      min: Number.isFinite(min) ? min : 0,
      max,
    },
    colors: Array.from(colors).sort((left, right) => left.localeCompare(right)),
    materials: Array.from(materials.values()).sort((left, right) => left.localeCompare(right)),
  }
}

export async function getCategories() {
  const db = await getDb()
  const rows = await db.collection('categories').find({ slug: { $in: FURNITURE_CATEGORY_SLUGS } }).sort({ name: 1 }).toArray()
  return rows.map(normalizeCategory)
}

export async function getProducts(params?: {
  category?: string
  query?: string
  minPrice?: number
  maxPrice?: number
  colors?: string[]
  materials?: string[]
  finishes?: string[]
  sort?: 'price_asc' | 'price_desc' | 'newest' | 'rating'
}) {
  const db = await getDb()
  const filter = await buildCatalogBaseFilter(db, params)
  const sort = getCatalogSort(params?.sort)

  let rows = await db.collection('products').find(filter).sort(sort).toArray()
  rows = rows.filter((row) => productMatchesColorFilters(row, params?.colors))
  const rowsWithStats = await attachReviewStats(db, rows)
  return rowsWithStats.map(normalizeProduct)
}

export async function searchProducts(params?: {
  category?: string
  query?: string
  minPrice?: number
  maxPrice?: number
  colors?: string[]
  materials?: string[]
  finishes?: string[]
  sort?: 'price_asc' | 'price_desc' | 'newest' | 'rating'
  page?: number
  limit?: number
}): Promise<ProductSearchResult> {
  const db = await getDb()
  const filter = await buildCatalogBaseFilter(db, params)
  const sort = getCatalogSort(params?.sort)
  const page = Math.max(1, Number(params?.page || 1))
  const limit = Math.max(1, Number(params?.limit || 12))

  let rows = await db.collection('products').find(filter).sort(sort).toArray()
  rows = rows.filter((row) => productMatchesColorFilters(row, params?.colors))

  const rowsWithStats = await attachReviewStats(db, rows)
  const normalized = rowsWithStats.map(normalizeProduct)
  const total = normalized.length
  const start = (page - 1) * limit
  const products = normalized.slice(start, start + limit)

  return {
    total,
    page,
    limit,
    products,
    facets: buildFacetSummary(normalized),
  }
}

export async function searchProductsPreview(input: {
  query?: string
  limit?: number
}) {
  const normalizedQuery = String(input.query || '').trim()
  if (!normalizedQuery) return []

  const result = await searchProducts({
    query: normalizedQuery,
    sort: 'rating',
    page: 1,
    limit: Math.max(1, Number(input.limit || 8)),
  })

  return result.products
}

export async function getFeaturedProducts(limit = 6) {
  const db = await getDb()
  const rows = await db
    .collection('products')
    .find({ category: { $in: [...FURNITURE_CATEGORY_SLUGS, ...FURNITURE_CATEGORY_NAMES] } })
    .sort({ rating: -1, createdAt: -1 })
    .limit(limit)
    .toArray()
  const rowsWithStats = await attachReviewStats(db, rows)
  return rowsWithStats.map(normalizeProduct)
}

export async function getProductByIdOrSlug(idOrSlug: string) {
  const db = await getDb()
  const isObjectId = ObjectId.isValid(idOrSlug)
  const query = isObjectId
    ? { _id: new ObjectId(idOrSlug) }
    : { slug: idOrSlug }

  const doc = await db.collection('products').findOne(query)
  if (!doc) return null
  const [withStats] = await attachReviewStats(db, [doc])
  return normalizeProduct(withStats)
}

export async function getReviews(limit = 3) {
  const db = await getDb()
  const rows = await db
    .collection('reviews')
    .find({})
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray()

  return rows.map(normalizeReview)
}

export async function getCollection(slug: string) {
  return getProducts({ category: slug })
}

export async function getRelatedProducts(productId: string, category: string, limit = 4) {
  const db = await getDb()
  const rows = await db
    .collection('products')
    .find({
      category,
      _id: { $ne: new ObjectId(productId) },
    })
    .limit(limit)
    .toArray()
  const rowsWithStats = await attachReviewStats(db, rows)
  return rowsWithStats.map(normalizeProduct)
}
