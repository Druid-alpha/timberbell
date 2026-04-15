import Link from 'next/link'
import type { Product } from '@/types/catalog'
import { formatMoney } from '@/lib/utils/format'
import WishlistButton from '@/app/_components/WishlistButton'

const StarIcon = ({ variant }: { variant: 'full' | 'half' | 'empty' }) => (
  <svg
    viewBox="0 0 24 24"
    className="h-3.5 w-3.5"
    fill="none"
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="half-star" x1="0" x2="1" y1="0" y2="0">
        <stop offset="50%" stopColor="#7C4E2F" />
        <stop offset="50%" stopColor="#D8C7B3" />
      </linearGradient>
    </defs>
    <path
      d="M12 3.5 14.6 9l6 .9-4.3 4.2 1 5.9-5.3-2.8-5.3 2.8 1-5.9L3.4 9.9 9.4 9 12 3.5Z"
      fill={
        variant === 'full' ? '#7C4E2F' : variant === 'half' ? 'url(#half-star)' : '#D8C7B3'
      }
    />
  </svg>
)

const renderStars = (rating?: number) => {
  const safeRating = Math.round((rating ?? 0) * 2) / 2
  return Array.from({ length: 5 }).map((_, index) => {
    const starNumber = index + 1
    if (safeRating >= starNumber) return <StarIcon key={index} variant="full" />
    if (safeRating + 0.5 === starNumber) return <StarIcon key={index} variant="half" />
    return <StarIcon key={index} variant="empty" />
  })
}

