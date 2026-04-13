import Link from 'next/link'
import type { Product } from '@/types/catalog'
import { formatMoney } from '@/lib/utils/format'
import WishlistButton from '@/app/_components/WishlistButton'

const ratingLabel = (rating: number | undefined) => `${(rating ?? 0).toFixed(1)} / 5`
const renderStars = (rating?: number) => {
  const safeRating = Math.round(rating ?? 0)
  return Array.from({ length: 5 }).map((_, index) => (
    <span key={index} className={index < safeRating ? 'text-[#7C4E2F]' : 'text-[#D8C7B3]'}>
      ★
    </span>
  ))
}

export default function ProductCard({ product }: { product: Product }) {
  const palette = product.palette ?? ['#f4e7d2', '#eab38b', '#c59a6b']
  const price = product.finalPrice ?? product.price
  const compareAt = product.compareAt ?? (product.finalPrice ? product.price : undefined)
  const variants = product.variants ?? []

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[28px] border border-[#E6D9C8] bg-[#F4EEE4] shadow-[0_18px_40px_-30px_rgba(55,32,15,0.45)] transition hover:-translate-y-1 hover:shadow-[0_28px_60px_-40px_rgba(55,32,15,0.55)] arkwood-reveal">
      <div className="relative h-56 w-full overflow-hidden">
        {product.images?.[0]?.url ? (
          <img
            src={product.images[0].url}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `linear-gradient(135deg, ${palette[0]}, ${palette[1]}, ${palette[2]})`,
            }}
          />
        )}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.6),transparent_60%)]" />
        {product.badge ? (
          <span className="absolute left-4 top-4 rounded-full bg-[#7C4E2F] px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-white">
            {product.badge}
          </span>
        ) : null}
        <span className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-[#7C4E2F]">
          {formatMoney(price)}
        </span>
        <div className="absolute left-4 bottom-4 flex items-center gap-2 rounded-full bg-white/90 px-3 py-2 text-[9px] uppercase tracking-[0.3em] text-[#7C4E2F]">
          <span className="h-2.5 w-2.5 rounded-full bg-[#7C4E2F]" />
          Arkwood
        </div>
        {variants.length ? (
          <div className="absolute inset-x-3 bottom-3 hidden gap-2 rounded-2xl bg-white/90 p-2 backdrop-blur-sm transition group-hover:flex">
            {variants.slice(0, 4).map((variant) => (
              <div
                key={variant.id}
                className="flex items-center gap-2 rounded-full border border-[#E6D9C8] bg-white px-2 py-1 text-[9px] uppercase tracking-[0.25em] text-[#6B594A]"
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
      </div>
      <div className="flex flex-1 flex-col gap-4 px-5 pb-5 pt-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-[#2B2119]">{product.name}</h3>
            <p className="text-[10px] uppercase tracking-[0.3em] text-[#8C7A6B]">
              {product.category}
            </p>
          </div>
          <div className="text-right">
            <div className="text-lg font-semibold text-[#2B2119]">{formatMoney(price)}</div>
            {compareAt ? (
              <div className="text-xs text-[#8C7A6B] line-through">{formatMoney(compareAt)}</div>
            ) : null}
          </div>
        </div>
        <p className="text-sm text-[#6B594A] line-clamp-2">{product.description}</p>
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-[#8C7A6B]">
          <span className="rounded-full border border-[#E6D9C8] px-2 py-1">Premium</span>
          <span className="rounded-full border border-[#E6D9C8] px-2 py-1">Organic</span>
        </div>
        <div className="mt-auto flex items-center justify-between text-xs text-[#8C7A6B]">
          <span className="flex items-center gap-1">{renderStars(product.rating)}</span>
          <span>{product.leadTime ?? 'TBD'}</span>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Link
            href={`/products/${product.id}`}
            className="inline-flex items-center justify-center rounded-full border border-[#7C4E2F] px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#7C4E2F] transition hover:bg-[#7C4E2F] hover:text-white"
          >
            View details
          </Link>
          <WishlistButton productId={product.id} />
        </div>
      </div>
    </article>
  )
}
