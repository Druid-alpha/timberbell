import { NextRequest } from 'next/server'
import { getDb } from '@/lib/db'
import { isAdminRequest } from '@/lib/admin'
import { ObjectId } from 'mongodb'
import { getUserFromRequest } from '@/lib/authServer'

async function getReviewOrError(id: string) {
  if (!ObjectId.isValid(id)) {
    return { error: Response.json({ message: 'Invalid review ID' }, { status: 400 }) }
  }

  const db = await getDb()
  const review = await db.collection('reviews').findOne({ _id: new ObjectId(id) })
  if (!review) {
    return { error: Response.json({ message: 'Review not found' }, { status: 404 }) }
  }

  return { db, review }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = getUserFromRequest(request)
  if (!user) {
    return Response.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const body = await request.json().catch(() => null)
  if (!body?.message || typeof body.rating !== 'number') {
    return Response.json({ message: 'rating and message required' }, { status: 400 })
  }

  const result = await getReviewOrError(id)
  if ('error' in result) return result.error
  if (result.review.userId !== user.id && !isAdminRequest(request)) {
    return Response.json({ message: 'Forbidden' }, { status: 403 })
  }

  await result.db.collection('reviews').updateOne(
    { _id: result.review._id },
    {
      $set: {
        rating: body.rating,
        message: body.message,
        updatedAt: new Date(),
      },
    }
  )

  return Response.json({ message: 'Review updated successfully' })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = getUserFromRequest(request)
  const admin = isAdminRequest(request)
  if (!user && !admin) {
    return Response.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const result = await getReviewOrError(id)
  if ('error' in result) return result.error
  if (!admin && result.review.userId !== user?.id) {
    return Response.json({ message: 'Forbidden' }, { status: 403 })
  }
  const deleteResult = await result.db.collection('reviews').deleteOne({ _id: result.review._id })

  if (deleteResult.deletedCount === 0) {
    return Response.json({ message: 'Review not found' }, { status: 404 })
  }

  return Response.json({ message: 'Review deleted successfully' })
}
