'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import SectionHeading from '@/app/_components/SectionHeading'
import ProductCard from '@/app/_components/ProductCard'
import RecentlyViewed from '@/app/_components/RecentlyViewed'

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

const heroSlides = [
  {
    eyebrow: 'Gallery One',
    title: 'Spaces shaped with quiet confidence',
    description: 'Sculptural silhouettes, calm luxury, and finely balanced pieces designed to make the room feel intentional.',
    image: '/modern-cool-white-furniture.jpg',
    accent: '/lifestyle-1.svg',
    supportTitle: 'Soft architectural living',
    supportText: 'Layered neutrals, sculptural forms, and a calm focal composition.'
  },
  {
    eyebrow: 'Gallery Two',
    title: 'Editorial furniture for modern living',
    description: 'Confident forms, composed layers, and elevated textures that turn everyday interiors into curated scenes.',
    image: '/cool-half-furniture.jpg',
    accent: '/lifestyle-2.svg',
    supportTitle: 'Warm tonal styling',
    supportText: 'A more intimate composition with contrast, depth, and visual rhythm.'
  },
  {
    eyebrow: 'Gallery Three',
    title: 'Raw materials with refined presence',
    description: 'Honest timber, tactile finishes, and collectible craftsmanship brought together with architectural restraint.',
    image: '/raw-furniture-art.jpg',
    accent: '/modern-cool-white-furniture.jpg',
    supportTitle: 'Natural statement finish',
    supportText: 'Raw texture and clean silhouettes presented with a gallery-like stillness.'
  }
]

  const heroChips = ['Editorial calm', 'Museum-white', 'Raw timber', 'Statement silhouettes']

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

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [activeSlide, setActiveSlide] = useState(0)

  const { scrollY } = useScroll()
  const y1 = useTransform(scrollY, [0, 500], [0, 150])
  const y2 = useTransform(scrollY, [0, 2000], [0, 300])

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
    return () => { active = false }
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % heroSlides.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [])

  const featured = useMemo(() => products.slice(0, 6), [products])
  const categoryPreview = categories.slice(0, 6)

  return (
    <div className="space-y-24 pb-24">
      {/* Hero Carousel */}
      <section className="px-0 pt-0 sm:px-6 sm:pt-10">
        <div className="mx-auto max-w-7xl">
          <div className="relative overflow-hidden sm:rounded-[48px] sm:border sm:border-[#E6D9C8] sm:shadow-[0_40px_100px_-50px_rgba(55,32,15,0.4)]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSlide}
                initial={{ opacity: 0, scale: 1.02 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.99 }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                className="relative min-h-[100svh] overflow-hidden bg-[#2B2119] sm:min-h-[620px]"
              >
                <motion.div
                  style={{ y: y1 }}
                  initial={{ opacity: 0, scale: 1.08 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 1.2, ease: 'easeOut' }}
                  className="absolute inset-0"
                >
                  <img
                    src={heroSlides[activeSlide].image}
                    alt=""
                    className="h-full w-full object-cover transition-transform duration-[18s] hover:scale-105"
                  />
                </motion.div>
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,5,4,0.2)_0%,rgba(7,5,4,0.18)_18%,rgba(7,5,4,0.56)_56%,rgba(7,5,4,0.88)_100%)] sm:bg-[linear-gradient(100deg,rgba(10,7,5,0.9)_0%,rgba(18,13,10,0.72)_38%,rgba(22,16,12,0.4)_68%,rgba(12,8,6,0.6)_100%)]" />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.08)_0%,rgba(0,0,0,0.04)_24%,rgba(0,0,0,0.24)_52%,rgba(0,0,0,0.42)_100%)] sm:bg-[linear-gradient(180deg,rgba(0,0,0,0.18)_0%,rgba(0,0,0,0.08)_30%,rgba(0,0,0,0.38)_100%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(244,238,228,0.18),transparent_34%)]" />
                <div className="absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(180deg,transparent,rgba(8,6,5,0.75))] sm:hidden" />

                <div className="relative flex min-h-[100svh] items-end px-5 pb-8 pt-24 sm:min-h-[620px] sm:px-8 sm:py-8 md:px-10 md:py-10 lg:px-16 lg:py-16">
                  <div className="grid w-full gap-6 sm:gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end lg:gap-10">
                    <div className="space-y-5 sm:space-y-6 lg:space-y-8">
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="inline-flex max-w-full items-center gap-2 rounded-full border border-white/18 bg-white/10 px-4 py-2 text-[9px] font-bold uppercase tracking-[0.3em] text-white backdrop-blur-md [text-shadow:0_1px_10px_rgba(0,0,0,0.65)] sm:border-white/24 sm:bg-black/42 sm:px-5 sm:py-2.5 sm:text-[10px] sm:tracking-[0.4em]"
                      >
                        {heroSlides[activeSlide].eyebrow}
                      </motion.div>
                      <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="max-w-3xl font-display text-[2.65rem] leading-[0.92] text-white [text-shadow:0_12px_34px_rgba(0,0,0,0.78)] sm:text-5xl lg:text-7xl"
                      >
                        {heroSlides[activeSlide].title}
                      </motion.h1>
                      <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="max-w-xl text-[0.95rem] leading-relaxed text-white/96 [text-shadow:0_6px_18px_rgba(0,0,0,0.74)] sm:max-w-2xl sm:text-base"
                      >
                        {heroSlides[activeSlide].description}
                      </motion.p>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.45 }}
                        className="flex flex-wrap gap-2 sm:flex"
                      >
                        {heroChips.map((chip) => (
                          <span key={chip} className="rounded-full border border-white/14 bg-black/20 px-3 py-2 text-[9px] font-bold uppercase tracking-[0.14em] text-white/92 backdrop-blur-md [text-shadow:0_1px_10px_rgba(0,0,0,0.58)] sm:border-white/18 sm:bg-black/38 sm:px-4 sm:text-[10px] sm:tracking-[0.22em]">
                            {chip}
                          </span>
                        ))}
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="flex flex-col gap-3 pt-2 sm:flex-row sm:flex-wrap sm:gap-4 sm:pt-2"
                      >
                        <Link
                          href="/productfilter"
                          className="inline-flex items-center justify-center rounded-full bg-[#F4EEE4] px-6 py-3.5 text-[9px] font-bold uppercase tracking-[0.22em] text-[#2B2119] shadow-[0_24px_60px_-30px_rgba(0,0,0,0.4)] transition-all hover:-translate-y-0.5 hover:bg-white sm:px-8 sm:py-4 sm:text-[10px] sm:tracking-[0.3em]"
                        >
                          Shop Collection
                        </Link>
                        <Link
                          href="/journal"
                          className="inline-flex items-center justify-center rounded-full border border-white/28 bg-white/8 px-6 py-3.5 text-[9px] font-bold uppercase tracking-[0.22em] text-white transition-all hover:-translate-y-0.5 hover:bg-white/10 sm:border-white/40 sm:bg-black/18 sm:px-8 sm:py-4 sm:text-[10px] sm:tracking-[0.3em]"
                        >
                          View the Lookbook
                        </Link>
                      </motion.div>

                      <div className="flex gap-2 pt-5 sm:pt-6">
                        {heroSlides.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setActiveSlide(i)}
                            className={`h-1 rounded-full transition-all duration-500 ${activeSlide === i ? 'w-12 bg-white' : 'w-4 bg-white/35 hover:bg-white/60'}`}
                          />
                        ))}
                      </div>
                    </div>

                    <motion.div
                      style={{ y: y2 }}
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.35, duration: 0.9 }}
                      className="hidden justify-self-start lg:justify-self-end lg:block"
                    >
                      <div className="w-full max-w-[280px] overflow-hidden rounded-[28px] border border-white/20 bg-[rgba(251,247,241,0.16)] p-3 backdrop-blur-xl shadow-[0_35px_100px_-40px_rgba(0,0,0,0.65)] sm:max-w-[320px] sm:rounded-[32px] sm:p-4">
                        <div className="relative overflow-hidden rounded-[24px]">
                          <img src={heroSlides[activeSlide].accent} alt="" className="h-40 w-full object-cover sm:h-48" />
                          <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(23,15,10,0.52))]" />
                        </div>
                        <div className="space-y-2 px-1 pt-4 text-white">
                          <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-white/78 [text-shadow:0_2px_10px_rgba(0,0,0,0.55)]">{heroSlides[activeSlide].supportTitle}</p>
                          <p className="text-xs leading-relaxed text-white [text-shadow:0_4px_18px_rgba(0,0,0,0.6)] sm:text-sm">{heroSlides[activeSlide].supportText}</p>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            eyebrow="The Collections"
            title="Shop with intention"
            description="Refined silhouettes curated for every corner of your sanctuary."
          />
          <Link href="/productfilter" className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#7C4E2F] border-b-2 border-[#7C4E2F]">
            View all categories
          </Link>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {categoryPreview.slice(0, 3).map((category) => (
            <Link
              key={category.id}
              href={`/productfilter?category=${category.slug}`}
              className="group relative h-64 overflow-hidden rounded-[40px] border border-[#E6D9C8] bg-white p-8 transition-all hover:shadow-xl hover:-translate-y-1"
            >
              <div className="relative z-10 flex h-full flex-col justify-between">
                <div>
                   <div className="text-[10px] uppercase tracking-[0.4em] text-[#8C7A6B] font-bold group-hover:text-[#7C4E2F] transition-colors">
                    {category.name}
                  </div>
                  <div className="mt-3 font-display text-3xl text-[#2B2119]">
                    {category.description || 'Natural essence'}
                  </div>
                </div>
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7C4E2F]">
                   Explore Collection &rarr;
                </div>
              </div>
              <div className="absolute -right-4 -bottom-4 h-32 w-32 rounded-full bg-[#F4EEE4] transition-transform group-hover:scale-150" />
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="mx-auto max-w-7xl px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <SectionHeading
            eyebrow="New Arrivals"
            title="The Artisan Edit"
            description="Hand-selected pieces that define our current seasonal tone."
          />
        </div>

        {loading ? (
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="aspect-[4/5] animate-pulse rounded-[40px] bg-[#E6D9C8]/30" />
            ))}
          </div>
        ) : (
          <div className="mt-12 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Lifestyle Banners */}
      <section className="mx-auto max-w-7xl px-6">
        <div className="grid gap-8 lg:grid-cols-2">
          {categoryBanners.map((banner) => (
            <div
              key={banner.title}
              className="group relative h-[500px] overflow-hidden rounded-[48px] border border-[#E6D9C8] bg-[#F4EEE4]"
            >
              <motion.div
                style={{ 
                  y: y1,
                  backgroundImage: `url(${banner.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
                className="absolute inset-0 transition-transform duration-[1.5s] ease-out group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-[#2B2119]/60 via-transparent to-transparent" />
              <div className="relative flex h-full flex-col justify-end p-12 text-white">
                <div className="space-y-4">
                  <p className="text-[10px] uppercase tracking-[0.4em] text-white/80 font-bold">
                    The Lookbook
                  </p>
                  <h3 className="font-display text-4xl leading-tight">{banner.title}</h3>
                  <p className="max-w-sm text-sm text-white/90">{banner.detail}</p>
                  <Link
                    href="/productfilter"
                    className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-3 text-[10px] font-bold uppercase tracking-[0.3em] text-[#2B2119] shadow-lg hover:shadow-xl transition-all"
                  >
                    View products
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <RecentlyViewed />
    </div>
  )
}
