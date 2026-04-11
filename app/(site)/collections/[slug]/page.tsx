'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import SectionHeading from '@/app/_components/SectionHeading'

type Product = {
  id: string
  name: string
  price: number
  category: string
  description: string
  palette?: string[]
}

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
        <Link href="/shop" className="text-xs uppercase tracking-[0.3em] text-neutral-500">
          Back to shop
        </Link>
        <SectionHeading
          eyebrow="Collection"
          title={category ? category.name : 'Collection'}
          description={
            category
              ? category.description
              : 'Curated pieces designed to create a layered, welcoming home.'
          }
        />
      </div>

      {loading ? (
        <div className="rounded-3xl border border-white/70 bg-white/70 p-6 text-sm text-neutral-600">
          Loading collection...
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="group flex h-full flex-col overflow-hidden rounded-3xl border border-neutral-200/80 bg-white/80 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div
                className="relative h-44 w-full overflow-hidden"
                style={{
                  backgroundImage: `linear-gradient(135deg, ${product.palette?.[0]}, ${product.palette?.[1]}, ${product.palette?.[2]})`,
                }}
              />
              <div className="flex flex-1 flex-col gap-4 px-5 pb-5 pt-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-900">{product.name}</h3>
                    <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">
                      {product.category}
                    </p>
                  </div>
                  <div className="text-right text-lg font-semibold text-neutral-900">
                    ${product.price.toLocaleString()}
                  </div>
                </div>
                <p className="text-sm text-neutral-600 line-clamp-2">
                  {product.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {!loading && products.length === 0 ? (
        <div className="rounded-3xl border border-white/70 bg-white/70 p-6 text-sm text-neutral-600">
          No products yet in this collection.
        </div>
      ) : null}
    </div>
  )
}
