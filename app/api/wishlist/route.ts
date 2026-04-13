import { NextRequest } from 'next/server'
import { ObjectId } from 'mongodb'
import { getUserFromRequest } from '@/lib/authServer'

async function getWishlistDoc(userId: string) {
  const db = await (await import('@/lib/db')).getDb()
  const existing = await db.collection('wishlists').findOne({ userId })
  if (existing) return existing
  const created = {
    userId,
    items: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  }
  await db.collection('wishlists').insertOne(created)
  return created
}

export async function GET(request: NextRequest) {
  const user = getUserFromRequest(request)
  if (!user) {
    return Response.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const db = await (await import('@/lib/db')).getDb()
  const wishlist = await getWishlistDoc(user.id)
  const ids = (wishlist.items || []).map((item: any) => String(item.productId))

  const objectIds = ids
    .filter((id: string) => ObjectId.isValid(id))
    .map((id: string) => new ObjectId(id))

  const products = ids.length
    ? await db
        .collection('products')
        .find({
          $or: [
            { _id: { $in: objectIds } },
            { slug: { $in: ids } },
          ],
        })
        .toArray()
    : []

  return Response.json({
    items: ids,
    products: products.map((product) => ({
      id: product._id.toString(),
      ...product,
      _id: undefined,
    })),
  })
}

export async function POST(request: NextRequest) {
  const user = getUserFromRequest(request)
  if (!user) {
    return Response.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const productId = body?.productId ? String(body.productId) : ''
  if (!productId) {
    return Response.json({ message: 'productId required' }, { status: 400 })
  }

  const db = await (await import('@/lib/db')).getDb()
  await db.collection('wishlists').updateOne(
    { userId: user.id },
    {
      $setOnInsert: { userId: user.id, createdAt: new Date() },
      $addToSet: { items: { productId, addedAt: new Date() } },
      $set: { updatedAt: new Date() },
    },
    { upsert: true }
  )

  return Response.json({ ok: true })
}

export async function DELETE(request: NextRequest) {
  const user = getUserFromRequest(request)
  if (!user) {
    return Response.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const productId = body?.productId ? String(body.productId) : ''
  if (!productId) {
    return Response.json({ message: 'productId required' }, { status: 400 })
  }

  const db = await (await import('@/lib/db')).getDb()
  await db.collection('wishlists').updateOne(
    { userId: user.id },
    {
      $pull: { items: { productId } } as any,
      $set: { updatedAt: new Date() },
    }
  )

  return Response.json({ ok: true })
}
