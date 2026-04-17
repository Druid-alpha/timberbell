'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import SectionHeading from '@/app/_components/SectionHeading'
import ProductCard from '@/app/_components/ProductCard'
import Breadcrumb from '@/app/_components/Breadcrumb'

type Product = {
  id: string
  name: string
  price: number
  category: string
  description: string
  palette?: string[]
}

export default function WishlistPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const res = await fetch('/api/wishlist', { cache: 'no-store' })
        const json = await res.json().catch(() => ({}))
        if (!active) return
        if (!res.ok) {
          setError(json?.message || 'Please sign in to view your wishlist.')
          setProducts([])
        } else {
          setProducts(json?.products ?? [])
        }
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [])

  return (
    <div className="mx-auto max-w-7xl space-y-10 px-6 py-16">
      <div className="flex flex-col gap-6">
        <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Wishlist' }]} />
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            eyebrow="Wishlist"
            title="Saved pieces"
            description="Keep track of the furniture pieces you love."
          />
          <Link
            href="/productfilter"
            className="rounded-full border border-[#7C4E2F] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#7C4E2F]"
          >
            Continue shopping
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-[#E6D9C8] bg-[#F4EEE4] p-8 text-center text-sm text-[#6B594A]">
          Loading wishlist...
        </div>
      ) : error ? (
        <div className="rounded-3xl border border-[#E6D9C8] bg-[#F4EEE4] p-8 text-center text-sm text-[#6B594A]">
          {error}
        </div>
      ) : products.length ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-[#E6D9C8] bg-[#F4EEE4] p-8 text-center text-sm text-[#6B594A]">
          Your wishlist is empty.
        </div>
      )}
    </div>
  )
}

