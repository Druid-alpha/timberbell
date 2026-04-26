export const siteConfig = {
  name: 'Timberbell',
  description: 'Timberbell crafts premium furniture, collected interiors, and concierge-led design experiences for modern spaces.',
  url: process.env.APP_URL || 'http://localhost:3000',
}

export function absoluteUrl(path = '/') {
  const base = siteConfig.url.replace(/\/$/, '')
  return `${base}${path.startsWith('/') ? path : `/${path}`}`
}
