'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import CategoryCard from '@/app/_components/CategoryCard'
import ProductCard from '@/app/_components/ProductCard'
import SectionHeading from '@/app/_components/SectionHeading'

const heroHighlights = [
  { title: 'Luxury facilities', detail: 'Premium craftsmanship' },
  { title: 'Affordable price', detail: 'Designer pieces, fair pricing' },
  { title: 'Many choices', detail: 'Curated collections weekly' },
]

const experienceStats = [
  { value: '7+', label: 'Years experience' },
  { value: '12K', label: 'Luxury clients' },
  { value: '640+', label: 'Ready pieces' },
]

const testimonials = [
  {
    name: 'Kelsie Monroe',
    role: 'Interior Stylist',
    quote:
      'Every piece feels intentional. The textures, proportions, and finish level feel couture.',
  },
  {
    name: 'Devon Pierce',
    role: 'Architect',
    quote:
      'Lighting, seating, and tables land with the same calm palette. It made the project effortless.',
  },
  {
    name: 'Sana El-Rashid',
    role: 'Homeowner',
    quote:
      'Delivery was seamless and the lounge chairs feel like a boutique hotel suite.',
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
  const categoryPreview = categories.slice(0, 4)

  return (
    <div className="space-y-24 pb-24">
      <section className="px-6 pt-10">
        <div className="mx-auto max-w-7xl">
          <div className="relative overflow-hidden rounded-[2.75rem] border border-[#E4DDCF] bg-[#FCFAF6] px-6 py-12 lg:px-14 lg:py-16">
            <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-[#E9E1D4] blur-3xl" />
            <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-[#D8E1CF] blur-3xl" />

            <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
              <div className="space-y-8">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#E4DDCF] bg-white/70 px-5 py-2 text-[10px] uppercase tracking-[0.35em] text-[#6B665A]">
                  Timberbell atelier
                </div>
                <h1 className="font-display text-4xl leading-tight text-[#2A3320] sm:text-5xl lg:text-6xl">
                  The best place to find your dream furniture.
                </h1>
                <p className="max-w-xl text-sm text-[#6B665A] sm:text-base">
                  Discover sculpted seating, warm woods, and layered textiles shaped for modern,
                  calming interiors.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/shop"
                    className="rounded-full bg-[#2A3320] px-7 py-3 text-xs font-bold uppercase tracking-[0.3em] text-white"
                  >
                    Shop now
                  </Link>
                  <Link
                    href="/collections/living"
                    className="rounded-full border border-[#2A3320] px-7 py-3 text-xs font-bold uppercase tracking-[0.3em] text-[#2A3320]"
                  >
                    Explore
                  </Link>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-xs text-[#8A836F]">
                  {heroHighlights.map((item) => (
                    <div key={item.title} className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-[#2A3320]/10" />
                      <div>
                        <div className="text-sm font-semibold text-[#2A3320]">
                          {item.title}
                        </div>
                        <div className="text-xs text-[#8A836F]">{item.detail}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative">
                <div className="absolute right-6 top-6 hidden rounded-full bg-[#2A3320]/10 px-4 py-2 text-[10px] uppercase tracking-[0.3em] text-[#2A3320] lg:block">
                  New arrivals
                </div>
                <div className="rounded-[2.5rem] border border-[#E4DDCF] bg-white/90 p-6 shadow-2xl">
                  <div className="space-y-5">
                    <div className="rounded-2xl bg-[#F2EBDD] p-5">
                      <div className="text-[10px] uppercase tracking-[0.35em] text-[#8B9A78]">
                        Living room
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-sm font-semibold text-[#2A3320]">
                          Harborline Suite
                        </span>
                        <span className="rounded-full bg-[#2A3320] px-3 py-1 text-[10px] text-white">
                          Hot
                        </span>
                      </div>
                      <p className="mt-3 text-xs text-[#6B665A]">
                        Textured linen, oak frame, cloud-soft cushions.
                      </p>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {['Sofa', 'Lighting'].map((label) => (
                        <div
                          key={label}
                          className="rounded-2xl border border-[#E4DDCF] bg-[#FBF8F2] p-4"
                        >
                          <div className="text-[10px] uppercase tracking-[0.3em] text-[#8B9A78]">
                            {label}
                          </div>
                          <p className="mt-3 text-sm text-[#6B665A]">
                            {label === 'Sofa'
                              ? 'Modular comfort pieces'
                              : 'Warm ambient glow'}
                          </p>
                        </div>
                      ))}
                    </div>
                    <div className="rounded-2xl bg-[#2A3320] px-4 py-3 text-sm text-white">
                      Shop by room in minutes
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex items-center justify-between rounded-2xl border border-[#E4DDCF] bg-white/70 px-5 py-4 text-xs text-[#6B665A]">
                  <span>Search furniture</span>
                  <span className="rounded-full bg-[#2A3320] px-4 py-2 text-[10px] uppercase tracking-[0.3em] text-white">
                    Search
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6">
        <SectionHeading
          eyebrow="Why choosing us"
          title="The best place to buy your furniture"
          description="We curate timeless silhouettes with impeccable finishes to elevate every room."
        />
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {heroHighlights.map((item) => (
            <div
              key={item.title}
              className="rounded-[28px] border border-[#E4DDCF] bg-[#FCFAF6] p-6 shadow-sm"
            >
              <div className="text-xs uppercase tracking-[0.35em] text-[#8B9A78]">
                {item.title}
              </div>
              <h3 className="mt-4 text-lg font-semibold text-[#2A3320]">
                {item.detail}
              </h3>
              <p className="mt-3 text-sm text-[#6B665A]">
                Thoughtful curation, rich materials, and gentle palettes that feel serene.
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            eyebrow="Categories"
            title="Best selling product"
            description="Shop the edit of seating, dining, and accessories loved by our clients."
          />
          <div className="flex flex-wrap gap-2">
            {['Chair', 'Beds', 'Sofa', 'Lamp'].map((tab) => (
              <span
                key={tab}
                className="rounded-full border border-[#E4DDCF] bg-white/70 px-4 py-2 text-[10px] uppercase tracking-[0.3em] text-[#8A836F]"
              >
                {tab}
              </span>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="mt-8 rounded-3xl border border-[#E4DDCF] bg-[#FCFAF6] p-8 text-sm text-[#6B665A]">
            Loading products...
          </div>
        ) : featured.length ? (
          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-3xl border border-[#E4DDCF] bg-[#FCFAF6] p-8 text-sm text-[#6B665A]">
            No products found.
          </div>
        )}
      </section>

      <section className="mx-auto max-w-7xl px-6">
        <div className="grid gap-10 rounded-[2.5rem] border border-[#E4DDCF] bg-[#FCFAF6] p-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-5">
            <p className="text-xs uppercase tracking-[0.35em] text-[#8B9A78]">
              Experiences
            </p>
            <h3 className="font-display text-3xl text-[#2A3320]">
              We provide you the best experience
            </h3>
            <p className="text-sm text-[#6B665A]">
              Our design concierge pairs timeless pieces with modern layouts, ensuring every room
              feels intentional and elevated.
            </p>
            <div className="flex flex-wrap gap-5">
              {experienceStats.map((stat) => (
                <div key={stat.label}>
                  <div className="text-2xl font-semibold text-[#2A3320]">{stat.value}</div>
                  <div className="text-xs uppercase tracking-[0.3em] text-[#8A836F]">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
            <Link
              href="/about"
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.3em] text-[#2A3320]"
            >
              Learn more
            </Link>
          </div>
          <div className="rounded-[2rem] bg-[#E8E1D5] p-6">
            <div className="h-full rounded-[1.75rem] bg-[radial-gradient(circle_at_top,#ffffff,transparent_65%)]" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            eyebrow="Materials"
            title="Very serious materials for making furniture"
            description="From kiln-dried oak to brushed bronze, every finish is crafted to age beautifully."
          />
          <Link href="/shop" className="text-xs font-bold uppercase tracking-[0.3em] text-[#2A3320]">
            Learn more
          </Link>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-[2.5rem] border border-[#E4DDCF] bg-[#FCFAF6] p-8">
            <div className="space-y-4">
              <div className="text-xs uppercase tracking-[0.35em] text-[#8B9A78]">
                Signature materials
              </div>
              <h3 className="font-display text-2xl text-[#2A3320]">
                Layered woods, relaxed textiles, hand-finished metalwork.
              </h3>
              <p className="text-sm text-[#6B665A]">
                We source with intention to ensure each piece feels both luxurious and lived-in.
              </p>
              <div className="flex flex-wrap gap-2">
                {['Oak', 'Boucle', 'Walnut', 'Bronze'].map((chip) => (
                  <span
                    key={chip}
                    className="rounded-full border border-[#E4DDCF] bg-white/70 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-[#8A836F]"
                  >
                    {chip}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {categoryPreview.length
              ? categoryPreview.map((category) => (
                  <CategoryCard key={category.id} category={category} />
                ))
              : Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={`placeholder-${index}`}
                    className="rounded-[28px] border border-[#E4DDCF] bg-[#FCFAF6] p-6"
                  >
                    <div className="h-24 rounded-2xl bg-[#EFE6D9]" />
                    <div className="mt-4 h-3 w-24 rounded-full bg-[#DED5C7]" />
                    <div className="mt-2 h-3 w-32 rounded-full bg-[#E6DDD0]" />
                  </div>
                ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6">
        <SectionHeading
          eyebrow="Testimonials"
          title="Our clients say it best"
          description="Stories from homeowners, stylists, and designers who curated with Timberbell."
          align="center"
        />
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {testimonials.map((item) => (
            <div
              key={item.name}
              className="rounded-[28px] border border-[#E4DDCF] bg-[#FCFAF6] p-6"
            >
              <p className="text-sm text-[#6B665A]">“{item.quote}”</p>
              <div className="mt-6 text-sm font-semibold text-[#2A3320]">{item.name}</div>
              <div className="text-xs uppercase tracking-[0.3em] text-[#8A836F]">
                {item.role}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6">
        <div className="rounded-[2.75rem] border border-[#E4DDCF] bg-[#2A3320] px-8 py-12 text-white lg:px-14">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-white/60">
                Subscribe now
              </p>
              <h3 className="mt-4 font-display text-3xl">
                Get 15% off your first order
              </h3>
              <p className="mt-3 text-sm text-white/70">
                Be first to know about new drops, private previews, and atelier stories.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="email"
                placeholder="Enter your email"
                className="h-12 flex-1 rounded-full bg-white/10 px-5 text-sm text-white placeholder:text-white/60"
              />
              <button className="h-12 rounded-full bg-white px-6 text-xs font-bold uppercase tracking-[0.3em] text-[#2A3320]">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
