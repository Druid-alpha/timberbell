'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { formatMoney } from '@/lib/utils/format'
import { useAppDispatch } from '@/lib/redux/hooks'
import { addItem } from '@/lib/redux/cartSlice'

type Product = {
  id: string
  name: string
  price: number
  category: string
  description: string
  images?: { url: string }[]
  variants?: any[]
  compareAt?: number
}

export default function QuickViewModal({ product }: { product: Product }) {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const [activeImage, setActiveImage] = useState(product.images?.[0]?.url || '')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  function close() {
    setMounted(false)
    setTimeout(() => router.back(), 200)
  }

  async function handleAddToCart() {
    // Server sync
    const res = await fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: product.id, quantity: 1 }),
    })

    if (res.ok) {
      dispatch(addItem({
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        imageUrl: product.images?.[0]?.url
      }))
      close()
      setTimeout(() => router.push('/cart'), 300)
    }
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${mounted ? 'opacity-100' : 'opacity-0'}`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#2B2119]/40 backdrop-blur-sm"
        onClick={close}
      />

      {/* Modal Container */}
      <div
        className={`relative w-full max-w-4xl overflow-hidden rounded-[40px] border border-[#E6D9C8] bg-white shadow-[0_40px_100px_-40px_rgba(55,32,15,0.7)] transition-all duration-500 ${mounted ? 'translate-y-0 scale-100' : 'translate-y-10 scale-95'}`}
      >
        <button
          onClick={close}
          className="absolute right-6 top-6 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-[#E6D9C8] bg-white/80 text-[#2B2119] transition hover:bg-white"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div className="grid lg:grid-cols-2">
          {/* Left: Images */}
          <div className="bg-[#F4EEE4] p-8 lg:p-12">
            <div className="aspect-square w-full overflow-hidden rounded-[32px] border border-[#E6D9C8] bg-white shadow-sm">
              {activeImage ? (
                <img
                  src={activeImage}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-[#EFE6DA] text-[10px] uppercase tracking-[0.3em] text-[#8C7A6B]">
                  No Image
                </div>
              )}
            </div>
            {product.images && product.images.length > 1 && (
              <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
                {product.images.slice(0, 4).map((img) => (
                  <button
                    key={img.url}
                    onClick={() => setActiveImage(img.url)}
                    className={`h-16 w-16 flex-shrink-0 rounded-2xl border-2 transition ${activeImage === img.url ? 'border-[#7C4E2F]' : 'border-transparent'}`}
                  >
                    <img src={img.url} alt="" className="h-full w-full rounded-xl object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Content */}
          <div className="flex flex-col justify-center p-8 lg:p-12">
            <div className="space-y-6">
              <div>
                <p className="text-[10px] uppercase tracking-[0.4em] text-[#8C7A6B]">
                  {product.category}
                </p>
                <h2 className="mt-3 font-display text-3xl text-[#2B2119] lg:text-4xl">
                  {product.name}
                </h2>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-2xl font-semibold text-[#2B2119]">
                  {formatMoney(product.price)}
                </span>
                {product.compareAt && product.compareAt > product.price && (
                  <span className="text-sm text-[#8C7A6B] line-through">
                    {formatMoney(product.compareAt)}
                  </span>
                )}
              </div>

              <p className="text-sm leading-relaxed text-[#6B594A] line-clamp-4">
                {product.description}
              </p>

              <div className="space-y-3 pt-4">
                <button
                  onClick={handleAddToCart}
                  className="w-full rounded-full bg-[#7C4E2F] py-4 text-xs font-bold uppercase tracking-[0.3em] text-white transition hover:bg-[#6A3F24]"
                >
                  Quick Add to Cart
                </button>
                <a
                  href={`/products/${product.id}`}
                  onClick={() => document.body.style.overflow = 'unset'}
                  className="flex w-full items-center justify-center rounded-full border border-[#E6D9C8] py-4 text-[10px] font-bold uppercase tracking-[0.3em] text-[#7C4E2F] transition hover:bg-[#F4EEE4]"
                >
                  View Full Details
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
