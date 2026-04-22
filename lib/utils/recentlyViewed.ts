'use client'

import { parseJsonArray } from '@/lib/utils/safe-json'

type RecentItem = {
  id: string
  name?: string
  category?: string
  price?: number
  imageUrl?: string
}

const GUEST_RECENTLY_VIEWED_KEY = 'recentlyViewed:guest'

export async function getRecentlyViewedStorageKey() {
  if (typeof window === 'undefined') return GUEST_RECENTLY_VIEWED_KEY

  try {
    const res = await fetch('/api/users/me', { cache: 'no-store' })
    if (!res.ok) return GUEST_RECENTLY_VIEWED_KEY
    const data = await res.json().catch(() => ({}))
    const userId = data?.user?.id
    return userId ? `recentlyViewed:${userId}` : GUEST_RECENTLY_VIEWED_KEY
  } catch {
    return GUEST_RECENTLY_VIEWED_KEY
  }
}

export function readRecentlyViewed(key: string) {
  if (typeof window === 'undefined') return [] as RecentItem[]
  return parseJsonArray<RecentItem>(window.localStorage.getItem(key))
}

export function writeRecentlyViewed(key: string, items: RecentItem[]) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(key, JSON.stringify(items))
}
