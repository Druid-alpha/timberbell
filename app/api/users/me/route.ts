import { NextRequest } from 'next/server'
import { getUserFromRequest } from '@/lib/authServer'
import { findUserById, updateUserProfile } from '@/lib/services/users'

export async function GET(request: NextRequest) {
  const user = getUserFromRequest(request)
  if (!user) {
    return Response.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const profile = await findUserById(user.id)
  if (!profile) {
    return Response.json({ message: 'User not found' }, { status: 404 })
  }

  return Response.json({
    user: {
      id: profile._id.toString(),
      name: profile.name,
      email: profile.email?.toLowerCase(),
      phone: profile.phone ?? null,
      avatarUrl: profile.avatarUrl ?? null,
      role: profile.role ?? 'user',
      createdAt: profile.createdAt,
      lastLoginAt: profile.lastLoginAt ?? null,
      address: profile.address ?? null,
      city: profile.city ?? null,
      country: profile.country ?? null,
      emailVerified: profile.emailVerified ?? false,
    },
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

  await updateUserProfile(user.id, {
    name: body.name,
    phone: body.phone,
    address: body.address,
    city: body.city,
    country: body.country,
    avatarUrl: body.avatarUrl,
  })

  return Response.json({ message: 'Profile updated' })
}
