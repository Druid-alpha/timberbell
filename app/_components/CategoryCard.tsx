import Link from 'next/link'
import type { Category } from '@/types/catalog'

export default function CategoryCard({ category }: { category: Category }) {
  return (
    <Link
      href={`/collections/${category.slug}`}
      className="group relative overflow-hidden rounded-3xl border border-white/60 bg-white/70 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
    >
      <div
        className={`absolute inset-0 bg-gradient-to-br ${category.tone} opacity-80 transition group-hover:opacity-100`}
      />
      <div className="relative flex flex-col gap-3">
        <span className="text-xs uppercase tracking-[0.3em] text-neutral-600">
          Collection
        </span>
        <h3 className="font-display text-2xl text-neutral-900">
          {category.name}
        </h3>
        <p className="text-sm text-neutral-600">{category.description}</p>
        <span className="mt-2 inline-flex items-center text-sm font-semibold text-neutral-900">
          Explore
        </span>
      </div>
    </Link>
  )
}

