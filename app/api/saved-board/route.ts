import { NextRequest } from 'next/server'
import { getUserFromRequest } from '@/lib/authServer'

export async function GET(request: NextRequest) {
  const user = getUserFromRequest(request)
  if (!user) {
    return Response.json({ board: null, authenticated: false })
  }

  const db = await (await import('@/lib/db')).getDb()
  const board = await db.collection('savedBoards').findOne({ userId: user.id })

  return Response.json({
    authenticated: true,
    board: board
      ? {
          id: board._id?.toString?.() ?? null,
          createdAt: board.createdAt,
          updatedAt: board.updatedAt,
          projectType: board.projectType ?? '',
          budget: board.budget ?? '',
          notes: board.notes ?? '',
          items: Array.isArray(board.items) ? board.items : [],
        }
      : null,
    })
}

export async function PUT(request: NextRequest) {
  const user = getUserFromRequest(request)
  if (!user) {
    return Response.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  if (!body) {
    return Response.json({ message: 'Body required' }, { status: 400 })
  }

  const projectType = String(body.projectType || '').trim()
  const budget = String(body.budget || '').trim()
  const notes = String(body.notes || '').trim()
  const items = Array.isArray(body.items)
    ? body.items
        .map((item: any) => ({
          id: String(item?.id || '').trim(),
          name: String(item?.name || '').trim(),
          price: Number(item?.price || 0),
        }))
        .filter((item: { id: string; name: string; price: number }) => item.id && item.name)
        .slice(0, 12)
    : []

  if (!projectType) {
    return Response.json({ message: 'projectType required' }, { status: 400 })
  }

  const db = await (await import('@/lib/db')).getDb()
  const now = new Date()

  await db.collection('savedBoards').updateOne(
    { userId: user.id },
    {
      $setOnInsert: { userId: user.id, createdAt: now },
      $set: {
        projectType,
        budget,
        notes,
        items,
        updatedAt: now,
      },
    },
    { upsert: true }
  )

  return Response.json({ ok: true, message: 'Saved board updated.' })
}

export async function DELETE(request: NextRequest) {
  const user = getUserFromRequest(request)
  if (!user) {
    return Response.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const db = await (await import('@/lib/db')).getDb()
  await db.collection('savedBoards').deleteOne({ userId: user.id })

  return Response.json({ ok: true, message: 'Saved board removed.' })
}
