'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import SectionHeading from '@/app/_components/SectionHeading'
import Breadcrumb from '@/app/_components/Breadcrumb'

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams()
  const reference = searchParams.get('reference')
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('Verifying your Paystack payment...')
  const [orderId, setOrderId] = useState<string | null>(null)

  useEffect(() => {
    if (!reference) {
      setStatus('error')
      setMessage('We could not find a payment reference to verify.')
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
        setStatus('success')
        setMessage('Your payment was confirmed and your order is now in the atelier queue.')
        setOrderId(json.orderId || null)
      } else {
        setStatus('error')
        setMessage(json.message || 'We could not verify your payment yet.')
      }
    }

    verify()

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

      <div className="rounded-[40px] border border-[#E6D9C8] bg-[#F4EEE4] p-8 shadow-sm">
        <p className="text-sm text-[#2B2119]">{message}</p>
        {reference ? <p className="mt-3 text-xs uppercase tracking-[0.25em] text-[#8C7A6B]">Reference: {reference}</p> : null}
        {orderId ? <p className="mt-2 text-xs uppercase tracking-[0.25em] text-[#8C7A6B]">Order: {orderId.slice(-8).toUpperCase()}</p> : null}

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

