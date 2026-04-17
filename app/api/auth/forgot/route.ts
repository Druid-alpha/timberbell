import { NextResponse } from 'next/server'
import { findUserByEmail } from '@/lib/services/users'
import { createPasswordReset } from '@/lib/services/authTokens'
import { generateToken, hashToken } from '@/lib/utils/tokens'
import { sendEmail } from '@/lib/email'
import { resetEmailTemplate } from '@/lib/emailTemplates'

const appUrl = process.env.APP_URL || 'http://localhost:3000'

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)

  if (!body?.email) {
    return NextResponse.json({ message: 'email required' }, { status: 400 })
  }

  const user = await findUserByEmail(body.email)
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
    to: body.email,
    subject: 'Reset your Timberbell password',
    html: resetEmailTemplate(resetUrl),
  })

  return NextResponse.json({ message: 'If that email exists, a reset link was sent.' })
}
