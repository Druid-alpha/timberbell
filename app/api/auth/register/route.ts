import { NextResponse } from 'next/server'
import { createUser, findUserByEmail } from '@/lib/services/users'
import { hashPassword, signToken } from '@/lib/auth'
import { createEmailVerification } from '@/lib/services/authTokens'
import { hashToken } from '@/lib/utils/tokens'
import { sendEmail } from '@/lib/email'
import { verificationEmailTemplate, welcomeEmailTemplate } from '@/lib/emailTemplates'
import { generateOtpCode } from '@/lib/utils/otp'

const appUrl = process.env.APP_URL || 'http://localhost:3000'

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)

  if (!body?.email || !body?.password) {
    return NextResponse.json(
      { message: 'email and password required' },
      { status: 400 }
    )
  }

  const nameFallback = body.name || [body.firstName, body.lastName].filter(Boolean).join(' ').trim()
  if (!nameFallback) {
    return NextResponse.json({ message: 'name is required' }, { status: 400 })
  }

  const normalizedEmail = String(body.email).toLowerCase()
  const existing = await findUserByEmail(normalizedEmail)
  if (existing) {
    return NextResponse.json({ message: 'Email already in use' }, { status: 409 })
  }

  const passwordHash = await hashPassword(body.password)
  const userId = await createUser({
    name: nameFallback,
    email: normalizedEmail,
    passwordHash,
    avatarUrl: body.avatarUrl ?? null,
  })

  const verificationToken = generateOtpCode()
  await createEmailVerification(
    userId,
    hashToken(verificationToken),
    new Date(Date.now() + 1000 * 60 * 10)
  )

  const verifyUrl = `${appUrl}/verify?email=${encodeURIComponent(normalizedEmail)}`
  await sendEmail({
    to: normalizedEmail,
    subject: 'Verify your Timberbell account',
    html: verificationEmailTemplate({ code: verificationToken, verifyUrl }),
  })

  await sendEmail({
    to: normalizedEmail,
    subject: `Welcome to Timberbell, ${nameFallback}`,
    html: welcomeEmailTemplate(nameFallback),
  })

  const token = signToken({ id: userId, email: normalizedEmail })
  const response = NextResponse.json({
    user: { id: userId, name: nameFallback, email: normalizedEmail, emailVerified: false },
    message: 'Verification code sent to your email.',
  })

  response.cookies.set('token', token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })

  return response
}
