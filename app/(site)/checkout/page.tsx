'use client'

import { useEffect, useState } from 'react'
import SectionHeading from '@/app/_components/SectionHeading'
import Breadcrumb from '@/app/_components/Breadcrumb'
import { motion, AnimatePresence } from 'framer-motion'
import { formatMoney } from '@/lib/utils/format'

export default function CheckoutPage() {
  const [cart, setCart] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('')
  const [step, setStep] = useState(1)
  
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    city: '',
    postal: '',
    notes: '',
  })

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
    return () => { active = false }
  }, [])

  const subtotal = cart?.items?.reduce(
    (sum: number, item: any) => sum + (item.product?.price ?? 0) * item.quantity,
    0
  ) ?? 0
  const delivery = subtotal > 0 ? 140 : 0
  const total = subtotal + delivery

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (step < 3) {
      setStep(step + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    setStatus('Placing your order...')
    const payload = {
      customer: {
        name: `${form.firstName} ${form.lastName}`.trim(),
        email: form.email,
        address: form.address,
        city: form.city,
        postal: form.postal,
      },
      notes: form.notes
    }

    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const data = await res.json().catch(() => ({}))

    if (res.ok) {
      setStatus(`Success! Order Reference: ${data.id}`)
    } else {
      setStatus(data.message || 'Unable to place order.')
    }
  }

  const StepIndicator = ({ current }: { current: number }) => (
    <div className="flex items-center gap-4 mb-8">
      {[1, 2, 3].map((s) => (
        <div key={s} className="flex items-center gap-2">
          <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all ${current === s ? 'bg-[#7C4E2F] text-white' : current > s ? 'bg-[#2A3320] text-white' : 'bg-[#E6D9C8] text-[#8C7A6B]'}`}>
            {current > s ? '✓' : s}
          </div>
          <span className={`text-[10px] uppercase tracking-[0.2em] font-bold ${current === s ? 'text-[#2B2119]' : 'text-[#8C7A6B]'}`}>
            {s === 1 ? 'Shipping' : s === 2 ? 'Method' : 'Order'}
          </span>
          {s < 3 && <div className="h-px w-8 bg-[#E6D9C8]" />}
        </div>
      ))}
    </div>
  )

  if (loading) return <div className="mx-auto max-w-6xl px-6 py-16 text-sm text-[#6B594A]">Initializing studio checkout...</div>

  return (
    <div className="mx-auto max-w-6xl space-y-10 px-6 py-16">
      <div className="flex flex-col gap-6">
        <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Cart', href: '/cart' }, { label: 'Checkout' }]} />
        <SectionHeading
          eyebrow={`Step ${step} of 3`}
          title={step === 1 ? 'Where should we deliver?' : step === 2 ? 'Select white-glove tier' : 'Final Curator Review'}
          description="Every Timberbell order includes professional white-glove setup as standard."
        />
      </div>

      <div className="grid gap-12 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-6">
          <StepIndicator current={step} />
          
          <form onSubmit={handleSubmit} className="space-y-8 rounded-[40px] border border-[#E6D9C8] bg-[#F4EEE4] p-8 shadow-sm">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <input
                      placeholder="First name"
                      className="rounded-2xl border border-[#E6D9C8] bg-white px-5 py-3 text-sm focus:border-[#7C4E2F] outline-none transition-all"
                      value={form.firstName}
                      onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                      required
                    />
                    <input
                      placeholder="Last name"
                      className="rounded-2xl border border-[#E6D9C8] bg-white px-5 py-3 text-sm focus:border-[#7C4E2F] outline-none transition-all"
                      value={form.lastName}
                      onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                      required
                    />
                  </div>
                  <input
                    placeholder="Email address"
                    className="w-full rounded-2xl border border-[#E6D9C8] bg-white px-5 py-3 text-sm focus:border-[#7C4E2F] outline-none transition-all"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                  />
                  <input
                    placeholder="Delivery address"
                    className="w-full rounded-2xl border border-[#E6D9C8] bg-white px-5 py-3 text-sm focus:border-[#7C4E2F] outline-none transition-all"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    required
                  />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <input
                      placeholder="City"
                      className="rounded-2xl border border-[#E6D9C8] bg-white px-5 py-3 text-sm focus:border-[#7C4E2F] outline-none transition-all"
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                      required
                    />
                    <input
                      placeholder="Postal code"
                      className="rounded-2xl border border-[#E6D9C8] bg-white px-5 py-3 text-sm focus:border-[#7C4E2F] outline-none transition-all"
                      value={form.postal}
                      onChange={(e) => setForm({ ...form, postal: e.target.value })}
                      required
                    />
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="rounded-3xl border-2 border-[#7C4E2F] bg-white p-6">
                    <div className="flex items-center justify-between">
                       <div className="space-y-1">
                          <p className="font-bold text-[#2B2119]">White Glove Delivery</p>
                          <p className="text-xs text-[#8C7A6B]">In-home placement, assembly, and debris removal.</p>
                       </div>
                       <div className="text-sm font-bold text-[#7C4E2F]">$140.00</div>
                    </div>
                  </div>
                  <div className="rounded-3xl border border-[#E6D9C8] bg-white/50 p-6 opacity-60">
                    <div className="flex items-center justify-between">
                       <div className="space-y-1">
                          <p className="font-bold text-[#2B2119]">Express Installation</p>
                          <p className="text-xs text-[#8C7A6B]">Priority scheduling within 7 days of arrival.</p>
                       </div>
                       <div className="text-sm font-bold text-[#8C7A6B]">Coming Soon</div>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="rounded-3xl border border-[#E6D9C8] bg-white p-6 space-y-4">
                    <div className="flex justify-between items-start">
                       <div>
                          <p className="text-[10px] uppercase tracking-widest text-[#8C7A6B] font-bold">Delivery Contact</p>
                          <p className="mt-1 text-sm font-medium">{form.firstName} {form.lastName}</p>
                          <p className="text-xs text-[#8C7A6B]">{form.email}</p>
                       </div>
                       <button type="button" onClick={() => setStep(1)} className="text-[10px] uppercase border-b border-[#7C4E2F] text-[#7C4E2F] font-bold">Edit</button>
                    </div>
                    <div className="pt-4 border-t border-[#F4EEE4]">
                        <p className="text-[10px] uppercase tracking-widest text-[#8C7A6B] font-bold">Shipping Address</p>
                        <p className="mt-1 text-sm font-medium">{form.address}, {form.city} {form.postal}</p>
                    </div>
                  </div>
                  <textarea
                    placeholder="Delivery notes (optional)..."
                    className="h-28 w-full rounded-[24px] border border-[#E6D9C8] bg-white px-5 py-4 text-sm focus:border-[#7C4E2F] outline-none transition-all"
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center gap-4 pt-4 border-t border-[#E6D9C8]">
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="rounded-full border border-[#7C4E2F] px-8 py-4 text-[10px] font-bold uppercase tracking-[0.3em] text-[#7C4E2F] transition hover:bg-white"
                >
                  Back
                </button>
              )}
              <button
                type="submit"
                className="flex-1 rounded-full bg-[#7C4E2F] px-8 py-4 text-[10px] font-bold uppercase tracking-[0.4em] text-white shadow-lg transition-all hover:bg-[#5C3A24] active:scale-[0.98]"
              >
                {step === 3 ? 'Confirm & Place Order' : 'Continue to next step'}
              </button>
            </div>
          </form>
          {status && <p className="mt-6 text-center text-xs font-bold text-[#7C4E2F] animate-pulse">{status}</p>}
        </div>

        <div className="space-y-6">
          <div className="rounded-[40px] border border-[#E6D9C8] bg-[#F4EEE4] p-8 text-sm text-[#6B594A]">
            <div className="text-[10px] uppercase tracking-[0.3em] text-[#8C7A6B] font-bold mb-6">Order Detail</div>
            {cart?.items?.length ? (
              <div className="space-y-6">
                <div className="space-y-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                  {cart.items.map((item: any) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="h-16 w-16 shrink-0 rounded-xl overflow-hidden bg-white border border-[#E6D9C8]">
                        <img src={item.product?.images?.[0]?.url || ''} alt="" className="h-full w-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-[#2B2119] leading-tight line-clamp-1">{item.product?.name}</p>
                        <p className="text-[10px] text-[#8C7A6B]">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-bold text-[#2B2119]">${(item.product?.price * item.quantity).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
                <div className="space-y-3 pt-6 border-t border-[#E6D9C8]">
                  <div className="flex justify-between">
                    <span className="text-[10px] uppercase font-bold tracking-widest">Subtotal</span>
                    <span className="font-bold text-[#2B2119]">${subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[10px] uppercase font-bold tracking-widest">White Glove</span>
                    <span className="font-bold text-[#2B2119]">${delivery.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-[#E6D9C8] text-lg font-display text-[#7C4E2F]">
                    <span>Total</span>
                    <span>{formatMoney(total)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <p>No items in cart.</p>
            )}
          </div>
          
          <div className="rounded-[40px] border border-[#E6D9C8] p-8 space-y-4">
             <div className="flex items-center gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#2A3320] text-white">✓</div>
                <p className="text-[10px] uppercase tracking-[0.2em] font-bold">Studio Insured Delivery</p>
             </div>
             <div className="flex items-center gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#2A3320] text-white">✓</div>
                <p className="text-[10px] uppercase tracking-[0.2em] font-bold">Sustainable Packaging</p>
             </div>
             <p className="text-[10px] text-[#8C7A6B] leading-relaxed">By placing your order, you agree to our terms of curated service and white-glove logistics policy.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
