import { checkRateLimit, getRequestIp } from '@/lib/rate-limit'
import { getCloudinary } from '@/lib/cloudinary'

export async function POST(request: Request) {
  const rateLimit = checkRateLimit({
    key: `cloudinary-public:${getRequestIp(request)}`,
    limit: 10,
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

  const cloudinary = getCloudinary()
  const timestamp = Math.round(Date.now() / 1000)
  const folder = 'timberbell/avatars'

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
