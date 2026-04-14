'use client'

import { useEffect, useState } from 'react'

export default function WishlistButton({ productId }: { productId: string }) {
  const [active, setActive] = useState(false)
  const [loading, setLoading] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let activeFlag = true
    async function load() {
      try {
        const res = await fetch('/api/wishlist')
        if (!res.ok) return
        const json = await res.json().catch(() => ({}))
        if (!activeFlag) return
        const items: string[] = json?.items ?? []
        setActive(items.includes(productId))
        setReady(true)
      } catch {
        setReady(true)
      }
    }
    load()
    return () => {
      activeFlag = false
    }
  }, [productId])

  async function toggle() {
    if (loading) return
    setLoading(true)
    const method = active ? 'DELETE' : 'POST'
    const res = await fetch('/api/wishlist', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId }),
    })
    if (res.ok) {
      setActive(!active)
    }
    setLoading(false)
  }

  if (!ready) {
    return null
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={active ? 'Remove from wishlist' : 'Add to wishlist'}
      className={`inline-flex items-center justify-center rounded-full border px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.3em] transition ${
        active ? 'border-[#7C4E2F] bg-[#7C4E2F] text-white' : 'border-[#E6D9C8] text-[#7C4E2F]'
      }`}
    >
      {loading ? (
        '...'
      ) : (
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill={active ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path
            d="M12 19s-6-4.35-8-7.9C2.5 8 4 5.5 6.7 5.2 8.3 5 10 5.8 12 7.8c2-2 3.7-2.8 5.3-2.6C20 5.5 21.5 8 20 11.1 18 14.65 12 19 12 19Z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  )
}
