import { NextRequest } from 'next/server'

export async function GET() {
  const db = await (await import('@/lib/db')).getDb()
  const categories = await db.collection('categories').find({}).sort({ name: 1 }).toArray()

  return Response.json({
    count: categories.length,
    categories: categories.map((category) => ({
      id: category._id.toString(),
      ...category,
      _id: undefined,
    })),
  })
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)

  if (!body?.name || !body?.slug) {
    return Response.json({ message: 'name and slug are required' }, { status: 400 })
  }

  const db = await (await import('@/lib/db')).getDb()
  const result = await db.collection('categories').insertOne({
    name: body.name,
    slug: body.slug,
    description: body.description ?? '',
    tone: body.tone,
    createdAt: new Date(),
  })

  return Response.json({ id: result.insertedId.toString() }, { status: 201 })
}
