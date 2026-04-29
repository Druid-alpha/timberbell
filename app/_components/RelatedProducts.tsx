'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { formatMoney } from '@/lib/utils/format'
import { getOptimizedImageUrl } from '@/lib/utils/image'
import StateCard from '@/app/_components/StateCard'

type Product = {
  id: string
  name: string
  price: number
  category: string
  images: { url: string }[]
  palette?: string[]
}

export default function RelatedProducts({ productId, category }: { productId: string; category: string }) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/products/related?productId=${productId}&category=${category}`)
        const data = await res.json()
        setProducts(data.products || [])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [productId, category])

  if (loading) {
    return (
      <div className="space-y-8 border-t border-[#E6D9C8] pt-16">
        <div className="space-y-2">
          <div className="h-4 w-32 animate-pulse rounded bg-[#E6D9C8]/40" />
          <div className="h-10 w-64 animate-pulse rounded bg-[#E6D9C8]/30" />
        </div>
        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="overflow-hidden rounded-[32px] border border-[#E6D9C8] bg-[linear-gradient(180deg,#f8f1e8,#fffdfa)] p-3">
              <div className="aspect-[4/5] animate-pulse rounded-[26px] bg-[#E6D9C8]/35" />
              <div className="mt-4 space-y-2 px-2">
                <div className="h-4 w-3/4 animate-pulse rounded bg-[#E6D9C8]/30" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-[#E6D9C8]/25" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="border-t border-[#E6D9C8] pt-16">
        <StateCard
          eyebrow="Complementary Pieces"
          title="No related pieces just yet"
          description="As the collection expands, we will surface more pairings that work naturally with this piece."
          actionHref={`/productfilter?category=${category}`}
          actionLabel="Browse collection"
          compact
        />
      </div>
    )
  }

  return (
    <div className="space-y-8 pt-16 border-t border-[#E6D9C8]">
      <div className="flex items-end justify-between">
        <div className="space-y-1">
          <h2 className="font-display text-3xl text-[#2B2119]">Complementary Pieces</h2>
          <p className="text-sm text-[#6B594A]">Other curators also integrated these into their space.</p>
        </div>
        <Link href={`/productfilter?category=${category}`} scroll className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#7C4E2F] border-b border-[#7C4E2F]">
          View collection
        </Link>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2 lg:grid lg:grid-cols-4 lg:gap-8 lg:overflow-visible lg:pb-0">
        {products.map((product, i) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="group relative w-[15rem] shrink-0 lg:w-auto"
          >
            <Link href={`/products/${product.id}`} className="block space-y-4">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[32px] border border-[#E6D9C8] bg-[#F4EEE4]">
                {product.images?.[0]?.url ? (
                  <img
                    src={getOptimizedImageUrl(product.images[0].url)}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                ) : (
                  <div
                    className="h-full w-full"
                    style={{
                      backgroundImage: `linear-gradient(135deg, ${(product.palette || [])[0] || '#E6D9C8'}, ${(product.palette || [])[1] || '#D8C7B3'})`,
                    }}
                  />
                )}
                <div className="absolute inset-x-0 bottom-0 translate-y-full bg-white/60 p-4 backdrop-blur-sm transition-transform group-hover:translate-y-0">
                   <div className="text-[9px] font-bold uppercase tracking-widest text-[#7C4E2F]">Quick View</div>
                </div>
              </div>
              <div className="px-2">
                <h3 className="text-sm font-semibold text-[#2B2119] group-hover:text-[#7C4E2F] transition-colors">{product.name}</h3>
                <p className="text-xs font-medium text-[#8C7A6B]">{formatMoney(product.price)}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
