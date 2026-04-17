import { NextResponse } from 'next/server'
import { findUserByEmail } from '@/lib/services/users'
import { signToken, verifyPassword } from '@/lib/auth'

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)

  if (!body?.email || !body?.password) {
    return NextResponse.json({ message: 'email and password required' }, { status: 400 })
  }

  const normalizedEmail = String(body.email).toLowerCase()
  const user = await findUserByEmail(normalizedEmail)
  if (!user) {
    return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 })
  }

  if (!user.emailVerified) {
    return NextResponse.json(
      { message: 'Please verify your email before logging in.' },
      { status: 403 }
    )
  }

  const valid = await verifyPassword(body.password, user.passwordHash)
  if (!valid) {
    return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 })
  }

  const token = signToken({ id: user._id.toString(), email: user.email })
  const { getDb } = await import('@/lib/db')
  const db = await getDb()
  await db.collection('users').updateOne(
    { _id: user._id },
    { $set: { lastLoginAt: new Date() } }
  )
  const response = NextResponse.json({
    user: {
      id: user._id.toString(),
      name: user.name || (user.firstName ? `${user.firstName} ${user.lastName ?? ''}`.trim() : null),
      email: user.email.toLowerCase(),
      role: user.role ?? 'user',
      emailVerified: user.emailVerified ?? false,
    },
  })

  response.cookies.set('token', token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })

  return response
}
