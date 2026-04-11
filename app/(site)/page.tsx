'use client'

import { useEffect, useMemo, useState } from 'react'

const highlights = [
  { title: 'Free Shipping', detail: 'Orders over $500' },
  { title: 'Flexible Payment', detail: 'Card or transfer' },
  { title: '24/7 Support', detail: 'Design concierge' },
]

const uiBadges = ['30+ Pages', 'Figma Ready', 'Modern UI Kit']

const categoryTiles = [
  {
    title: 'Chairs',
    detail: 'Lounge, dining, accent',
    tone: 'from-amber-200/80 via-orange-100/70 to-rose-100/70',
  },
  {
    title: 'Sofa',
    detail: 'Modular + sectionals',
    tone: 'from-emerald-100/80 via-teal-100/70 to-lime-50/70',
  },
  {
    title: 'Lighting',
    detail: 'Floor + pendant',
    tone: 'from-indigo-100/80 via-sky-100/70 to-slate-100/70',
  },
]

type Category = {
  id: string
  slug: string
  name: string
  description?: string
  tone?: string
}

type Product = {
  id: string
  name: string
  price: number
  category: string
  description: string
  palette?: string[]
}

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    async function load() {
      try {
        const [categoryRes, productRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/products'),
        ])

        const categoriesJson = await categoryRes.json()
        const productsJson = await productRes.json()

        if (!active) return

        setCategories(categoriesJson.categories ?? [])
        setProducts(productsJson.products ?? [])
      } finally {
        if (active) setLoading(false)
      }
    }

    load()

    return () => {
      active = false
    }
  }, [])

  const featured = useMemo(() => products.slice(0, 8), [products])

  return (
    <div className="space-y-20 pb-24">
      <section className="px-6">
        <div className="mx-auto max-w-7xl">
          <div className="relative overflow-hidden rounded-[2.75rem] bg-emerald-900 px-8 py-12 text-white lg:px-14 lg:py-16">
            <div className="absolute -left-12 -top-12 h-56 w-56 rounded-full bg-emerald-700/60 blur-3xl" />
            <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-emerald-700/50 blur-3xl" />

            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-5 py-2 text-xs uppercase tracking-[0.3em]">
              Furniture Ecommerce Website UIUX Design
            </div>

            <div className="mt-10 grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="space-y-6">
                <h1 className="font-display text-4xl leading-tight sm:text-5xl">
                  Explore our modern furniture collection
                </h1>
                <p className="max-w-xl text-sm text-emerald-100/90 sm:text-base">
                  Build layered rooms with curated seating, sculpted tables, and warm lighting
                  designed for calm, everyday living.
                </p>
                <div className="flex flex-wrap gap-3">
                  <a
                    href="/shop"
                    className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-emerald-900"
                  >
                    Shop now
                  </a>
                  <a
                    href="/contact"
                    className="rounded-full border border-white/40 px-6 py-3 text-sm font-semibold text-white"
                  >
                    View catalog
                  </a>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-xs text-emerald-100/80">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="h-8 w-8 rounded-full border-2 border-emerald-900 bg-white/80"
                      />
                    ))}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">4.9 Rating</div>
                    <div>Trusted by 2,400+ homes</div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {uiBadges.map((badge) => (
                    <span
                      key={badge}
                      className="rounded-full border border-white/30 px-3 py-1 text-[11px] uppercase tracking-[0.3em]"
                    >
                      {badge}
                    </span>
                  ))}
                </div>
              </div>

              <div className="relative">
                <div className="absolute -top-6 right-6 hidden rounded-full bg-white/15 px-4 py-2 text-xs uppercase tracking-[0.3em] lg:block">
                  New arrivals
                </div>
                <div className="rounded-[2.5rem] bg-white/95 p-6 text-emerald-900 shadow-2xl">
                  <div className="space-y-4">
                    <div className="rounded-2xl bg-emerald-50 p-4">
                      <div className="text-xs uppercase tracking-[0.3em] text-emerald-700">
                        Living room
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-sm font-semibold">Harborline Suite</span>
                        <span className="rounded-full bg-emerald-900 px-3 py-1 text-xs text-white">
                          Hot
                        </span>
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {['Sofa', 'Lighting'].map((label) => (
                        <div
                          key={label}
                          className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4"
                        >
                          <div className="text-xs uppercase tracking-[0.3em] text-emerald-700">
                            {label}
                          </div>
                          <p className="mt-3 text-sm text-emerald-800">
                            {label === 'Sofa'
                              ? 'Modular comfort pieces'
                              : 'Warm ambient glow'}
                          </p>
                        </div>
                      ))}
                    </div>
                    <div className="rounded-2xl bg-emerald-900 px-4 py-3 text-sm text-white">
                      Shop by room in minutes
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="-mt-8 grid gap-4 rounded-[2rem] border border-white/70 bg-white/90 px-6 py-6 shadow-lg md:grid-cols-3">
            {highlights.map((item) => (
              <div key={item.title} className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-emerald-900/10" />
                <div>
                  <div className="text-sm font-semibold text-neutral-900">{item.title}</div>
                  <div className="text-xs text-neutral-500">{item.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">Our Products</p>
            <h2 className="mt-3 font-display text-3xl text-neutral-900">
              Furniture highlights
            </h2>
          </div>
          <a href="/shop" className="text-sm font-semibold text-neutral-900 underline">
            View all
          </a>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {categoryTiles.map((tile) => (
            <div
              key={tile.title}
              className="relative overflow-hidden rounded-3xl border border-white/70 bg-white/80 p-6"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${tile.tone} opacity-90`} />
              <div className="relative space-y-3">
                <p className="text-xs uppercase tracking-[0.3em] text-neutral-600">
                  {tile.title}
                </p>
                <p className="text-sm text-neutral-700">{tile.detail}</p>
                <span className="text-sm font-semibold text-neutral-900">Explore</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">Our Collections</p>
            <h2 className="mt-3 font-display text-3xl text-neutral-900">
              Our products collections
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {['All Products', 'Latest Products', 'Best Sellers', 'Featured Products'].map((tab) => (
              <span
                key={tab}
                className="rounded-full border border-neutral-200 bg-white/80 px-3 py-1 text-xs text-neutral-600"
              >
                {tab}
              </span>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="mt-8 rounded-3xl border border-white/70 bg-white/70 p-8 text-sm text-neutral-600">
            Loading products...
          </div>
        ) : featured.length ? (
          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {featured.map((product) => (
              <a
                key={product.id}
                href={`/products/${product.id}`}
                className="flex flex-col gap-4 rounded-3xl border border-white/70 bg-white/80 p-4 shadow-sm"
              >
                <div
                  className="h-44 w-full rounded-2xl"
                  style={{
                    backgroundImage: `linear-gradient(135deg, ${product.palette?.[0]}, ${product.palette?.[1]}, ${product.palette?.[2]})`,
                  }}
                />
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-neutral-900">{product.name}</p>
                  <p className="text-xs text-neutral-500">{product.category}</p>
                  <p className="text-sm font-semibold text-neutral-900">
                    ${product.price.toLocaleString()}
                  </p>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-3xl border border-white/70 bg-white/70 p-8 text-sm text-neutral-600">
            No products found.
          </div>
        )}
      </section>

      <section className="mx-auto max-w-7xl px-6">
        <div className="grid gap-8 rounded-[2.5rem] border border-white/70 bg-white/70 p-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">Why Timberbell</p>
            <h3 className="font-display text-3xl text-neutral-900">Designs crafted for slow living</h3>
            <p className="text-sm text-neutral-600">
              Every piece is built in small batches, with clear lead times and long-term care
              support.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {(categories.length ? categories : []).slice(0, 4).map((category) => (
              <div key={category.id} className="rounded-2xl border border-white/70 bg-white/80 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">{category.name}</p>
                <p className="mt-2 text-sm text-neutral-700">{category.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
