import 'server-only'
import { ObjectId } from 'mongodb'
import { getDb } from '@/lib/db'

export async function createEmailVerification(userId: string, tokenHash: string, expiresAt: Date) {
  const db = await getDb()
  await db.collection('email_verifications').deleteMany({
    userId: new ObjectId(userId),
  })
  await db.collection('email_verifications').insertOne({
    userId: new ObjectId(userId),
    tokenHash,
    expiresAt,
    createdAt: new Date(),
  })
}

export async function findEmailVerification(tokenHash: string, userId?: string) {
  const db = await getDb()
  const query: { tokenHash: string; userId?: ObjectId } = { tokenHash }
  if (userId) {
    query.userId = new ObjectId(userId)
  }
  const record = await db.collection('email_verifications').findOne(query)

  if (!record) {
    return null
  }

  if (record.expiresAt && record.expiresAt < new Date()) {
    await db.collection('email_verifications').deleteOne({ _id: record._id })
    return null
  }

  return record
}

export async function deleteEmailVerification(id: ObjectId) {
  const db = await getDb()
  await db.collection('email_verifications').deleteOne({ _id: id })
}

export async function createPasswordReset(userId: string, tokenHash: string, expiresAt: Date) {
  const db = await getDb()
  await db.collection('password_resets').insertOne({
    userId: new ObjectId(userId),
    tokenHash,
    expiresAt,
    createdAt: new Date(),
  })
}

export async function consumePasswordReset(tokenHash: string) {
  const db = await getDb()
  const record = await db.collection('password_resets').findOne({ tokenHash })

  if (!record) {
    return null
  }

  if (record.expiresAt && record.expiresAt < new Date()) {
    await db.collection('password_resets').deleteOne({ _id: record._id })
    return null
  }

  await db.collection('password_resets').deleteOne({ _id: record._id })
  return record
}
