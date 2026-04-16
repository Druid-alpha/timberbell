const brandColor = '#2B2119'
const accentColor = '#7C4E2F'
const bgColor = '#F7F4EF'
const cardColor = '#FFFFFF'
const textColor = '#4A3F35'
const secondaryTextColor = '#8C7A6B'

const baseHtml = (title: string, body: string, btnText?: string, btnUrl?: string) => `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
    <style>
      body {
        margin: 0;
        padding: 0;
        background-color: ${bgColor};
        font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
        color: ${textColor};
        -webkit-font-smoothing: antialiased;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        padding: 40px 20px;
      }
      .card {
        background-color: ${cardColor};
        border-radius: 20px;
        overflow: hidden;
        box-shadow: 0 10px 40px -10px rgba(43, 33, 25, 0.08);
      }
      .header {
        background-color: ${brandColor};
        padding: 32px 40px;
        text-align: center;
      }
      .logo {
        margin: 0;
        font-size: 24px;
        font-weight: 600;
        letter-spacing: 0.15em;
        text-transform: uppercase;
        color: #FFFFFF;
      }
      .logo-sub {
        margin: 4px 0 0;
        font-size: 10px;
        letter-spacing: 0.4em;
        text-transform: uppercase;
        color: #A39689;
      }
      .content {
        padding: 40px;
      }
      h1 {
        margin: 0 0 16px;
        font-size: 24px;
        font-weight: 600;
        color: ${brandColor};
      }
      p {
        margin: 0 0 24px;
        font-size: 15px;
        line-height: 1.6;
        color: ${textColor};
      }
      .btn-container {
        text-align: center;
        margin: 32px 0 16px;
      }
      .btn {
        display: inline-block;
        background-color: ${accentColor};
        color: #FFFFFF;
        text-decoration: none;
        padding: 14px 32px;
        border-radius: 30px;
        font-size: 13px;
        font-weight: 600;
        letter-spacing: 0.1em;
        text-transform: uppercase;
      }
      .footer {
        text-align: center;
        padding: 32px 20px;
      }
      .footer p {
        margin: 0;
        font-size: 12px;
        color: ${secondaryTextColor};
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="card">
        <div class="header">
          <p class="logo">Timberbell</p>
          <p class="logo-sub">Atelier</p>
        </div>
        <div class="content">
          ${body}
          ${btnText && btnUrl ? `<div class="btn-container"><a href="${btnUrl}" class="btn">${btnText}</a></div>` : ''}
        </div>
      </div>
      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} Timberbell Furniture. All rights reserved.</p>
        <p>Lagos, Nigeria</p>
      </div>
    </div>
  </body>
</html>
`

export function welcomeEmailTemplate(name: string) {
  const body = `
    <h1>Welcome to Timberbell, ${name}</h1>
    <p>We are thrilled to welcome you to our community. At Timberbell, we believe that furniture should do more than fill a space - it should ground your home in natural beauty and calm.</p>
    <p>Explore our curated collections of premium, sustainably sourced pieces designed to create a layered and welcoming environment.</p>
  `
  return baseHtml('Welcome to Timberbell', body, 'Discover Collections', `${process.env.NEXT_PUBLIC_APP_URL}/collections`)
}

export function verificationEmailTemplate(verifyUrl: string) {
  const body = `
    <h1>Verify your email</h1>
    <p>Thank you for creating an account with Timberbell. To ensure the security of your account and start building your curated spaces, please verify your email address.</p>
    <p style="font-size: 13px; color: ${secondaryTextColor};">This link will expire in 24 hours.</p>
  `
  return baseHtml('Verify your Timberbell account', body, 'Verify Email Address', verifyUrl)
}

export function resetEmailTemplate(resetUrl: string) {
  const body = `
    <h1>Reset your password</h1>
    <p>We received a request to reset the password for your Timberbell account. If you made this request, please click the button below to set a new password.</p>
    <p>If you did not request a password reset, you can safely ignore this email. Your current password will remain unchanged.</p>
    <p style="font-size: 13px; color: ${secondaryTextColor};">This link will expire in 30 minutes.</p>
  `
  return baseHtml('Reset your Timberbell password', body, 'Reset Password', resetUrl)
}

export function refundStatusEmailTemplate(input: { customerName: string; orderId: string; status: string; adminMessage?: string }) {
  const statusLabel = input.status.charAt(0).toUpperCase() + input.status.slice(1)
  const body = `
    <h1>Refund request update</h1>
    <p>Hello ${input.customerName},</p>
    <p>Your refund request for order <strong>${input.orderId.slice(-6).toUpperCase()}</strong> has been updated to <strong>${statusLabel}</strong>.</p>
    ${input.adminMessage ? `<p><strong>Message from Timberbell:</strong><br/>${input.adminMessage.replace(/\n/g, '<br/>')}</p>` : '<p>Our team has reviewed your request and recorded the latest update on your account.</p>'}
  `
  return baseHtml('Your Timberbell refund update', body, 'View Account', `${process.env.APP_URL || 'http://localhost:3000'}/account`)
}
