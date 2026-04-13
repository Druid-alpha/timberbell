'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import SectionHeading from '@/app/_components/SectionHeading'
import ProductCard from '@/app/_components/ProductCard'

type Category = {
  id: string
  slug: string
  name: string
}

type Product = {
  id: string
  name: string
  price: number
  category: string
  description: string
  palette?: string[]
  materials?: string[]
  finishes?: string[]
}

const colorOptions = [
  { label: 'Cream', value: '#F2EBDD' },
  { label: 'Olive', value: '#8B9A78' },
  { label: 'Walnut', value: '#8B6A4E' },
  { label: 'Sand', value: '#E6D8C7' },
  { label: 'Charcoal', value: '#5B5A52' },
  { label: 'White', value: '#F9F7F2' },
]

const materialOptions = ['Oak', 'Walnut', 'Boucle', 'Linen', 'Leather', 'Stone']
const finishOptions = ['Matte', 'Natural', 'Brushed', 'Polished', 'Smoked', 'Waxed']

function ProductFilterContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const query = searchParams.get('q') || ''
  const category = searchParams.get('category') || ''
  const minPriceParam = searchParams.get('minPrice') || ''
  const maxPriceParam = searchParams.get('maxPrice') || ''
  const colorsParam = searchParams.get('colors') || ''
  const materialsParam = searchParams.get('materials') || ''
  const finishesParam = searchParams.get('finishes') || ''
  const sortParam = searchParams.get('sort') || 'newest'

  const [search, setSearch] = useState(query)
  const [minPrice, setMinPrice] = useState(minPriceParam || '0')
  const [maxPrice, setMaxPrice] = useState(maxPriceParam || '5000')
  const [colors, setColors] = useState<string[]>(
    colorsParam ? colorsParam.split(',').filter(Boolean) : []
  )
  const [materials, setMaterials] = useState<string[]>(
    materialsParam ? materialsParam.split(',').filter(Boolean) : []
  )
  const [finishes, setFinishes] = useState<string[]>(
    finishesParam ? finishesParam.split(',').filter(Boolean) : []
  )
  const [sort, setSort] = useState(sortParam)

  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [suggestions, setSuggestions] = useState<Product[]>([])
  const [suggestOpen, setSuggestOpen] = useState(false)

  const url = useMemo(() => {
    const params = new URLSearchParams()
    if (query) params.set('q', query)
    if (category) params.set('category', category)
    if (minPrice) params.set('minPrice', minPrice)
    if (maxPrice) params.set('maxPrice', maxPrice)
    if (colors.length) params.set('colors', colors.join(','))
    if (materials.length) params.set('materials', materials.join(','))
    if (finishes.length) params.set('finishes', finishes.join(','))
    if (sort) params.set('sort', sort)
    const qs = params.toString()
    return `/api/products${qs ? `?${qs}` : ''}`
  }, [query, category, minPrice, maxPrice, colors, materials, finishes, sort])

  useEffect(() => {
    let active = true

    async function load() {
      setLoading(true)
      const [catRes, prodRes] = await Promise.all([fetch('/api/categories'), fetch(url)])
      const catJson = await catRes.json()
      const prodJson = await prodRes.json()

      if (!active) return
      setCategories(catJson.categories ?? [])
      setProducts(prodJson.products ?? [])
      setLoading(false)
    }

    load()

    return () => {
      active = false
    }
  }, [url])

  useEffect(() => {
    if (!search || search.trim().length < 2) {
      setSuggestions([])
      setSuggestOpen(false)
      return
    }

    const handle = setTimeout(async () => {
      const res = await fetch(`/api/products?q=${encodeURIComponent(search)}&limit=5`)
      const json = await res.json().catch(() => ({}))
      setSuggestions(json?.products ?? [])
      setSuggestOpen(true)
    }, 250)

    return () => clearTimeout(handle)
  }, [search])

  useEffect(() => {
    setSearch(query)
    setMinPrice(minPriceParam || '0')
    setMaxPrice(maxPriceParam || '5000')
    setColors(colorsParam ? colorsParam.split(',').filter(Boolean) : [])
    setMaterials(materialsParam ? materialsParam.split(',').filter(Boolean) : [])
    setFinishes(finishesParam ? finishesParam.split(',').filter(Boolean) : [])
    setSort(sortParam || 'newest')
  }, [query, minPriceParam, maxPriceParam, colorsParam, materialsParam, finishesParam])

  function toggleValue(list: string[], value: string) {
    return list.includes(value) ? list.filter((item) => item !== value) : [...list, value]
  }

  function buildParams(overrides?: Partial<{
    search: string
    minPrice: string
    maxPrice: string
    colors: string[]
    materials: string[]
    finishes: string[]
    sort: string
  }>) {
    const params = new URLSearchParams()
    const nextSearch = overrides?.search ?? search
    const nextMin = overrides?.minPrice ?? minPrice
    const nextMax = overrides?.maxPrice ?? maxPrice
    const nextColors = overrides?.colors ?? colors
    const nextMaterials = overrides?.materials ?? materials
    const nextFinishes = overrides?.finishes ?? finishes
    const nextSort = overrides?.sort ?? sort

    if (nextSearch) params.set('q', nextSearch)
    if (category) params.set('category', category)
    if (nextMin) params.set('minPrice', nextMin)
    if (nextMax) params.set('maxPrice', nextMax)
    if (nextColors.length) params.set('colors', nextColors.join(','))
    if (nextMaterials.length) params.set('materials', nextMaterials.join(','))
    if (nextFinishes.length) params.set('finishes', nextFinishes.join(','))
    if (nextSort) params.set('sort', nextSort)
    return params
  }

  function applyFilters(overrides?: Partial<{
    search: string
    minPrice: string
    maxPrice: string
    colors: string[]
    materials: string[]
    finishes: string[]
    sort: string
  }>) {
    const params = buildParams(overrides)
    const qs = params.toString()
    router.push(`/productfilter${qs ? `?${qs}` : ''}`)
  }

  function clearFilters() {
    setSearch('')
    setMinPrice('0')
    setMaxPrice('5000')
    setColors([])
    setMaterials([])
    setFinishes([])
    setSort('newest')
    router.push('/productfilter')
  }

  const histogram = useMemo(() => {
    if (!products.length) return []
    const prices = products.map((p) => p.price).filter((p) => typeof p === 'number') as number[]
    if (!prices.length) return []
    const min = Math.min(...prices)
    const max = Math.max(...prices)
    const bucketCount = 6
    const step = Math.max(1, Math.ceil((max - min) / bucketCount))
    const buckets = Array.from({ length: bucketCount }, (_, i) => ({
      label: `$${min + i * step}`,
      count: 0,
    }))
    prices.forEach((price) => {
      const index = Math.min(bucketCount - 1, Math.floor((price - min) / step))
      buckets[index].count += 1
    })
    const maxCount = Math.max(...buckets.map((b) => b.count), 1)
    return buckets.map((bucket) => ({
      ...bucket,
      percent: Math.round((bucket.count / maxCount) * 100),
    }))
  }, [products])

  const activeFilters = useMemo(() => {
    const pills: { label: string; onRemove: () => void }[] = []

    if (query) {
      pills.push({
        label: `Search: ${query}`,
        onRemove: () => {
          const params = new URLSearchParams(searchParams.toString())
          params.delete('q')
          router.push(`/productfilter?${params.toString()}`)
        },
      })
    }

    if (category) {
      pills.push({
        label: `Category: ${category}`,
        onRemove: () => {
          const params = new URLSearchParams(searchParams.toString())
          params.delete('category')
          router.push(`/productfilter?${params.toString()}`)
        },
      })
    }

    if (minPrice || maxPrice) {
      pills.push({
        label: `Price: ${minPrice || 0}-${maxPrice || 5000}`,
        onRemove: () => {
          const params = new URLSearchParams(searchParams.toString())
          params.delete('minPrice')
          params.delete('maxPrice')
          router.push(`/productfilter?${params.toString()}`)
        },
      })
    }

    if (colorsParam) {
      colorsParam.split(',').filter(Boolean).forEach((color) => {
        pills.push({
          label: `Color: ${color}`,
          onRemove: () => {
            const next = colorsParam
              .split(',')
              .filter((c) => c && c !== color)
              .join(',')
            const params = new URLSearchParams(searchParams.toString())
            if (next) params.set('colors', next)
            else params.delete('colors')
            router.push(`/productfilter?${params.toString()}`)
          },
        })
      })
    }

    if (materialsParam) {
      materialsParam.split(',').filter(Boolean).forEach((material) => {
        pills.push({
          label: `Material: ${material}`,
          onRemove: () => {
            const next = materialsParam
              .split(',')
              .filter((m) => m && m !== material)
              .join(',')
            const params = new URLSearchParams(searchParams.toString())
            if (next) params.set('materials', next)
            else params.delete('materials')
            router.push(`/productfilter?${params.toString()}`)
          },
        })
      })
    }

    if (finishesParam) {
      finishesParam.split(',').filter(Boolean).forEach((finish) => {
        pills.push({
          label: `Finish: ${finish}`,
          onRemove: () => {
            const next = finishesParam
              .split(',')
              .filter((f) => f && f !== finish)
              .join(',')
            const params = new URLSearchParams(searchParams.toString())
            if (next) params.set('finishes', next)
            else params.delete('finishes')
            router.push(`/productfilter?${params.toString()}`)
          },
        })
      })
    }

    if (sortParam && sortParam !== 'newest') {
      pills.push({
        label: `Sort: ${sortParam.replace('_', ' ')}`,
        onRemove: () => {
          const params = new URLSearchParams(searchParams.toString())
          params.delete('sort')
          router.push(`/productfilter?${params.toString()}`)
        },
      })
    }

    return pills
  }, [query, category, minPrice, maxPrice, colorsParam, materialsParam, finishesParam, sortParam, searchParams, router])

  return (
    <div className="mx-auto max-w-7xl space-y-10 px-6 py-16">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <SectionHeading
          eyebrow="Filter"
          title="Refine your furniture selections"
          description="Use filters to discover pieces by price, material, and palette."
        />
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/shop"
            className="rounded-full border border-[#E4DDCF] px-4 py-2 text-[10px] uppercase tracking-[0.3em] text-[#8A836F]"
          >
            Standard shop
          </Link>
          <button
            type="button"
            onClick={clearFilters}
            className="rounded-full border border-[#2A3320] px-4 py-2 text-[10px] font-bold uppercase tracking-[0.3em] text-[#2A3320]"
          >
            Clear filters
          </button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <aside className="space-y-6 rounded-[2rem] border border-[#E4DDCF] bg-[#FCFAF6] p-6">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[#8B9A78]">Search</p>
            <div className="mt-3 flex items-center gap-2 rounded-full border border-[#E4DDCF] bg-white px-4 py-2">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-full bg-transparent text-sm text-[#2A3320] placeholder:text-[#8A836F] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => applyFilters()}
                className="rounded-full bg-[#2A3320] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.3em] text-white"
              >
                Go
              </button>
            </div>
            {suggestOpen && suggestions.length ? (
              <div className="mt-2 rounded-2xl border border-[#E4DDCF] bg-white p-2 shadow-lg">
                {suggestions.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setSearch(item.name)
                      setSuggestOpen(false)
                      applyFilters({ search: item.name })
                    }}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm text-[#2A3320] transition hover:bg-[#F8F3EA]"
                  >
                    <span>{item.name}</span>
                    <span className="text-[10px] uppercase tracking-[0.3em] text-[#8A836F]">
                      {item.category}
                    </span>
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[#8B9A78]">Category</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => router.push('/productfilter')}
                className={`rounded-full border px-3 py-2 text-[10px] uppercase tracking-[0.3em] ${
                  !category ? 'border-[#2A3320] text-[#2A3320]' : 'border-[#E4DDCF] text-[#8A836F]'
                }`}
              >
                All
              </button>
              {categories.map((item) => {
                const isActive = item.slug === category
                return (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => router.push(`/productfilter?category=${item.slug}`)}
                    className={`rounded-full border px-3 py-2 text-[10px] uppercase tracking-[0.3em] ${
                      isActive
                        ? 'border-[#2A3320] text-[#2A3320]'
                        : 'border-[#E4DDCF] text-[#8A836F]'
                    }`}
                  >
                    {item.name}
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[#8B9A78]">Sort</p>
            <select
              value={sort}
              onChange={(e) => {
                const value = e.target.value
                setSort(value)
                applyFilters({ sort: value })
              }}
              className="mt-3 h-10 w-full rounded-full border border-[#E4DDCF] bg-white px-4 text-sm"
            >
              <option value="newest">Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[#8B9A78]">Price range</p>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between text-sm text-[#6B665A]">
                <span>${minPrice}</span>
                <span>${maxPrice}</span>
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
              <div className="grid gap-2 sm:grid-cols-2">
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  placeholder="Min"
                  className="h-10 rounded-full border border-[#E4DDCF] bg-white px-3 text-sm"
                />
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="Max"
                  className="h-10 rounded-full border border-[#E4DDCF] bg-white px-3 text-sm"
                />
              </div>
              {histogram.length ? (
                <div className="mt-2 space-y-2">
                  {histogram.map((bucket) => (
                    <div key={bucket.label} className="flex items-center gap-3">
                      <div className="h-2 flex-1 rounded-full bg-[#EDE6DA]">
                        <div
                          className="h-2 rounded-full bg-[#2A3320]/70"
                          style={{ width: `${bucket.percent}%` }}
                        />
                      </div>
                      <span className="text-[10px] uppercase tracking-[0.3em] text-[#8A836F]">
                        {bucket.label}
                      </span>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[#8B9A78]">Color</p>
            <div className="mt-4 flex flex-wrap gap-3">
              {colorOptions.map((color) => {
                const active = colors.includes(color.value)
                return (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setColors((prev) => toggleValue(prev, color.value))}
                    className={`flex items-center gap-2 rounded-full border px-3 py-2 text-[10px] uppercase tracking-[0.3em] ${
                      active ? 'border-[#2A3320] text-[#2A3320]' : 'border-[#E4DDCF] text-[#8A836F]'
                    }`}
                  >
                    <span
                      className="h-3 w-3 rounded-full border border-[#E4DDCF]"
                      style={{ backgroundColor: color.value }}
                    />
                    {color.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[#8B9A78]">Materials</p>
            <div className="mt-4 space-y-2 text-sm text-[#6B665A]">
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

          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[#8B9A78]">Finishes</p>
            <div className="mt-4 space-y-2 text-sm text-[#6B665A]">
              {finishOptions.map((finish) => (
                <label key={finish} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={finishes.includes(finish)}
                    onChange={() => setFinishes((prev) => toggleValue(prev, finish))}
                  />
                  {finish}
                </label>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => applyFilters()}
            className="w-full rounded-full bg-[#2A3320] px-4 py-3 text-[10px] font-bold uppercase tracking-[0.3em] text-white"
          >
            Apply filters
          </button>
        </aside>

        <section className="space-y-6">
          <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-[#8A836F]">
            <span>{loading ? 'Loading results' : `${products.length} results`}</span>
            <span>{sort.replace('_', ' ')}</span>
          </div>
          {activeFilters.length ? (
            <div className="flex flex-wrap gap-2">
              {activeFilters.map((filter) => (
                <button
                  key={filter.label}
                  type="button"
                  onClick={filter.onRemove}
                  className="rounded-full border border-[#E4DDCF] bg-white/80 px-3 py-2 text-[10px] uppercase tracking-[0.3em] text-[#6B665A]"
                >
                  {filter.label} ×
                </button>
              ))}
            </div>
          ) : null}
          {loading ? (
            <div className="rounded-3xl border border-[#E4DDCF] bg-[#FCFAF6] p-8 text-center text-sm text-[#6B665A]">
              Loading products...
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {!loading && products.length === 0 ? (
            <div className="rounded-3xl border border-[#E4DDCF] bg-[#FCFAF6] p-8 text-center text-sm text-[#6B665A]">
              No products found. Try adjusting your filters.
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
        <div className="mx-auto max-w-7xl px-6 py-16 text-sm text-neutral-600">
          Loading filters...
        </div>
      }
    >
      <ProductFilterContent />
    </Suspense>
  )
}
