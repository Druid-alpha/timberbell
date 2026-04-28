'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import ProductCard from '@/app/_components/ProductCard'
import Breadcrumb from '@/app/_components/Breadcrumb'
import { getColorFamilySwatch } from '@/lib/utils/color-name'
import StateCard from '@/app/_components/StateCard'
import type { Category, Product, ProductFacetSummary } from '@/types/catalog'

const DEFAULT_MIN_PRICE = '0'
const FALLBACK_MAX_PRICE = 500000

type ProductFilterClientProps = {
  categories: Category[]
  products: Product[]
  facets: ProductFacetSummary
  total: number
  query: string
  category: string
  minPriceParam: string
  maxPriceParam: string
  colorsParam: string
  materialsParam: string
  sortParam: string
  pageParam: string
}

export default function ProductFilterClient({
  categories,
  products,
  facets,
  total,
  query,
  category,
  minPriceParam,
  maxPriceParam,
  colorsParam,
  materialsParam,
  sortParam,
  pageParam,
}: ProductFilterClientProps) {
  const router = useRouter()
  const [search, setSearch] = useState(query)
  const [minPrice, setMinPrice] = useState(minPriceParam || DEFAULT_MIN_PRICE)
  const [maxPrice, setMaxPrice] = useState(maxPriceParam || '')
  const [colors, setColors] = useState<string[]>(colorsParam ? colorsParam.split(',').filter(Boolean) : [])
  const [materials, setMaterials] = useState<string[]>(materialsParam ? materialsParam.split(',').filter(Boolean) : [])
  const [sort, setSort] = useState(sortParam || 'newest')
  const [page, setPage] = useState(Number(pageParam) || 1)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  const priceCeiling = useMemo(() => {
    const highest = Number(facets.priceRange.max || 0)
    if (!highest) return FALLBACK_MAX_PRICE
    if (!maxPriceParam && highest <= 10000) return Math.ceil(highest / 1000) * 1000
    if (!maxPriceParam && highest <= 100000) return Math.ceil(highest / 5000) * 5000
    if (!maxPriceParam) return Math.ceil(highest / 10000) * 10000
    return Math.max(Number(maxPriceParam) || 0, highest)
  }, [facets.priceRange.max, maxPriceParam])

  const priceStep = useMemo(() => {
    if (priceCeiling <= 10000) return 500
    if (priceCeiling <= 100000) return 2500
    return 5000
  }, [priceCeiling])

  useEffect(() => {
    setSearch(query)
    setMinPrice(minPriceParam || DEFAULT_MIN_PRICE)
    setMaxPrice(maxPriceParam || String(priceCeiling))
    setColors(colorsParam ? colorsParam.split(',').filter(Boolean) : [])
    setMaterials(materialsParam ? materialsParam.split(',').filter(Boolean) : [])
    setSort(sortParam || 'newest')
    setPage(Number(pageParam) || 1)
  }, [query, minPriceParam, maxPriceParam, colorsParam, materialsParam, sortParam, pageParam, priceCeiling])

  function buildFilterUrl(next: {
    query?: string
    category?: string
    minPrice?: string
    maxPrice?: string
    colors?: string[]
    materials?: string[]
    sort?: string
    page?: number
  }) {
    const params = new URLSearchParams()
    if (next.query) params.set('q', next.query)
    if (next.category) params.set('category', next.category)
    if (next.minPrice && next.minPrice !== DEFAULT_MIN_PRICE) params.set('minPrice', next.minPrice)
    if (next.maxPrice && Number(next.maxPrice) < priceCeiling) params.set('maxPrice', next.maxPrice)
    if (next.colors?.length) params.set('colors', next.colors.join(','))
    if (next.materials?.length) params.set('materials', next.materials.join(','))
    if (next.sort) params.set('sort', next.sort)
    if ((next.page || 1) > 1) params.set('page', String(next.page))
    params.set('limit', '12')
    const qs = params.toString()
    return `/productfilter${qs ? `?${qs}` : ''}`
  }

  function toggleValue(list: string[], value: string) {
    return list.includes(value) ? list.filter((item) => item !== value) : [...list, value]
  }

  function applyFilters() {
    setPage(1)
    setMobileFiltersOpen(false)
    router.push(buildFilterUrl({ query: search, category, minPrice, maxPrice, colors, materials, sort, page: 1 }))
  }

  function clearFilters() {
    setSearch('')
    setMinPrice(DEFAULT_MIN_PRICE)
    setMaxPrice(String(priceCeiling))
    setColors([])
    setMaterials([])
    setSort('newest')
    setPage(1)
    setMobileFiltersOpen(false)
    router.push('/productfilter')
  }

  function applyBudget(nextMaxPrice: string) {
    setMaxPrice(nextMaxPrice)
    setPage(1)
    router.replace(
      buildFilterUrl({
        query,
        category,
        minPrice,
        maxPrice: nextMaxPrice,
        colors,
        materials,
        sort,
        page: 1,
      }),
      { scroll: false }
    )
  }

  const colorOptions = facets.colors
  const materialOptions = facets.materials

  const filtersContent = (
    <>
      <div className="flex items-center justify-between gap-4 border-b border-[#E8DCCB] pb-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[#8C7A6B]">Refine the Edit</p>
          <p className="mt-2 text-sm text-[#6B594A]">Shape the assortment around your room, material, and spend.</p>
        </div>
        <button type="button" onClick={clearFilters} className="rounded-full border border-[#7C4E2F] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#7C4E2F]">
          Clear
        </button>
      </div>

      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-[#8C7A6B]">Search</p>
        <div className="mt-3 flex items-center gap-2 rounded-full border border-[#E6D9C8] bg-white px-4 py-2">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." className="w-full bg-transparent text-sm text-[#2B2119] placeholder:text-[#8C7A6B] focus:outline-none" />
          <button type="button" onClick={applyFilters} className="rounded-full bg-[#7C4E2F] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-white">
            Go
          </button>
        </div>
      </div>

      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-[#8C7A6B]">Category</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" onClick={() => { setMobileFiltersOpen(false); router.push('/productfilter') }} className={`rounded-full border px-3 py-2 text-[10px] uppercase tracking-[0.3em] transition ${!category ? 'border-[#7C4E2F] bg-[#7C4E2F] text-white' : 'border-[#E6D9C8] text-[#8C7A6B] hover:border-[#7C4E2F]'}`}>
            All
          </button>
          {categories.map((item) => {
            const isActive = item.slug === category
            return (
              <button key={item.id} type="button" onClick={() => { setMobileFiltersOpen(false); router.push(`/productfilter?category=${item.slug}`) }} className={`rounded-full border px-3 py-2 text-[10px] uppercase tracking-[0.3em] transition ${isActive ? 'border-[#7C4E2F] bg-[#7C4E2F] text-white' : 'border-[#E6D9C8] text-[#8C7A6B] hover:border-[#7C4E2F]'}`}>
                {item.name}
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-[#8C7A6B]">Sort</p>
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="mt-3 h-10 w-full rounded-full border border-[#E6D9C8] bg-white px-4 text-sm">
          <option value="newest">Newest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="rating">Top Rated</option>
        </select>
      </div>

      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-[#8C7A6B]">Budget</p>
        <div className="mt-4 space-y-3">
          <div className="rounded-[1.75rem] border border-[#E6D9C8] bg-white px-4 py-3 text-sm text-[#6B594A]">
            <div className="flex items-center justify-between gap-3">
              <span>Showing pieces up to</span>
              <span className="font-semibold text-[#2B2119]">N{Number(maxPrice || priceCeiling).toLocaleString()}</span>
            </div>
          </div>
          <input type="range" min="0" max={priceCeiling} step={priceStep} value={Number(maxPrice || priceCeiling)} onChange={(e) => applyBudget(e.target.value)} className="w-full" />
          <div className="flex items-center justify-between text-[11px] text-[#8C7A6B]">
            <span>N0</span>
            <span>N{priceCeiling.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-[#8C7A6B]">Color</p>
        <div className="mt-4 flex flex-wrap gap-3">
          {colorOptions.map((family) => {
            const active = colors.includes(family)
            return (
              <button key={family} type="button" onClick={() => setColors((prev) => toggleValue(prev, family))} className={`flex items-center gap-2 rounded-full border px-3 py-2 text-[10px] uppercase tracking-[0.3em] transition ${active ? 'border-[#7C4E2F] bg-[#7C4E2F]/5 text-[#7C4E2F] ring-1 ring-[#7C4E2F]' : 'border-[#E6D9C8] text-[#8C7A6B] hover:border-[#7C4E2F]'}`} title={family}>
                <span className="h-5 w-5 rounded-full border shadow-sm" style={{ backgroundColor: getColorFamilySwatch(family) }} />
                <span>{family}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-[#8C7A6B]">Materials</p>
        <div className="mt-4 space-y-2 text-sm text-[#6B594A]">
          {materialOptions.map((material) => (
            <label key={material} className="flex items-center gap-2">
              <input type="checkbox" checked={materials.includes(material)} onChange={() => setMaterials((prev) => toggleValue(prev, material))} />
              {material}
            </label>
          ))}
        </div>
      </div>

      <button type="button" onClick={applyFilters} className="w-full rounded-full bg-[#7C4E2F] px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-white">
        Apply filters
      </button>
    </>
  )

  return (
    <div className="mx-auto max-w-7xl space-y-10 px-4 py-12 sm:px-6 sm:py-16">
      <div className="flex items-center justify-between gap-3">
        <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Shop' }]} />
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setMobileFiltersOpen(true)} className="inline-flex h-9 items-center justify-center rounded-full border border-[#E6D9C8] bg-white px-4 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#7C4E2F] transition lg:hidden">Filters</button>
          <button type="button" onClick={() => setViewMode('list')} className={`inline-flex h-9 w-9 items-center justify-center rounded-full border transition ${viewMode === 'list' ? 'border-[#7C4E2F] bg-[#7C4E2F] text-white' : 'border-[#E6D9C8] bg-white/70 text-[#7C4E2F]'}`} aria-label="List view">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 6h16M7 12h10M10 18h4" strokeLinecap="round" /></svg>
          </button>
          <button type="button" onClick={() => setViewMode('grid')} className={`inline-flex h-9 w-9 items-center justify-center rounded-full border transition ${viewMode === 'grid' ? 'border-[#7C4E2F] bg-[#7C4E2F] text-white' : 'border-[#E6D9C8] bg-white/70 text-[#7C4E2F]'}`} aria-label="Grid view">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" strokeLinecap="round" /></svg>
          </button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
        <aside className="hidden space-y-6 rounded-[2rem] border border-[#E6D9C8] bg-[linear-gradient(180deg,#f7f0e6,#fff)] p-6 shadow-[0_20px_60px_-50px_rgba(55,32,15,0.4)] lg:block">
          {filtersContent}
        </aside>

        <section className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-[28px] border border-[#E6D9C8] bg-white px-5 py-4 text-xs uppercase tracking-[0.3em] text-[#8C7A6B] shadow-sm">
            <span>{total} results</span>
            <div className="flex flex-wrap items-center gap-2">
              {category ? <span className="rounded-full bg-[#F4EEE4] px-3 py-2 text-[10px] text-[#7C4E2F]">{category}</span> : null}
              {colors.length ? <span className="rounded-full bg-[#F4EEE4] px-3 py-2 text-[10px] text-[#7C4E2F]">{colors.length} colors</span> : null}
              {materials.length ? <span className="rounded-full bg-[#F4EEE4] px-3 py-2 text-[10px] text-[#7C4E2F]">{materials.length} materials</span> : null}
              <span>{sort.replace('_', ' ')}</span>
            </div>
          </div>

          <div className={`grid gap-4 sm:gap-6 ${viewMode === 'grid' ? 'grid-cols-2 2xl:grid-cols-3' : 'grid-cols-1'}`}>
            {products.map((product) => (
              <ProductCard key={product.id} product={product} variant={viewMode} />
            ))}
          </div>

          {!products.length ? (
            <StateCard
              eyebrow="Curated Browse"
              title="No products matched this direction"
              description="Try widening the budget, removing a filter, or exploring a broader collection view."
              actionHref="/productfilter"
              actionLabel="Reset browse"
              compact
            />
          ) : null}

          {products.length > 0 ? (
            <div className="flex items-center justify-between rounded-3xl border border-[#E6D9C8] bg-white px-6 py-4 text-xs uppercase tracking-[0.3em] text-[#8C7A6B] shadow-sm">
              <button
                type="button"
                onClick={() => {
                  const nextPage = Math.max(1, page - 1)
                  const params = new URLSearchParams()
                  if (query) params.set('q', query)
                  if (category) params.set('category', category)
                  if (minPriceParam) params.set('minPrice', minPriceParam)
                  if (maxPriceParam) params.set('maxPrice', maxPriceParam)
                  if (colorsParam) params.set('colors', colorsParam)
                  if (materialsParam) params.set('materials', materialsParam)
                  if (sortParam) params.set('sort', sortParam)
                  if (nextPage > 1) params.set('page', String(nextPage))
                  params.set('limit', '12')
                  router.push(`/productfilter?${params.toString()}`)
                }}
                disabled={page <= 1}
                className={`rounded-full border px-4 py-2 ${page <= 1 ? 'border-[#E6D9C8] text-[#C1B4A4]' : 'border-[#7C4E2F] text-[#7C4E2F]'}`}
              >
                Prev
              </button>
              <span>Page {page} / {Math.max(1, Math.ceil(total / 12))}</span>
              <button
                type="button"
                onClick={() => {
                  const totalPages = Math.max(1, Math.ceil(total / 12))
                  const nextPage = Math.min(totalPages, page + 1)
                  const params = new URLSearchParams()
                  if (query) params.set('q', query)
                  if (category) params.set('category', category)
                  if (minPriceParam) params.set('minPrice', minPriceParam)
                  if (maxPriceParam) params.set('maxPrice', maxPriceParam)
                  if (colorsParam) params.set('colors', colorsParam)
                  if (materialsParam) params.set('materials', materialsParam)
                  if (sortParam) params.set('sort', sortParam)
                  if (nextPage > 1) params.set('page', String(nextPage))
                  params.set('limit', '12')
                  router.push(`/productfilter?${params.toString()}`)
                }}
                disabled={page >= Math.max(1, Math.ceil(total / 12))}
                className={`rounded-full border px-4 py-2 ${page >= Math.max(1, Math.ceil(total / 12)) ? 'border-[#E6D9C8] text-[#C1B4A4]' : 'border-[#7C4E2F] text-[#7C4E2F]'}`}
              >
                Next
              </button>
            </div>
          ) : null}
        </section>
      </div>

      {mobileFiltersOpen ? (
        <div className="fixed inset-0 z-[80] lg:hidden">
          <button type="button" aria-label="Close filters" className="absolute inset-0 bg-[#2B2119]/45 backdrop-blur-sm" onClick={() => setMobileFiltersOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 top-0 overflow-y-auto bg-[#F8F2EA] px-5 pb-10 pt-6 shadow-[0_-30px_80px_-40px_rgba(43,33,25,0.6)]">
            <div className="mx-auto mb-5 h-1.5 w-16 rounded-full bg-[#D8C7B3]" />
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[#8C7A6B]">Mobile Refine</p>
                <h2 className="mt-2 font-display text-2xl text-[#2B2119]">Filter products</h2>
              </div>
              <button type="button" onClick={() => setMobileFiltersOpen(false)} className="rounded-full border border-[#E6D9C8] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#7C4E2F]">
                Close
              </button>
            </div>
            <div className="space-y-6 rounded-[2rem] border border-[#E6D9C8] bg-[linear-gradient(180deg,#f7f0e6,#fff)] p-5">
              {filtersContent}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
