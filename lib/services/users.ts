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
  address?: string
  city?: string
  country?: string
  createdAt: Date
}

export async function findUserByEmail(email: string) {
  const db = await getDb()
  return db.collection<DbUser>('users').findOne({ email })
}

export async function findUserById(id: string) {
  const db = await getDb()
  return db.collection<DbUser>('users').findOne({ _id: new ObjectId(id) })
}

export async function createUser(data: { name: string; email: string; passwordHash: string }) {
  const db = await getDb()
  const result = await db.collection('users').insertOne({
    name: data.name,
    email: data.email,
    passwordHash: data.passwordHash,
    emailVerified: false,
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
  updates: { name?: string; phone?: string; address?: string; city?: string; country?: string }
) {
  const db = await getDb()
  await db.collection('users').updateOne(
    { _id: new ObjectId(userId) },
    { $set: { ...updates, updatedAt: new Date() } }
  )
}
