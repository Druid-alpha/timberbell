'use client'

import { useEffect, useState } from 'react'
import SectionHeading from '@/app/_components/SectionHeading'

export default function CheckoutPage() {
  const [cart, setCart] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('')

  useEffect(() => {
    let active = true

    async function load() {
      const res = await fetch('/api/cart')
      const data = await res.json().catch(() => ({}))

      if (!active) return

      if (!res.ok && res.status === 401) {
        setStatus('Please sign in to checkout.')
        setCart(null)
      } else {
        setCart(res.ok ? data.cart : null)
      }
      setLoading(false)
    }

    load()

    return () => {
      active = false
    }
  }, [])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setStatus('Placing your order...')

    const form = event.target as HTMLFormElement
    const formData = new FormData(form)

    const payload = {
      customer: {
        name: `${formData.get('firstName')} ${formData.get('lastName')}`.trim(),
        email: formData.get('email'),
        address: formData.get('address'),
        city: formData.get('city'),
        postal: formData.get('postal'),
      },
    }

    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const data = await res.json().catch(() => ({}))

    if (res.ok) {
      setStatus(`Order placed. Reference: ${data.id}`)
    } else {
      setStatus(data.message || 'Unable to place order.')
      if (res.status === 401) {
        setStatus('Please sign in to place your order.')
      }
    }
  }

  const subtotal = cart?.items?.reduce(
    (sum: number, item: any) => sum + (item.product?.price ?? 0) * item.quantity,
    0
  ) ?? 0
  const delivery = subtotal > 0 ? 140 : 0
  const total = subtotal + delivery

  return (
    <div className="mx-auto max-w-6xl space-y-10 px-6 py-16">
      <SectionHeading
        eyebrow="Checkout"
        title="Schedule your delivery"
        description="Confirm your details and we will prepare your Timberbell pieces for shipment."
      />

      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl border border-white/70 bg-white/70 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <input
              name="firstName"
              placeholder="First name"
              className="rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm"
              required
            />
            <input
              name="lastName"
              placeholder="Last name"
              className="rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm"
              required
            />
          </div>
          <input
            name="email"
            placeholder="Email address"
            className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm"
            required
          />
          <input
            name="address"
            placeholder="Delivery address"
            className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm"
            required
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <input
              name="city"
              placeholder="City"
              className="rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm"
              required
            />
            <input
              name="postal"
              placeholder="Postal code"
              className="rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm"
              required
            />
          </div>
          <textarea
            name="notes"
            placeholder="Delivery notes"
            className="h-28 w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm"
          />
          <button
            type="submit"
            className="w-full rounded-full bg-neutral-900 px-5 py-3 text-sm font-semibold text-white"
            disabled={loading || !cart || cart.items.length === 0}
          >
            Place order
          </button>
          {status ? <p className="text-sm text-neutral-600">{status}</p> : null}
          {status.includes('sign in') ? (
            <p className="text-sm text-neutral-600">
              <a href="/login" className="underline">Go to login</a>
            </p>
          ) : null}
        </form>

        <div className="space-y-4 rounded-3xl border border-white/70 bg-white/80 p-6 text-sm text-neutral-600">
          <div className="text-xs uppercase tracking-[0.3em] text-neutral-500">Order summary</div>
          {loading ? (
            <div className="rounded-2xl border border-white/70 bg-white/70 p-4">
              Loading cart...
            </div>
          ) : cart?.items?.length ? (
            <div className="space-y-3">
              {cart.items.map((item: any) => (
                <div key={item.productId} className="flex items-center justify-between">
                  <span>{item.product?.name}</span>
                  <span className="font-semibold text-neutral-900">
                    ${((item.product?.price ?? 0) * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
              <div className="flex items-center justify-between border-t border-neutral-200/70 pt-3">
                <span>Delivery</span>
                <span className="font-semibold text-neutral-900">${delivery.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-base font-semibold text-neutral-900">
                <span>Total</span>
                <span>${total.toLocaleString()}</span>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-white/70 bg-white/70 p-4">
              Your cart is empty.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
