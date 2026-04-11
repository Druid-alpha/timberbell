import { NextResponse } from 'next/server'
import { consumePasswordReset } from '@/lib/services/authTokens'
import { updatePassword } from '@/lib/services/users'
import { hashPassword } from '@/lib/auth'
import { hashToken } from '@/lib/utils/tokens'

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)

  if (!body?.token || !body?.password) {
    return NextResponse.json({ message: 'token and password required' }, { status: 400 })
  }

  const record = await consumePasswordReset(hashToken(body.token))
  if (!record) {
    return NextResponse.json({ message: 'Invalid or expired token' }, { status: 400 })
  }

  const passwordHash = await hashPassword(body.password)
  await updatePassword(record.userId.toString(), passwordHash)

  return NextResponse.json({ message: 'Password updated' })
}
