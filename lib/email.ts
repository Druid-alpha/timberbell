import nodemailer from 'nodemailer'

const user = process.env.SMTP_USER
const pass = process.env.SMTP_PASS
const from = process.env.SMTP_FROM || process.env.SMTP_USER

if (!user || !pass) {
  throw new Error('Missing SMTP_USER or SMTP_PASS in environment variables')
}

export const mailer = nodemailer.createTransport({
  service: 'gmail',
  auth: { user, pass },
})

export async function sendEmail(options: { to: string; subject: string; html: string }) {
  if (!from) {
    throw new Error('Missing SMTP_FROM in environment variables')
  }

  await mailer.sendMail({
    from,
    to: options.to,
    subject: options.subject,
    html: options.html,
  })
}
