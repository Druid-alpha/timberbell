import { NextResponse } from 'next/server'
import { deleteEmailVerification, findEmailVerification } from '@/lib/services/authTokens'
import { findUserByEmail, markEmailVerified } from '@/lib/services/users'
import { hashToken } from '@/lib/utils/tokens'
import { checkRateLimit, getRequestIp } from '@/lib/rate-limit'
import { validateVerificationPayload } from '@/lib/validation/request'

export async function POST(request: Request) {
  const rateLimit = checkRateLimit({
    key: `auth-verify:${getRequestIp(request)}`,
    limit: 20,
    windowMs: 10 * 60 * 1000,
  })
  if (!rateLimit.ok) {
    return NextResponse.json(
      { message: 'Too many verification attempts. Please wait and try again.' },
      { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfterSeconds) } }
    )
  }

  const body = await request.json().catch(() => null)
  const parsed = validateVerificationPayload(body)

  if (!parsed.ok) {
    return NextResponse.json({ message: parsed.message }, { status: 400 })
  }

  let record = null

  if ('token' in parsed.data) {
    record = await findEmailVerification(hashToken(parsed.data.token))
  } else {
    const user = await findUserByEmail(parsed.data.email)
    if (!user) {
      return NextResponse.json({ message: 'Invalid or expired code' }, { status: 400 })
    }

    if (user.emailVerified) {
      return NextResponse.json({ message: 'Email verified' })
    }

    record = await findEmailVerification(hashToken(parsed.data.code), user._id.toString())

    if (!record) {
      const refreshedUser = await findUserByEmail(parsed.data.email)
      if (refreshedUser?.emailVerified) {
        return NextResponse.json({ message: 'Email verified' })
      }
    }
  }

  if (!record) {
    return NextResponse.json({ message: 'Invalid or expired verification details' }, { status: 400 })
  }

  await markEmailVerified(record.userId.toString())
  await deleteEmailVerification(record._id)

  return NextResponse.json({ message: 'Email verified' })
}
