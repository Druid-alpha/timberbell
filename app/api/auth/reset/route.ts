import { NextResponse } from 'next/server'
import { consumePasswordReset } from '@/lib/services/authTokens'
import { updatePassword } from '@/lib/services/users'
import { hashPassword } from '@/lib/auth'
import { hashToken } from '@/lib/utils/tokens'
import { checkRateLimit, getRequestIp } from '@/lib/rate-limit'
import { validatePasswordResetPayload } from '@/lib/validation/request'

export async function POST(request: Request) {
  const rateLimit = checkRateLimit({
    key: `auth-reset:${getRequestIp(request)}`,
    limit: 10,
    windowMs: 10 * 60 * 1000,
  })
  if (!rateLimit.ok) {
    return NextResponse.json(
      { message: 'Too many password reset attempts. Please wait and try again.' },
      { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfterSeconds) } }
    )
  }

  const body = await request.json().catch(() => null)
  const parsed = validatePasswordResetPayload(body)

  if (!parsed.ok) {
    return NextResponse.json({ message: parsed.message }, { status: 400 })
  }

  const record = await consumePasswordReset(hashToken(parsed.data.token))
  if (!record) {
    return NextResponse.json({ message: 'Invalid or expired token' }, { status: 400 })
  }

  const passwordHash = await hashPassword(parsed.data.password)
  await updatePassword(record.userId.toString(), passwordHash)

  return NextResponse.json({ message: 'Password updated' })
}
