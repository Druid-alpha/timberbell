'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import SectionHeading from '@/app/_components/SectionHeading'
import Breadcrumb from '@/app/_components/Breadcrumb'
import { getCategoryCopy, getCategoryImage } from '@/lib/constants/category-display'

type Category = {
  id: string
  slug: string
  name: string
  description?: string
  tone?: string
}

export default function CollectionsPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    async function load() {
      setLoading(true)
      const res = await fetch('/api/categories')
      const json = await res.json().catch(() => ({}))
      if (!active) return
      setCategories(json.categories ?? [])
      setLoading(false)
    }
    load()
    return () => {
      active = false
    }
  }, [])

  return (
    <div className="mx-auto max-w-7xl space-y-12 px-6 py-16">
      <div className="flex flex-col gap-6">
        <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Collections' }]} />
        <SectionHeading
          eyebrow="Curated"
          title="Our Collections"
          description="Explore our thoughtfully designed categories to find pieces that elevate your space."
        />
      </div>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-[18.5rem] w-full animate-pulse rounded-[32px] bg-[#E6D9C8]/40 sm:h-64 sm:rounded-[40px]" />
          ))}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/collections/${category.slug}`}
              className="group relative flex h-[18.5rem] flex-col justify-end overflow-hidden rounded-[32px] border border-[#E6D9C8] bg-white p-6 transition hover:-translate-y-1 hover:shadow-xl sm:h-64 sm:rounded-[40px] sm:p-8"
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{ backgroundImage: `url(${getCategoryImage(category.slug)})` }}
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(22,16,12,0.15)_0%,rgba(22,16,12,0.7)_100%)]" />
              <div className="relative z-10 flex h-full flex-col justify-between">
                <div>
                  <div className="text-[9px] font-bold uppercase tracking-[0.3em] text-white/70 transition-colors group-hover:text-white">
                    {category.name}
                  </div>
                  <div className="mt-2 max-w-[14rem] font-display text-[1.45rem] leading-tight text-[#F9F3EA] sm:text-[1.75rem]">
                    {getCategoryCopy(category.slug, category.description || `Explore our ${category.name.toLowerCase()} collection.`)}
                  </div>
                </div>
                <div className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#F5E6D2]">
                  Explore Collection &rarr;
                </div>
              </div>
              <div className="absolute -right-4 -bottom-4 h-32 w-32 rounded-full bg-white/20 blur-md transition-transform group-hover:scale-150" />
            </Link>
          ))}
        </div>
      )}
      
      {!loading && categories.length === 0 ? (
        <div className="rounded-[32px] border border-[#E6D9C8] bg-[#F4EEE4] p-12 text-center text-sm text-[#6B594A] shadow-sm sm:rounded-[40px]">
           No collections found.
        </div>
      ) : null}
    </div>
  )
}
