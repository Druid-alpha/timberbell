import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value

  if (!token) {
    return NextResponse.json({ user: null }, { status: 401 })
  }

  try {
    const payload = verifyToken(token)
    return NextResponse.json({ user: payload })
  } catch {
    return NextResponse.json({ user: null }, { status: 401 })
  }
}

export async function POST() {
  const response = NextResponse.json({ message: 'Logged out' })
  response.cookies.set('token', '', { path: '/', maxAge: 0 })
  return response
}
