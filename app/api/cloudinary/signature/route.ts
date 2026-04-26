import { NextRequest } from 'next/server'
import { getCloudinary } from '@/lib/cloudinary'
import { getUserFromRequest } from '@/lib/authServer'
import { checkRateLimit, getRequestIp } from '@/lib/rate-limit'

const ALLOWED_USER_FOLDERS = new Set(['timberbell/avatars', 'timberbell/refunds'])

export async function POST(request: NextRequest) {
  const user = getUserFromRequest(request)

  if (!user) {
    return Response.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const rateLimit = checkRateLimit({
    key: `cloudinary-auth:${user.id}:${getRequestIp(request)}`,
    limit: 20,
    windowMs: 10 * 60 * 1000,
  })

  if (!rateLimit.ok) {
    return Response.json(
      { message: 'Too many upload attempts. Please wait and try again.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(rateLimit.retryAfterSeconds),
        },
      }
    )
  }

  const body = await request.json().catch(() => null)
  const folder = String(body?.folder || '').trim() || 'timberbell/avatars'

  if (!ALLOWED_USER_FOLDERS.has(folder)) {
    return Response.json({ message: 'Unsupported upload folder' }, { status: 400 })
  }

  const cloudinary = getCloudinary()
  const timestamp = Math.round(Date.now() / 1000)
  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder },
    process.env.CLOUDINARY_API_SECRET as string
  )

  return Response.json({
    timestamp,
    signature,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    folder,
  })
}
