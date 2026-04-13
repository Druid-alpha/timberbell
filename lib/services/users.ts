import 'server-only'
import { ObjectId } from 'mongodb'
import { getDb } from '@/lib/db'

export type DbUser = {
  _id: ObjectId
  name: string
  email: string
  passwordHash: string
  emailVerified?: boolean
  emailVerifiedAt?: Date
  phone?: string
  avatarUrl?: string
  role?: 'admin' | 'user'
  lastLoginAt?: Date
  address?: string
  city?: string
  country?: string
  createdAt: Date
}

export async function findUserByEmail(email: string) {
  const db = await getDb()
  return db.collection<DbUser>('users').findOne({ email: email.toLowerCase() })
}

export async function findUserById(id: string) {
  const db = await getDb()
  return db.collection<DbUser>('users').findOne({ _id: new ObjectId(id) })
}

export async function createUser(data: {
  name: string
  email: string
  passwordHash: string
  avatarUrl?: string | null
}) {
  const db = await getDb()
  const result = await db.collection('users').insertOne({
    name: data.name,
    email: data.email.toLowerCase(),
    passwordHash: data.passwordHash,
    emailVerified: false,
    role: 'user',
    avatarUrl: data.avatarUrl ?? null,
    createdAt: new Date(),
  })

  return result.insertedId.toString()
}

export async function markEmailVerified(userId: string) {
  const db = await getDb()
  await db.collection('users').updateOne(
    { _id: new ObjectId(userId) },
    { $set: { emailVerified: true, emailVerifiedAt: new Date() } }
  )
}

export async function updatePassword(userId: string, passwordHash: string) {
  const db = await getDb()
  await db.collection('users').updateOne(
    { _id: new ObjectId(userId) },
    { $set: { passwordHash } }
  )
}

export async function updateUserProfile(
  userId: string,
  updates: {
    name?: string
    phone?: string
    address?: string
    city?: string
    country?: string
    avatarUrl?: string
  }
) {
  const db = await getDb()
  await db.collection('users').updateOne(
    { _id: new ObjectId(userId) },
    { $set: { ...updates, updatedAt: new Date() } }
  )
}
