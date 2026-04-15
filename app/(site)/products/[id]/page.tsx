'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import SectionHeading from '@/app/_components/SectionHeading'
import { formatMoney } from '@/lib/utils/format'
import WishlistButton from '@/app/_components/WishlistButton'
import Breadcrumb from '@/app/_components/Breadcrumb'
import { useAppDispatch } from '@/lib/redux/hooks'
import { addItem } from '@/lib/redux/cartSlice'

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

  const ratingLabel = useMemo(() => `${(product?.rating ?? 0).toFixed(1)} / 5`, [product?.rating])
  const stars = useMemo(() => {
    const safeRating = Math.round((product?.rating ?? 0) * 2) / 2
    return Array.from({ length: 5 }).map((_, index) => {
      const starNumber = index + 1
      if (safeRating >= starNumber) return 'full'
      if (safeRating + 0.5 === starNumber) return 'half'
      return 'empty'
    })
  }, [product?.rating])

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="h-6 w-32 animate-pulse rounded bg-[#E6D9C8]" />
        <div className="mt-8 grid gap-10 lg:grid-cols-2">
          <div className="aspect-square animate-pulse rounded-[32px] bg-[#E6D9C8]/40" />
          <div className="space-y-6">
            <div className="h-10 w-2/3 animate-pulse rounded bg-[#E6D9C8]" />
            <div className="h-24 w-full animate-pulse rounded bg-[#E6D9C8]/40" />
            <div className="h-12 w-full animate-pulse rounded bg-[#E6D9C8]" />
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-16 text-sm text-[#6B594A]">
        Product not found.
      </div>
    )
  }

  const images = product.images?.length ? product.images.map((img) => img.url) : []
  const fallbackPalette = product.palette ?? ['#f4e7d2', '#eab38b', '#c59a6b']
  const price = variantPrice ?? product.finalPrice ?? product.price
  const compareAt = product.compareAt ?? (product.finalPrice ? product.price : undefined)

  const StarIcon = ({ variant }: { variant: 'full' | 'half' | 'empty' }) => (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="half-star-detail" x1="0" x2="1" y1="0" y2="0">
          <stop offset="50%" stopColor="#7C4E2F" />
          <stop offset="50%" stopColor="#D8C7B3" />
        </linearGradient>
      </defs>
      <path
        d="M12 3.5 14.6 9l6 .9-4.3 4.2 1 5.9-5.3-2.8-5.3 2.8 1-5.9L3.4 9.9 9.4 9 12 3.5Z"
        fill={
          variant === 'full'
            ? '#7C4E2F'
            : variant === 'half'
              ? 'url(#half-star-detail)'
              : '#D8C7B3'
        }
      />
    </svg>
  )

  const dispatch = useAppDispatch()
  const handleAddToCart = async () => {
    setStatus('Adding to cart...')
    const res = await fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: product.id, quantity: 1 }),
    })

    if (res.ok) {
      dispatch(addItem({
        productId: product.id,
        name: product.name,
        price: price, // price is defined below in the render but actually I should define it above if needed, wait price is defined inside the component body
        quantity: 1,
        imageUrl: product.images?.[0]?.url,
        variantId: activeVariantId || undefined,
        variantName: product.variants?.find(v => v.id === activeVariantId)?.name
      }))
      setStatus('Added to cart.')
      return
    }

    const data = await res.json().catch(() => ({}))
    setStatus(data.message || 'Unable to add to cart.')
  }

  return (
    <div className="mx-auto max-w-6xl space-y-12 px-6 py-16">
      <div className="flex flex-col gap-6">
        <Breadcrumb items={[
          { label: 'Home', href: '/' },
          { label: 'Shop', href: '/productfilter' },
          { label: product.category || 'Collection', href: `/productfilter?category=${(product.category || '').toLowerCase().replace(/ /g, '-')}` },
          { label: product.name }
        ]} />
        <SectionHeading
          eyebrow={product.category}
          title={product.name}
          description={product.description}
        />
      </div>

      <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <div
            className="relative h-[420px] w-full overflow-hidden rounded-[32px] border border-[#E6D9C8] bg-[#F4EEE4] shadow-[0_30px_80px_-60px_rgba(55,32,15,0.6)]"
            style={{
              backgroundImage: images.length
                ? undefined
                : `linear-gradient(135deg, ${fallbackPalette[0]}, ${fallbackPalette[1]}, ${fallbackPalette[2]})`,
            }}
          >
            {images.length ? (
              <img
                src={activeImage || images[0]}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : null}
            <div className="absolute right-4 top-4 rounded-full bg-white/90 px-4 py-2 text-[10px] uppercase tracking-[0.3em] text-[#7C4E2F]">
              Featured
            </div>
            {compareAt && compareAt > price ? (
              <div className="absolute left-4 top-4 rounded-full bg-[#7C4E2F] px-4 py-2 text-[10px] uppercase tracking-[0.3em] text-white">
                {Math.round(((compareAt - price) / compareAt) * 100)}% OFF
              </div>
            ) : null}
          </div>
          {images.length > 1 ? (
            <div className="grid grid-cols-4 gap-3">
              {images.slice(0, 4).map((img) => (
                <button
                  key={img}
                  type="button"
                  onClick={() => setActiveImage(img)}
                  className={`h-20 rounded-2xl border-2 overflow-hidden ${activeImage === img ? 'border-[#2B2119]' : 'border-[#E6D9C8]'}`}
                >
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="space-y-6">
          <div className="rounded-[28px] border border-[#E6D9C8] bg-white/80 p-6 shadow-[0_18px_40px_-30px_rgba(55,32,15,0.35)]">
            <div className="flex items-center justify-between">
              <div className="text-[10px] uppercase tracking-[0.3em] text-[#8C7A6B]">
                Starting at
              </div>
              <div className="text-2xl font-semibold text-[#2B2119]">
                {formatMoney(price)}
              </div>
            </div>
            {compareAt ? (
              <div className="mt-1 text-xs text-[#8C7A6B] line-through">
                {formatMoney(compareAt)}
              </div>
            ) : null}
            <div className="mt-4 flex flex-wrap gap-3 text-xs text-[#8C7A6B]">
              <span className="rounded-full bg-[#7C4E2F]/10 px-3 py-1">
                Delivery window: {product.leadTime ?? 'TBD'}
              </span>
              <span className="rounded-full bg-[#7C4E2F]/10 px-3 py-1 flex items-center gap-2">
                <span className="flex items-center gap-1">
                  {stars.map((variant, index) => (
                    <StarIcon key={index} variant={variant as 'full' | 'half' | 'empty'} />
                  ))}
                </span>
                {ratingLabel}
              </span>
              <span className="rounded-full bg-[#7C4E2F]/10 px-3 py-1">
                {product.reviewCount ?? 0} reviews
              </span>
            </div>
            <button
              className="mt-6 w-full rounded-full bg-[#7C4E2F] px-5 py-3 text-xs font-bold uppercase tracking-[0.3em] text-white"
              onClick={handleAddToCart}
            >
              Add to cart
            </button>
            <div className="mt-3 flex items-center justify-center">
              <WishlistButton productId={product.id} />
            </div>
            {status ? <p className="mt-3 text-sm text-[#6B594A]">{status}</p> : null}
          </div>

          {product.variants?.length ? (
            <div className="rounded-[28px] border border-[#E6D9C8] bg-[#F4EEE4] p-6">
              <div className="text-[10px] uppercase tracking-[0.3em] text-[#8C7A6B]">
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
                      className={`flex items-center gap-2 rounded-full border px-3 py-2 text-[10px] uppercase tracking-[0.3em] transition ${
                        isActive ? 'border-[#7C4E2F] bg-[#7C4E2F]/5 text-[#7C4E2F] ring-1 ring-[#7C4E2F]' : 'border-[#E6D9C8] text-[#8C7A6B] hover:border-[#7C4E2F]'
                      }`}
                    >
                      <span
                        className="h-4 w-4 rounded-full border shadow-sm"
                        style={{ backgroundColor: variant.color || '#E6D9C8' }}
                      />
                      {variant.name}
                    </button>
                  )
                })}
              </div>
              {product.variants.find((variant) => variant.id === activeVariantId)
                ?.specifications?.length ? (
                <ul className="mt-4 space-y-2 text-sm text-[#6B594A]">
                  {product.variants
                    .find((variant) => variant.id === activeVariantId)
                    ?.specifications?.map((spec) => (
                      <li key={spec}>{spec}</li>
                    ))}
                </ul>
              ) : null}
              {product.variants.find((variant) => variant.id === activeVariantId) ? (
               <div className="mt-4 flex flex-wrap gap-2 text-xs uppercase tracking-[0.3em] text-[#8C7A6B]">
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

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[24px] border border-[#E6D9C8] bg-[#F4EEE4] p-5">
              <div className="text-xs uppercase tracking-[0.3em] text-[#8C7A6B]">
                Materials
              </div>
              <ul className="mt-3 space-y-2 text-sm text-[#6B594A]">
                {(product.materials ?? []).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-[24px] border border-[#E6D9C8] bg-[#F4EEE4] p-5">
              <div className="text-xs uppercase tracking-[0.3em] text-[#8C7A6B]">
                Dimensions
              </div>
              <p className="mt-3 text-sm text-[#6B594A]">{product.dimensions ?? 'TBD'}</p>
              <div className="mt-4 text-xs uppercase tracking-[0.3em] text-[#8C7A6B]">
                Finishes
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {(product.finishes ?? []).map((finish) => (
                  <span
                    key={finish}
                    className="rounded-full border border-[#E6D9C8] bg-white px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-[#6B594A]"
                  >
                    {finish}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-[24px] border border-[#E6D9C8] bg-[#F4EEE4] p-6 text-sm text-[#6B594A]">
            Every Timberbell piece ships with a care kit, felt pads, and a detailed maintenance guide.
          </div>
        </div>
      </div>
    </div>
  )
}
