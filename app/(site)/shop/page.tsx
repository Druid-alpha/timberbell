'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import SectionHeading from '@/app/_components/SectionHeading'

type Category = {
  id: string
  slug: string
  name: string
}

type Product = {
  id: string
  name: string
  price: number
  category: string
  description: string
  palette?: string[]
}

function ShopContent() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''
  const category = searchParams.get('category') || ''

  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  const url = useMemo(() => {
    const params = new URLSearchParams()
    if (query) params.set('q', query)
    if (category) params.set('category', category)
    const qs = params.toString()
    return `/api/products${qs ? `?${qs}` : ''}`
  }, [query, category])

  useEffect(() => {
    let active = true

    async function load() {
      setLoading(true)
      const [catRes, prodRes] = await Promise.all([
        fetch('/api/categories'),
        fetch(url),
      ])

      const catJson = await catRes.json()
      const prodJson = await prodRes.json()

      if (!active) return

      setCategories(catJson.categories ?? [])
      setProducts(prodJson.products ?? [])
      setLoading(false)
    }

    load()

    return () => {
      active = false
    }
  }, [url])

  return (
    <div className="mx-auto max-w-7xl space-y-10 px-6 py-16">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <SectionHeading
          eyebrow="Shop"
          title="Furniture designed for calm, layered homes"
          description="Browse every Timberbell piece, filter by category, or search for the vibe you want to build."
        />
        <div className="flex flex-wrap gap-2">
          <Link
            href="/shop"
            className="rounded-full border border-neutral-900 px-4 py-2 text-xs uppercase tracking-[0.3em] text-neutral-900"
          >
            All
          </Link>
          {categories.map((item) => (
            <Link
              key={item.id}
              href={`/shop?category=${item.slug}`}
              className="rounded-full border border-neutral-200 bg-white/80 px-4 py-2 text-xs uppercase tracking-[0.3em] text-neutral-600 transition hover:border-neutral-900 hover:text-neutral-900"
            >
              {item.name}
            </Link>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-white/70 bg-white/70 p-8 text-center text-sm text-neutral-600">
          Loading products...
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="group flex h-full flex-col overflow-hidden rounded-3xl border border-neutral-200/80 bg-white/80 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div
                className="relative h-44 w-full overflow-hidden"
                style={{
                  backgroundImage: `linear-gradient(135deg, ${product.palette?.[0]}, ${product.palette?.[1]}, ${product.palette?.[2]})`,
                }}
              />
              <div className="flex flex-1 flex-col gap-4 px-5 pb-5 pt-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-900">{product.name}</h3>
                    <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">
                      {product.category}
                    </p>
                  </div>
                  <div className="text-right text-lg font-semibold text-neutral-900">
                    ${product.price.toLocaleString()}
                  </div>
                </div>
                <p className="text-sm text-neutral-600 line-clamp-2">
                  {product.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {!loading && products.length === 0 ? (
        <div className="rounded-3xl border border-white/70 bg-white/70 p-8 text-center text-sm text-neutral-600">
          No products found. Try a different search or browse another collection.
        </div>
      ) : null}
    </div>
  )
}

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-6 py-16 text-sm text-neutral-600">
          Loading shop...
        </div>
      }
    >
      <ShopContent />
    </Suspense>
  )
}
