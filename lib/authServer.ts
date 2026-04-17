import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'

export function getUserFromRequest(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  if (!token) {
    return null
  }

  try {
    return verifyToken(token)
  } catch {
    return null
  }
}
