'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import ProductCard from '@/app/_components/ProductCard'
import Breadcrumb from '@/app/_components/Breadcrumb'
import ProductSkeleton from '@/app/_components/ProductSkeleton'
import { getColorFamily, getColorFamilySwatch } from '@/lib/utils/color-name'
import type { Product } from '@/types/catalog'

type Category = {
  id: string
  slug: string
  name: string
}

const DEFAULT_MIN_PRICE = '0'
const FALLBACK_MAX_PRICE = 500000

function ProductFilterContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const query = searchParams.get('q') || ''
  const category = searchParams.get('category') || ''
  const minPriceParam = searchParams.get('minPrice') || ''
  const maxPriceParam = searchParams.get('maxPrice') || ''
  const colorsParam = searchParams.get('colors') || ''
  const materialsParam = searchParams.get('materials') || ''
  const sortParam = searchParams.get('sort') || 'newest'
  const pageParam = searchParams.get('page') || '1'

  const [search, setSearch] = useState(query)
  const [minPrice, setMinPrice] = useState(minPriceParam || DEFAULT_MIN_PRICE)
  const [maxPrice, setMaxPrice] = useState(maxPriceParam || '')
  const [colors, setColors] = useState<string[]>(colorsParam ? colorsParam.split(',').filter(Boolean) : [])
  const [materials, setMaterials] = useState<string[]>(materialsParam ? materialsParam.split(',').filter(Boolean) : [])
  const [sort, setSort] = useState(sortParam)
  const [page, setPage] = useState(Number(pageParam) || 1)
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [filterProducts, setFilterProducts] = useState<Product[]>([])
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

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

  const priceCeiling = useMemo(() => {
    const highest = Math.max(
      ...filterProducts.map((product) => Number(product.finalPrice ?? product.price ?? 0)),
      0
    )

    if (!highest) return FALLBACK_MAX_PRICE
    if (highest <= 10000) return Math.ceil(highest / 1000) * 1000
    if (highest <= 100000) return Math.ceil(highest / 5000) * 5000
    return Math.ceil(highest / 10000) * 10000
  }, [filterProducts])

  const priceStep = useMemo(() => {
    if (priceCeiling <= 10000) return 500
    if (priceCeiling <= 100000) return 2500
    return 5000
  }, [priceCeiling])

  const url = useMemo(() => {
    const params = new URLSearchParams()
    if (query) params.set('q', query)
    if (category) params.set('category', category)
    if (minPrice && minPrice !== DEFAULT_MIN_PRICE) params.set('minPrice', minPrice)
    if (maxPrice && Number(maxPrice) < priceCeiling) params.set('maxPrice', maxPrice)
    if (colors.length) params.set('colors', colors.join(','))
    if (materials.length) params.set('materials', materials.join(','))
    if (sort) params.set('sort', sort)
    if (page > 1) params.set('page', String(page))
    params.set('limit', '12')
    const qs = params.toString()
    return `/api/products${qs ? `?${qs}` : ''}`
  }, [query, category, minPrice, maxPrice, colors, materials, sort, page, priceCeiling])

  useEffect(() => {
    let active = true
    async function load() {
      setLoading(true)
      const [catRes, prodRes, filterRes] = await Promise.all([
        fetch('/api/categories'),
        fetch(url),
        fetch('/api/products'),
      ])
      const catJson = await catRes.json()
      const prodJson = await prodRes.json()
      const filterJson = await filterRes.json().catch(() => ({}))
      if (!active) return
      setCategories(catJson.categories ?? [])
      setProducts(prodJson.products ?? [])
      setTotal(prodJson.total ?? prodJson.count ?? 0)
      setFilterProducts(filterJson.products ?? [])
      setLoading(false)
    }
    load()
    return () => {
      active = false
    }
  }, [url])

  useEffect(() => {
    if (!maxPriceParam) {
      setMaxPrice(String(priceCeiling))
    }
  }, [maxPriceParam, priceCeiling])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(query)
      setMinPrice(minPriceParam || DEFAULT_MIN_PRICE)
      setMaxPrice(maxPriceParam || String(priceCeiling))
      setColors(colorsParam ? colorsParam.split(',').filter(Boolean) : [])
      setMaterials(materialsParam ? materialsParam.split(',').filter(Boolean) : [])
      setSort(sortParam || 'newest')
      setPage(Number(pageParam) || 1)
    }, 0)

    return () => window.clearTimeout(timer)
  }, [query, minPriceParam, maxPriceParam, colorsParam, materialsParam, sortParam, pageParam, priceCeiling])

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

  const colorOptions = useMemo(() => {
    const allColors = filterProducts.flatMap((product) => [
      ...(product.palette ?? []),
      ...((product.variants ?? []).map((variant) => variant.color).filter(Boolean) as string[]),
    ])
    return Array.from(new Set(allColors.map((color) => getColorFamily(color)))).sort()
  }, [filterProducts])

  const materialOptions = useMemo(() => {
    const allMaterials = filterProducts.flatMap((product) => [
      ...(product.materials ?? []),
      ...((product.variants ?? []).flatMap((variant) => variant.materials ?? [])),
    ])
    const normalized = new Map<string, string>()
    allMaterials.forEach((material) => {
      const clean = String(material || '').trim()
      if (!clean) return
      const key = clean.toLowerCase()
      if (!normalized.has(key)) normalized.set(key, clean)
    })
    return Array.from(normalized.values()).sort((left, right) => left.localeCompare(right))
  }, [filterProducts])

  const filtersContent = (
    <>
      <div className="flex items-center justify-between gap-4">
        <p className="text-xs uppercase tracking-[0.3em] text-[#8C7A6B]">Filter selection</p>
        <button
          type="button"
          onClick={clearFilters}
          className="rounded-full border border-[#7C4E2F] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#7C4E2F]"
        >
          Clear
        </button>
      </div>

      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-[#8C7A6B]">Search</p>
        <div className="mt-3 flex items-center gap-2 rounded-full border border-[#E6D9C8] bg-white px-4 py-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="w-full bg-transparent text-sm text-[#2B2119] placeholder:text-[#8C7A6B] focus:outline-none"
          />
          <button
            type="button"
            onClick={applyFilters}
            className="rounded-full bg-[#7C4E2F] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-white"
          >
            Go
          </button>
        </div>
      </div>

      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-[#8C7A6B]">Category</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              setMobileFiltersOpen(false)
              router.push('/productfilter')
            }}
            className={`rounded-full border px-3 py-2 text-[10px] uppercase tracking-[0.3em] transition ${
              !category ? 'border-[#7C4E2F] bg-[#7C4E2F] text-white' : 'border-[#E6D9C8] text-[#8C7A6B] hover:border-[#7C4E2F]'
            }`}
          >
            All
          </button>
          {loading && !categories.length ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-8 w-20 animate-pulse rounded-full bg-[#E6D9C8]" />
            ))
          ) : (
            categories.map((item) => {
              const isActive = item.slug === category
              return (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => {
                    setMobileFiltersOpen(false)
                    router.push(`/productfilter?category=${item.slug}`)
                  }}
                  className={`rounded-full border px-3 py-2 text-[10px] uppercase tracking-[0.3em] transition ${
                    isActive
                      ? 'border-[#7C4E2F] bg-[#7C4E2F] text-white'
                      : 'border-[#E6D9C8] text-[#8C7A6B] hover:border-[#7C4E2F]'
                  }`}
                >
                  {item.name}
                </button>
              )
            })
          )}
        </div>
      </div>

      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-[#8C7A6B]">Sort</p>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="mt-3 h-10 w-full rounded-full border border-[#E6D9C8] bg-white px-4 text-sm"
        >
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
          <input
            type="range"
            min="0"
            max={priceCeiling}
            step={priceStep}
            value={Number(maxPrice || priceCeiling)}
            onChange={(e) => applyBudget(e.target.value)}
            className="w-full"
          />
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
              <button
                key={family}
                type="button"
                onClick={() => setColors((prev) => toggleValue(prev, family))}
                className={`flex items-center gap-2 rounded-full border px-3 py-2 text-[10px] uppercase tracking-[0.3em] transition ${
                  active ? 'border-[#7C4E2F] bg-[#7C4E2F]/5 text-[#7C4E2F] ring-1 ring-[#7C4E2F]' : 'border-[#E6D9C8] text-[#8C7A6B] hover:border-[#7C4E2F]'
                }`}
                title={family}
              >
                <span className="h-5 w-5 rounded-full border shadow-sm" style={{ backgroundColor: getColorFamilySwatch(family) }} />
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
              <input
                type="checkbox"
                checked={materials.includes(material)}
                onChange={() => setMaterials((prev) => toggleValue(prev, material))}
              />
              {material}
            </label>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={applyFilters}
        className="w-full rounded-full bg-[#7C4E2F] px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-white"
      >
        Apply filters
      </button>
    </>
  )

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-12 sm:px-6 sm:py-16">
      <div className="flex items-center justify-between gap-3">
        <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Shop' }]} />
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMobileFiltersOpen(true)}
            className="inline-flex h-9 items-center justify-center rounded-full border border-[#E6D9C8] bg-white px-4 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#7C4E2F] transition lg:hidden"
          >
            Filters
          </button>
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`inline-flex h-9 w-9 items-center justify-center rounded-full border transition ${viewMode === 'list' ? 'border-[#7C4E2F] bg-[#7C4E2F] text-white' : 'border-[#E6D9C8] bg-white/70 text-[#7C4E2F]'}`}
            aria-label="List view"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M4 6h16M7 12h10M10 18h4" strokeLinecap="round" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={`inline-flex h-9 w-9 items-center justify-center rounded-full border transition ${viewMode === 'grid' ? 'border-[#7C4E2F] bg-[#7C4E2F] text-white' : 'border-[#E6D9C8] bg-white/70 text-[#7C4E2F]'}`}
            aria-label="Grid view"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
        <aside className="hidden space-y-6 rounded-[2rem] border border-[#E6D9C8] bg-[#F4EEE4] p-6 lg:block">
          {filtersContent}
        </aside>

        <section className="space-y-6">
          <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-[#8C7A6B]">
            <span>{loading ? 'Search...' : `${total} results`}</span>
            <span>{sort.replace('_', ' ')}</span>
          </div>

          {loading ? (
            <div className={`grid gap-8 ${viewMode === 'grid' ? 'md:grid-cols-2 2xl:grid-cols-3' : 'grid-cols-1'}`}>
              {Array.from({ length: 9 }).map((_, i) => (
                <ProductSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className={`grid gap-6 ${viewMode === 'grid' ? 'md:grid-cols-2 2xl:grid-cols-3' : 'grid-cols-1'}`}>
              {products.map((product) => (
                <ProductCard key={product.id} product={product} variant={viewMode} />
              ))}
            </div>
          )}

          {!loading && products.length === 0 ? (
            <div className="rounded-[28px] border border-[#E6D9C8] bg-white p-12 text-center text-sm text-[#6B594A] shadow-sm">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="mx-auto mb-4 h-12 w-12 opacity-20">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              No products found. Try adjusting your filters.
            </div>
          ) : null}

          {!loading && products.length > 0 ? (
            <div className="flex items-center justify-between rounded-3xl border border-[#E6D9C8] bg-white px-6 py-4 text-xs uppercase tracking-[0.3em] text-[#8C7A6B] shadow-sm">
              <button
                type="button"
                onClick={() => {
                  const nextPage = Math.max(1, page - 1)
                  const params = new URLSearchParams(searchParams.toString())
                  if (nextPage <= 1) params.delete('page')
                  else params.set('page', String(nextPage))
                  params.set('limit', '12')
                  router.push(`/productfilter?${params.toString()}`)
                }}
                disabled={page <= 1}
                className={`rounded-full border px-4 py-2 ${page <= 1 ? 'border-[#E6D9C8] text-[#C1B4A4]' : 'border-[#7C4E2F] text-[#7C4E2F]'}`}
              >
                Prev
              </button>
              <span>
                Page {page} / {Math.max(1, Math.ceil(total / 12))}
              </span>
              <button
                type="button"
                onClick={() => {
                  const totalPages = Math.max(1, Math.ceil(total / 12))
                  const nextPage = Math.min(totalPages, page + 1)
                  const params = new URLSearchParams(searchParams.toString())
                  params.set('page', String(nextPage))
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
          <button
            type="button"
            aria-label="Close filters"
            className="absolute inset-0 bg-[#2B2119]/45 backdrop-blur-sm"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-0 top-0 overflow-y-auto bg-[#F8F2EA] px-5 pb-10 pt-6 shadow-[0_-30px_80px_-40px_rgba(43,33,25,0.6)]">
            <div className="mx-auto mb-5 h-1.5 w-16 rounded-full bg-[#D8C7B3]" />
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[#8C7A6B]">Mobile Refine</p>
                <h2 className="mt-2 font-display text-2xl text-[#2B2119]">Filter products</h2>
              </div>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="rounded-full border border-[#E6D9C8] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#7C4E2F]"
              >
                Close
              </button>
            </div>
            <div className="space-y-6 rounded-[2rem] border border-[#E6D9C8] bg-[#F4EEE4] p-5">
              {filtersContent}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default function ProductFilterPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-6 py-16 text-sm text-[#6B594A]">
          Loading filters...
        </div>
      }
    >
      <ProductFilterContent />
    </Suspense>
  )
}
