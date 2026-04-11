import Link from 'next/link'
import type { Product } from '@/types/catalog'
import { formatMoney } from '@/lib/utils/format'

const ratingLabel = (rating: number) => `${rating.toFixed(1)} / 5`

export default function ProductCard({ product }: { product: Product }) {
  const palette = product.palette ?? ['#f4e7d2', '#eab38b', '#c59a6b']

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-neutral-200/80 bg-white/80 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <div
        className="relative h-44 w-full overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(135deg, ${palette[0]}, ${palette[1]}, ${palette[2]})`,
        }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.55),transparent_60%)]" />
        {product.badge ? (
          <span className="absolute left-4 top-4 rounded-full bg-neutral-900/80 px-3 py-1 text-xs uppercase tracking-[0.2em] text-white">
            {product.badge}
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-4 px-5 pb-5 pt-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-neutral-900">
              {product.name}
            </h3>
            <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">
              {product.category}
            </p>
          </div>
          <div className="text-right">
            <div className="text-lg font-semibold text-neutral-900">
              {formatMoney(product.price)}
            </div>
            {product.compareAt ? (
              <div className="text-xs text-neutral-400 line-through">
                {formatMoney(product.compareAt)}
              </div>
            ) : null}
          </div>
        </div>
        <p className="text-sm text-neutral-600 line-clamp-2">
          {product.description}
        </p>
        <div className="mt-auto flex items-center justify-between text-xs text-neutral-500">
          <span>{ratingLabel(product.rating)}</span>
          <span>{product.leadTime}</span>
        </div>
        <Link
          href={`/products/${product.id}`}
          className="mt-2 inline-flex items-center justify-center rounded-full border border-neutral-900 px-4 py-2 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-900 hover:text-white"
        >
          View details
        </Link>
      </div>
    </article>
  )
}

