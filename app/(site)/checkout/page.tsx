'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import SectionHeading from '@/app/_components/SectionHeading'
import Breadcrumb from '@/app/_components/Breadcrumb'
import StateCard from '@/app/_components/StateCard'
import { motion, AnimatePresence } from 'framer-motion'
import { formatMoney } from '@/lib/utils/format'
import { NIGERIA_STATES, getDeliveryQuote, type DeliveryMethod } from '@/lib/constants/shipping'
import { getStateTowns, getTownAreas } from '@/lib/constants/nigeria-locations'

const CHECKOUT_DETAILS_KEY = 'timberbell_checkout_details'

export default function CheckoutPage() {
  const [cart, setCart] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('')
  const [step, setStep] = useState(1)
  const [emailVerified, setEmailVerified] = useState(true)
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('standard')

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    city: '',
    state: '',
    area: '',
    postal: '',
    notes: '',
  })

  useEffect(() => {
    const savedForm = localStorage.getItem(CHECKOUT_DETAILS_KEY)
    if (savedForm) {
      const parsed = JSON.parse(savedForm)
      setForm((current) => ({
        ...current,
        ...parsed,
        area: parsed.area || '',
      }))
      if (parsed.deliveryMethod === 'priority') {
        setDeliveryMethod('priority')
      }
    }

    let active = true
    async function load() {
      const [cartRes, profileRes] = await Promise.all([
        fetch('/api/cart'),
        fetch('/api/users/me'),
      ])
      const data = await cartRes.json().catch(() => ({}))
      const profileData = await profileRes.json().catch(() => ({}))
      if (!active) return
      if (!cartRes.ok && cartRes.status === 401) {
        setStatus('Please sign in to checkout.')
        setCart(null)
        window.location.href = `/login?next=${encodeURIComponent('/checkout')}`
      } else {
        setCart(cartRes.ok ? data.cart : null)
        const verified = Boolean(profileData?.user?.emailVerified ?? true)
        setEmailVerified(verified)
        if (!verified) {
          setStatus('Please verify your email before checkout.')
        }
      }
      setLoading(false)
    }
    load()
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(CHECKOUT_DETAILS_KEY, JSON.stringify({ ...form, deliveryMethod }))
  }, [form, deliveryMethod])

  const getCheckoutUnitPrice = (item: any) => item.product?.finalPrice ?? item.price ?? item.selectedVariant?.price ?? item.product?.price ?? 0
  const activeItems = cart?.items?.filter((item: any) => !item.saved) ?? []
  const subtotal = activeItems.reduce((sum: number, item: any) => sum + getCheckoutUnitPrice(item) * item.quantity, 0)
  const deliveryQuote = getDeliveryQuote({ state: form.state, city: form.city, method: deliveryMethod })
  const delivery = subtotal > 0 ? deliveryQuote.fee : 0
  const towns = getStateTowns(form.state)
  const areas = getTownAreas(form.state, form.city)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!emailVerified) {
      setStatus('Please verify your email before checkout.')
      return
    }
    if (step < 3) {
      setStep(step + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    setStatus('Redirecting you to Paystack...')
    const payload = {
      customer: {
        name: `${form.firstName} ${form.lastName}`.trim(),
        email: form.email,
        address: form.address,
        city: form.city,
        state: form.state,
        area: form.area,
        postal: form.postal,
      },
      delivery: {
        method: deliveryMethod,
        state: form.state,
        city: form.city,
        area: form.area,
      },
      notes: form.notes,
    }

    const res = await fetch('/api/payments/paystack/initialize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const data = await res.json().catch(() => ({}))

    if (res.ok && data.authorizationUrl) {
      window.location.href = data.authorizationUrl
    } else {
      setStatus(data.message || 'Unable to start Paystack checkout.')
    }
  }

  const StepIndicator = ({ current }: { current: number }) => (
    <div className="mb-8 flex flex-wrap items-center gap-3 sm:gap-4">
      {[1, 2, 3].map((s) => (
        <div key={s} className="flex items-center gap-2">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all ${current === s ? 'bg-[#7C4E2F] text-white' : current > s ? 'bg-[#2A3320] text-white' : 'bg-[#E6D9C8] text-[#8C7A6B]'}`}
          >
            {current > s ? 'OK' : s}
          </div>
          <span
            className={`text-[10px] font-bold uppercase tracking-[0.2em] ${current === s ? 'text-[#2B2119]' : 'text-[#8C7A6B]'}`}
          >
            {s === 1 ? 'Shipping' : s === 2 ? 'Method' : 'Order'}
          </span>
          {s < 3 && <div className="hidden h-px w-8 bg-[#E6D9C8] sm:block" />}
        </div>
      ))}
    </div>
  )

  if (loading) {
    return <div className="mx-auto max-w-6xl px-6 py-16 text-sm text-[#6B594A]">Initializing studio checkout...</div>
  }

  return (
    <div className="mx-auto max-w-7xl space-y-10 px-4 py-10 sm:px-6 sm:py-16">
      <section className="overflow-hidden rounded-[40px] border border-[#E6D9C8] bg-[radial-gradient(circle_at_top_right,rgba(124,78,47,0.16),transparent_30%),linear-gradient(135deg,#fffdf9,#f4eee4)] px-6 py-8 shadow-[0_30px_90px_-65px_rgba(55,32,15,0.5)] sm:px-8 sm:py-10">
        <div className="flex flex-col gap-6">
          <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Cart', href: '/cart' }, { label: 'Checkout' }]} />
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <SectionHeading
              eyebrow={`Step ${step} of 3`}
              title={step === 1 ? 'Where should we deliver?' : step === 2 ? 'Select delivery plan' : 'Final Order Review'}
              description="Every Timberbell order uses Nigeria delivery logistics, with Paystack used for a secure payment flow."
            />
          </div>
        </div>
      </section>

      <div className="grid gap-12 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-6">
          <StepIndicator current={step} />

          {!emailVerified ? (
            <div className="rounded-[32px] border border-[#E6D9C8] bg-[#FFF7EF] px-5 py-4 text-sm text-[#6B594A]">
              Verify your email to continue. <Link href="/verify" className="font-semibold underline">Open verification</Link>
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-8 rounded-[40px] border border-[#E6D9C8] bg-[linear-gradient(180deg,#f8f1e8,#fffdfa)] p-5 shadow-[0_24px_60px_-48px_rgba(55,32,15,0.45)] sm:p-8">
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
                      className="rounded-2xl border border-[#E6D9C8] bg-white px-5 py-3 text-sm outline-none transition-all focus:border-[#7C4E2F]"
                      value={form.firstName}
                      onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                      required
                    />
                    <input
                      placeholder="Last name"
                      className="rounded-2xl border border-[#E6D9C8] bg-white px-5 py-3 text-sm outline-none transition-all focus:border-[#7C4E2F]"
                      value={form.lastName}
                      onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                      required
                    />
                  </div>
                  <input
                    placeholder="Email address"
                    className="w-full rounded-2xl border border-[#E6D9C8] bg-white px-5 py-3 text-sm outline-none transition-all focus:border-[#7C4E2F]"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                  />
                  <input
                    placeholder="Street address"
                    className="w-full rounded-2xl border border-[#E6D9C8] bg-white px-5 py-3 text-sm outline-none transition-all focus:border-[#7C4E2F]"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    required
                  />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <select
                      className="rounded-2xl border border-[#E6D9C8] bg-white px-5 py-3 text-sm outline-none transition-all focus:border-[#7C4E2F]"
                      value={form.state}
                      onChange={(e) => setForm({ ...form, state: e.target.value, city: '', area: '' })}
                      required
                    >
                      <option value="">Select state</option>
                      {NIGERIA_STATES.map((state) => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                    <select
                      className="rounded-2xl border border-[#E6D9C8] bg-white px-5 py-3 text-sm outline-none transition-all focus:border-[#7C4E2F] disabled:bg-[#F4EEE4] disabled:text-[#8C7A6B]"
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value, area: '' })}
                      disabled={!form.state}
                      required
                    >
                      <option value="">{form.state ? 'Select town' : 'Select state first'}</option>
                      {towns.map((town) => (
                        <option key={town.name} value={town.name}>{town.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <select
                      className="rounded-2xl border border-[#E6D9C8] bg-white px-5 py-3 text-sm outline-none transition-all focus:border-[#7C4E2F] disabled:bg-[#F4EEE4] disabled:text-[#8C7A6B]"
                      value={form.area}
                      onChange={(e) => setForm({ ...form, area: e.target.value })}
                      disabled={!form.city}
                      required
                    >
                      <option value="">{form.city ? 'Select area' : 'Select town first'}</option>
                      {areas.map((area) => (
                        <option key={area} value={area}>{area}</option>
                      ))}
                    </select>
                    <input
                      placeholder="Postal code"
                      className="rounded-2xl border border-[#E6D9C8] bg-white px-5 py-3 text-sm outline-none transition-all focus:border-[#7C4E2F]"
                      value={form.postal}
                      onChange={(e) => setForm({ ...form, postal: e.target.value })}
                      required
                    />
                  </div>
                  <div className="rounded-3xl border border-[#E6D9C8] bg-white/80 px-5 py-4 text-sm text-[#6B594A]">
                    Delivery zone: <span className="font-semibold text-[#2B2119]">{deliveryQuote.zone.label}</span> • ETA {deliveryQuote.zone.standardEta}
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
                  <button
                    type="button"
                    onClick={() => setDeliveryMethod('standard')}
                    className={`w-full rounded-3xl border bg-white p-6 text-left shadow-sm transition ${deliveryMethod === 'standard' ? 'border-2 border-[#7C4E2F]' : 'border-[#E6D9C8]'}`}
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="space-y-1">
                        <p className="font-bold text-[#2B2119]">Standard Delivery</p>
                        <p className="text-xs text-[#8C7A6B]">{deliveryQuote.zone.label} • {deliveryQuote.zone.standardEta}</p>
                      </div>
                      <div className="text-sm font-bold text-[#7C4E2F]">{formatMoney(subtotal > 0 ? deliveryQuote.zone.standardFee : 0)}</div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeliveryMethod('priority')}
                    className={`w-full rounded-3xl border bg-white p-6 text-left shadow-sm transition ${deliveryMethod === 'priority' ? 'border-2 border-[#7C4E2F]' : 'border-[#E6D9C8]'}`}
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="space-y-1">
                        <p className="font-bold text-[#2B2119]">Priority Dispatch</p>
                        <p className="text-xs text-[#8C7A6B]">{deliveryQuote.zone.label} • {deliveryQuote.zone.priorityEta}</p>
                      </div>
                      <div className="text-sm font-bold text-[#7C4E2F]">{formatMoney(subtotal > 0 ? deliveryQuote.zone.priorityFee : 0)}</div>
                    </div>
                  </button>
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
                  <div className="space-y-4 rounded-3xl border border-[#E6D9C8] bg-white p-6 shadow-sm">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#8C7A6B]">Delivery Contact</p>
                        <p className="mt-1 text-sm font-medium">{form.firstName} {form.lastName}</p>
                        <p className="text-xs text-[#8C7A6B]">{form.email}</p>
                      </div>
                      <button type="button" onClick={() => setStep(1)} className="w-fit border-b border-[#7C4E2F] text-[10px] font-bold uppercase text-[#7C4E2F]">
                        Edit
                      </button>
                    </div>
                    <div className="border-t border-[#F4EEE4] pt-4">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[#8C7A6B]">Shipping Address</p>
                      <p className="mt-1 text-sm font-medium">{form.address}, {form.area}, {form.city}, {form.state} {form.postal}</p>
                    </div>
                    <div className="border-t border-[#F4EEE4] pt-4">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[#8C7A6B]">Delivery Plan</p>
                      <p className="mt-1 text-sm font-medium capitalize">{deliveryMethod} dispatch</p>
                      <p className="text-xs text-[#8C7A6B]">{deliveryQuote.zone.label} • {deliveryQuote.eta}</p>
                    </div>
                  </div>
                  <textarea
                    placeholder="Delivery notes (optional)..."
                    className="h-28 w-full rounded-[24px] border border-[#E6D9C8] bg-white px-5 py-4 text-sm outline-none transition-all focus:border-[#7C4E2F]"
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex flex-col gap-3 border-t border-[#E6D9C8] pt-4 sm:flex-row sm:items-center">
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
                disabled={!emailVerified}
                className="flex-1 rounded-full bg-[#7C4E2F] px-8 py-4 text-[10px] font-bold uppercase tracking-[0.4em] text-white shadow-lg transition-all hover:bg-[#5C3A24] active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-[#D8C7B3] disabled:shadow-none"
              >
                {step === 3 ? 'Continue To Paystack' : 'Continue to next step'}
              </button>
            </div>
          </form>
          {status && <p className="mt-6 text-center text-xs font-bold text-[#7C4E2F] animate-pulse">{status}</p>}
        </div>

        <div className="space-y-6 lg:sticky lg:top-28">
          {!activeItems.length ? (
            <StateCard
              eyebrow="Checkout"
              title="There are no active pieces to review"
              description="Add products to your bundle before returning here to complete delivery details and payment."
              actionHref="/productfilter"
              actionLabel="Browse products"
              compact
            />
          ) : null}
        </div>
      </div>
    </div>
  )
}
