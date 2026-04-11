import 'server-only'
import { ObjectId } from 'mongodb'
import { getDb } from '@/lib/db'
import type { Category, Product, Review } from '@/types/catalog'

const fallbackPalette = ['#f4e7d2', '#eab38b', '#c59a6b']

const toId = (value: ObjectId) => value.toString()

const normalizeProduct = (doc: any): Product => ({
  id: toId(doc._id),
  slug: doc.slug,
  name: doc.name,
  price: doc.price,
  compareAt: doc.compareAt,
  category: doc.category,
  description: doc.description ?? '',
  materials: doc.materials ?? [],
  finishes: doc.finishes ?? [],
  badge: doc.badge,
  rating: doc.rating ?? 0,
  reviewCount: doc.reviewCount ?? 0,
  leadTime: doc.leadTime ?? 'TBD',
  dimensions: doc.dimensions ?? 'TBD',
  palette: doc.palette?.length ? doc.palette : fallbackPalette,
  images: doc.images ?? [],
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

export async function getCategories() {
  const db = await getDb()
  const rows = await db.collection('categories').find({}).sort({ name: 1 }).toArray()
  return rows.map(normalizeCategory)
}

export async function getProducts(params?: { category?: string; query?: string }) {
  const db = await getDb()
  const filter: Record<string, any> = {}

  if (params?.category) {
    filter.category = params.category
  }

  if (params?.query) {
    filter.$or = [
      { name: { $regex: params.query, $options: 'i' } },
      { description: { $regex: params.query, $options: 'i' } },
    ]
  }

  const rows = await db.collection('products').find(filter).sort({ createdAt: -1 }).toArray()
  return rows.map(normalizeProduct)
}

export async function getFeaturedProducts(limit = 6) {
  const db = await getDb()
  const rows = await db
    .collection('products')
    .find({})
    .sort({ rating: -1, createdAt: -1 })
    .limit(limit)
    .toArray()

  return rows.map(normalizeProduct)
}

export async function getProductByIdOrSlug(idOrSlug: string) {
  const db = await getDb()
  const isObjectId = ObjectId.isValid(idOrSlug)
  const query = isObjectId
    ? { _id: new ObjectId(idOrSlug) }
    : { slug: idOrSlug }

  const doc = await db.collection('products').findOne(query)
  return doc ? normalizeProduct(doc) : null
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
