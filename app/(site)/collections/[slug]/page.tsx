'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import SectionHeading from '@/app/_components/SectionHeading'
import ProductCard from '@/app/_components/ProductCard'
import Breadcrumb from '@/app/_components/Breadcrumb'
import type { Product } from '@/types/catalog'

type Category = {
  id: string
  slug: string
  name: string
  description?: string
}

export default function CollectionPage() {
  const params = useParams<{ slug: string }>()
  const [products, setProducts] = useState<Product[]>([])
  const [category, setCategory] = useState<Category | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!params?.slug) return

    let active = true

    async function load() {
      setLoading(true)
      const [categoryRes, productRes] = await Promise.all([
        fetch('/api/categories'),
        fetch(`/api/products?category=${params.slug}`),
      ])

      const categoryJson = await categoryRes.json()
      const productJson = await productRes.json()

      if (!active) return

      setProducts(productJson.products ?? [])
      const match = (categoryJson.categories ?? []).find(
        (item: Category) => item.slug === params.slug
      )
      setCategory(match ?? null)
      setLoading(false)
    }

    load()

    return () => {
      active = false
    }
  }, [params?.slug])

  return (
    <div className="mx-auto max-w-7xl space-y-12 px-6 py-16">
      <div className="flex flex-col gap-6">
        <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Collections', href: '/collections' }, { label: category?.name || 'Collection' }]} />
        <SectionHeading
          eyebrow="Collection"
          title={category ? category.name : 'Collection'}
          description={
            category?.description || 'Curated pieces designed to create a layered, welcoming home.'
          }
        />
      </div>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-[400px] w-full animate-pulse rounded-[28px] bg-[#E6D9C8]/40" />
          ))}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {!loading && products.length === 0 ? (
        <div className="rounded-[28px] border border-[#E6D9C8] bg-white p-12 text-center text-sm text-[#6B594A] shadow-sm">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="mx-auto mb-4 h-12 w-12 opacity-20">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          No products yet in this collection.
        </div>
      ) : null}
    </div>
  )
}
