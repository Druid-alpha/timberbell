import Link from 'next/link'
import type { Category } from '@/types/catalog'

export default function CategoryCard({ category }: { category: Category }) {
  return (
    <Link
      href={`/collections/${category.slug}`}
      className="group relative overflow-hidden rounded-[28px] border border-[#E4DDCF] bg-[#FCFAF6] p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
    >
      <div
        className={`absolute inset-0 bg-gradient-to-br ${category.tone ?? 'from-[#F2EBDD] via-[#F8F3EA] to-white'} opacity-80 transition group-hover:opacity-100`}
      />
      <div className="relative flex flex-col gap-3">
        <span className="text-[10px] uppercase tracking-[0.35em] text-[#8B9A78]">
          Collection
        </span>
        <h3 className="font-display text-2xl text-[#2A3320]">
          {category.name}
        </h3>
        <p className="text-sm text-[#6B665A]">{category.description}</p>
        <span className="mt-2 inline-flex items-center text-sm font-semibold text-[#2A3320]">
          Explore
        </span>
      </div>
    </Link>
  )
}

