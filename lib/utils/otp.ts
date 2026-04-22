import crypto from 'crypto'

export function generateOtpCode() {
  return crypto.randomInt(100000, 1000000).toString()
}
