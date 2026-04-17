'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { formatMoney } from '@/lib/utils/format'
import { useAppDispatch } from '@/lib/redux/hooks'
import { addItem } from '@/lib/redux/cartSlice'
import { ensureReservationCountdown } from '@/lib/reservation'
import { getColorName } from '@/lib/utils/color-name'

type Product = {
  id: string
  name: string
  price: number
  category: string
  description: string
  discountType?: 'percentage' | 'fixed'
  discountValue?: number
  finalPrice?: number
  images?: { url: string }[]
  variants?: Array<{
    id: string
    name: string
    price?: number
    color?: string
    stockCount?: number
    stockStatus?: 'in_stock' | 'low_stock' | 'out_of_stock' | 'preorder'
    image?: { url: string }
    materials?: string[]
    finishes?: string[]
    specifications?: string[]
  }>
}

export default function QuickViewModal({ product }: { product: Product }) {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const [activeVariantId, setActiveVariantId] = useState<string | null>(product.variants?.[0]?.id ?? null)
  const [activeImage, setActiveImage] = useState(product.variants?.[0]?.image?.url || product.images?.[0]?.url || '')
  const [mounted, setMounted] = useState(false)

  const selectedVariant = useMemo(
    () => product.variants?.find((variant) => variant.id === activeVariantId) ?? null,
    [activeVariantId, product.variants]
  )

  const computeDisplayPrice = (basePrice?: number | null) => {
    const sourcePrice = Number(basePrice || 0)
    if (!sourcePrice) return 0
    if (product.discountType === 'percentage' && product.discountValue) {
      return Math.max(sourcePrice - (sourcePrice * product.discountValue) / 100, 0)
    }
    if (product.discountType === 'fixed' && product.discountValue) {
      return Math.max(sourcePrice - product.discountValue, 0)
    }
    return sourcePrice
  }

  const basePrice = selectedVariant?.price ?? product.price
  const displayPrice = product.finalPrice ?? computeDisplayPrice(basePrice)
  const galleryImages = Array.from(new Set([selectedVariant?.image?.url, ...(product.images?.map((img) => img.url) || [])].filter(Boolean))) as string[]
  const availableStock = selectedVariant?.stockCount ?? null
  const selectedColor = selectedVariant?.color ? getColorName(selectedVariant.color) : null

  useEffect(() => {
    setMounted(true)
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  function close() {
    setMounted(false)
    setTimeout(() => router.back(), 200)
  }

  async function handleAddToCart() {
    const res = await fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: product.id,
        variantId: selectedVariant?.id,
        variantName: selectedVariant?.name ?? null,
        color: selectedVariant?.color ?? null,
        quantity: 1,
      }),
    })

    if (res.ok) {
      ensureReservationCountdown()
      dispatch(addItem({
        productId: product.id,
        variantId: selectedVariant?.id,
        name: product.name,
        price: displayPrice,
        quantity: 1,
        imageUrl: selectedVariant?.image?.url || product.images?.[0]?.url,
        variantName: selectedVariant?.name,
        color: selectedVariant?.color,
      }))
      close()
      setTimeout(() => router.push('/cart'), 300)
    }
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${mounted ? 'opacity-100' : 'opacity-0'}`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#2B2119]/40 backdrop-blur-sm"
        onClick={close}
      />

      {/* Modal Container */}
      <div
        className={`relative w-full max-w-4xl overflow-hidden rounded-[40px] border border-[#E6D9C8] bg-white shadow-[0_40px_100px_-40px_rgba(55,32,15,0.7)] transition-all duration-500 ${mounted ? 'translate-y-0 scale-100' : 'translate-y-10 scale-95'}`}
      >
        <button
          onClick={close}
          className="absolute right-6 top-6 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-[#E6D9C8] bg-white/80 text-[#2B2119] transition hover:bg-white"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div className="grid lg:grid-cols-2">
          {/* Left: Images */}
          <div className="bg-[#F4EEE4] p-8 lg:p-12">
            <div className="aspect-square w-full overflow-hidden rounded-[32px] border border-[#E6D9C8] bg-white shadow-sm">
              {activeImage ? (
                <img
                  src={activeImage}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-[#EFE6DA] text-[10px] uppercase tracking-[0.3em] text-[#8C7A6B]">
                  No Image
                </div>
              )}
            </div>
            {galleryImages.length > 1 && (
              <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
                {galleryImages.slice(0, 4).map((img) => (
                  <button
                    key={img}
                    onClick={() => setActiveImage(img)}
                    className={`h-16 w-16 flex-shrink-0 rounded-2xl border-2 transition ${activeImage === img ? 'border-[#7C4E2F]' : 'border-transparent'}`}
                  >
                    <img src={img} alt="" className="h-full w-full rounded-xl object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Content */}
          <div className="flex flex-col justify-center p-8 lg:p-12">
            <div className="space-y-6">
              <div>
                <p className="text-[10px] uppercase tracking-[0.4em] text-[#8C7A6B]">
                  {product.category}
                </p>
                <h2 className="mt-3 font-display text-3xl text-[#2B2119] lg:text-4xl">
                  {selectedVariant?.name ? `${product.name} · ${selectedVariant.name}` : product.name}
                </h2>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-2xl font-semibold text-[#2B2119]">
                  {formatMoney(displayPrice)}
                </span>
                {basePrice > displayPrice && (
                  <span className="text-sm text-[#8C7A6B] line-through">
                    {formatMoney(basePrice)}
                  </span>
                )}
              </div>

              {product.variants?.length ? (
                <div className="space-y-3 rounded-[28px] border border-[#E6D9C8] bg-[#FCFAF6] p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#8C7A6B]">Choose Variant</p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {product.variants.map((variant) => (
                      <button
                        key={variant.id}
                        type="button"
                        onClick={() => {
                          setActiveVariantId(variant.id)
                          setActiveImage(variant.image?.url || product.images?.[0]?.url || '')
                        }}
                        className={`rounded-[22px] border px-4 py-3 text-left transition ${selectedVariant?.id === variant.id ? 'border-[#7C4E2F] bg-[#2B2119] text-white' : 'border-[#E6D9C8] bg-white text-[#2B2119]'}`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-[11px] font-bold uppercase tracking-[0.18em]">{variant.name}</p>
                            <p className={`mt-1 text-[10px] ${selectedVariant?.id === variant.id ? 'text-white/70' : 'text-[#8C7A6B]'}`}>
                              {formatMoney(computeDisplayPrice(variant.price ?? product.price))}
                            </p>
                          </div>
                          {variant.color ? <span className="h-3 w-3 rounded-full border border-black/10" style={{ backgroundColor: variant.color }} /> : null}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              <p className="text-sm leading-relaxed text-[#6B594A] line-clamp-4">
                {product.description}
              </p>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-[#E6D9C8] bg-[#FCFAF6] p-4">
                  <p className="text-[10px] uppercase tracking-[0.24em] text-[#8C7A6B]">Color</p>
                  <p className="mt-2 text-sm font-bold text-[#2B2119]">{selectedColor || 'Main finish'}</p>
                </div>
                <div className="rounded-2xl border border-[#E6D9C8] bg-[#FCFAF6] p-4">
                  <p className="text-[10px] uppercase tracking-[0.24em] text-[#8C7A6B]">Stock</p>
                  <p className="mt-2 text-sm font-bold text-[#2B2119]">{availableStock ?? 'Main stock'}</p>
                </div>
                <div className="rounded-2xl border border-[#E6D9C8] bg-[#FCFAF6] p-4">
                  <p className="text-[10px] uppercase tracking-[0.24em] text-[#8C7A6B]">Status</p>
                  <p className="mt-2 text-sm font-bold text-[#2B2119]">{selectedVariant?.stockStatus?.replace('_', ' ') || 'in stock'}</p>
                </div>
              </div>

              <div className="space-y-3 pt-4">
                <button
                  onClick={handleAddToCart}
                  disabled={selectedVariant?.stockStatus === 'out_of_stock' || availableStock === 0}
                  className="w-full rounded-full bg-[#7C4E2F] py-4 text-xs font-bold uppercase tracking-[0.3em] text-white transition hover:bg-[#6A3F24]"
                >
                  {selectedVariant?.stockStatus === 'out_of_stock' || availableStock === 0 ? 'Out of Stock' : 'Quick Add to Cart'}
                </button>
                <a
                  href={`/products/${product.id}`}
                  onClick={() => document.body.style.overflow = 'unset'}
                  className="flex w-full items-center justify-center rounded-full border border-[#E6D9C8] py-4 text-[10px] font-bold uppercase tracking-[0.3em] text-[#7C4E2F] transition hover:bg-[#F4EEE4]"
                >
                  View Full Details
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
