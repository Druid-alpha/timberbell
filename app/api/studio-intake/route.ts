import { NextRequest } from 'next/server'
import { sendEmail } from '@/lib/email'
import { checkRateLimit, getRequestIp } from '@/lib/rate-limit'
import { escapeHtml, validateStudioIntakePayload } from '@/lib/validation/request'

export async function POST(request: NextRequest) {
  const rateLimit = checkRateLimit({
    key: `studio-intake:${getRequestIp(request)}`,
    limit: 6,
    windowMs: 10 * 60 * 1000,
  })

  if (!rateLimit.ok) {
    return Response.json(
      { message: 'Too many requests sent. Please wait and try again.' },
      { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfterSeconds) } }
    )
  }

  const body = await request.json().catch(() => null)
  const parsed = validateStudioIntakePayload(body)

  if (!parsed.ok) {
    return Response.json({ message: parsed.message }, { status: 400 })
  }

  const to = process.env.SMTP_USER || process.env.SMTP_FROM
  if (!to) {
    return Response.json({ message: 'Studio email is not configured' }, { status: 500 })
  }

  const html = `
    <h2>New Timberbell Studio Intake</h2>
    <p><strong>Type:</strong> ${escapeHtml(parsed.data.type)}</p>
    <p><strong>Name:</strong> ${escapeHtml(parsed.data.name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(parsed.data.email)}</p>
    <p><strong>Location:</strong> ${escapeHtml(parsed.data.location || 'Not provided')}</p>
    <p><strong>Project Type:</strong> ${escapeHtml(parsed.data.projectType || 'Not provided')}</p>
    <p><strong>Budget:</strong> ${escapeHtml(parsed.data.budget || 'Not provided')}</p>
    <p><strong>Timeline:</strong> ${escapeHtml(parsed.data.timeline || 'Not provided')}</p>
    <p><strong>Message:</strong></p>
    <p>${escapeHtml(parsed.data.message).replace(/\n/g, '<br/>')}</p>
  `

  await sendEmail({
    to,
    subject: `Studio intake: ${parsed.data.type === 'trade' ? 'Trade Program' : 'Room Advisor'} - ${parsed.data.name}`,
    html,
  })

  return Response.json({
    message: parsed.data.type === 'trade'
      ? 'Trade application received. Our studio team will reach out shortly.'
      : 'Room advisor request received. Our studio team will respond with recommendations shortly.',
  })
}
