import { getCloudinary } from '@/lib/cloudinary'

export async function POST() {
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
