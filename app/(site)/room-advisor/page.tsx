import type { Metadata } from 'next'
import RoomAdvisorClient from '@/app/(site)/_components/RoomAdvisorClient'
import { getProducts } from '@/lib/services/catalog'
import { absoluteUrl } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Room Advisor',
  description: 'Get a guided Timberbell shortlist for your room, your budget, and your design direction.',
  alternates: {
    canonical: absoluteUrl('/room-advisor'),
  },
}

export default async function RoomAdvisorPage() {
  const [living, bedroom, dining, entry] = await Promise.all([
    getProducts({ category: 'living' }),
    getProducts({ category: 'bedroom' }),
    getProducts({ category: 'dining' }),
    getProducts({ category: 'entry' }),
  ])

  return (
    <RoomAdvisorClient
      productsByRoom={{
        living,
        bedroom,
        dining,
        entry,
      }}
    />
  )
}
