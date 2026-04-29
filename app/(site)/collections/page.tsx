import type { Metadata } from 'next'
import Link from 'next/link'
import Breadcrumb from '@/app/_components/Breadcrumb'
import SectionHeading from '@/app/_components/SectionHeading'
import { getCategoryCopy, getCategoryImage } from '@/lib/constants/category-display'
import { getCategories } from '@/lib/services/catalog'
import { absoluteUrl } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Collections',
  description: 'Explore Timberbell collections across living, bedroom, dining, and entry spaces.',
  alternates: {
    canonical: absoluteUrl('/collections'),
  },
}

export default async function CollectionsPage() {
  const categories = await getCategories()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Timberbell Collections',
    url: absoluteUrl('/collections'),
    hasPart: categories.map((category) => ({
      '@type': 'CollectionPage',
      name: category.name,
      url: absoluteUrl(`/collections/${category.slug}`),
      description: category.description || getCategoryCopy(category.slug, `Explore our ${category.name.toLowerCase()} collection.`),
    })),
  }

  return (
    <div className="mx-auto max-w-7xl space-y-12 px-4 py-10 sm:px-6 sm:py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="overflow-hidden rounded-[40px] border border-[#E6D9C8] bg-[radial-gradient(circle_at_top_right,rgba(124,78,47,0.18),transparent_30%),linear-gradient(135deg,#fffdf9,#f4eee4)] px-8 py-10 shadow-[0_30px_90px_-65px_rgba(55,32,15,0.5)]">
        <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Collections' }]} />
        <div className="mt-4 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <SectionHeading
            eyebrow="Curated"
            title="Our Collections"
            description="Explore our thoughtfully designed categories to find pieces that elevate your space."
          />
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { label: 'Collections', value: String(categories.length) },
              { label: 'Direction', value: 'Editorial' },
              { label: 'Mood', value: 'Warm Modern' },
            ].map((item) => (
              <div key={item.label} className="rounded-[24px] border border-[#E6D9C8] bg-white/80 px-4 py-5 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#8C7A6B]">{item.label}</p>
                <div className="mt-3 font-display text-2xl text-[#2B2119]">{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-3">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/collections/${category.slug}`}
            className="group relative flex h-[20rem] flex-col justify-end overflow-hidden rounded-[36px] border border-[#E6D9C8] bg-white p-7 transition hover:-translate-y-1 hover:shadow-xl sm:h-72 sm:p-8"
          >
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
              style={{ backgroundImage: `url(${getCategoryImage(category.slug)})` }}
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(22,16,12,0.12)_0%,rgba(22,16,12,0.76)_100%)]" />
            <div className="absolute right-6 top-6 rounded-full border border-white/20 bg-black/20 px-3 py-1 text-[9px] uppercase tracking-[0.24em] text-white backdrop-blur-sm">
              Curated
            </div>
            <div className="relative z-10 flex h-full flex-col justify-between">
              <div>
                <div className="text-[9px] font-bold uppercase tracking-[0.3em] text-white/70 transition-colors group-hover:text-white">
                  {category.name}
                </div>
                <div className="mt-3 max-w-[16rem] font-display text-[1.65rem] leading-tight text-[#F9F3EA] sm:text-[1.9rem]">
                  {getCategoryCopy(category.slug, category.description || `Explore our ${category.name.toLowerCase()} collection.`)}
                </div>
              </div>
              <div className="flex items-center justify-between gap-4">
                <div className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#F5E6D2]">Explore Collection</div>
                <div className="h-10 w-10 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm" />
              </div>
            </div>
            <div className="absolute -right-4 -bottom-4 h-32 w-32 rounded-full bg-white/20 blur-md transition-transform group-hover:scale-150" />
          </Link>
        ))}
      </div>

      {!categories.length ? (
        <div className="rounded-[32px] border border-[#E6D9C8] bg-[#F4EEE4] p-12 text-center text-sm text-[#6B594A] shadow-sm sm:rounded-[40px]">
          No collections found.
        </div>
      ) : null}
    </div>
  )
}
