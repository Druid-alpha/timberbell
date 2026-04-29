import { NextResponse } from 'next/server'
import { createUser, findUserByEmail } from '@/lib/services/users'
import { hashPassword } from '@/lib/auth'
import { createEmailVerification } from '@/lib/services/authTokens'
import { hashToken } from '@/lib/utils/tokens'
import { sendEmail } from '@/lib/email'
import { verificationEmailTemplate, welcomeEmailTemplate } from '@/lib/emailTemplates'
import { generateOtpCode } from '@/lib/utils/otp'
import { checkRateLimit, getRequestIp } from '@/lib/rate-limit'
import { validateRegisterPayload } from '@/lib/validation/request'

const appUrl = process.env.APP_URL || 'http://localhost:3000'

export async function POST(request: Request) {
  const rateLimit = checkRateLimit({
    key: `auth-register:${getRequestIp(request)}`,
    limit: 10,
    windowMs: 10 * 60 * 1000,
  })
  if (!rateLimit.ok) {
    return NextResponse.json(
      { message: 'Too many registration attempts. Please wait and try again.' },
      { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfterSeconds) } }
    )
  }

  const body = await request.json().catch(() => null)
  const parsed = validateRegisterPayload(body)

  if (!parsed.ok) {
    return NextResponse.json({ message: parsed.message }, { status: 400 })
  }

  const existing = await findUserByEmail(parsed.data.email)
  if (existing) {
    return NextResponse.json({ message: 'Email already in use' }, { status: 409 })
  }

  const passwordHash = await hashPassword(parsed.data.password)
  const userId = await createUser({
    name: parsed.data.name,
    email: parsed.data.email,
    passwordHash,
    avatarUrl: parsed.data.avatarUrl,
  })

  if (!userId) {
    return NextResponse.json({ message: 'Email already in use' }, { status: 409 })
  }

  const verificationToken = generateOtpCode()
  await createEmailVerification(
    userId,
    hashToken(verificationToken),
    new Date(Date.now() + 1000 * 60 * 10)
  )

  const verifyUrl = `${appUrl}/verify?email=${encodeURIComponent(parsed.data.email)}`
  await sendEmail({
    to: parsed.data.email,
    subject: 'Verify your Timberbell account',
    html: verificationEmailTemplate({ code: verificationToken, verifyUrl }),
  })

  await sendEmail({
    to: parsed.data.email,
    subject: `Welcome to Timberbell, ${parsed.data.name}`,
    html: welcomeEmailTemplate(parsed.data.name),
  })

  return NextResponse.json({
    user: { id: userId, name: parsed.data.name, email: parsed.data.email, emailVerified: false },
    message: 'Verification code sent to your email.',
  })
}
