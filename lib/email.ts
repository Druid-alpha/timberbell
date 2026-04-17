import nodemailer from 'nodemailer'

let cachedTransport: any = null

function getTransport() {
  if (cachedTransport) return cachedTransport

  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS

  if (!user || !pass) {
    throw new Error('Missing SMTP_USER or SMTP_PASS in environment variables')
  }

  cachedTransport = nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  })

  return cachedTransport
}

export async function sendEmail(options: { to: string; subject: string; html: string }) {
  const from = process.env.SMTP_FROM || process.env.SMTP_USER

  if (!from) {
    throw new Error('Missing SMTP_FROM in environment variables')
  }

  const mailer = getTransport()

  await mailer.sendMail({
    from,
    to: options.to,
    subject: options.subject,
    html: options.html,
  })
}
