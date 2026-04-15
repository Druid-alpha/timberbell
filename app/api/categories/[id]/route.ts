import { NextRequest } from 'next/server'
import { ObjectId } from 'mongodb'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const db = await (await import('@/lib/db')).getDb()
  const query = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { slug: id }

  const category = await db.collection('categories').findOne(query)
  if (!category) {
    return Response.json({ message: 'Category not found' }, { status: 404 })
  }

  return Response.json({ id: category._id.toString(), ...category, _id: undefined })
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json().catch(() => null)

  if (!body) {
    return Response.json({ message: 'Body required' }, { status: 400 })
  }

  const db = await (await import('@/lib/db')).getDb()
  const query = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { slug: id }

  const result = await db.collection('categories').findOneAndUpdate(
    query,
    { $set: { ...body, updatedAt: new Date() } },
    { returnDocument: 'after' }
  )

  if (!result || !result.value) {
    return Response.json({ message: 'Category not found' }, { status: 404 })
  }

  return Response.json({ id: result.value._id.toString(), ...result.value, _id: undefined })
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const db = await (await import('@/lib/db')).getDb()
  const query = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { slug: id }

  const result = await db.collection('categories').deleteOne(query)

  if (result.deletedCount === 0) {
    return Response.json({ message: 'Category not found' }, { status: 404 })
  }

  return Response.json({ message: 'Category deleted' })
}
