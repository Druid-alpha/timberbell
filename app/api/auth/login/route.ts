import { NextResponse } from 'next/server'
import { findUserByEmail } from '@/lib/services/users'
import { signToken, verifyPassword } from '@/lib/auth'
import { checkRateLimit, getRequestIp } from '@/lib/rate-limit'
import { validateLoginPayload } from '@/lib/validation/request'

export async function POST(request: Request) {
  const rateLimit = checkRateLimit({
    key: `auth-login:${getRequestIp(request)}`,
    limit: 20,
    windowMs: 10 * 60 * 1000,
  })
  if (!rateLimit.ok) {
    return NextResponse.json(
      { message: 'Too many sign-in attempts. Please wait and try again.' },
      { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfterSeconds) } }
    )
  }

  const body = await request.json().catch(() => null)
  const parsed = validateLoginPayload(body)

  if (!parsed.ok) {
    return NextResponse.json({ message: parsed.message }, { status: 400 })
  }

  const user = await findUserByEmail(parsed.data.email)
  if (!user) {
    return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 })
  }

  if (!user.emailVerified) {
    return NextResponse.json(
      { message: 'Please verify your email before logging in.' },
      { status: 403 }
    )
  }

  const valid = await verifyPassword(parsed.data.password, user.passwordHash)
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
