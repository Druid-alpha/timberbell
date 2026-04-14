'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import SectionHeading from '@/app/_components/SectionHeading'
import ProductCard from '@/app/_components/ProductCard'

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

const heroChips = ['Natural wood', 'Organic fabrics', 'Artisan made', 'Smart storage']

const categoryBanners = [
  {
    title: 'Dining stories',
    detail: 'Warm oak, textured linens, and sculptural silhouettes.',
    image: '/lifestyle-1.svg',
  },
  {
    title: 'Living calm',
    detail: 'Soft seating and serene palettes for slow evenings.',
    image: '/lifestyle-2.svg',
  },
]

const featureCards = [
  {
    title: 'Style with conscience',
    detail: 'Sustainably sourced oak, walnut, and cotton blends.',
  },
  {
    title: 'Quiet silhouettes',
    detail: 'Soft edges, warm textures, and timeless proportions.',
  },
  {
    title: 'Crafted longevity',
    detail: 'Engineered joints and finishes built to last.',
  },
]

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [heroLiked, setHeroLiked] = useState(false)

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

  const featured = useMemo(() => products.slice(0, 6), [products])
  const categoryPreview = categories.slice(0, 6)

  return (
    <div className="space-y-24 pb-24">
      <section className="px-6 pt-10 arkwood-reveal">
        <div className="mx-auto max-w-7xl">
          <div className="relative overflow-hidden rounded-[40px] border border-[#E6D9C8] bg-[#F4EEE4] px-6 py-12 shadow-[0_30px_80px_-60px_rgba(55,32,15,0.55)] lg:px-14 lg:py-16">
            <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-[#E6D6C4] blur-3xl" />
            <div className="absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-[#D9C7B3] blur-3xl" />
            <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
              <div className="space-y-6 arkwood-stagger">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#E6D9C8] bg-white/70 px-4 py-2 text-[10px] uppercase tracking-[0.35em] text-[#7C5A3B]">
                  Timberbell Atelier
                </div>
                <h1 className="font-display text-4xl leading-tight text-[#2B2119] sm:text-5xl lg:text-6xl">
                  Nature in your home
                </h1>
                <p className="max-w-xl text-sm text-[#6B594A] sm:text-base">
                  Curate warm, grounded interiors with sculptural seating, serene palettes, and
                  organic finishes designed for slow living.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/productfilter"
                    className="rounded-full bg-[#7C4E2F] px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-white"
                  >
                    Shop now
                  </Link>
                  <Link
                    href="/productfilter"
                    className="rounded-full border border-[#7C4E2F] px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-[#7C4E2F]"
                  >
                    Explore
                  </Link>
                </div>
                <div className="flex flex-wrap gap-2">
                  {heroChips.map((chip) => (
                    <span
                      key={chip}
                      className="rounded-full border border-[#E2D3C1] bg-white/80 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-[#7C5A3B]"
                    >
                      {chip}
                    </span>
                  ))}
                </div>
                <div className="mt-6 flex items-center gap-3 rounded-full border border-[#E6D9C8] bg-white/80 px-4 py-2">
                  <input
                    placeholder="Search products, materials, colors"
                    className="w-full bg-transparent text-sm text-[#2B2119] placeholder:text-[#8C7A6B] focus:outline-none"
                  />
                  <button className="rounded-full bg-[#7C4E2F] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-white">
                    Search
                  </button>
                </div>
              </div>

              <div className="relative">
                <div className="rounded-[36px] border border-[#E6D9C8] bg-[#EFE6DA] p-6 shadow-[0_30px_80px_-60px_rgba(55,32,15,0.6)] arkwood-float">
                  <div className="rounded-[28px] bg-white p-6">
                    <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.3em] text-[#7C5A3B]">
                      <span>Featured</span>
                      <span>2025</span>
                    </div>
                    <div className="mt-6 h-48 overflow-hidden rounded-[24px] bg-[radial-gradient(circle_at_top,#ffffff,transparent_60%)]">
                      <img src="/hero-chair.svg" alt="Orbital chair" className="h-full w-full object-contain" />
                    </div>
                    <div className="mt-6 flex items-center justify-between">
                      <div>
                        <div className="text-sm font-semibold text-[#2B2119]">
                          Orbital Chair
                        </div>
                        <div className="text-[10px] uppercase tracking-[0.3em] text-[#8C7A6B]">
                          Walnut leather
                        </div>
                      </div>
                      <div className="rounded-full bg-[#7C4E2F] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-white">
                        $280
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-4 gap-2">
                      {[1, 2, 3, 4].map((item) => (
                        <div
                          key={item}
                          className="h-10 rounded-2xl border border-[#E6D9C8] bg-[#F4EEE4]"
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex w-full rounded-[22px] border border-[#E6D9C8] bg-white p-4 shadow-xl lg:absolute lg:-left-6 lg:top-8 lg:w-[220px]">
                  <div className="flex items-start gap-3">
                    <div className="h-14 w-14 overflow-hidden rounded-2xl bg-[#F4EEE4]">
                      <img src="/hero-room.svg" alt="Natural living room" className="h-full w-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] uppercase tracking-[0.3em] text-[#8C7A6B]">Natural calm</p>
                      <p className="text-sm font-semibold text-[#2B2119]">Soft wood dining</p>
                    </div>
                    <button
                      type="button"
                      aria-label="Toggle wishlist"
                      onClick={() => setHeroLiked((prev) => !prev)}
                      className={`flex h-9 w-9 items-center justify-center rounded-full border ${heroLiked ? 'border-[#7C4E2F] bg-[#7C4E2F]' : 'border-[#E6D9C8] bg-white'} transition`}
                    >
                      <svg viewBox="0 0 24 24" className={`h-4 w-4 ${heroLiked ? 'text-white' : 'text-[#7C4E2F]'}`} fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M12 19s-6-4.35-8-7.9C2.5 8 4 5.5 6.7 5.2 8.3 5 10 5.8 12 7.8c2-2 3.7-2.8 5.3-2.6C20 5.5 21.5 8 20 11.1 18 14.65 12 19 12 19Z" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="mt-4 w-full rounded-[24px] border border-[#E6D9C8] bg-white p-4 shadow-xl lg:absolute lg:-right-6 lg:bottom-6 lg:w-[200px]">
                  <div className="h-24 w-full overflow-hidden rounded-2xl bg-[#F4EEE4]">
                    <img src="/hero-chair.svg" alt="Lounge chair" className="h-full w-full object-contain" />
                  </div>
                  <div className="mt-3 space-y-2">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-[#8C7A6B]">Studio drop</p>
                    <p className="text-sm font-semibold text-[#2B2119]">Natural essence</p>
                    <Link
                      href="/productfilter"
                      className="inline-flex w-full items-center justify-center rounded-full bg-[#7C4E2F] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-white"
                    >
                      Shop now
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            eyebrow="Collections"
            title="Shop with category"
            description="Refined silhouettes for dining, living, and slow mornings."
          />
          <Link href="/productfilter" className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#7C4E2F]">
            View all
          </Link>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {(categoryPreview.length ? categoryPreview : []).slice(0, 3).map((category) => (
            <div
              key={category.id}
              className="rounded-[28px] border border-[#E6D9C8] bg-white/80 p-6"
            >
              <div className="text-[10px] uppercase tracking-[0.3em] text-[#8C7A6B]">
                {category.name}
              </div>
              <div className="mt-3 font-display text-2xl text-[#2B2119]">
                {category.description || 'Natural essence'}
              </div>
              <Link
                href={`/productfilter?category=${category.slug}`}
                className="mt-6 inline-flex items-center text-[10px] font-semibold uppercase tracking-[0.3em] text-[#7C4E2F]"
              >
                Explore
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6">
        <div className="grid gap-6 lg:grid-cols-2">
          {categoryBanners.map((banner) => (
            <div
              key={banner.title}
              className="relative overflow-hidden rounded-[32px] border border-[#E6D9C8] bg-[#F4EEE4] p-6"
            >
              <div
                className="absolute inset-0 opacity-90"
                style={{
                  backgroundImage: `url(${banner.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
              <div className="absolute inset-0 bg-white/40" />
              <div className="relative space-y-3">
                <p className="text-[10px] uppercase tracking-[0.35em] text-[#8C7A6B]">
                  Timberbell
                </p>
                <h3 className="font-display text-2xl text-[#2B2119]">{banner.title}</h3>
                <p className="max-w-sm text-sm text-[#6B594A]">{banner.detail}</p>
                <Link
                  href="/productfilter"
                  className="inline-flex items-center text-[10px] font-semibold uppercase tracking-[0.3em] text-[#7C4E2F]"
                >
                  Shop the edit
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6">
        <div className="grid gap-8 rounded-[36px] border border-[#E6D9C8] bg-[#F4EEE4] p-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <p className="text-[10px] uppercase tracking-[0.35em] text-[#8C7A6B]">
              Natural essence
            </p>
            <h3 className="font-display text-3xl text-[#2B2119]">
              Crafted serenity for the rooms you love.
            </h3>
            <p className="text-sm text-[#6B594A]">
              Designed to feel light, warm, and grounded. Each piece is curated to pair seamlessly.
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              {featureCards.map((card) => (
                <div key={card.title} className="rounded-2xl border border-[#E6D9C8] bg-white/80 p-4">
                  <div className="text-sm font-semibold text-[#2B2119]">{card.title}</div>
                  <p className="mt-2 text-xs text-[#6B594A]">{card.detail}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[28px] border border-[#E6D9C8] bg-white p-6">
            <div className="text-[10px] uppercase tracking-[0.3em] text-[#8C7A6B]">Signature</div>
            <div className="mt-4 h-48 rounded-[24px] bg-[#EFE6DA]" />
            <div className="mt-4 flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-[#2B2119]">Cedar Lounge</div>
                <div className="text-[10px] uppercase tracking-[0.3em] text-[#8C7A6B]">
                  Soft boucle
                </div>
              </div>
              <button className="rounded-full bg-[#7C4E2F] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-white">
                Add
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <SectionHeading
            eyebrow="Shop"
            title="Modern pieces for every room"
            description="Select from curated seating, lighting, and dining essentials."
          />
          <div className="flex flex-wrap gap-2">
            {['Living', 'Dining', 'Bedroom', 'Decor'].map((tab) => (
              <span
                key={tab}
                className="rounded-full border border-[#E6D9C8] bg-white/80 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-[#8C7A6B]"
              >
                {tab}
              </span>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="mt-8 rounded-3xl border border-[#E6D9C8] bg-white/70 p-8 text-sm text-[#6B594A]">
            Loading products...
          </div>
        ) : featured.length ? (
          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-3xl border border-[#E6D9C8] bg-white/70 p-8 text-sm text-[#6B594A]">
            No products found.
          </div>
        )}
      </section>
    </div>
  )
}
