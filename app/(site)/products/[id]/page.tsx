'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import SectionHeading from '@/app/_components/SectionHeading'
import { formatMoney } from '@/lib/utils/format'
import WishlistButton from '@/app/_components/WishlistButton'

type Product = {
  id: string
  name: string
  price: number
  finalPrice?: number
  compareAt?: number
  category: string
  description: string
  leadTime?: string
  rating?: number
  reviewCount?: number
  materials?: string[]
  finishes?: string[]
  dimensions?: string
  palette?: string[]
  images?: { url: string }[]
  variants?: {
    id: string
    name: string
    sku?: string
    price?: number
    stockStatus?: 'in_stock' | 'low_stock' | 'out_of_stock' | 'preorder'
    stockCount?: number
    color?: string
    image?: { url: string }
    specifications?: string[]
  }[]
}

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('')
  const [activeImage, setActiveImage] = useState('')
  const [activeVariantId, setActiveVariantId] = useState<string | null>(null)
  const [variantPrice, setVariantPrice] = useState<number | null>(null)

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

  useEffect(() => {
    if (!product) return
    const firstVariantImage = product.variants?.find((variant) => variant.image?.url)?.image?.url
    const fallback = product.images?.[0]?.url || firstVariantImage || ''
    setActiveImage(fallback)
    setActiveVariantId(product.variants?.[0]?.id ?? null)
    setVariantPrice(product.variants?.[0]?.price ?? null)
  }, [product])

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-16 text-sm text-neutral-600">
        Loading product...
      </div>
    )
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-16 text-sm text-[#6B665A]">
        Product not found.
      </div>
    )
  }

  const images = product.images?.length ? product.images.map((img) => img.url) : []
  const fallbackPalette = product.palette ?? ['#f4e7d2', '#eab38b', '#c59a6b']
  const price = variantPrice ?? product.finalPrice ?? product.price
  const compareAt = product.compareAt ?? (product.finalPrice ? product.price : undefined)
  const ratingLabel = useMemo(() => `${(product.rating ?? 0).toFixed(1)} / 5`, [product.rating])

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
        <Link href="/shop" className="text-xs uppercase tracking-[0.3em] text-[#8A836F]">
          Back to shop
        </Link>
        <SectionHeading
          eyebrow={product.category}
          title={product.name}
          description={product.description}
        />
      </div>

      <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          <div
            className="h-96 w-full rounded-[2.5rem] border border-[#E4DDCF] bg-[#FCFAF6] overflow-hidden"
            style={{
              backgroundImage: images.length
                ? undefined
                : `linear-gradient(135deg, ${fallbackPalette[0]}, ${fallbackPalette[1]}, ${fallbackPalette[2]})`,
            }}
          >
            {images.length ? (
              <img src={activeImage || images[0]} alt={product.name} className="h-full w-full object-contain p-6" />
            ) : null}
          </div>
          {images.length > 1 ? (
            <div className="grid grid-cols-4 gap-3">
              {images.slice(0, 4).map((img) => (
                <button
                  key={img}
                  type="button"
                  onClick={() => setActiveImage(img)}
                  className={`h-20 rounded-2xl border-2 overflow-hidden ${activeImage === img ? 'border-[#2A3320]' : 'border-[#E4DDCF]'}`}
                >
                  <img src={img} alt="" className="h-full w-full object-contain p-2" />
                </button>
              ))}
            </div>
          ) : null}
        </div>
        <div className="space-y-6">
          <div className="rounded-3xl border border-[#E4DDCF] bg-[#FCFAF6] p-6">
            <div className="flex items-center justify-between">
              <div className="text-sm uppercase tracking-[0.3em] text-[#8B9A78]">
                Starting at
              </div>
              <div className="text-2xl font-semibold text-[#2A3320]">
                {formatMoney(price)}
              </div>
            </div>
            {compareAt ? (
              <div className="mt-1 text-xs text-[#8A836F] line-through">
                {formatMoney(compareAt)}
              </div>
            ) : null}
            <div className="mt-4 flex flex-wrap gap-3 text-xs text-[#8A836F]">
              <span className="rounded-full bg-[#2A3320]/10 px-3 py-1">
                Lead time: {product.leadTime ?? 'TBD'}
              </span>
              <span className="rounded-full bg-[#2A3320]/10 px-3 py-1">
                Rating: {ratingLabel}
              </span>
              <span className="rounded-full bg-[#2A3320]/10 px-3 py-1">
                {product.reviewCount ?? 0} reviews
              </span>
            </div>
            <button
              className="mt-6 w-full rounded-full bg-[#2A3320] px-5 py-3 text-xs font-bold uppercase tracking-[0.3em] text-white"
              onClick={handleAddToCart}
            >
              Add to cart
            </button>
            <div className="mt-3 flex items-center justify-center">
              <WishlistButton productId={product.id} />
            </div>
            {status ? <p className="mt-3 text-sm text-[#6B665A]">{status}</p> : null}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-[#E4DDCF] bg-[#FCFAF6] p-5">
              <div className="text-xs uppercase tracking-[0.3em] text-[#8B9A78]">
                Materials
              </div>
              <ul className="mt-3 space-y-2 text-sm text-[#6B665A]">
                {(product.materials ?? []).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-3xl border border-[#E4DDCF] bg-[#FCFAF6] p-5">
              <div className="text-xs uppercase tracking-[0.3em] text-[#8B9A78]">
                Dimensions
              </div>
              <p className="mt-3 text-sm text-[#6B665A]">{product.dimensions ?? 'TBD'}</p>
              <div className="mt-4 text-xs uppercase tracking-[0.3em] text-[#8B9A78]">
                Finishes
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {(product.finishes ?? []).map((finish) => (
                  <span
                    key={finish}
                    className="rounded-full border border-[#E4DDCF] bg-white px-3 py-1 text-xs text-[#6B665A]"
                  >
                    {finish}
                  </span>
                ))}
              </div>
            </div>
          </div>
          {product.variants?.length ? (
            <div className="rounded-3xl border border-[#E4DDCF] bg-[#FCFAF6] p-6">
              <div className="text-xs uppercase tracking-[0.3em] text-[#8B9A78]">
                Variants
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                {product.variants.map((variant) => {
                  const isActive = variant.id === activeVariantId
                  return (
                    <button
                      key={variant.id}
                      type="button"
                      onClick={() => {
                        setActiveVariantId(variant.id)
                        if (variant.image?.url) {
                          setActiveImage(variant.image.url)
                        }
                        setVariantPrice(variant.price ?? null)
                      }}
                      className={`flex items-center gap-2 rounded-full border px-3 py-2 text-[10px] uppercase tracking-[0.3em] ${
                        isActive ? 'border-[#2A3320] text-[#2A3320]' : 'border-[#E4DDCF] text-[#8A836F]'
                      }`}
                    >
                      <span
                        className="h-3 w-3 rounded-full border border-[#E4DDCF]"
                        style={{ backgroundColor: variant.color || '#E4DDCF' }}
                      />
                      {variant.name}
                    </button>
                  )
                })}
              </div>
              {product.variants.find((variant) => variant.id === activeVariantId)
                ?.specifications?.length ? (
                <ul className="mt-4 space-y-2 text-sm text-[#6B665A]">
                  {product.variants
                    .find((variant) => variant.id === activeVariantId)
                    ?.specifications?.map((spec) => (
                      <li key={spec}>{spec}</li>
                    ))}
                </ul>
              ) : null}
              {product.variants.find((variant) => variant.id === activeVariantId) ? (
                <div className="mt-4 flex flex-wrap gap-2 text-xs uppercase tracking-[0.3em] text-[#8A836F]">
                  <span>
                    Status:{' '}
                    {product.variants.find((variant) => variant.id === activeVariantId)
                      ?.stockStatus ?? 'in_stock'}
                  </span>
                  <span>
                    Stock:{' '}
                    {product.variants.find((variant) => variant.id === activeVariantId)
                      ?.stockCount ?? '-'}
                  </span>
                  <span>
                    SKU:{' '}
                    {product.variants.find((variant) => variant.id === activeVariantId)?.sku ?? '-'}
                  </span>
                </div>
              ) : null}
            </div>
          ) : null}
          <div className="rounded-3xl border border-[#E4DDCF] bg-[#FCFAF6] p-6 text-sm text-[#6B665A]">
            Every Timberbell piece ships with a care kit, felt pads, and a detailed maintenance
            guide to keep finishes looking their best.
          </div>
        </div>
      </div>
    </div>
  )
}
