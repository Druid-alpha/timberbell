const baseStyle = `
  font-family: 'Helvetica Neue', Arial, sans-serif;
  background: #f7f3ee;
  color: #1f1a16;
  padding: 32px;
`

const cardStyle = `
  max-width: 520px;
  margin: 0 auto;
  background: #ffffff;
  border-radius: 24px;
  padding: 28px;
  box-shadow: 0 12px 30px rgba(31, 26, 22, 0.1);
`

const buttonStyle = `
  display: inline-block;
  background: #1f1a16;
  color: #ffffff;
  text-decoration: none;
  padding: 12px 22px;
  border-radius: 999px;
  font-weight: 600;
`

export function verificationEmailTemplate(verifyUrl: string) {
  return `
  <div style="${baseStyle}">
    <div style="${cardStyle}">
      <p style="letter-spacing: 0.3em; text-transform: uppercase; font-size: 12px; color: #6f6660;">Timberbell</p>
      <h1 style="margin: 12px 0 8px; font-size: 24px;">Verify your email</h1>
      <p style="margin: 0 0 16px; color: #6f6660;">
        Welcome to Timberbell. Confirm your email to start building your curated spaces.
      </p>
      <p style="margin: 20px 0;">
        <a href="${verifyUrl}" style="${buttonStyle}">Verify email</a>
      </p>
      <p style="font-size: 12px; color: #6f6660;">This link expires in 24 hours.</p>
    </div>
  </div>
  `
}

export function resetEmailTemplate(resetUrl: string) {
  return `
  <div style="${baseStyle}">
    <div style="${cardStyle}">
      <p style="letter-spacing: 0.3em; text-transform: uppercase; font-size: 12px; color: #6f6660;">Timberbell</p>
      <h1 style="margin: 12px 0 8px; font-size: 24px;">Reset your password</h1>
      <p style="margin: 0 0 16px; color: #6f6660;">
        We received a request to reset your password. Use the link below to set a new one.
      </p>
      <p style="margin: 20px 0;">
        <a href="${resetUrl}" style="${buttonStyle}">Reset password</a>
      </p>
      <p style="font-size: 12px; color: #6f6660;">This link expires in 30 minutes.</p>
    </div>
  </div>
  `
}
