import { NextRequest } from 'next/server'
import { ObjectId } from 'mongodb'
import { isAdminRequest } from '@/lib/admin'
import { getProductByIdOrSlug } from '@/lib/services/catalog'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = await getProductByIdOrSlug(id)

  if (!product) {
    return Response.json({ message: 'Product not found' }, { status: 404 })
  }

  return Response.json(product)
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

  const db = await (await import('@/lib/db')).getDb()
  const query = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { slug: id }

  const result = await db.collection('products').findOneAndUpdate(
    query,
    { $set: { ...body, updatedAt: new Date() } },
    { returnDocument: 'after' }
  )

  if (!result || !result.value) {
    return Response.json({ message: 'Product not found' }, { status: 404 })
  }

  return Response.json({
    id: result.value._id.toString(),
    ...result.value,
    _id: undefined,
  })
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdminRequest(request)) {
    return Response.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const db = await (await import('@/lib/db')).getDb()
  const query = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { slug: id }

  const result = await db.collection('products').deleteOne(query)

  if (result.deletedCount === 0) {
    return Response.json({ message: 'Product not found' }, { status: 404 })
  }

  return Response.json({ message: 'Product deleted' })
}
