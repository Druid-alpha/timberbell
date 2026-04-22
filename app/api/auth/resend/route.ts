import { NextResponse } from 'next/server'
import { findUserByEmail } from '@/lib/services/users'
import { createEmailVerification } from '@/lib/services/authTokens'
import { hashToken } from '@/lib/utils/tokens'
import { sendEmail } from '@/lib/email'
import { verificationEmailTemplate } from '@/lib/emailTemplates'
import { generateOtpCode } from '@/lib/utils/otp'

const appUrl = process.env.APP_URL || 'http://localhost:3000'

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)

  if (!body?.email) {
    return NextResponse.json({ message: 'email required' }, { status: 400 })
  }

  const user = await findUserByEmail(body.email)
  if (!user) {
    return NextResponse.json({ message: 'If that email exists, a code was sent.' })
  }

  if (user.emailVerified) {
    return NextResponse.json({ message: 'Email already verified.' })
  }

  const verificationToken = generateOtpCode()
  await createEmailVerification(
    user._id.toString(),
    hashToken(verificationToken),
    new Date(Date.now() + 1000 * 60 * 10)
  )

  const verifyUrl = `${appUrl}/verify?email=${encodeURIComponent(user.email)}`
  await sendEmail({
    to: user.email,
    subject: 'Verify your Timberbell account',
    html: verificationEmailTemplate({ code: verificationToken, verifyUrl }),
  })

  return NextResponse.json({ message: 'Verification code sent.' })
}
