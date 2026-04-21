'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatMoney } from '@/lib/utils/format'
import { getOptimizedImageUrl } from '@/lib/utils/image'

type Product = {
  id: string
  name: string
  price: number
  category: string
  description: string
  inventoryCount?: number
  stockStatus?: 'in_stock' | 'low_stock' | 'out_of_stock' | 'preorder'
  discountType?: 'percentage' | 'fixed'
  discountValue?: number
  finalPrice?: number
  images?: { url: string }[]
  variants?: Array<{
    id: string
    name: string
    price?: number
    discountType?: 'percentage' | 'fixed'
    discountValue?: number
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
  const [selectionMode, setSelectionMode] = useState<'main' | 'variant'>(product.variants?.length ? 'main' : 'main')
  const [activeVariantId, setActiveVariantId] = useState<string | null>(product.variants?.[0]?.id ?? null)
  const [activeImage, setActiveImage] = useState(getOptimizedImageUrl(product.images?.[0]?.url || product.variants?.[0]?.image?.url || ''))

  const selectedVariant = useMemo(
    () => product.variants?.find((variant) => variant.id === activeVariantId) ?? null,
    [activeVariantId, product.variants]
  )
  const displayVariant = selectionMode === 'variant' ? selectedVariant : null

  const computeDisplayPrice = (basePrice?: number | null) => {
    const sourcePrice = Number(basePrice || 0)
    if (!sourcePrice) return 0
    const discountType = displayVariant?.discountType || product.discountType
    const discountValue = displayVariant?.discountValue ?? product.discountValue
    if (discountType === 'percentage' && discountValue) {
      return Math.max(sourcePrice - (sourcePrice * discountValue) / 100, 0)
    }
    if (discountType === 'fixed' && discountValue) {
      return Math.max(sourcePrice - discountValue, 0)
    }
    return sourcePrice
  }

  const basePrice = displayVariant?.price ?? product.price
  const displayPrice = computeDisplayPrice(basePrice)
  const galleryImages = Array.from(
    new Set(
      [displayVariant?.image?.url, ...(product.images?.map((img) => img.url) || [])]
        .filter(Boolean)
        .map((url) => getOptimizedImageUrl(url))
    )
  ) as string[]
  const availableStock = displayVariant?.stockCount ?? product.inventoryCount ?? null
  const stockStatus = displayVariant?.stockStatus ?? product.stockStatus

  useEffect(() => {
    const previousBodyOverflow = document.body.style.overflow
    const previousBodyOverflowX = document.body.style.overflowX
    const previousHtmlOverflow = document.documentElement.style.overflow
    const previousHtmlOverflowX = document.documentElement.style.overflowX

    document.body.style.overflow = 'hidden'
    document.body.style.overflowX = 'hidden'
    document.documentElement.style.overflow = 'hidden'
    document.documentElement.style.overflowX = 'hidden'

    return () => {
      document.body.style.overflow = previousBodyOverflow
      document.body.style.overflowX = previousBodyOverflowX
      document.documentElement.style.overflow = previousHtmlOverflow
      document.documentElement.style.overflowX = previousHtmlOverflowX
    }
  }, [])

  function releasePageOverflow() {
    document.body.style.overflow = 'unset'
    document.body.style.overflowX = 'hidden'
    document.documentElement.style.overflow = 'unset'
    document.documentElement.style.overflowX = 'hidden'
  }

  function close() {
    releasePageOverflow()
    router.back()
  }

  function openFullDetails() {
    releasePageOverflow()
    window.location.assign(`/products/${product.id}`)
  }

  function selectMainProduct() {
    setSelectionMode('main')
    setActiveImage(getOptimizedImageUrl(product.images?.[0]?.url || product.variants?.[0]?.image?.url || ''))
  }

  function selectVariant(variantId: string) {
    const nextVariant = product.variants?.find((variant) => variant.id === variantId) ?? null
    setSelectionMode('variant')
    setActiveVariantId(variantId)
    setActiveImage(getOptimizedImageUrl(nextVariant?.image?.url || product.images?.[0]?.url || ''))
  }

  const isUnavailable = stockStatus === 'out_of_stock' || availableStock === 0

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-x-hidden overflow-y-auto p-3 sm:items-center sm:p-4">
      <div
        className="absolute inset-0 bg-[#2B2119]/40 backdrop-blur-sm"
        onClick={close}
      />

      <div className="relative my-4 w-full min-w-0 max-w-[52rem] overflow-hidden rounded-[28px] border border-[#E6D9C8] bg-white shadow-[0_40px_100px_-40px_rgba(55,32,15,0.7)] sm:my-0">
        <button
          onClick={close}
          className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-[#E6D9C8] bg-white/90 text-[#2B2119] transition hover:bg-white sm:right-5 sm:top-5"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div className="grid min-w-0 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="min-w-0 bg-[#F4EEE4] p-4 sm:p-5 lg:p-6">
            <div className="aspect-square w-full overflow-hidden rounded-[24px] border border-[#E6D9C8] bg-white shadow-sm sm:rounded-[28px]">
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
              <div className="mt-3 flex max-w-full gap-2 overflow-x-auto pb-1 sm:mt-4 sm:gap-3 sm:pb-2">
                {galleryImages.slice(0, 3).map((img) => (
                  <button
                    key={img}
                    onClick={() => setActiveImage(img)}
                    className={`h-14 w-14 flex-shrink-0 rounded-xl border-2 transition sm:h-16 sm:w-16 sm:rounded-2xl ${activeImage === img ? 'border-[#7C4E2F]' : 'border-transparent'}`}
                  >
                    <img src={img} alt="" className="h-full w-full rounded-xl object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex min-w-0 flex-col p-4 sm:p-5 lg:p-6">
            <div className="space-y-4">
              <div className="min-w-0">
                <p className="truncate text-[10px] uppercase tracking-[0.28em] text-[#8C7A6B]">
                  {product.category}
                </p>
                <h2 className="mt-2 break-words pr-10 font-display text-2xl text-[#2B2119] sm:mt-3 sm:text-[2rem]">
                  {displayVariant?.name ? `${product.name} - ${displayVariant.name}` : product.name}
                </h2>
              </div>

              <div className="flex min-w-0 flex-wrap items-center gap-2.5">
                <span className="text-2xl font-semibold text-[#2B2119] sm:text-3xl">
                  {formatMoney(displayPrice)}
                </span>
                {basePrice > displayPrice && (
                  <span className="min-w-0 break-words text-sm text-[#8C7A6B] line-through">
                    {formatMoney(basePrice)}
                  </span>
                )}
              </div>

              {product.variants?.length ? (
                <div className="space-y-3 rounded-[24px] border border-[#E6D9C8] bg-[#FCFAF6] p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8C7A6B]">Choose Purchase Type</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={selectMainProduct}
                      className={`min-w-0 rounded-full border px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] transition-all active:scale-[0.98] ${selectionMode === 'main' ? 'translate-y-[1px] border-[#7C4E2F] bg-[#2B2119] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]' : 'border-[#E6D9C8] bg-white text-[#6B594A] hover:border-[#7C4E2F]'}`}
                    >
                      Main Product
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const fallbackVariantId = activeVariantId ?? product.variants?.[0]?.id
                        if (fallbackVariantId) selectVariant(fallbackVariantId)
                      }}
                      className={`min-w-0 rounded-full border px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] transition-all active:scale-[0.98] ${selectionMode === 'variant' ? 'translate-y-[1px] border-[#7C4E2F] bg-[#2B2119] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]' : 'border-[#E6D9C8] bg-white text-[#6B594A] hover:border-[#7C4E2F]'}`}
                    >
                      Variant
                    </button>
                  </div>
                  <div className={`grid gap-2 transition-all ${selectionMode === 'variant' ? 'opacity-100' : 'pointer-events-none opacity-45'}`}>
                    {product.variants.map((variant) => (
                      <button
                        key={variant.id}
                        type="button"
                        onClick={() => selectVariant(variant.id)}
                        className={`min-w-0 rounded-[18px] border px-4 py-3 text-left transition-all active:scale-[0.98] ${displayVariant?.id === variant.id ? 'translate-y-[1px] border-[#7C4E2F] bg-[#2B2119] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]' : 'border-[#E6D9C8] bg-white text-[#2B2119] hover:border-[#7C4E2F] hover:shadow-sm'}`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-[11px] font-bold uppercase tracking-[0.12em]">{variant.name}</p>
                            <p className={`mt-1 text-[10px] ${displayVariant?.id === variant.id ? 'text-white/70' : 'text-[#8C7A6B]'}`}>
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

              <p className="text-sm leading-relaxed text-[#6B594A] line-clamp-2">
                {product.description}
              </p>

              <div className="space-y-3 pt-1">
                <div className="rounded-2xl border border-[#E6D9C8] bg-white px-4 py-3 text-sm text-[#6B594A]">
                  {stockStatus === 'preorder'
                    ? 'Available for preorder.'
                    : availableStock === 0
                      ? 'Currently unavailable.'
                      : availableStock && availableStock <= 5
                        ? `Only ${availableStock} left in stock.`
                        : selectionMode === 'variant'
                          ? 'Variant ready to review.'
                          : 'Main product ready to review.'}
                </div>
                <button
                  type="button"
                  onClick={openFullDetails}
                  className={`block w-full max-w-full rounded-full px-3 py-3 text-[10px] font-bold uppercase tracking-[0.1em] transition active:scale-[0.99] ${isUnavailable ? 'border border-[#E6D9C8] text-[#7C4E2F] hover:bg-[#F4EEE4]' : 'bg-[#7C4E2F] text-white hover:bg-[#6A3F24]'}`}
                >
                  {isUnavailable ? 'View Full Details' : selectionMode === 'variant' ? 'Choose Variant In Full Details' : 'Open Product Details'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
