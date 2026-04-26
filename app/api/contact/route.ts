import { NextRequest } from 'next/server'
import { sendEmail } from '@/lib/email'
import { checkRateLimit, getRequestIp } from '@/lib/rate-limit'
import { escapeHtml, validateContactPayload } from '@/lib/validation/request'

export async function POST(request: NextRequest) {
  const rateLimit = checkRateLimit({
    key: `contact:${getRequestIp(request)}`,
    limit: 5,
    windowMs: 10 * 60 * 1000,
  })
  if (!rateLimit.ok) {
    return Response.json(
      { message: 'Too many messages sent. Please wait and try again.' },
      { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfterSeconds) } }
    )
  }

  const body = await request.json().catch(() => null)
  const parsed = validateContactPayload(body)

  if (!parsed.ok) {
    return Response.json({ message: parsed.message }, { status: 400 })
  }

  const to = process.env.SMTP_USER || process.env.SMTP_FROM
  if (!to) {
    return Response.json({ message: 'Contact email is not configured' }, { status: 500 })
  }

  const html = `
    <h2>New Timberbell Contact Message</h2>
    <p><strong>Name:</strong> ${escapeHtml(parsed.data.name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(parsed.data.email)}</p>
    <p><strong>Location:</strong> ${escapeHtml(parsed.data.location || 'Not provided')}</p>
    <p><strong>Message:</strong></p>
    <p>${escapeHtml(parsed.data.message).replace(/\n/g, '<br/>')}</p>
  `

  await sendEmail({
    to,
    subject: `Contact form: ${parsed.data.name}`,
    html,
  })

  return Response.json({ message: 'Message sent successfully' })
}
