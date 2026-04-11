'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import SectionHeading from '@/app/_components/SectionHeading'

type Product = {
  id: string
  name: string
  price: number
  category: string
  description: string
  leadTime?: string
  rating?: number
  reviewCount?: number
  materials?: string[]
  finishes?: string[]
  dimensions?: string
  palette?: string[]
}

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('')

  useEffect(() => {
    if (!params?.id) return

    let active = true

    async function load() {
      setLoading(true)
      const res = await fetch(`/api/products/${params.id}`)
      const data = await res.json()
      if (active) {
        setProduct(res.ok ? data : null)
        setLoading(false)
      }
    }

    load()

    return () => {
      active = false
    }
  }, [params?.id])

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-16 text-sm text-neutral-600">
        Loading product...
      </div>
    )
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-16 text-sm text-neutral-600">
        Product not found.
      </div>
    )
  }

  const handleAddToCart = async () => {
    setStatus('Adding to cart...')
    const res = await fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: product.id, quantity: 1 }),
    })

    if (res.ok) {
      setStatus('Added to cart.')
      return
    }

    const data = await res.json().catch(() => ({}))
    setStatus(data.message || 'Unable to add to cart.')
  }

  return (
    <div className="mx-auto max-w-6xl space-y-12 px-6 py-16">
      <div className="flex flex-col gap-6">
        <Link href="/shop" className="text-xs uppercase tracking-[0.3em] text-neutral-500">
          Back to shop
        </Link>
        <SectionHeading
          eyebrow={product.category}
          title={product.name}
          description={product.description}
        />
      </div>

      <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div
          className="h-96 w-full rounded-[2.5rem] border border-white/70 bg-white/70"
          style={{
            backgroundImage: `linear-gradient(135deg, ${product.palette?.[0]}, ${product.palette?.[1]}, ${product.palette?.[2]})`,
          }}
        />
        <div className="space-y-6">
          <div className="rounded-3xl border border-white/70 bg-white/80 p-6">
            <div className="flex items-center justify-between">
              <div className="text-sm uppercase tracking-[0.3em] text-neutral-500">
                Starting at
              </div>
              <div className="text-2xl font-semibold text-neutral-900">
                ${product.price.toLocaleString()}
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-3 text-xs text-neutral-500">
              <span className="rounded-full bg-neutral-900/5 px-3 py-1">
                Lead time: {product.leadTime ?? 'TBD'}
              </span>
              <span className="rounded-full bg-neutral-900/5 px-3 py-1">
                Rating: {product.rating ?? 0}
              </span>
              <span className="rounded-full bg-neutral-900/5 px-3 py-1">
                {product.reviewCount ?? 0} reviews
              </span>
            </div>
            <button
              className="mt-6 w-full rounded-full bg-neutral-900 px-5 py-3 text-sm font-semibold text-white"
              onClick={handleAddToCart}
            >
              Add to cart
            </button>
            {status ? <p className="mt-3 text-sm text-neutral-600">{status}</p> : null}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-white/70 bg-white/70 p-5">
              <div className="text-xs uppercase tracking-[0.3em] text-neutral-500">
                Materials
              </div>
              <ul className="mt-3 space-y-2 text-sm text-neutral-700">
                {(product.materials ?? []).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-3xl border border-white/70 bg-white/70 p-5">
              <div className="text-xs uppercase tracking-[0.3em] text-neutral-500">
                Dimensions
              </div>
              <p className="mt-3 text-sm text-neutral-700">{product.dimensions ?? 'TBD'}</p>
              <div className="mt-4 text-xs uppercase tracking-[0.3em] text-neutral-500">
                Finishes
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {(product.finishes ?? []).map((finish) => (
                  <span
                    key={finish}
                    className="rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs text-neutral-600"
                  >
                    {finish}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="rounded-3xl border border-white/70 bg-white/70 p-6 text-sm text-neutral-600">
            Every Timberbell piece ships with a care kit, felt pads, and a detailed maintenance
            guide to keep finishes looking their best.
          </div>
        </div>
      </div>
    </div>
  )
}
