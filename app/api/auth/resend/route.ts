import { NextResponse } from 'next/server'
import { findUserByEmail } from '@/lib/services/users'
import { createEmailVerification } from '@/lib/services/authTokens'
import { generateToken, hashToken } from '@/lib/utils/tokens'
import { sendEmail } from '@/lib/email'
import { verificationEmailTemplate } from '@/lib/emailTemplates'

const appUrl = process.env.APP_URL || 'http://localhost:3000'

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)

  if (!body?.email) {
    return NextResponse.json({ message: 'email required' }, { status: 400 })
  }

  const user = await findUserByEmail(body.email)
  if (!user) {
    return NextResponse.json({ message: 'If that email exists, a link was sent.' })
  }

  if (user.emailVerified) {
    return NextResponse.json({ message: 'Email already verified.' })
  }

  const verificationToken = generateToken()
  await createEmailVerification(
    user._id.toString(),
    hashToken(verificationToken),
    new Date(Date.now() + 1000 * 60 * 60 * 24)
  )

  const verifyUrl = `${appUrl}/verify?token=${verificationToken}`
  await sendEmail({
    to: user.email,
    subject: 'Verify your Timberbell account',
    html: verificationEmailTemplate(verifyUrl),
  })

  return NextResponse.json({ message: 'Verification email sent.' })
}
