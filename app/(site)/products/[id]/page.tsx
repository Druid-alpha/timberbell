'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import SectionHeading from '@/app/_components/SectionHeading'
import { formatMoney } from '@/lib/utils/format'
import WishlistButton from '@/app/_components/WishlistButton'
import { useAppDispatch } from '@/lib/redux/hooks'
import { addItem } from '@/lib/redux/cartSlice'
import Breadcrumb from '@/app/_components/Breadcrumb'
import RelatedProducts from '@/app/_components/RelatedProducts'
import { useToast } from '@/app/_components/ToastProvider'
import { ensureReservationCountdown } from '@/lib/reservation'
import { parseJsonArray } from '@/lib/utils/safe-json'
import { getColorName } from '@/lib/utils/color-name'
import { getOptimizedImageUrl } from '@/lib/utils/image'

type ProductReview = {
  id: string
  userId?: string
  customer: string
  rating: number
  message: string
  createdAt: string
}

export default function ProductDetailPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const dispatch = useAppDispatch()
  const { toast } = useToast()
  
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('')
  const [activeImage, setActiveImage] = useState('')
  const [selectionMode, setSelectionMode] = useState<'main' | 'variant'>('main')
  const [activeVariantId, setActiveVariantId] = useState<string | null>(null)
  const [activeColorHex, setActiveColorHex] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [reviews, setReviews] = useState<ProductReview[]>([])
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [isAddingReview, setIsAddingReview] = useState(false)
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null)
  const [newReview, setNewReview] = useState({ rating: 5, message: '' })

  const computeDisplayPrice = (basePrice?: number | null) => {
    const priceValue = Number(basePrice || 0)
    if (!priceValue) return 0
    const selectedVariant = product?.variants?.find((v: any) => v.id === activeVariantId) ?? null
    const activeDiscountType =
      selectionMode === 'variant' ? selectedVariant?.discountType || product?.discountType : product?.discountType
    const activeDiscountValue =
      selectionMode === 'variant' ? selectedVariant?.discountValue ?? product?.discountValue : product?.discountValue
    if (activeDiscountType === 'percentage' && activeDiscountValue) {
      return Math.max(priceValue - (priceValue * Number(activeDiscountValue || 0)) / 100, 0)
    }
    if (activeDiscountType === 'fixed' && activeDiscountValue) {
      return Math.max(priceValue - Number(activeDiscountValue || 0), 0)
    }
    return priceValue
  }
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
        
        // Track recently viewed
        if (res.ok && data) {
          const viewed = parseJsonArray<any>(localStorage.getItem('recentlyViewed'))
          const newItem = {
            id: data.id,
            name: data.name,
            price: data.finalPrice || data.price,
            category: data.category,
            imageUrl: getOptimizedImageUrl(data.images?.[0]?.url)
          }
          const filtered = viewed.filter((item: any) => item.id !== data.id)
          localStorage.setItem('recentlyViewed', JSON.stringify([newItem, ...filtered].slice(0, 10)))
        }
      }
    }

    async function loadReviews() {
      const res = await fetch(`/api/reviews?productId=${params.id}`)
      const data = await res.json()
      if (active && res.ok) {
        setReviews(data.reviews)
        setCurrentUserId(data.currentUserId ?? null)
      }
    }

    load()
    loadReviews()
    return () => { active = false }
  }, [params?.id])

  useEffect(() => {
    if (!product) return
    const firstVariantImage = product.variants?.find((variant: any) => variant.image?.url)?.image?.url
    setSelectionMode('main')
    setActiveImage(getOptimizedImageUrl(product.images?.[0]?.url || firstVariantImage || ''))
    setActiveVariantId(product.variants?.[0]?.id ?? null)
    setActiveColorHex(product.variants?.[0]?.color ?? product.palette?.[0] ?? '#f4e7d2')
  }, [product])

  const averageRating = useMemo(() => {
    if (!reviews.length) return 0
    return reviews.reduce((sum, review) => sum + (review.rating || 0), 0) / reviews.length
  }, [reviews])
  const ratingLabel = useMemo(() => `${averageRating.toFixed(1)} / 5`, [averageRating])
  const stars = useMemo(() => {
    const safeRating = Math.round(averageRating * 2) / 2
    return Array.from({ length: 5 }).map((_, index) => {
      const starNumber = index + 1
      if (safeRating >= starNumber) return 'full'
      if (safeRating + 0.5 === starNumber) return 'half'
      return 'empty'
    })
  }, [averageRating])

  const handleAddToCart = async () => {
    if (!product) return
    setStatus('Adding to cart...')
    const selectedVariant = product.variants?.find((v: any) => v.id === activeVariantId) ?? null
    const displayVariant = selectionMode === 'variant' ? selectedVariant : null
    const finalPrice = computeDisplayPrice(displayVariant?.price ?? product.price)
    
    const res = await fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: product.id,
        purchaseType: displayVariant ? 'variant' : 'main',
        variantId: displayVariant?.id,
        variantName: displayVariant?.name ?? null,
        color: displayVariant?.color ?? (selectionMode === 'main' ? activeColorHex ?? null : null),
        quantity: quantity,
      }),
    })

    if (res.ok) {
      ensureReservationCountdown()
      dispatch(
        addItem({
          productId: product.id,
          purchaseType: displayVariant ? 'variant' : 'main',
          variantId: displayVariant?.id,
          quantity: quantity,
          name: product.name,
          price: finalPrice,
          variantName: displayVariant?.name,
          color: displayVariant?.color ?? (selectionMode === 'main' ? activeColorHex : undefined),
        })
      )
      toast(`${product.name} added to your bundle`, 'success')
      setTimeout(() => router.push('/cart'), 600)
    } else {
      const data = await res.json().catch(() => ({}))
      setStatus(data.message || 'Error occurred')
    }
  }

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newReview.message.trim()) return
    const res = await fetch(editingReviewId ? `/api/reviews/${editingReviewId}` : '/api/reviews', {
      method: editingReviewId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: product.id,
        rating: newReview.rating,
        message: newReview.message,
      }),
    })
    if (res.ok) {
      const refreshReviews = await fetch(`/api/reviews?productId=${product.id}`)
      const newData = await refreshReviews.json()
      if (refreshReviews.ok) {
        setReviews(newData.reviews)
        setCurrentUserId(newData.currentUserId ?? null)
      }
      setNewReview({ rating: 5, message: '' })
      setIsAddingReview(false)
      setEditingReviewId(null)
    } else if (res.status === 401) {
      setStatus('Please sign in to leave a review.')
    } else {
      const data = await res.json().catch(() => ({}))
      setStatus(data.message || 'Unable to save your review.')
    }
  }

  const myReview = reviews.find((review) => review.userId === currentUserId) ?? null

  async function deleteReview(id: string) {
    const res = await fetch(`/api/reviews/${id}`, { method: 'DELETE' })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      setStatus(data.message || 'Unable to delete your review.')
      return
    }
    const remaining = reviews.filter((review) => review.id !== id)
    setReviews(remaining)
    if (editingReviewId === id) {
      setEditingReviewId(null)
      setIsAddingReview(false)
      setNewReview({ rating: 5, message: '' })
    }
  }

  const StarIcon = ({ variant, size = 'sm' }: { variant: 'full' | 'half' | 'empty', size?: 'sm' | 'lg' }) => (
    <svg viewBox="0 0 24 24" className={`${size === 'lg' ? 'h-5 w-5' : 'h-3.5 w-3.5'}`} fill="none" aria-hidden="true">
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

  const images = product.images?.length ? product.images.map((img: any) => getOptimizedImageUrl(img.url)) : []
  const fallbackPalette = product.palette ?? ['#f4e7d2', '#eab38b', '#c59a6b']
  const selectedVariant = product.variants?.find((variant: any) => variant.id === activeVariantId) ?? null
  const displayVariant = selectionMode === 'variant' ? selectedVariant : null
  const price = computeDisplayPrice(displayVariant?.price ?? product.price)
  const galleryImages = Array.from(new Set([getOptimizedImageUrl(displayVariant?.image?.url), ...images].filter(Boolean))) as string[]
  const variantBasePrice = displayVariant?.price ?? product.price
  const variantDisplayPrice = computeDisplayPrice(variantBasePrice)
  const activeDiscountType = displayVariant?.discountType || product.discountType
  const activeDiscountValue = displayVariant?.discountValue ?? product.discountValue
  const selectedColorHex = displayVariant?.color || activeColorHex || fallbackPalette[0]
  const selectedColorName = getColorName(selectedColorHex)
  const paletteChoices = (Array.from(new Set((product.palette ?? []).filter(Boolean))) as string[]).slice(0, 3)
  const availableStock = displayVariant?.stockCount ?? product.inventoryCount ?? 0
  const displayStockStatus = displayVariant?.stockStatus ?? product.stockStatus
  const displayMaterials = displayVariant?.materials?.length ? displayVariant.materials.join(', ') : product.materials?.join(', ') || 'Natural wood & organic fabric'
  const displayFinishes = displayVariant?.finishes?.length ? displayVariant.finishes.join(', ') : product.finishes?.join(', ') || 'Furniture-grade finish'
  const selectedTitle = displayVariant?.name ? `${product.name} - ${displayVariant.name}` : product.name

  return (
    <div className="mx-auto max-w-6xl space-y-12 overflow-x-hidden px-4 py-16 sm:px-6">
      <div className="flex flex-col gap-6">
        <Breadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: (product.category ?? 'Collection').charAt(0).toUpperCase() + (product.category ?? 'Collection').slice(1), href: `/productfilter?category=${product.category}` },
            { label: product.name },
          ]}
        />
        <SectionHeading
          eyebrow="Timberbell Furniture"
          title={selectedTitle}
          description="Refined proportions and honest materials chosen for everyday living."
        />
      </div>

      <div className="grid min-w-0 gap-12 lg:grid-cols-2">
        <div className="min-w-0 space-y-6">
          <div className="relative aspect-square overflow-hidden rounded-[40px] border border-[#E6D9C8] bg-[#F4EEE4] arkwood-reveal">
            {activeImage ? (
              <img src={activeImage} alt="" className="h-full w-full object-cover" />
            ) : (
              <div
                className="h-full w-full"
                style={{
                  backgroundImage: `linear-gradient(135deg, ${fallbackPalette[0]}, ${fallbackPalette[1]}, ${fallbackPalette[2]})`,
                }}
              />
            )}
            {activeDiscountType && activeDiscountValue ? (
              <div className="absolute left-6 top-6 rounded-full bg-[#7C4E2F] px-4 py-2 text-[10px] uppercase tracking-[0.3em] text-white">
                {activeDiscountType === 'percentage' ? `${activeDiscountValue}% Off` : `${formatMoney(activeDiscountValue)} Off`}
              </div>
            ) : null}
          </div>
          <div className="flex max-w-full gap-4 overflow-x-auto pb-2">
            {galleryImages.map((img: string, i: number) => (
              <button
                key={i}
                onClick={() => setActiveImage(img)}
                className={`h-24 w-24 shrink-0 overflow-hidden rounded-2xl border transition-all ${activeImage === img ? 'border-[#7C4E2F] p-1.5' : 'border-[#E6D9C8] hover:border-[#7C4E2F]/50'}`}
              >
                <img src={img} alt="" className="h-full w-full rounded-xl object-cover" />
              </button>
            ))}
          </div>
        </div>

        <div className="min-w-0 space-y-8 arkwood-stagger">
          <div className="space-y-4">
            <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">
              <div className="flex min-w-0 flex-wrap items-center gap-3 rounded-full border border-[#E6D9C8] bg-white/70 px-4 py-2 shadow-sm">
                <div className="flex shrink-0">
                  {stars.map((s, i) => (
                    <StarIcon key={i} variant={s as any} />
                  ))}
                </div>
                <span className="shrink-0 text-xs font-semibold text-[#2B2119]">{ratingLabel}</span>
                <span className="text-xs uppercase tracking-[0.12em] text-[#8C7A6B]">{reviews.length} reviews</span>
              </div>
              <WishlistButton productId={product.id} />
            </div>

          <div className="flex min-w-0 flex-wrap items-baseline gap-3">
            <span className="font-display text-4xl text-[#7C4E2F]">{formatMoney(price)}</span>
            {variantBasePrice > variantDisplayPrice ? (
              <span className="min-w-0 break-words text-lg text-[#8C7A6B] line-through">{formatMoney(variantBasePrice)}</span>
            ) : null}
          </div>

            <p className="text-sm leading-relaxed text-[#6B594A]">{product.description}</p>
          </div>

          <div className="space-y-6 rounded-[32px] border border-[#E6D9C8] bg-[#F4EEE4]/50 p-8 shadow-sm">
            {product.variants?.length > 0 && (
              <div className="space-y-3">
                <p className="text-[10px] uppercase tracking-[0.14em] text-[#8C7A6B]">Choose purchase type</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectionMode('main')
                      setActiveImage(getOptimizedImageUrl(product.images?.[0]?.url || selectedVariant?.image?.url || ''))
                      setQuantity(1)
                    }}
                    className={`min-w-0 rounded-full border px-4 py-3 text-[10px] font-bold uppercase tracking-[0.12em] transition-all active:scale-[0.98] ${selectionMode === 'main' ? 'translate-y-[1px] border-[#7C4E2F] bg-[#2B2119] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]' : 'border-[#E6D9C8] bg-white text-[#6B594A] hover:border-[#7C4E2F] hover:shadow-sm'}`}
                  >
                    Main Product
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const fallbackVariant = activeVariantId ?? product.variants?.[0]?.id
                      if (!fallbackVariant) return
                      setSelectionMode('variant')
                      setActiveVariantId(fallbackVariant)
                      const nextVariant = product.variants?.find((variant: any) => variant.id === fallbackVariant) ?? null
                      setActiveImage(getOptimizedImageUrl(nextVariant?.image?.url || product.images?.[0]?.url || ''))
                      setQuantity(1)
                    }}
                    className={`min-w-0 rounded-full border px-4 py-3 text-[10px] font-bold uppercase tracking-[0.12em] transition-all active:scale-[0.98] ${selectionMode === 'variant' ? 'translate-y-[1px] border-[#7C4E2F] bg-[#2B2119] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]' : 'border-[#E6D9C8] bg-white text-[#6B594A] hover:border-[#7C4E2F] hover:shadow-sm'}`}
                  >
                    Variant
                  </button>
                </div>
                <div className={`grid gap-2 sm:grid-cols-2 xl:grid-cols-3 transition-all ${selectionMode === 'variant' ? 'opacity-100' : 'pointer-events-none opacity-45'}`}>
                  {product.variants.map((v: any) => (
                    <button
                      key={v.id}
                      onClick={() => {
                        setSelectionMode('variant')
                        setActiveVariantId(v.id)
                        setActiveImage(getOptimizedImageUrl(v.image?.url || product.images?.[0]?.url || ''))
                        setActiveColorHex(v.color || fallbackPalette[0])
                        setQuantity(1)
                      }}
                      className={`flex min-w-0 items-center justify-between gap-3 rounded-[24px] border px-4 py-3 text-left transition-all active:scale-[0.98] ${displayVariant?.id === v.id ? 'translate-y-[1px] border-[#7C4E2F] bg-[#2B2119] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]' : 'border-[#E6D9C8] bg-white text-[#6B594A] hover:border-[#7C4E2F] hover:shadow-sm'}`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full border border-black/10 shadow-inner" style={{ backgroundColor: v.color || '#D8C7B3' }} />
                          <span className="truncate text-[11px] font-bold uppercase tracking-[0.12em]">{v.name}</span>
                        </div>
                        <p className={`mt-1 text-[10px] ${displayVariant?.id === v.id ? 'text-white/70' : 'text-[#8C7A6B]'}`}>
                          {formatMoney(computeDisplayPrice(v.price ?? product.price))}
                        </p>
                      </div>
                      <span className={`rounded-full px-2 py-1 text-[9px] font-bold uppercase tracking-widest ${displayVariant?.id === v.id ? 'bg-white/10 text-white' : 'bg-[#F4EEE4] text-[#7C4E2F]'}`}>
                        {v.stockStatus === 'preorder' ? 'Preorder' : `${v.stockCount ?? 0} left`}
                      </span>
                    </button>
                  ))}
                </div>
                {displayVariant ? (
                  <div className="rounded-[24px] border border-[#D9C3AA] bg-[linear-gradient(135deg,#fffdf9,#f6ede2)] p-4 shadow-[0_24px_60px_-45px_rgba(55,32,15,0.45)]">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#8C7A6B]">Selected Option</p>
                        <p className="mt-2 text-sm font-semibold text-[#2B2119]">{displayVariant.name}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex max-w-full items-center gap-2 rounded-full border border-[#E6D9C8] bg-white px-3 py-1 text-[10px] uppercase tracking-[0.12em] text-[#6B594A]">
                          <span className="h-3 w-3 rounded-full border border-black/10" style={{ backgroundColor: selectedColorHex }} />
                          {selectedColorName}
                        </span>
                        <span className="rounded-full border border-[#E6D9C8] bg-white px-3 py-1 text-[10px] uppercase tracking-[0.12em] text-[#6B594A]">
                          {displayVariant.stockStatus?.replace('_', ' ') || 'in stock'}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            )}

            {!product.variants?.length && paletteChoices.length > 0 && (
              <div className="space-y-3">
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#8C7A6B]">Available colors</p>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {paletteChoices.map((color: string) => {
                    const isActive = selectedColorHex === color
                    return (
                      <button
                        key={color}
                        type="button"
                        onClick={() => {
                          setActiveColorHex(color)
                          setActiveImage(product.images?.[0]?.url || '')
                        }}
                        className={`flex min-w-0 items-center justify-between gap-3 rounded-[24px] border px-4 py-3 text-left text-[10px] uppercase tracking-[0.12em] transition-all active:scale-[0.98] ${isActive ? 'translate-y-[1px] border-[#7C4E2F] bg-white text-[#2B2119] shadow-[inset_0_0_0_1px_rgba(124,78,47,0.1)]' : 'border-[#E6D9C8] bg-white/80 text-[#6B594A] hover:border-[#7C4E2F] hover:shadow-sm'}`}
                      >
                        <span className="inline-flex items-center gap-2">
                          <span className="h-3 w-3 rounded-full border border-black/10" style={{ backgroundColor: color }} />
                          {getColorName(color)}
                        </span>
                        <span className="text-[#8C7A6B]">Main</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-1 rounded-full border border-[#E6D9C8] bg-white p-1 shadow-sm">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="flex h-10 w-10 items-center justify-center rounded-full text-[#7C4E2F] transition hover:bg-[#F4EEE4]"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-sm font-semibold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    disabled={availableStock > 0 && quantity >= availableStock}
                    className="flex h-10 w-10 items-center justify-center rounded-full text-[#7C4E2F] transition hover:bg-[#F4EEE4] disabled:opacity-40"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={handleAddToCart}
                  disabled={displayStockStatus === 'out_of_stock' || availableStock === 0}
                  className="group relative flex-1 overflow-hidden rounded-full bg-[#7C4E2F] px-8 py-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-white shadow-lg transition-all hover:bg-[#5C3A24] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span className="relative z-10">{displayStockStatus === 'out_of_stock' || availableStock === 0 ? 'Out of stock' : selectionMode === 'variant' ? 'Add variant to bundle' : 'Add product to bundle'}</span>
                </button>
              </div>
              
              <div className="flex flex-col gap-3 px-2">
                <div className="flex items-center gap-2 text-[10px] text-[#6B594A]">
                  <div className={`h-1.5 w-1.5 rounded-full ${(availableStock > 5 || displayStockStatus === 'preorder') ? 'bg-green-500' : 'bg-orange-500 animate-pulse'}`} />
                  {displayStockStatus === 'preorder'
                    ? 'Available for preorder'
                    : availableStock > 5
                      ? 'In stock and ready to ship'
                      : `Only ${availableStock} left - items in cart are reserved for 10 min`}
                </div>
                <div className="rounded-2xl border border-[#E6D9C8]/60 bg-white/50 px-4 py-3 text-[10px] text-[#6B594A]">
                  <p className="font-bold uppercase tracking-[0.2em] text-[#8C7A6B]">Shipping & Availability</p>
                  <div className="mt-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <span>{displayStockStatus === 'preorder' ? 'Preorder available' : 'Ready for dispatch once ordered'}</span>
                    <span>Secure delivery arranged at checkout</span>
                  </div>
                </div>
              </div>
            </div>
            
            {status && (
              <p className="mt-2 text-center text-xs font-medium text-[#7C4E2F]">{status}</p>
            )}
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {product.dimensions && product.dimensions !== 'TBD' ? (
              <div className="rounded-3xl border border-[#E6D9C8] bg-white/50 p-6 shadow-sm">
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#8C7A6B]">Dimensions</p>
                <p className="mt-2 text-sm font-medium text-[#2B2119]">{product.dimensions}</p>
              </div>
            ) : null}
            <div className="rounded-3xl border border-[#E6D9C8] bg-white/50 p-6 shadow-sm">
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#8C7A6B]">Materials</p>
              <p className="mt-2 text-sm font-medium text-[#2B2119]">{displayMaterials}</p>
            </div>
            <div className="rounded-3xl border border-[#E6D9C8] bg-white/50 p-6 shadow-sm">
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#8C7A6B]">Finishes</p>
              <p className="mt-2 text-sm font-medium text-[#2B2119]">{displayFinishes}</p>
            </div>
            <div className="hidden rounded-3xl border border-[#E6D9C8] bg-white/50 p-6 shadow-sm">
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#8C7A6B]">Color</p>
              <p className="mt-2 text-sm font-medium text-[#2B2119]">
                {selectedColorName}
                {displayVariant?.name ? <span className="text-[#8C7A6B]"> - {displayVariant.name}</span> : null}
              </p>
            </div>
            <div className="rounded-3xl border border-[#E6D9C8] bg-white/50 p-6 shadow-sm">
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#8C7A6B]">Availability</p>
              <p className="mt-2 text-sm font-medium text-[#2B2119]">{displayStockStatus === 'preorder' ? 'Preorder' : 'Available to order'}</p>
            </div>
          </div>
        </div>
      </div>

      <RelatedProducts productId={product.id} category={product.category} />

      <section className="space-y-10 pt-16 border-t border-[#E6D9C8]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <h2 className="font-display text-4xl text-[#2B2119]">Collector Reviews</h2>
            <p className="text-sm text-[#6B594A]">A more refined read on comfort, finish, and presence in real spaces.</p>
          </div>
          <button 
            onClick={() => {
              if (myReview) {
                setEditingReviewId(myReview.id)
                setNewReview({ rating: myReview.rating, message: myReview.message })
              } else {
                setEditingReviewId(null)
                setNewReview({ rating: 5, message: '' })
              }
              setIsAddingReview(!isAddingReview)
            }}
            className="rounded-full border-2 border-[#7C4E2F] px-8 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#7C4E2F] hover:bg-[#7C4E2F] hover:text-white transition-all shadow-sm"
          >
            {isAddingReview ? 'Cancel' : myReview ? 'Edit your note' : 'Write a note'}
          </button>
        </div>

        {isAddingReview && (
          <form onSubmit={submitReview} className="space-y-6 rounded-[32px] border-2 border-[#7C4E2F]/10 bg-[#F4EEE4] p-8 shadow-inner arkwood-reveal">
            <div className="space-y-3">
              <label className="text-[10px] uppercase tracking-[0.2em] text-[#8C7A6B]">Experience rating</label>
              <div className="flex gap-3">
                {[1, 2, 3, 4, 5].map((num) => (
                  <button 
                    key={num} 
                    type="button"
                    onClick={() => setNewReview({ ...newReview, rating: num })}
                    className={`transition-transform hover:scale-125 ${newReview.rating >= num ? 'text-[#7C4E2F]' : 'text-[#D8C7B3]'}`}
                  >
                    <StarIcon variant={newReview.rating >= num ? 'full' : 'empty'} size="lg" />
                  </button>
                ))}
              </div>
            </div>
            <textarea
              placeholder="Share your thoughts on the texture, comfort, or how it sits in your space..."
              value={newReview.message}
              onChange={(e) => setNewReview({ ...newReview, message: e.target.value })}
              className="h-32 w-full rounded-2xl border border-[#E6D9C8] bg-white p-5 text-sm ring-inset focus:ring-2 focus:ring-[#7C4E2F] focus:outline-none transition-all"
              required
            />
            <button 
              type="submit"
              className="rounded-full bg-[#7C4E2F] px-10 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white shadow-[0_10px_30px_-10px_rgba(124,78,47,0.5)] hover:shadow-lg transition-all active:scale-[0.97]"
            >
              {editingReviewId ? 'Update community note' : 'Post community note'}
            </button>
          </form>
        )}

        <div className="grid gap-8">
          {reviews.length > 0 ? (
            reviews.map((review, i) => (
              <div key={review.id || i} className="group relative space-y-5 rounded-[32px] border border-[#E6D9C8] bg-[linear-gradient(180deg,#fffdfa,#ffffff)] p-8 shadow-[0_24px_60px_-45px_rgba(55,32,15,0.45)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_30px_70px_-40px_rgba(55,32,15,0.5)]">
                <div className="flex items-center justify-between">
                  <div className="flex gap-0.5 rounded-full border border-[#E6D9C8] bg-[#F9F5EF] px-3 py-2">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <StarIcon key={idx} variant={review.rating > idx ? 'full' : 'empty'} />
                    ))}
                  </div>
                  <span className="text-[10px] text-[#8C7A6B] uppercase tracking-[0.2em] font-medium">
                    {new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
                <p className="text-lg italic leading-relaxed text-[#2B2119] font-medium">&ldquo;{review.message}&rdquo;</p>
                <div className="flex items-center gap-3 pt-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F4EEE4] text-[10px] font-bold text-[#7C4E2F] ring-1 ring-[#7C4E2F]/10 shadow-inner">
                    {review.customer?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#2B2119] uppercase tracking-[0.1em]">{review.customer}</span>
                    <p className="text-[9px] uppercase tracking-[0.1em] text-[#8C7A6B]">Verified Curator</p>
                  </div>
                </div>
                {review.userId === currentUserId ? (
                  <div className="flex flex-wrap gap-4 border-t border-[#F4EEE4] pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingReviewId(review.id)
                        setNewReview({ rating: review.rating, message: review.message })
                        setIsAddingReview(true)
                      }}
                      className="text-[10px] font-bold uppercase tracking-widest text-[#7C4E2F]"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteReview(review.id)}
                      className="text-[10px] font-bold uppercase tracking-widest text-red-600"
                    >
                      Delete
                    </button>
                  </div>
                ) : null}
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center rounded-[32px] border-2 border-dashed border-[#E6D9C8] py-20 text-center">
              <div className="h-12 w-12 rounded-full bg-[#F4EEE4] flex items-center justify-center mb-4">
                <StarIcon variant="empty" size="lg" />
              </div>
              <p className="text-sm font-medium text-[#8C7A6B] max-w-xs">No community notes yet. Share your experience to help others decide.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

