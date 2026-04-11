import 'server-only'
import { getDb } from '@/lib/db'
import type { Cart } from '@/types/catalog'
import type { CartItem } from '@/types/catalog'

export async function getCartByUserId(userId: string) {
  const db = await getDb()
  const doc = await db.collection('carts').findOne({ userId })

  if (!doc) {
    return null
  }

  return {
    id: doc._id.toString(),
    items: doc.items ?? [],
  } as Cart
}

export async function createCartForUser(userId: string) {
  const db = await getDb()
  const result = await db.collection('carts').insertOne({
    userId,
    items: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  })

  return result.insertedId.toString()
}

export async function addCartItemForUser(userId: string, item: CartItem) {
  const db = await getDb()

  const result = await db.collection('carts').findOneAndUpdate(
    { userId, 'items.productId': item.productId },
    { $inc: { 'items.$.quantity': item.quantity }, $set: { updatedAt: new Date() } },
    { returnDocument: 'after' }
  )

  if (!result.value) {
    await db.collection('carts').updateOne(
      { userId },
      {
        $setOnInsert: { createdAt: new Date() },
        $set: { updatedAt: new Date() },
        $push: { items: item },
      },
      { upsert: true }
    )
  }

  return getCartByUserId(userId)
}

export async function replaceCartItems(userId: string, items: CartItem[]) {
  const db = await getDb()
  await db.collection('carts').updateOne(
    { userId },
    {
      $setOnInsert: { createdAt: new Date() },
      $set: { items, updatedAt: new Date() },
    },
    { upsert: true }
  )

  return getCartByUserId(userId)
}

export async function clearCart(userId: string) {
  const db = await getDb()
  await db.collection('carts').updateOne(
    { userId },
    { $set: { items: [], updatedAt: new Date() } }
  )

  return getCartByUserId(userId)
}
