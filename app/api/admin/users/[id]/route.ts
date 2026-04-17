import { NextRequest } from 'next/server'
import { ObjectId } from 'mongodb'
import { isAdminRequest } from '@/lib/admin'

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdminRequest(request)) {
    return Response.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const db = await (await import('@/lib/db')).getDb()
  if (!ObjectId.isValid(id)) {
    return Response.json({ message: 'Invalid user id' }, { status: 400 })
  }
  const query = { _id: new ObjectId(id) }
  const result = await db.collection('users').deleteOne(query)

  if (result.deletedCount === 0) {
    return Response.json({ message: 'User not found' }, { status: 404 })
  }

  return Response.json({ message: 'User deleted' })
}
