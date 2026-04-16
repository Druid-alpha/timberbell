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

type ProductReview = {
  id: string
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
  const [activeVariantId, setActiveVariantId] = useState<string | null>(null)
  const [variantPrice, setVariantPrice] = useState<number | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [reviews, setReviews] = useState<ProductReview[]>([])
  const [isAddingReview, setIsAddingReview] = useState(false)
  const [newReview, setNewReview] = useState({ rating: 5, message: '' })

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
            imageUrl: data.images?.[0]?.url
          }
          const filtered = viewed.filter((item: any) => item.id !== data.id)
          localStorage.setItem('recentlyViewed', JSON.stringify([newItem, ...filtered].slice(0, 10)))
        }
      }
    }

    async function loadReviews() {
      const res = await fetch(`/api/reviews?productId=${params.id}`)
      const data = await res.json()
      if (active && res.ok) setReviews(data.reviews)
    }

    load()
    loadReviews()
    return () => { active = false }
  }, [params?.id])

  useEffect(() => {
    if (!product) return
    const firstVariantImage = product.variants?.find((variant: any) => variant.image?.url)?.image?.url
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

  const handleAddToCart = async () => {
    if (!product) return
    setStatus('Adding to cart...')
    
    const finalPrice = variantPrice ?? product.finalPrice ?? product.price
    
    const res = await fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: product.id,
        quantity: quantity,
      }),
    })

    if (res.ok) {
      ensureReservationCountdown()
      dispatch(
        addItem({
          productId: product.id,
          quantity: quantity,
          name: product.name,
          price: finalPrice,
          variantName: product.variants?.find((v: any) => v.id === activeVariantId)?.name,
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
    const res = await fetch('/api/reviews', {
      method: 'POST',
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
      if (refreshReviews.ok) setReviews(newData.reviews)
      setNewReview({ rating: 5, message: '' })
      setIsAddingReview(false)
    } else if (res.status === 401) {
      setStatus('Please sign in to leave a review.')
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

  const images = product.images?.length ? product.images.map((img: any) => img.url) : []
  const fallbackPalette = product.palette ?? ['#f4e7d2', '#eab38b', '#c59a6b']
  const price = variantPrice ?? product.finalPrice ?? product.price
  const compareAt = product.compareAt ?? (product.finalPrice ? product.price : undefined)

  return (
    <div className="mx-auto max-w-6xl space-y-12 px-6 py-16">
      <div className="flex flex-col gap-6">
        <Breadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: (product.category ?? 'Collection').charAt(0).toUpperCase() + (product.category ?? 'Collection').slice(1), href: `/productfilter?category=${product.category}` },
            { label: product.name },
          ]}
        />
        <SectionHeading
          eyebrow="Timberbell Atelier"
          title={product.name}
          description="Refined proportions and honest materials, built for generations."
        />
      </div>

      <div className="grid gap-12 lg:grid-cols-2">
        <div className="space-y-6">
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
            {compareAt && compareAt > price && (
               <div className="absolute left-6 top-6 rounded-full bg-[#7C4E2F] px-4 py-2 text-[10px] uppercase tracking-[0.3em] text-white">
                Save {Math.round(((compareAt - price) / compareAt) * 100)}%
              </div>
            )}
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {images.map((img: string, i: number) => (
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

        <div className="space-y-8 arkwood-stagger">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex">
                  {stars.map((s, i) => (
                    <StarIcon key={i} variant={s as any} />
                  ))}
                </div>
                <span className="text-xs font-semibold text-[#2B2119]">{ratingLabel}</span>
                <span className="text-xs text-[#8C7A6B]">({reviews.length} reviews)</span>
              </div>
              <WishlistButton productId={product.id} />
            </div>

            <div className="flex items-baseline gap-3">
              <span className="font-display text-4xl text-[#7C4E2F]">{formatMoney(price)}</span>
              {compareAt && (
                <span className="text-lg text-[#8C7A6B] line-through">{formatMoney(compareAt)}</span>
              )}
            </div>

            <p className="text-sm leading-relaxed text-[#6B594A]">{product.description}</p>
          </div>

          <div className="space-y-6 rounded-[32px] border border-[#E6D9C8] bg-[#F4EEE4]/50 p-8 shadow-sm">
            {product.variants?.length > 0 && (
              <div className="space-y-3">
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#8C7A6B]">Select configuration</p>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v: any) => (
                    <button
                      key={v.id}
                      onClick={() => {
                        setActiveVariantId(v.id)
                        if (v.image?.url) setActiveImage(v.image.url)
                        if (v.price) setVariantPrice(v.price)
                      }}
                      className={`flex items-center gap-2 rounded-full border px-4 py-2 text-[10px] uppercase tracking-[0.2em] transition-all ${activeVariantId === v.id ? 'border-[#7C4E2F] bg-[#7C4E2F] text-white shadow-md' : 'border-[#E6D9C8] bg-white text-[#6B594A] hover:border-[#7C4E2F]'}`}
                    >
                      <div className="h-3 w-3 rounded-full border border-black/10 shadow-inner" style={{ backgroundColor: v.color || '#D8C7B3' }} />
                      {v.name}
                    </button>
                  ))}
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
                    –
                  </button>
                  <span className="w-8 text-center text-sm font-semibold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="flex h-10 w-10 items-center justify-center rounded-full text-[#7C4E2F] transition hover:bg-[#F4EEE4]"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={handleAddToCart}
                  className="group relative flex-1 overflow-hidden rounded-full bg-[#7C4E2F] px-8 py-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-white shadow-lg transition-all hover:bg-[#5C3A24] active:scale-[0.98]"
                >
                  <span className="relative z-10">Add to bundle</span>
                </button>
              </div>
              
              <div className="flex flex-col gap-3 px-2">
                 <div className="flex items-center gap-2 text-[10px] text-[#6B594A]">
                  <div className={`h-1.5 w-1.5 rounded-full ${(!product.inventoryCount || product.inventoryCount > 5) ? 'bg-green-500' : 'bg-orange-500 animate-pulse'}`} />
                  {(!product.inventoryCount || product.inventoryCount > 5) ? 'In stock and ready to ship' : `Only ${product.inventoryCount} left — items in cart are reserved for 10 min`}
                </div>
                
                {/* Nigeria specific ETAs */}
                <div className="grid grid-cols-2 gap-4 rounded-2xl bg-white/40 p-3 border border-[#E6D9C8]/50">
                    <div className="space-y-0.5">
                        <p className="text-[9px] uppercase tracking-widest text-[#8C7A6B] font-bold">Lagos Delivery</p>
                        <p className="text-[10px] text-[#2B2119]">3 - 5 Business Days</p>
                    </div>
                    <div className="space-y-0.5 border-l border-[#E6D9C8] pl-4">
                        <p className="text-[9px] uppercase tracking-widest text-[#8C7A6B] font-bold">Abuja / PH</p>
                        <p className="text-[10px] text-[#2B2119]">5 - 9 Business Days</p>
                    </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-[#8C7A6B]">
                  <span>Premium White-Glove Care Included</span>
                  <span>Lead time: {product.leadTime || '2-4 weeks'}</span>
                </div>
              </div>
            </div>
            
            {status && (
              <p className="mt-2 text-center text-xs font-medium text-[#7C4E2F]">{status}</p>
            )}
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="rounded-3xl border border-[#E6D9C8] bg-white/50 p-6 shadow-sm">
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#8C7A6B]">Dimensions</p>
              <p className="mt-2 text-sm font-medium text-[#2B2119]">{product.dimensions || 'Standard architectural fit'}</p>
            </div>
            <div className="rounded-3xl border border-[#E6D9C8] bg-white/50 p-6 shadow-sm">
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#8C7A6B]">Materials</p>
              <p className="mt-2 text-sm font-medium text-[#2B2119]">{product.materials?.join(', ') || 'Natural wood & organic fabric'}</p>
            </div>
          </div>
        </div>
      </div>

      <RelatedProducts productId={product.id} category={product.category} />

      <section className="space-y-10 pt-16 border-t border-[#E6D9C8]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <h2 className="font-display text-4xl text-[#2B2119]">Community Notes</h2>
            <p className="text-sm text-[#6B594A]">Honest thoughts from fellow curators.</p>
          </div>
          <button 
            onClick={() => setIsAddingReview(!isAddingReview)}
            className="rounded-full border-2 border-[#7C4E2F] px-8 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#7C4E2F] hover:bg-[#7C4E2F] hover:text-white transition-all shadow-sm"
          >
            {isAddingReview ? 'Cancel' : 'Write a note'}
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
              Post community note
            </button>
          </form>
        )}

        <div className="grid gap-8">
          {reviews.length > 0 ? (
            reviews.map((review, i) => (
              <div key={review.id || i} className="group relative space-y-4 rounded-3xl border border-[#E6D9C8] bg-white p-8 shadow-sm transition-all hover:shadow-md">
                <div className="flex items-center justify-between">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <StarIcon key={idx} variant={review.rating > idx ? 'full' : 'empty'} />
                    ))}
                  </div>
                  <span className="text-[10px] text-[#8C7A6B] uppercase tracking-[0.2em] font-medium">
                    {new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
                <p className="text-base italic leading-relaxed text-[#2B2119] font-medium">"{review.message}"</p>
                <div className="flex items-center gap-3 pt-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F4EEE4] text-[10px] font-bold text-[#7C4E2F] ring-1 ring-[#7C4E2F]/10">
                    {review.customer?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#2B2119] uppercase tracking-[0.1em]">{review.customer}</span>
                    <p className="text-[9px] uppercase tracking-[0.1em] text-[#8C7A6B]">Verified Curator</p>
                  </div>
                </div>
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
