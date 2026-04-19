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
    title: 'Spaces shaped with quiet confidence',
    description: 'Sculptural silhouettes, calm luxury, and finely balanced pieces designed to make the room feel intentional.',
    image: '/modern-cool-white-furniture.jpg',
    chip: 'White Edit'
  },
  {
    title: 'Editorial furniture for modern living',
    description: 'Confident forms, composed layers, and elevated textures that turn everyday interiors into curated scenes.',
    image: '/cool-half-furniture.jpg',
    chip: 'Cool Edit'
  },
  {
    title: 'Raw materials with refined presence',
    description: 'Honest timber, tactile finishes, and collectible craftsmanship brought together with architectural restraint.',
    image: '/raw-furniture-art.jpg',
    chip: 'Raw Edit'
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
      <section className="px-6 pt-10">
        <div className="mx-auto max-w-7xl">
          <div className="relative overflow-hidden rounded-[48px] border border-[#E6D9C8] bg-[#F4EEE4] shadow-[0_40px_100px_-50px_rgba(55,32,15,0.4)]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSlide}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center px-10 py-16 lg:px-20 lg:py-24"
              >
                <div className="space-y-8">
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="image-glass inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-[10px] font-bold uppercase tracking-[0.4em] text-[#6A4529]"
                  >
                    {heroSlides[activeSlide].chip}
                  </motion.div>
                  <motion.h1 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="font-display text-5xl leading-[0.96] text-[#2B2119] sm:text-6xl lg:text-7xl"
                  >
                    {heroSlides[activeSlide].title}
                  </motion.h1>
                  <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="max-w-xl text-base leading-relaxed text-[#6B594A]"
                  >
                    {heroSlides[activeSlide].description}
                  </motion.p>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45 }}
                    className="flex flex-wrap gap-2"
                  >
                    {heroChips.map((chip) => (
                      <span key={chip} className="image-glass rounded-full px-4 py-2 text-[10px] font-bold uppercase tracking-[0.22em] text-[#6A4529]">
                        {chip}
                      </span>
                    ))}
                  </motion.div>
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex flex-wrap gap-4 pt-4"
                  >
                    <Link
                      href="/productfilter"
                    className="rounded-full bg-[#7C4E2F] px-8 py-4 text-[10px] font-bold uppercase tracking-[0.3em] text-white shadow-[0_24px_60px_-30px_rgba(55,32,15,0.55)] hover:-translate-y-0.5 hover:bg-[#5C3A24] hover:shadow-[0_30px_70px_-30px_rgba(55,32,15,0.6)] transition-all"
                    >
                      Shop Collection
                    </Link>
                    <Link
                      href="/journal"
                    className="rounded-full border border-[#7C4E2F] px-8 py-4 text-[10px] font-bold uppercase tracking-[0.3em] text-[#7C4E2F] hover:-translate-y-0.5 hover:bg-white/50 transition-all"
                    >
                      View the Lookbook
                    </Link>
                  </motion.div>
                  
                  <div className="flex gap-2 pt-8">
                    {heroSlides.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveSlide(i)}
                        className={`h-1 rounded-full transition-all duration-500 ${activeSlide === i ? 'bg-[#7C4E2F] w-12' : 'bg-[#E6D9C8] w-4 hover:bg-[#D9C7B3]'}`}
                      />
                    ))}
                  </div>
                </div>

                <div className="relative aspect-square">
                  <motion.div 
                    style={{ y: y1 }}
                    initial={{ opacity: 0, scale: 1.1, rotate: 2 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="h-full w-full overflow-hidden rounded-[40px] border border-[#E6D9C8] bg-white shadow-[0_35px_100px_-40px_rgba(55,32,15,0.55)]"
                  >
                    <img 
                      src={heroSlides[activeSlide].image} 
                      alt="" 
                      className="h-full w-full object-cover transition-transform duration-[18s] hover:scale-105" 
                    />
                  </motion.div>
                  <motion.div
                    style={{ y: y2 }}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.35, duration: 0.9 }}
                    className="image-glass absolute -bottom-6 -left-6 hidden overflow-hidden rounded-[28px] px-5 py-4 md:block"
                  >
                    <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.3),rgba(43,33,25,0.08))]" />
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#8C7A6B]">Curated Mood</p>
                    <p className="relative mt-2 max-w-[12rem] text-sm leading-relaxed text-[#2B2119] [text-shadow:0_1px_1px_rgba(255,255,255,0.45)]">Sophisticated furniture direction with collectible presence.</p>
                  </motion.div>
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
