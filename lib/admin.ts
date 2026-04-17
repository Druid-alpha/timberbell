import { createHmac } from 'crypto'
import type { NextRequest } from 'next/server'

const ADMIN_COOKIE = 'admin_auth'

export function getAdminSetupKey() {
  return process.env.ADMIN_SETUP_KEY ?? ''
}

export function getAdminToken() {
  const key = getAdminSetupKey()
  if (!key) return null
  return createHmac('sha256', key).update('admin').digest('hex')
}

export function isAdminKeyValid(key?: string | null) {
  const adminKey = getAdminSetupKey()
  if (!adminKey || !key) return false
  return key === adminKey
}

export function isAdminCookieValid(value?: string | null) {
  const token = getAdminToken()
  if (!token || !value) return false
  return value === token
}

export function isAdminRequest(request: NextRequest) {
  const headerKey =
    request.headers.get('x-admin-key') ??
    request.headers.get('authorization')?.replace('Bearer ', '')
  if (isAdminKeyValid(headerKey)) return true

  const cookieValue = request.cookies.get(ADMIN_COOKIE)?.value
  return isAdminCookieValid(cookieValue)
}

export function getAdminCookieName() {
  return ADMIN_COOKIE
}
