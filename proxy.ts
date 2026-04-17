import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'

export function proxy(request: NextRequest) {
  const protectedPaths = ['/account', '/checkout']
  const pathname = request.nextUrl.pathname

  if (!protectedPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  const token = request.cookies.get('token')?.value
  if (!token) {
    return NextResponse.redirect(new URL('/register', request.url))
  }

  try {
    verifyToken(token)
    return NextResponse.next()
  } catch {
    const response = NextResponse.redirect(new URL('/register', request.url))
    response.cookies.set('token', '', { path: '/', maxAge: 0 })
    return response
  }
}

export const config = {
  matcher: ['/account/:path*', '/checkout/:path*'],
}
