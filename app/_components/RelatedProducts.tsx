'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { formatMoney } from '@/lib/utils/format'

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
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="aspect-[4/5] animate-pulse rounded-[32px] bg-[#E6D9C8]/30" />
        ))}
      </div>
    )
  }

  if (products.length === 0) return null

  return (
    <div className="space-y-8 pt-16 border-t border-[#E6D9C8]">
      <div className="flex items-end justify-between">
        <div className="space-y-1">
          <h2 className="font-display text-3xl text-[#2B2119]">Complementary Pieces</h2>
          <p className="text-sm text-[#6B594A]">Other curators also integrated these into their space.</p>
        </div>
        <Link href={`/productfilter?category=${category}`} className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#7C4E2F] border-b border-[#7C4E2F]">
          View collection
        </Link>
      </div>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product, i) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="group relative"
          >
            <Link href={`/products/${product.id}`} className="block space-y-4">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[32px] border border-[#E6D9C8] bg-[#F4EEE4]">
                {product.images?.[0]?.url ? (
                  <img
                    src={product.images[0].url}
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
