import 'server-only'
import { getDb } from '@/lib/db'
import type { Cart, CartItem } from '@/types/catalog'

export async function getCartByUserId(userId: string) {
  const db = await getDb()
  const doc = await db.collection<CartDoc>('carts').findOne({ userId })

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
  const result = await db.collection<CartDoc>('carts').insertOne({
    userId,
    items: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  })

  return result.insertedId.toString()
}

export async function addCartItemForUser(userId: string, item: CartItem) {
  const db = await getDb()
  const matchByVariant =
    item.variantId != null
      ? {
          userId,
          items: {
            $elemMatch: {
              productId: item.productId,
              variantId: item.variantId,
            },
          },
        }
      : {
          userId,
          items: {
            $elemMatch: {
              productId: item.productId,
              $or: [{ variantId: { $exists: false } }, { variantId: null }],
            },
          },
        }

  const updateExisting = await db.collection<CartDoc>('carts').updateOne(
    matchByVariant,
    { $inc: { 'items.$.quantity': item.quantity }, $set: { updatedAt: new Date() } }
  )

  if (updateExisting.matchedCount === 0) {
    await db.collection<CartDoc>('carts').updateOne(
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
  await db.collection<CartDoc>('carts').updateOne(
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
  await db.collection<CartDoc>('carts').updateOne(
    { userId },
    { $set: { items: [], updatedAt: new Date() } }
  )

  return getCartByUserId(userId)
}

export async function clearActiveCartItems(userId: string) {
  const db = await getDb()
  const existing = await db.collection<CartDoc>('carts').findOne({ userId })
  const savedItems = (existing?.items || []).filter((item: any) => item.saved)

  await db.collection<CartDoc>('carts').updateOne(
    { userId },
    {
      $setOnInsert: { createdAt: new Date() },
      $set: { items: savedItems, updatedAt: new Date() },
    },
    { upsert: true }
  )

  return getCartByUserId(userId)
}

type CartDoc = {
  userId: string
  items: CartItem[]
  createdAt: Date
  updatedAt: Date
}
