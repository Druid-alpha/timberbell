import { NextResponse } from 'next/server'
import { consumeEmailVerification } from '@/lib/services/authTokens'
import { markEmailVerified } from '@/lib/services/users'
import { hashToken } from '@/lib/utils/tokens'

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)

  if (!body?.token) {
    return NextResponse.json({ message: 'token required' }, { status: 400 })
  }

  const record = await consumeEmailVerification(hashToken(body.token))
  if (!record) {
    return NextResponse.json({ message: 'Invalid or expired token' }, { status: 400 })
  }

  await markEmailVerified(record.userId.toString())

  return NextResponse.json({ message: 'Email verified' })
}
