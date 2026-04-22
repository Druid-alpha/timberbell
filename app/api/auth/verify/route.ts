import { NextResponse } from 'next/server'
import { consumeEmailVerification } from '@/lib/services/authTokens'
import { findUserByEmail, markEmailVerified } from '@/lib/services/users'
import { hashToken } from '@/lib/utils/tokens'

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)

  if (!body?.token && !(body?.email && body?.code)) {
    return NextResponse.json({ message: 'token or email and code required' }, { status: 400 })
  }

  let record = null

  if (body?.token) {
    record = await consumeEmailVerification(hashToken(body.token))
  } else {
    const user = await findUserByEmail(String(body.email).toLowerCase())
    if (!user) {
      return NextResponse.json({ message: 'Invalid or expired code' }, { status: 400 })
    }
    record = await consumeEmailVerification(hashToken(String(body.code)), user._id.toString())
  }

  if (!record) {
    return NextResponse.json({ message: 'Invalid or expired verification details' }, { status: 400 })
  }

  await markEmailVerified(record.userId.toString())

  return NextResponse.json({ message: 'Email verified' })
}
