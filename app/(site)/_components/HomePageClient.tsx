'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'
import SectionHeading from '@/app/_components/SectionHeading'
import ProductCard from '@/app/_components/ProductCard'
import RecentlyViewed from '@/app/_components/RecentlyViewed'
import { getCategoryCopy, getCategoryImage } from '@/lib/constants/category-display'
import { armSharedAudio } from '@/lib/utils/sharedAudio'
import type { Category, Product } from '@/types/catalog'

const heroSlides = [
  {
    title: 'Spaces shaped with quiet confidence',
    description: 'Sculptural silhouettes, calm luxury, and finely balanced pieces designed to make the room feel intentional.',
    image: '/modern-cool-white-furniture.jpg',
  },
  {
    title: 'Editorial furniture for modern living',
    description: 'Confident forms, composed layers, and elevated textures that turn everyday interiors into curated scenes.',
    image: '/cool-half-furniture.jpg',
  },
  {
    title: 'Raw materials with refined presence',
    description: 'Honest timber, tactile finishes, and collectible craftsmanship brought together with architectural restraint.',
    image: '/raw-furniture-art.jpg',
  },
]

const categoryBanners = [
  {
    title: 'Dining stories',
    detail: 'Warm oak, soft light, and elegant hosting moments.',
    image: '/hero banner4.jpeg',
  },
  {
    title: 'Living calm',
    detail: 'Soft seating, warm texture, and a quieter rhythm at home.',
    image: '/hero banner 5.jpeg',
  },
]

