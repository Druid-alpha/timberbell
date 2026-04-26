import { NextResponse } from 'next/server'
import { findUserByEmail } from '@/lib/services/users'
import { createPasswordReset } from '@/lib/services/authTokens'
import { generateToken, hashToken } from '@/lib/utils/tokens'
import { sendEmail } from '@/lib/email'
import { resetEmailTemplate } from '@/lib/emailTemplates'
import { checkRateLimit, getRequestIp } from '@/lib/rate-limit'
import { validateEmailPayload } from '@/lib/validation/request'

const appUrl = process.env.APP_URL || 'http://localhost:3000'

export async function POST(request: Request) {
  const rateLimit = checkRateLimit({
    key: `auth-forgot:${getRequestIp(request)}`,
    limit: 10,
    windowMs: 10 * 60 * 1000,
  })
  if (!rateLimit.ok) {
    return NextResponse.json(
      { message: 'Too many reset requests. Please wait and try again.' },
      { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfterSeconds) } }
    )
  }

  const body = await request.json().catch(() => null)
  const parsed = validateEmailPayload(body)

  if (!parsed.ok) {
    return NextResponse.json({ message: parsed.message }, { status: 400 })
  }

  const user = await findUserByEmail(parsed.data.email)
  if (!user) {
    return NextResponse.json({ message: 'If that email exists, a reset link was sent.' })
  }

  const resetToken = generateToken()
  await createPasswordReset(
    user._id.toString(),
    hashToken(resetToken),
    new Date(Date.now() + 1000 * 60 * 30)
  )

  const resetUrl = `${appUrl}/reset?token=${resetToken}`
  await sendEmail({
    to: parsed.data.email,
    subject: 'Reset your Timberbell password',
    html: resetEmailTemplate(resetUrl),
  })

  return NextResponse.json({ message: 'If that email exists, a reset link was sent.' })
}