export default function ProductCard({
  product,
  variant = 'grid',
}: {
  product: Product
  variant?: 'grid' | 'list'
}) {
  const palette = product.palette ?? ['#f4e7d2', '#eab38b', '#c59a6b']
  // Final price logic if discount exists
  let price = product.price
  let compareAt = product.compareAt

  // Calculate discount dynamically if discountValue exists
  if (product.discountValue) {
    if (!compareAt) compareAt = product.price
    if (product.discountType === 'percentage') {
      price = product.price * (1 - product.discountValue / 100)
    } else if (product.discountType === 'fixed') {
      price = Math.max(0, product.price - product.discountValue)
    }
  }

  // Use the pre-computed finalPrice if provided by backend
  if (product.finalPrice !== undefined) {
    price = product.finalPrice
    if (!compareAt && product.price > product.finalPrice) {
      compareAt = product.price
    }
  }

  const discountPercent = compareAt ? Math.round(((compareAt - price) / compareAt) * 100) : null
  const variants = product.variants ?? []

  if (variant === 'list') {
    return (
      <article className="group flex flex-col gap-6 rounded-[28px] border border-[#E6D9C8] bg-[#F4EEE4] p-4 transition sm:flex-row sm:items-center shadow-sm hover:shadow-md">
        <Link
          href={`/products/${product.id}`}
          className="relative h-40 w-full shrink-0 overflow-hidden rounded-2xl sm:w-48"
        >
          {product.images?.[0]?.url ? (
            <img src={product.images[0].url} alt={product.name} className="h-full w-full object-cover" />
          ) : (
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `linear-gradient(135deg, ${palette[0]}, ${palette[1]}, ${palette[2]})`,
              }}
            />
          )}
          {discountPercent ? (
            <span className="absolute left-2 top-2 rounded-full bg-[#7C4E2F] px-2 py-0.5 text-[8px] uppercase tracking-[0.25em] text-white">
              {discountPercent}%
            </span>
          ) : null}
        </Link>
        <div className="flex-1 space-y-2">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-[#8C7A6B]">
                {product.category}
              </p>
              <h3 className="text-lg font-semibold text-[#2B2119]">
                <Link href={`/products/${product.id}`}>{product.name}</Link>
              </h3>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-[#2B2119]">{formatMoney(price)}</div>
              {compareAt && compareAt > price && (
                <div className="text-[10px] text-[#8C7A6B] line-through">
                  {formatMoney(compareAt)}
                </div>
              )}
            </div>
          </div>
          <p className="line-clamp-2 text-xs leading-relaxed text-[#6B594A]">
            {product.description}
          </p>
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-1.5">
              <span className="flex items-center gap-0.5">{renderStars(product.rating)}</span>
              <span className="text-[10px] text-[#8C7A6B]">({product.reviewCount || 0})</span>
            </div>
            <div className="flex items-center gap-3">
              <WishlistButton productId={product.id} />
              <Link
                href={`/products/${product.id}`}
                className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7C4E2F]"
              >
                View
              </Link>
            </div>
          </div>
        </div>
      </article>
    )
  }

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[28px] border border-[#E6D9C8] bg-[#F4EEE4] shadow-[0_18px_40px_-30px_rgba(55,32,15,0.45)] transition hover:-translate-y-1 hover:shadow-[0_28px_60px_-40px_rgba(55,32,15,0.55)] arkwood-reveal">
      <Link href={`/products/${product.id}`} className="relative h-64 w-full overflow-hidden block">
        {product.images?.[0]?.url ? (
          <img
            src={product.images[0].url}
            alt={product.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `linear-gradient(135deg, ${palette[0]}, ${palette[1]}, ${palette[2]})`,
            }}
          />
        )}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.3),transparent_60%)] pointer-events-none" />
        
        {/* Badges */}
        <div className="absolute left-4 top-4 flex flex-col gap-2">
          {product.badge ? (
            <span className="rounded-full bg-[#2B2119] px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-white">
              {product.badge}
            </span>
          ) : null}
          {discountPercent ? (
            <span className="rounded-full bg-[#7C4E2F] px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-white">
              {discountPercent}% OFF
            </span>
          ) : null}
        </div>

        <div className="absolute right-4 top-4 z-10">
          <WishlistButton productId={product.id} />
        </div>

        {/* Quick View Button Hover overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <div className="rounded-full bg-white/90 px-6 py-2 text-[10px] font-bold uppercase tracking-[0.3em] text-[#7C4E2F] shadow-lg backdrop-blur-sm pointer-events-auto">
            Quick View
          </div>
        </div>
        
        {variants.length > 0 ? (
          <div className="absolute inset-x-3 bottom-3 hidden gap-2 rounded-2xl bg-white/90 p-2 backdrop-blur-sm transition group-hover:flex">
            {variants.slice(0, 4).map((variant) => (
              <div
                key={variant.id}
                className="flex items-center gap-1.5 rounded-full border border-[#E6D9C8] bg-white px-2 py-1 text-[9px] uppercase tracking-[0.25em] text-[#6B594A]"
              >
                <span
                  className="h-2.5 w-2.5 rounded-full border border-[#E6D9C8]"
                  style={{ backgroundColor: variant.color || '#E4DDCF' }}
                />
                {variant.name}
              </div>
            ))}
            {variants.length > 4 ? (
              <span className="rounded-full border border-[#E6D9C8] bg-white px-2 py-1 text-[9px] uppercase tracking-[0.25em] text-[#6B594A]">
                +{variants.length - 4}
              </span>
            ) : null}
          </div>
        ) : null}
      </Link>
      
      <div className="flex flex-1 flex-col gap-4 px-5 pb-5 pt-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-[#2B2119] line-clamp-1">
              <Link href={`/products/${product.id}`} className="hover:text-[#7C4E2F] transition-colors">
                {product.name}
              </Link>
            </h3>
            <p className="mt-1 text-[10px] uppercase tracking-[0.3em] text-[#8C7A6B]">
              {product.category}
            </p>
          </div>
          <div className="text-right whitespace-nowrap">
            <div className="text-base font-bold text-[#2B2119]">{formatMoney(price)}</div>
            {compareAt && compareAt > price ? (
              <div className="text-xs text-[#8C7A6B] line-through mt-0.5">{formatMoney(compareAt)}</div>
            ) : null}
          </div>
        </div>
        
        <div className="mt-auto pt-2 flex items-center justify-between border-t border-[#E6D9C8]/50">
          <div className="flex items-center gap-1.5">
            <span className="flex items-center gap-0.5">{renderStars(product.rating)}</span>
            <span className="text-[10px] text-[#8C7A6B]">({product.reviewCount || 0})</span>
          </div>
          <Link
            href={`/products/${product.id}`}
            className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#7C4E2F] transition hover:text-[#2B2119]"
          >
            Details
            <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </div>
    </article>
  )
}
