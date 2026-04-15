'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import SectionHeading from '@/app/_components/SectionHeading'
import Breadcrumb from '@/app/_components/Breadcrumb'

export default function CartPage() {
  const [cart, setCart] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function load() {
      setLoading(true)
      const res = await fetch('/api/cart')
      const data = await res.json().catch(() => ({}))

      if (!active) return

      if (!res.ok) {
        setError(data.message || 'Unable to load cart')
        if (res.status === 401) {
          setError('Please sign in to view your cart.')
        }
        setCart(null)
      } else {
        setCart(data.cart)
        setError('')
      }
      setLoading(false)
    }

    load()

    return () => {
      active = false
    }
  }, [])

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-16 text-sm text-[#6B594A]">
        Loading cart...
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-16 text-sm text-[#6B594A]">
        <div className="space-y-3">
          <p>{error}</p>
          {error.includes('sign in') ? (
            <Link href="/login" className="underline">
              Go to login
            </Link>
          ) : null}
        </div>
      </div>
    )
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-6xl space-y-6 px-6 py-16">
        <SectionHeading
          eyebrow="Cart"
          title="Your curated bundle"
          description="Review your selected pieces and schedule delivery when you are ready."
        />
        <div className="rounded-3xl border border-[#E6D9C8] bg-[#F4EEE4] p-8 text-center text-sm text-[#6B594A]">
          Your cart is empty. Start by exploring the shop.
          <div className="mt-4">
            <Link
              href="/shop"
              className="rounded-full bg-[#7C4E2F] px-6 py-3 text-sm font-semibold text-white"
            >
              Browse products
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const subtotal = cart.items.reduce(
    (sum: number, item: any) => sum + (item.product?.price ?? 0) * item.quantity,
    0
  )
  const delivery = subtotal > 0 ? 140 : 0
  const total = subtotal + delivery

  return (
    <div className="mx-auto max-w-6xl space-y-10 px-6 py-16">
      <div className="flex flex-col gap-6">
        <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Cart' }]} />
        <SectionHeading
          eyebrow="Cart"
          title="Your curated bundle"
          description="Review your selected pieces and schedule delivery when you are ready."
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          {cart.items.map((item: any) => (
            <div
              key={item.productId}
              className="flex flex-col gap-4 rounded-3xl border border-[#E6D9C8] bg-[#F4EEE4] p-6 sm:flex-row sm:items-center"
            >
              <div
                className="h-28 w-full rounded-2xl sm:w-32"
                style={{
                  backgroundImage: item.product?.palette
                    ? `linear-gradient(135deg, ${item.product.palette[0]}, ${item.product.palette[1]}, ${item.product.palette[2]})`
                    : 'linear-gradient(135deg,#f1f1f1,#e2e2e2)',
                }}
              />
              <div className="flex-1 space-y-2">
                <div className="text-sm uppercase tracking-[0.3em] text-[#8C7A6B]">
                  {item.product?.category}
                </div>
                <div className="text-lg font-semibold text-[#2B2119]">
                  {item.product?.name}
                </div>
                <div className="text-sm text-[#6B594A]">Qty {item.quantity}</div>
              </div>
              <div className="text-right text-lg font-semibold text-[#2B2119]">
                ${(item.product?.price ?? 0).toLocaleString()}
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-3xl border border-[#E6D9C8] bg-[#F4EEE4] p-6">
          <div className="text-xs uppercase tracking-[0.3em] text-[#8C7A6B]">Summary</div>
          <div className="mt-4 space-y-3 text-sm text-[#6B594A]">
            <div className="flex items-center justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-[#2B2119]">${subtotal.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>White glove delivery</span>
              <span className="font-semibold text-[#2B2119]">${delivery.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between border-t border-[#E6D9C8] pt-3">
              <span>Total</span>
              <span className="text-lg font-semibold text-[#2B2119]">${total.toLocaleString()}</span>
            </div>
          </div>
          <Link
            href="/checkout"
            className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-[#7C4E2F] px-5 py-3 text-sm font-semibold text-white"
          >
            Continue to checkout
          </Link>
        </div>
      </div>
    </div>
  )
}
