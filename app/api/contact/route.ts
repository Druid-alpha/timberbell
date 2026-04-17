import { NextRequest } from 'next/server'
import { sendEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)

  if (!body?.name || !body?.email || !body?.message) {
    return Response.json({ message: 'name, email, and message are required' }, { status: 400 })
  }

  const to = process.env.SMTP_USER || process.env.SMTP_FROM
  if (!to) {
    return Response.json({ message: 'Contact email is not configured' }, { status: 500 })
  }

  const html = `
    <h2>New Timberbell Contact Message</h2>
    <p><strong>Name:</strong> ${String(body.name)}</p>
    <p><strong>Email:</strong> ${String(body.email)}</p>
    <p><strong>Location:</strong> ${String(body.location || 'Not provided')}</p>
    <p><strong>Message:</strong></p>
    <p>${String(body.message).replace(/\n/g, '<br/>')}</p>
  `

  await sendEmail({
    to,
    subject: `Contact form: ${String(body.name)}`,
    html,
  })

  return Response.json({ message: 'Message sent successfully' })
}
