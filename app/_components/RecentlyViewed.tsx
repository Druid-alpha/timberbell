'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { formatMoney } from '@/lib/utils/format'
import SectionHeading from './SectionHeading'
import { parseJsonArray } from '@/lib/utils/safe-json'

export default function RecentlyViewed() {
  const [items, setItems] = useState<any[]>([])

  useEffect(() => {
    const viewed = parseJsonArray(localStorage.getItem('recentlyViewed'))
    setItems(viewed)
  }, [])

  if (items.length === 0) return null

  return (
    <section className="mx-auto max-w-7xl px-6 py-12">
      <SectionHeading
        eyebrow="Your Curator History"
        title="Recently Viewed"
        description="Pick up where you left off in your discovery of Timberbell pieces."
      />
      <div className="mt-12 flex gap-6 overflow-x-auto pb-6 scrollbar-hide">
        {items.map((item) => (
          <Link
            key={item.id}
            href={`/products/${item.id}`}
            className="group w-48 shrink-0 space-y-4"
          >
            <div className="aspect-[4/5] overflow-hidden rounded-[32px] border border-[#E6D9C8] bg-[#F4EEE4]">
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                />
              ) : (
                <div className="h-full w-full bg-[#E6D9C8]/40" />
              )}
            </div>
            <div className="space-y-1 px-2">
              <h4 className="text-sm font-semibold text-[#2B2119] line-clamp-1">{item.name}</h4>
              <p className="text-[10px] uppercase tracking-widest text-[#8C7A6B]">{item.category}</p>
              <p className="text-sm font-bold text-[#7C4E2F]">{formatMoney(item.price)}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
