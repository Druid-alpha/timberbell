'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { formatMoney } from '@/lib/utils/format'
import { getRecentlyViewedStorageKey, readRecentlyViewed, writeRecentlyViewed } from '@/lib/utils/recentlyViewed'

export default function RecentlyViewed() {
  const [items, setItems] = useState<any[]>([])

  useEffect(() => {
    let active = true

    async function loadViewed() {
      const storageKey = await getRecentlyViewedStorageKey()
      if (!active) return
      const viewed = readRecentlyViewed(storageKey)
      if (!viewed.length) {
        if (active) setItems([])
        return
      }

      const responses = await Promise.all(
        viewed.map((item) => fetch(`/api/products/${item.id}`).then((res) => ({ ok: res.ok, item })).catch(() => ({ ok: false, item })))
      )

      const valid = responses.filter((entry) => entry.ok).map((entry) => entry.item)
      writeRecentlyViewed(storageKey, valid)
      if (active) setItems(valid)
    }

    void loadViewed()
    return () => {
      active = false
    }
  }, [])

  if (items.length === 0) return null

  return (
    <div className="flex gap-4 overflow-x-auto pb-3 pr-1 scrollbar-hide sm:gap-6 sm:pb-4">
        {items.map((item) => (
          <Link
            key={item.id}
            href={`/products/${item.id}`}
            className="group w-[11rem] shrink-0 space-y-3 sm:w-48 sm:space-y-4"
          >
            <div className="aspect-[4/5] overflow-hidden rounded-[26px] border border-[#E6D9C8] bg-[#F4EEE4] sm:rounded-[32px]">
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
            <div className="space-y-1 px-1 sm:px-2">
              <h4 className="text-sm font-semibold text-[#2B2119] line-clamp-1">{item.name}</h4>
              <p className="text-[10px] uppercase tracking-widest text-[#8C7A6B]">{item.category}</p>
              <p className="text-sm font-bold text-[#7C4E2F]">{formatMoney(item.price)}</p>
            </div>
          </Link>
        ))}
    </div>
  )
}
