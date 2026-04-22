import { NextRequest } from 'next/server'
import { getAdminCookieName, getAdminToken, isAdminCookieValid, isAdminKeyValid } from '@/lib/admin'

export async function GET(request: NextRequest) {
  const cookieValue = request.cookies.get(getAdminCookieName())?.value
  if (!isAdminCookieValid(cookieValue)) {
    return Response.json({ ok: false }, { status: 401 })
  }

  return Response.json({ ok: true })
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  const key = body?.key ? String(body.key) : ''

  if (!isAdminKeyValid(key)) {
    return Response.json({ message: 'Invalid key' }, { status: 401 })
  }

  const token = getAdminToken()
  if (!token) {
    return Response.json({ message: 'Missing admin key' }, { status: 500 })
  }

  const isProd = process.env.NODE_ENV === 'production'
  const response = Response.json({ ok: true })
  response.headers.set(
    'Set-Cookie',
    `${getAdminCookieName()}=${token}; Path=/; HttpOnly; SameSite=Lax; ${isProd ? 'Secure;' : ''} Max-Age=2592000`
  )
  return response
}
