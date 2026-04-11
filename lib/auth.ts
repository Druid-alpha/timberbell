import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const secret = process.env.JWT_SECRET

if (!secret) {
  throw new Error('Missing JWT_SECRET in environment variables')
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash)
}

export function signToken(payload: { id: string; email: string }) {
  return jwt.sign(payload, secret, { expiresIn: '7d' })
}

export function verifyToken(token: string) {
  return jwt.verify(token, secret) as { id: string; email: string; iat: number; exp: number }
}
