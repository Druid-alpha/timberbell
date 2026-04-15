'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import SectionHeading from '@/app/_components/SectionHeading'
import Breadcrumb from '@/app/_components/Breadcrumb'

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
            <div key={i} className="h-64 w-full animate-pulse rounded-[28px] bg-[#E6D9C8]/40" />
          ))}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/collections/${category.slug}`}
              className="group relative flex h-64 flex-col justify-end overflow-hidden rounded-[28px] border border-[#E6D9C8] transition hover:-translate-y-1 hover:shadow-lg"
              style={{
                backgroundColor: category.tone || '#F4EEE4',
              }}
            >
              {/* Optional: Add background image or pattern based on category here in the future */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="relative z-10 p-8">
                <h3 className="font-display text-2xl text-[#2B2119] transition-colors group-hover:text-white">
                  {category.name}
                </h3>
                <p className="mt-2 text-sm text-[#6B594A] transition-colors group-hover:text-[#E6D9C8] line-clamp-2">
                  {category.description || `Explore our ${category.name.toLowerCase()} collection.`}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
      
      {!loading && categories.length === 0 ? (
        <div className="rounded-[28px] border border-[#E6D9C8] bg-[#F4EEE4] p-12 text-center text-sm text-[#6B594A] shadow-sm">
           No collections found.
        </div>
      ) : null}
    </div>
  )
}
