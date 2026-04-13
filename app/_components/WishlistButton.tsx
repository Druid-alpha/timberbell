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
      className={`rounded-full border px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.3em] transition ${
        active ? 'border-[#7C4E2F] bg-[#7C4E2F] text-white' : 'border-[#E6D9C8] text-[#7C4E2F]'
      }`}
    >
      {loading ? '...' : active ? 'Wishlisted' : 'Wishlist'}
    </button>
  )
}
