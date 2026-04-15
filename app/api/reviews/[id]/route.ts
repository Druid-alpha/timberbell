import { NextRequest } from 'next/server'
import { getDb } from '@/lib/db'
import { isAdminRequest } from '@/lib/admin'
import { ObjectId } from 'mongodb'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdminRequest(request)) {
    return Response.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  if (!ObjectId.isValid(id)) {
    return Response.json({ message: 'Invalid review ID' }, { status: 400 })
  }

  const db = await getDb()
  const result = await db.collection('reviews').deleteOne({ _id: new ObjectId(id) })

  if (result.deletedCount === 0) {
    return Response.json({ message: 'Review not found' }, { status: 404 })
  }

  return Response.json({ message: 'Review deleted successfully' })
}
