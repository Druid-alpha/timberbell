'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import SectionHeading from '@/app/_components/SectionHeading'
import Breadcrumb from '@/app/_components/Breadcrumb'
import { clearReservationCountdown } from '@/lib/reservation'

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams()
  const reference = searchParams.get('reference')
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(reference ? 'loading' : 'error')
  const [message, setMessage] = useState(reference ? 'Verifying your Paystack payment...' : 'We could not find a payment reference to verify.')
  const [orderId, setOrderId] = useState<string | null>(null)

  useEffect(() => {
    if (!reference) {
      clearReservationCountdown()
      return
    }

    const referenceValue = reference

    let active = true

    async function verify() {
      const res = await fetch(`/api/payments/paystack/verify?reference=${encodeURIComponent(referenceValue)}`, {
        cache: 'no-store',
      })
      const json = await res.json().catch(() => ({}))
      if (!active) return

      if (res.ok) {
        clearReservationCountdown()
        setStatus('success')
        setMessage('Your payment was confirmed and your order is now in the atelier queue.')
        setOrderId(json.orderId || null)
      } else {
        clearReservationCountdown()
        setStatus('error')
        setMessage(json.message || 'We could not verify your payment yet.')
      }
    }

    verify().catch(() => {
      clearReservationCountdown()
      if (!active) return
      setStatus('error')
      setMessage('We could not verify your payment yet.')
    })

    return () => {
      active = false
    }
  }, [reference])

  return (
    <div className="mx-auto max-w-4xl space-y-10 px-6 py-16">
      <div className="flex flex-col gap-6">
        <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Checkout', href: '/checkout' }, { label: 'Payment Status' }]} />
        <SectionHeading
          eyebrow="Checkout"
          title={status === 'success' ? 'Payment Confirmed' : status === 'error' ? 'Verification Needed' : 'Confirming Payment'}
          description="We're checking your Paystack payment and syncing your order details."
        />
      </div>

      <div className="overflow-hidden rounded-[40px] border border-[#E6D9C8] bg-[radial-gradient(circle_at_top,#fffdf8,rgba(244,238,228,0.96)_45%,rgba(236,223,208,0.96)_100%)] p-8 shadow-sm">
        <div className="grid gap-8 lg:grid-cols-[260px_1fr] lg:items-center">
          <div className="relative mx-auto flex h-56 w-56 items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 9, ease: 'linear' }}
              className="absolute h-56 w-56 rounded-full border border-[#D8C7B3]/70"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ repeat: Infinity, duration: 12, ease: 'linear' }}
              className="absolute h-44 w-44 rounded-full border border-dashed border-[#C5A070]/65"
            />
            <motion.div
              animate={status === 'loading' ? { scale: [0.94, 1.08, 0.94], opacity: [0.55, 0.95, 0.55] } : { scale: 1, opacity: 1 }}
              transition={{ repeat: status === 'loading' ? Infinity : 0, duration: 2.4, ease: 'easeInOut' }}
              className={`absolute h-28 w-28 rounded-full blur-2xl ${status === 'success' ? 'bg-emerald-300/70' : status === 'error' ? 'bg-rose-300/70' : 'bg-amber-300/70'}`}
            />
            <motion.div
              initial={{ scale: 0.86, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="relative flex h-28 w-28 items-center justify-center rounded-full border border-white/70 bg-white/80 shadow-[0_20px_80px_-35px_rgba(55,32,15,0.65)] backdrop-blur-xl"
            >
              {status === 'success' ? (
                <svg viewBox="0 0 24 24" className="h-10 w-10 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : status === 'error' ? (
                <svg viewBox="0 0 24 24" className="h-10 w-10 text-rose-600" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 8v5m0 3h.01M10.29 3.86l-8.1 14.04A2 2 0 0 0 3.92 21h16.16a2 2 0 0 0 1.73-3.1l-8.1-14.04a2 2 0 0 0-3.42 0Z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <div className="relative flex h-12 w-12 items-center justify-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                    className="absolute inset-0 rounded-full border-[3px] border-[#7C4E2F]/20 border-t-[#7C4E2F]"
                  />
                  <img src="/brand.svg" alt="Timberbell" className="h-6 w-6" />
                </div>
              )}
            </motion.div>
          </div>

          <div>
            <p className="text-sm text-[#2B2119]">{message}</p>
            {reference ? (
              <div className="mt-4 rounded-3xl border border-[#E6D9C8] bg-white/70 px-4 py-3">
                <p className="text-[10px] uppercase tracking-[0.25em] text-[#8C7A6B]">Reference</p>
                <p className="mt-1 break-all font-mono text-sm text-[#2B2119]">{reference}</p>
              </div>
            ) : null}
            {orderId ? (
              <div className="mt-3 rounded-3xl border border-[#E6D9C8] bg-white/70 px-4 py-3">
                <p className="text-[10px] uppercase tracking-[0.25em] text-[#8C7A6B]">Order</p>
                <p className="mt-1 break-all font-mono text-sm text-[#2B2119]">{orderId}</p>
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          {status === 'success' ? (
            <>
              <Link href="/account" className="rounded-full bg-[#7C4E2F] px-6 py-3 text-[10px] font-bold uppercase tracking-[0.3em] text-white">
                View Account
              </Link>
              <Link href="/productfilter" className="rounded-full border border-[#7C4E2F] px-6 py-3 text-[10px] font-bold uppercase tracking-[0.3em] text-[#7C4E2F]">
                Continue Shopping
              </Link>
            </>
          ) : (
            <>
              <Link href="/checkout" className="rounded-full bg-[#7C4E2F] px-6 py-3 text-[10px] font-bold uppercase tracking-[0.3em] text-white">
                Back To Checkout
              </Link>
              <Link href="/account" className="rounded-full border border-[#7C4E2F] px-6 py-3 text-[10px] font-bold uppercase tracking-[0.3em] text-[#7C4E2F]">
                Check Orders
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