export default function HomePageClient({
  categories,
  products,
}: {
  categories: Category[]
  products: Product[]
}) {
  const [activeSlide, setActiveSlide] = useState(0)
  const [isMobileHero, setIsMobileHero] = useState(false)

  const { scrollY } = useScroll()
  const y1 = useTransform(scrollY, [0, 500], [0, isMobileHero ? 30 : 120])
  const y2 = useTransform(scrollY, [0, 2000], [0, isMobileHero ? 50 : 240])

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % heroSlides.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const media = window.matchMedia('(max-width: 767px)')
    const sync = () => setIsMobileHero(media.matches)
    sync()
    media.addEventListener('change', sync)
    return () => media.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    heroSlides.forEach((slide) => {
      const img = new window.Image()
      img.src = slide.image
    })
  }, [])

  const featured = useMemo(() => products.slice(0, 6), [products])
  const categoryPreview = useMemo(() => {
    const preferredOrder = ['living', 'bedroom', 'dining', 'entry']
    return [...categories]
      .sort((left, right) => preferredOrder.indexOf(left.slug) - preferredOrder.indexOf(right.slug))
      .slice(0, 4)
  }, [categories])

  return (
    <div className="space-y-20 pb-20 sm:space-y-24 sm:pb-24">
      <section className="px-0 pt-0">
        <div className="mx-auto max-w-7xl">
          <div className="relative overflow-hidden bg-[#2B2119]">
            <div className="relative min-h-[100svh] overflow-hidden bg-[#2B2119] sm:min-h-[720px]">
              {heroSlides.map((slide, index) => (
                <motion.div
                  key={slide.image}
                  style={{ y: index === activeSlide ? y1 : 0 }}
                  animate={{ opacity: index === activeSlide ? 1 : 0, scale: index === activeSlide ? 1 : 1.03 }}
                  transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute inset-0 transform-gpu will-change-transform"
                >
                  <img
                    src={slide.image}
                    alt=""
                    className="h-full w-full object-cover transform-gpu transition-transform duration-[18s] will-change-transform"
                  />
                </motion.div>
              ))}
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,5,4,0.62)_0%,rgba(7,5,4,0.44)_18%,rgba(7,5,4,0.42)_46%,rgba(7,5,4,0.84)_100%)] sm:bg-[linear-gradient(100deg,rgba(10,7,5,0.86)_0%,rgba(16,11,8,0.7)_34%,rgba(20,15,12,0.42)_60%,rgba(11,8,6,0.72)_100%)]" />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.24)_0%,rgba(0,0,0,0.12)_20%,rgba(0,0,0,0.16)_48%,rgba(0,0,0,0.48)_100%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(244,238,228,0.16),transparent_34%)]" />

              <div className="relative flex min-h-[100svh] items-start px-5 pb-10 pt-20 sm:min-h-[720px] sm:px-8 sm:pb-14 sm:pt-28 md:px-10 lg:px-16 lg:pb-16 lg:pt-32">
                <div className="w-full max-w-3xl space-y-5 sm:space-y-6 lg:space-y-8">
                  <motion.h1
                    key={`title-${activeSlide}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="max-w-3xl font-display text-[2.65rem] leading-[0.92] text-white [text-shadow:0_12px_34px_rgba(0,0,0,0.82)] sm:text-5xl lg:text-7xl"
                  >
                    {heroSlides[activeSlide].title}
                  </motion.h1>
                  <motion.p
                    key={`description-${activeSlide}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="max-w-xl text-[0.95rem] leading-relaxed text-white [text-shadow:0_6px_18px_rgba(0,0,0,0.78)] sm:max-w-2xl sm:text-base"
                  >
                    {heroSlides[activeSlide].description}
                  </motion.p>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex flex-col gap-3 pt-6 sm:flex-row sm:flex-wrap sm:gap-4 sm:pt-2"
                  >
                    <Link
                      href="/productfilter"
                      onPointerDown={() => { void armSharedAudio() }}
                      onClick={() => { void armSharedAudio() }}
                      className="inline-flex items-center justify-center rounded-full bg-[#F4EEE4] px-6 py-3.5 text-[10px] font-bold uppercase tracking-[0.22em] text-[#1B130D] shadow-[0_24px_60px_-30px_rgba(0,0,0,0.45)] transition-all hover:-translate-y-0.5 hover:bg-white sm:px-8 sm:py-4 sm:text-[10px] sm:tracking-[0.3em]"
                    >
                      Shop Collection
                    </Link>
                    <Link
                      href="/journal"
                      className="inline-flex items-center justify-center rounded-full border border-white/45 bg-black/38 px-6 py-3.5 text-[10px] font-bold uppercase tracking-[0.22em] text-white transition-all hover:-translate-y-0.5 hover:bg-black/48 sm:px-8 sm:py-4 sm:text-[10px] sm:tracking-[0.3em]"
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
              </div>
              <motion.div
                style={{ y: y2 }}
                className="pointer-events-none absolute inset-x-0 bottom-0 hidden h-40 bg-[linear-gradient(180deg,transparent,rgba(8,6,5,0.5))] sm:block"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            eyebrow="The Collections"
            title="Shop with intention"
            description="Refined silhouettes curated for every corner of your sanctuary."
          />
          <Link href="/productfilter" className="rounded-full border border-[#E6D9C8] bg-white/80 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.24em] text-[#7C4E2F] shadow-sm transition hover:border-[#7C4E2F] hover:bg-white">
            View all categories
          </Link>
        </div>
        <div className="mt-10 grid gap-6 md:mt-12 md:grid-cols-2 xl:grid-cols-4">
          {categoryPreview.map((category) => (
            <Link
              key={category.id}
              href={`/productfilter?category=${category.slug}`}
              onPointerDown={() => { void armSharedAudio() }}
              onClick={() => { void armSharedAudio() }}
              className="group relative h-[18.5rem] overflow-hidden rounded-[32px] border border-[#E6D9C8] bg-white p-6 shadow-[0_24px_60px_-46px_rgba(55,32,15,0.42)] transition-all hover:-translate-y-1 hover:shadow-[0_32px_70px_-42px_rgba(55,32,15,0.5)] sm:h-64 sm:rounded-[40px] sm:p-8"
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
                    {getCategoryCopy(category.slug, category.description)}
                  </div>
                </div>
                <div className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#F5E6D2]">
                  Explore Collection &rarr;
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 h-32 w-32 rounded-full bg-white/20 blur-md transition-transform group-hover:scale-150" />
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-2">
          {categoryBanners.map((banner) => (
            <div
              key={banner.title}
              className="group relative h-[420px] overflow-hidden rounded-[40px] border border-[#E6D9C8] bg-[#F4EEE4] shadow-[0_30px_80px_-55px_rgba(55,32,15,0.5)] sm:h-[500px] sm:rounded-[48px]"
            >
              <motion.div
                style={{
                  backgroundImage: `url("${banner.image}")`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
                className="absolute inset-0 transition-transform duration-[1.5s] ease-out group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-[#2B2119]/60 via-transparent to-transparent" />
              <div className="relative flex h-full flex-col justify-end p-7 text-white sm:p-12">
                <div className="space-y-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/80">
                    The Lookbook
                  </p>
                  <h3 className="font-display text-[2rem] leading-tight sm:text-4xl">{banner.title}</h3>
                  <p className="max-w-sm text-sm leading-relaxed text-white/90">{banner.detail}</p>
                  <Link
                    href="/productfilter"
                    className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-3 text-[10px] font-bold uppercase tracking-[0.3em] text-[#2B2119] shadow-lg transition-all hover:shadow-xl"
                  >
                    View products
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="rounded-[40px] border border-[#E6D9C8] bg-[linear-gradient(180deg,#f8f1e8,#fffdfa)] px-6 py-8 shadow-[0_24px_70px_-55px_rgba(55,32,15,0.45)] sm:px-8 sm:py-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <SectionHeading
              eyebrow="Continue Exploring"
              title="Return to pieces that already caught your eye"
              description="Your recent views stay close so it is easier to compare and revisit on the go."
            />
            <Link href="/productfilter" className="w-fit rounded-full border border-[#7C4E2F] px-5 py-3 text-[10px] font-bold uppercase tracking-[0.24em] text-[#7C4E2F] transition hover:bg-white">
              Browse all products
            </Link>
          </div>
          <div className="mt-8">
            <RecentlyViewed />
          </div>
        </div>
      </section>
    </div>
  )
}
