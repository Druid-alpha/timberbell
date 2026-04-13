import { NextResponse } from 'next/server'
import { createUser, findUserByEmail } from '@/lib/services/users'
import { hashPassword, signToken } from '@/lib/auth'
import { createEmailVerification } from '@/lib/services/authTokens'
import { generateToken, hashToken } from '@/lib/utils/tokens'
import { sendEmail } from '@/lib/email'
import { verificationEmailTemplate } from '@/lib/emailTemplates'

const appUrl = process.env.APP_URL || 'http://localhost:3000'

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)

  if (!body?.name || !body?.email || !body?.password) {
    return NextResponse.json(
      { message: 'name, email, and password required' },
      { status: 400 }
    )
  }

  const normalizedEmail = String(body.email).toLowerCase()
  const existing = await findUserByEmail(normalizedEmail)
  if (existing) {
    return NextResponse.json({ message: 'Email already in use' }, { status: 409 })
  }

  const passwordHash = await hashPassword(body.password)
  const userId = await createUser({
    name: body.name,
    email: normalizedEmail,
    passwordHash,
    avatarUrl: body.avatarUrl ?? null,
  })

  const verificationToken = generateToken()
  await createEmailVerification(
    userId,
    hashToken(verificationToken),
    new Date(Date.now() + 1000 * 60 * 60 * 24)
  )

  const verifyUrl = `${appUrl}/verify?token=${verificationToken}`
  await sendEmail({
    to: normalizedEmail,
    subject: 'Verify your Timberbell account',
    html: verificationEmailTemplate(verifyUrl),
  })

  const token = signToken({ id: userId, email: normalizedEmail })
  const response = NextResponse.json({
    user: { id: userId, name: body.name, email: normalizedEmail, emailVerified: false },
    message: 'Verification email sent',
  })

  response.cookies.set('token', token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })

  return response
}
