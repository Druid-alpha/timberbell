import { NextRequest } from 'next/server'
import { isAdminRequest } from '@/lib/admin'

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return Response.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const db = await (await import('@/lib/db')).getDb()
  const users = await db.collection('users').find({}).limit(20).toArray()

  return Response.json({
    users: users.map((user) => ({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
    })),
  })
}

export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return Response.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => null)

  if (!body?.name || !body?.email) {
    return Response.json({ message: 'name and email are required' }, { status: 400 })
  }

  const db = await (await import('@/lib/db')).getDb()
  const result = await db.collection('users').insertOne({
    name: body.name,
    email: body.email,
    createdAt: new Date(),
  })

  return Response.json({ id: result.insertedId.toString() }, { status: 201 })
}
