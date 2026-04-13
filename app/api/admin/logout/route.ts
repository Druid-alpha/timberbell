import { getAdminCookieName } from '@/lib/admin'

export async function POST() {
  const response = Response.json({ ok: true })
  response.headers.set(
    'Set-Cookie',
    `${getAdminCookieName()}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`
  )
  return response
}
