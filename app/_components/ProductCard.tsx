import Link from 'next/link'
import type { Product } from '@/types/catalog'
import { formatMoney } from '@/lib/utils/format'
import WishlistButton from '@/app/_components/WishlistButton'

const ratingLabel = (rating: number | undefined) => `${(rating ?? 0).toFixed(1)} / 5`

export default function ProductCard({ product }: { product: Product }) {
  const palette = product.palette ?? ['#f4e7d2', '#eab38b', '#c59a6b']
  const price = product.finalPrice ?? product.price
  const compareAt = product.compareAt ?? (product.finalPrice ? product.price : undefined)
  const variants = product.variants ?? []

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[28px] border border-[#E4DDCF] bg-[#FCFAF6] shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <div
        className="relative h-44 w-full overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(135deg, ${palette[0]}, ${palette[1]}, ${palette[2]})`,
        }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.55),transparent_60%)]" />
        {product.badge ? (
          <span className="absolute left-4 top-4 rounded-full bg-[#2A3320] px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-white">
            {product.badge}
          </span>
        ) : null}
        {variants.length ? (
          <div className="absolute inset-x-3 bottom-3 hidden gap-2 rounded-2xl bg-white/90 p-2 backdrop-blur-sm transition group-hover:flex">
            {variants.slice(0, 4).map((variant) => (
              <div
                key={variant.id}
                className="flex items-center gap-2 rounded-full border border-[#E4DDCF] bg-white px-2 py-1 text-[9px] uppercase tracking-[0.25em] text-[#6B665A]"
              >
                <span
                  className="h-2.5 w-2.5 rounded-full border border-[#E4DDCF]"
                  style={{ backgroundColor: variant.color || '#E4DDCF' }}
                />
                {variant.name}
              </div>
            ))}
            {variants.length > 4 ? (
              <span className="rounded-full border border-[#E4DDCF] bg-white px-2 py-1 text-[9px] uppercase tracking-[0.25em] text-[#6B665A]">
                +{variants.length - 4}
              </span>
            ) : null}
          </div>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-4 px-5 pb-5 pt-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-[#2A3320]">{product.name}</h3>
            <p className="text-[10px] uppercase tracking-[0.3em] text-[#8A836F]">
              {product.category}
            </p>
          </div>
          <div className="text-right">
            <div className="text-lg font-semibold text-[#2A3320]">{formatMoney(price)}</div>
            {compareAt ? (
              <div className="text-xs text-[#8A836F] line-through">{formatMoney(compareAt)}</div>
            ) : null}
          </div>
        </div>
        <p className="text-sm text-[#6B665A] line-clamp-2">{product.description}</p>
        <div className="mt-auto flex items-center justify-between text-xs text-[#8A836F]">
          <span>{ratingLabel(product.rating)}</span>
          <span>{product.leadTime ?? 'TBD'}</span>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Link
            href={`/products/${product.id}`}
            className="inline-flex items-center justify-center rounded-full border border-[#2A3320] px-4 py-2 text-xs font-bold uppercase tracking-[0.25em] text-[#2A3320] transition hover:bg-[#2A3320] hover:text-white"
          >
            View details
          </Link>
          <WishlistButton productId={product.id} />
        </div>
      </div>
    </article>
  )
}
