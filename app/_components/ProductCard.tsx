'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import type { Product } from '@/types/catalog'
import { formatMoney } from '@/lib/utils/format'
import { getOptimizedImageUrl } from '@/lib/utils/image'
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
  const palette = (product.palette?.filter(Boolean).slice(0, 4) ?? []).length
    ? (product.palette?.filter(Boolean).slice(0, 4) as string[])
    : ['#f4e7d2', '#eab38b', '#c59a6b']
  const [hoveredVariantId, setHoveredVariantId] = useState<string | null>(null)
  const [isCardHovered, setIsCardHovered] = useState(false)
  let price = product.price

  if (product.discountValue) {
    if (product.discountType === 'percentage') {
      price = product.price * (1 - product.discountValue / 100)
    } else if (product.discountType === 'fixed') {
      price = Math.max(0, product.price - product.discountValue)
    }
  }

  if (product.finalPrice !== undefined) {
    price = product.finalPrice
  }

  const discountPercent = product.price > price ? Math.round(((product.price - price) / product.price) * 100) : null
  const variants = useMemo(() => product.variants ?? [], [product.variants])
  const hoveredVariant = useMemo(
    () => variants.find((entry) => entry.id === hoveredVariantId) ?? null,
    [hoveredVariantId, variants]
  )
  const previewVariant = hoveredVariant ?? (isCardHovered ? variants.find((entry) => entry.image?.url) ?? variants[0] ?? null : null)
  const fallbackVariantImage = variants.find((entry) => entry.image?.url)?.image?.url
  const primaryImage = getOptimizedImageUrl(previewVariant?.image?.url || product.images?.[0]?.url || fallbackVariantImage)
  const secondaryImage = previewVariant
    ? getOptimizedImageUrl(previewVariant.image?.url || product.images?.[1]?.url || fallbackVariantImage)
    : getOptimizedImageUrl(product.images?.[1]?.url || fallbackVariantImage)
  const visiblePalette = palette.slice(0, 3)
  const extraPaletteCount = Math.max(0, palette.length - visiblePalette.length)

  if (variant === 'list') {
    return (
      <article className="group mx-auto flex w-full max-w-full flex-col gap-4 rounded-[30px] border border-[#E6D9C8] bg-[linear-gradient(180deg,#fffdf9,#f4eee4)] p-4 transition sm:flex-row sm:items-center shadow-[0_18px_45px_-38px_rgba(55,32,15,0.55)] hover:-translate-y-0.5 hover:shadow-[0_24px_55px_-34px_rgba(55,32,15,0.55)]">
        <Link
          href={`/products/${product.id}`}
          className="relative h-36 w-full shrink-0 overflow-hidden rounded-[24px] sm:h-40 sm:w-44"
        >
          {primaryImage ? (
            <img src={primaryImage} alt={product.name} className="h-full w-full object-cover" />
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
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-[0.3em] text-[#8C7A6B]">
                {product.category}
              </p>
              <h3 className="font-display text-[1.35rem] leading-snug text-[#2B2119] break-words">
                <Link href={`/products/${product.id}`}>{product.name}</Link>
              </h3>
            </div>
            <div className="text-left md:text-right md:whitespace-nowrap">
              <div className="font-display text-xl text-[#2B2119]">{formatMoney(price)}</div>
            </div>
          </div>
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <div className="flex min-w-0 flex-wrap items-center gap-1.5">
              {visiblePalette.map((color, index) => (
                <span
                  key={`${product.id}-list-${index}`}
                  className="h-4 w-4 shrink-0 rounded-full border border-black/10"
                  style={{ backgroundColor: color }}
                />
              ))}
              {extraPaletteCount ? (
                <span className="inline-flex h-4 min-w-4 shrink-0 items-center justify-center rounded-full border border-[#D8C7B3] bg-white px-1 text-[8px] font-bold text-[#7C4E2F]">
                  +{extraPaletteCount}
                </span>
              ) : null}
            </div>
            {variants.length ? (
              <span className="min-w-0 truncate text-[10px] uppercase tracking-[0.18em] text-[#8C7A6B]">
                {variants.length} variants
              </span>
            ) : null}
          </div>
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-1.5">
              <span className="flex items-center gap-0.5">{renderStars(product.rating)}</span>
              <span className="text-[10px] text-[#8C7A6B]">({product.reviewCount || 0})</span>
            </div>
            <div className="flex items-center gap-3">
              <WishlistButton productId={product.id} />
              <Link
                href={`/products/${product.id}`}
                className="rounded-full border border-[#E6D9C8] px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#7C4E2F] transition hover:border-[#7C4E2F] hover:bg-white"
              >
                View Piece
              </Link>
            </div>
          </div>
        </div>
      </article>
    )
  }

  return (
    <article
      className="group mx-auto flex h-full w-full min-w-0 max-w-full flex-col overflow-hidden rounded-[28px] border border-[#E6D9C8] bg-[linear-gradient(180deg,#fffdf9,#f4eee4)] shadow-[0_18px_38px_-28px_rgba(55,32,15,0.4)] transition hover:-translate-y-1 hover:shadow-[0_30px_60px_-34px_rgba(55,32,15,0.5)] arkwood-reveal"
      onMouseEnter={() => setIsCardHovered(true)}
      onMouseLeave={() => {
        setIsCardHovered(false)
        setHoveredVariantId(null)
      }}
    >
      <Link href={`/products/${product.id}`} className="relative block h-52 w-full overflow-hidden sm:h-56 md:h-64">
        {primaryImage ? (
          <>
            <img
              src={primaryImage}
              alt={product.name}
              className={`h-full w-full object-cover transition duration-700 ${secondaryImage && secondaryImage !== primaryImage ? 'group-hover:opacity-0' : 'group-hover:scale-105'}`}
            />
            {secondaryImage && secondaryImage !== primaryImage && (
              <img
                src={secondaryImage}
                alt={product.name}
                className="absolute inset-0 h-full w-full object-cover opacity-0 transition duration-700 group-hover:opacity-100 group-hover:scale-105"
              />
            )}
          </>
        ) : (
          <div
            className="absolute inset-0 transition-transform duration-700 group-hover:scale-105"
            style={{
              backgroundImage: `linear-gradient(135deg, ${palette[0]}, ${palette[1]}, ${palette[2]})`,
            }}
          />
        )}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.3),transparent_60%)] pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-[linear-gradient(180deg,transparent,rgba(28,18,12,0.55))] pointer-events-none" />

        <div className="absolute left-3 top-3 flex flex-col gap-1.5 sm:left-4 sm:top-4">
          {product.badge ? (
            <span className="rounded-full bg-[#2B2119] px-2.5 py-1 text-[9px] uppercase tracking-[0.22em] text-white">
              {product.badge}
            </span>
          ) : null}
          {discountPercent ? (
            <span className="rounded-full bg-[#7C4E2F] px-2.5 py-1 text-[9px] uppercase tracking-[0.22em] text-white">
              {discountPercent}% OFF
            </span>
          ) : null}
        </div>

        <div className="absolute right-3 top-3 z-10 sm:right-4 sm:top-4">
          <WishlistButton productId={product.id} />
        </div>

        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity pointer-events-none group-hover:opacity-100">
          <div className="image-glass rounded-full px-5 py-2 text-[9px] font-bold uppercase tracking-[0.24em] text-[#5B371F] pointer-events-auto">
            View Piece
          </div>
        </div>

        {previewVariant?.name ? (
          <div className="pointer-events-none absolute inset-x-3 bottom-3 opacity-0 transition group-hover:opacity-100">
            <div className="image-glass inline-flex max-w-full items-center gap-2 rounded-full px-3 py-1.5 text-[8px] uppercase tracking-[0.18em] text-[#4C3628]">
              {previewVariant.color ? (
                <span
                  className="h-2.5 w-2.5 rounded-full border border-[#E6D9C8]"
                  style={{ backgroundColor: previewVariant.color }}
                />
              ) : null}
              <span className="truncate">{previewVariant.name}</span>
            </div>
          </div>
        ) : null}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col gap-3 px-4 pb-4 pt-3.5 sm:px-4.5">
        <div className="space-y-2.5">
          <div className="min-w-0">
            <p className="mb-1 truncate text-[8px] font-semibold uppercase tracking-[0.18em] text-[#8C7A6B] sm:text-[9px] sm:tracking-[0.22em]">
              {product.category}
            </p>
            <h3 className="line-clamp-2 min-h-[2.6rem] break-words font-display text-[1.2rem] leading-snug text-[#2B2119] sm:text-[1.3rem]">
              <Link href={`/products/${product.id}`} className="hover:text-[#7C4E2F] transition-colors">
                {product.name}
              </Link>
            </h3>
          </div>
          <div className="flex items-end justify-between gap-2.5">
            <div className="min-w-0">
              <p className="text-[8px] font-semibold uppercase tracking-[0.14em] text-[#8C7A6B]">Price</p>
              <div className="truncate font-display text-[1.2rem] text-[#2B2119] sm:text-[1.35rem]">{formatMoney(price)}</div>
            </div>
            {product.price > price ? (
              <div className="shrink-0 text-right">
                <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-[#8C7A6B]">Was</p>
                <p className="text-[11px] text-[#8C7A6B] line-through">{formatMoney(product.price)}</p>
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex min-w-0 items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-1.5 overflow-hidden">
            {visiblePalette.map((color, index) => (
              <span
                key={`${product.id}-grid-${index}`}
                className="h-3 w-3 shrink-0 rounded-full border border-black/10"
                style={{ backgroundColor: color }}
              />
            ))}
            {extraPaletteCount ? (
              <span className="inline-flex h-4 min-w-4 shrink-0 items-center justify-center rounded-full border border-[#D8C7B3] bg-white px-1 text-[7px] font-bold text-[#7C4E2F]">
                +{extraPaletteCount}
              </span>
            ) : null}
          </div>
          {variants.length ? (
            <span className="shrink-0 text-[8px] font-semibold uppercase tracking-[0.14em] text-[#8C7A6B]">
              {variants.length} options
            </span>
          ) : null}
        </div>

        <div className="mt-auto flex min-w-0 items-center justify-between gap-2 border-t border-[#E6D9C8]/60 pt-3">
          <div className="flex min-w-0 items-center gap-1.5 overflow-hidden">
            <span className="flex shrink-0 items-center gap-0.5">{renderStars(product.rating)}</span>
            <span className="truncate text-[9px] text-[#8C7A6B]">({product.reviewCount || 0})</span>
          </div>
          <Link
            href={`/products/${product.id}`}
            className="inline-flex shrink-0 items-center gap-1.5 text-[8px] font-bold uppercase tracking-[0.14em] text-[#7C4E2F] transition hover:text-[#2B2119] sm:gap-2 sm:text-[9px] sm:tracking-[0.18em]"
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
