import { NextRequest } from 'next/server'
import { ObjectId } from 'mongodb'
import { isAdminRequest } from '@/lib/admin'
import { getCloudinary } from '@/lib/cloudinary'
import { normalizeFurnitureCategory } from '@/lib/catalog-taxonomy'

function getQuery(id: string) {
  return ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { slug: id }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdminRequest(request)) {
    return Response.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const db = await (await import('@/lib/db')).getDb()
  const product = await db.collection('products').findOne(getQuery(id))

  if (!product) {
    return Response.json({ message: 'Product not found' }, { status: 404 })
  }

  return Response.json({
    id: product._id.toString(),
    ...product,
    _id: undefined,
  })
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdminRequest(request)) {
    return Response.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const body = await request.json().catch(() => null)
  if (!body) {
    return Response.json({ message: 'Body required' }, { status: 400 })
  }

  const normalizedCategory = normalizeFurnitureCategory(body.category)
  if (!normalizedCategory) {
    return Response.json({ message: 'Only living room, bedroom, dining, and entryway are supported.' }, { status: 400 })
  }

  const db = await (await import('@/lib/db')).getDb()
  const existing = await db.collection('products').findOne(getQuery(id))
  if (!existing) {
    return Response.json({ message: 'Product not found' }, { status: 404 })
  }

  const existingImages = Array.isArray(existing.images) ? existing.images : []
  const existingVariantImages = Array.isArray(existing.variants)
    ? existing.variants.map((variant: any) => variant?.image).filter(Boolean)
    : []
  const incomingImages = Array.isArray(body.images) ? body.images : []
  const incomingVariantImages = Array.isArray(body.variants)
    ? body.variants.map((variant: any) => variant?.image).filter(Boolean)
    : []
  const existingIds = existingImages
    .map((img: any) => img?.publicId || img?.public_id)
    .filter(Boolean)
  const existingVariantIds = existingVariantImages
    .map((img: any) => img?.publicId || img?.public_id)
    .filter(Boolean)
  const incomingIds = incomingImages
    .map((img: any) => img?.publicId || img?.public_id)
    .filter(Boolean)
  const incomingVariantIds = incomingVariantImages
    .map((img: any) => img?.publicId || img?.public_id)
    .filter(Boolean)
  const removedIds = existingIds.filter((publicId: string) => !incomingIds.includes(publicId))
  const removedVariantIds = existingVariantIds.filter(
    (publicId: string) => !incomingVariantIds.includes(publicId)
  )

  if (removedIds.length || removedVariantIds.length) {
    const cloudinary = getCloudinary()
    await Promise.all(
      [...removedIds, ...removedVariantIds].map((publicId: string) =>
        cloudinary.uploader.destroy(publicId, { invalidate: true }).catch(() => null)
      )
    )
  }

  await db.collection('products').updateOne(
    getQuery(id),
    { $set: { ...body, category: normalizedCategory.name, updatedAt: new Date() } }
  )
  const value = await db.collection('products').findOne(getQuery(id))
  if (!value) {
    return Response.json({ message: 'Product not found' }, { status: 404 })
  }

  return Response.json({
    id: value._id.toString(),
    ...value,
    _id: undefined,
  })
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdminRequest(request)) {
    return Response.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const db = await (await import('@/lib/db')).getDb()
  const product = await db.collection('products').findOne(getQuery(id))

  if (!product) {
    return Response.json({ message: 'Product not found' }, { status: 404 })
  }

  const images = Array.isArray(product.images) ? product.images : []
  const variantImages = Array.isArray(product.variants)
    ? product.variants.map((variant: any) => variant?.image).filter(Boolean)
    : []
  const publicIds = [
    ...images.map((img: any) => img?.publicId || img?.public_id),
    ...variantImages.map((img: any) => img?.publicId || img?.public_id),
  ].filter(Boolean)

  if (publicIds.length) {
    const cloudinary = getCloudinary()
    await Promise.all(
      publicIds.map((publicId: string) =>
        cloudinary.uploader.destroy(publicId, { invalidate: true }).catch(() => null)
      )
    )
  }

  await db.collection('products').deleteOne(getQuery(id))

  return Response.json({ message: 'Product deleted' })
}
