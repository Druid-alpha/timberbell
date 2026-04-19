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
  const [minPrice, setMinPrice] = useState(minPriceParam || '0')
  const [maxPrice, setMaxPrice] = useState(maxPriceParam || '5000')
  const [colors, setColors] = useState<string[]>(
    colorsParam ? colorsParam.split(',').filter(Boolean) : []
  )
  const [materials, setMaterials] = useState<string[]>(
    materialsParam ? materialsParam.split(',').filter(Boolean) : []
  )
  const [sort, setSort] = useState(sortParam)
  const [page, setPage] = useState(Number(pageParam) || 1)

  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [filterProducts, setFilterProducts] = useState<Product[]>([])

  const url = useMemo(() => {
    const params = new URLSearchParams()
    if (query) params.set('q', query)
    if (category) params.set('category', category)
    if (minPrice) params.set('minPrice', minPrice)
    if (maxPrice) params.set('maxPrice', maxPrice)
    if (colors.length) params.set('colors', colors.join(','))
    if (materials.length) params.set('materials', materials.join(','))
    if (sort) params.set('sort', sort)
    if (page > 1) params.set('page', String(page))
    params.set('limit', '12')
    const qs = params.toString()
    return `/api/products${qs ? `?${qs}` : ''}`
  }, [query, category, minPrice, maxPrice, colors, materials, sort, page])

  useEffect(() => {
    let active = true
    async function load() {
      setLoading(true)
      const [catRes, prodRes, filterRes] = await Promise.all([
        fetch('/api/categories'),
        fetch(url),
        fetch('/api/products?limit=100'),
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
    const timer = window.setTimeout(() => {
      setSearch(query)
      setMinPrice(minPriceParam || '0')
      setMaxPrice(maxPriceParam || '5000')
      setColors(colorsParam ? colorsParam.split(',').filter(Boolean) : [])
      setMaterials(materialsParam ? materialsParam.split(',').filter(Boolean) : [])
      setSort(sortParam || 'newest')
      setPage(Number(pageParam) || 1)
    }, 0)

    return () => window.clearTimeout(timer)
  }, [query, minPriceParam, maxPriceParam, colorsParam, materialsParam, sortParam, pageParam])

  function toggleValue(list: string[], value: string) {
    return list.includes(value) ? list.filter((item) => item !== value) : [...list, value]
  }

  function applyFilters() {
    setPage(1)
    const params = new URLSearchParams()
    if (search) params.set('q', search)
    if (category) params.set('category', category)
    if (minPrice) params.set('minPrice', minPrice)
    if (maxPrice) params.set('maxPrice', maxPrice)
    if (colors.length) params.set('colors', colors.join(','))
    if (materials.length) params.set('materials', materials.join(','))
    if (sort) params.set('sort', sort)
    params.set('limit', '12')
    const qs = params.toString()
    router.push(`/productfilter${qs ? `?${qs}` : ''}`)
  }

  function clearFilters() {
    setSearch('')
    setMinPrice('0')
    setMaxPrice('5000')
    setColors([])
    setMaterials([])
    setSort('newest')
    setPage(1)
    router.push('/productfilter')
  }

  const colorOptions = useMemo(() => {
    const allColors = filterProducts.flatMap((product) => [
      ...(product.palette ?? []),
      ...((product.variants ?? []).map((variant) => variant.color).filter(Boolean) as string[]),
    ])
    return Array.from(new Set(allColors.map((color) => getColorFamily(color)))).slice(0, 8)
  }, [filterProducts])

  const materialOptions = useMemo(() => {
    const allMaterials = filterProducts.flatMap((product) => [
      ...(product.materials ?? []),
      ...((product.variants ?? []).flatMap((variant) => variant.materials ?? [])),
    ])
    return Array.from(new Set(allMaterials)).sort()
  }, [filterProducts])

  return (
    <div className="mx-auto max-w-7xl space-y-12 px-6 py-16">
      <div className="flex items-center justify-between">
        <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Shop' }]} />
        <div className="flex items-center gap-2">
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
        <aside className="space-y-6 rounded-[2rem] border border-[#E6D9C8] bg-[#F4EEE4] p-6">
          <div className="flex items-center justify-between gap-4">
            <p className="text-xs uppercase tracking-[0.3em] text-[#8C7A6B]">Refine selection</p>
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
                onClick={() => router.push('/productfilter')}
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
                      onClick={() => router.push(`/productfilter?category=${item.slug}`)}
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
              onChange={(e) => {
                const value = e.target.value
                setSort(value)
                applyFilters()
              }}
              className="mt-3 h-10 w-full rounded-full border border-[#E6D9C8] bg-white px-4 text-sm"
            >
              <option value="newest">Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[#8C7A6B]">Price range</p>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between rounded-full border border-[#E6D9C8] bg-white px-4 py-3 text-sm text-[#6B594A]">
                <span>₦{Number(minPrice || 0).toLocaleString()}</span>
                <span className="text-[#C5A070]">to</span>
                <span>₦{Number(maxPrice || 0).toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="0"
                max="5000"
                step="50"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full"
              />
              <input
                type="range"
                min="0"
                max="5000"
                step="50"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full"
              />
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
                    <span
                      className="h-5 w-5 rounded-full border shadow-sm"
                      style={{ backgroundColor: getColorFamilySwatch(family) }}
                    />
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
