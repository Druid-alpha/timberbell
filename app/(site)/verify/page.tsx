'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import SectionHeading from '@/app/_components/SectionHeading'

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const [status, setStatus] = useState('Verifying your email...')

  useEffect(() => {
    if (!token) {
      setStatus('Missing verification token.')
      return
    }

    fetch('/api/auth/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then((res) => {
        if (res.ok) {
          setStatus('Email verified. You can now log in.')
        } else {
          setStatus('Verification failed. Request a new link.')
        }
      })
      .catch(() => setStatus('Verification failed. Request a new link.'))
  }, [token])

  return (
    <div className="mx-auto max-w-3xl space-y-10 px-6 py-16">
      <SectionHeading
        eyebrow="Account"
        title="Verify your email"
        description="We are confirming your email address."
      />
      <div className="rounded-3xl border border-white/70 bg-white/70 p-6 text-sm text-neutral-600">
        {status}
      </div>
    </div>
  )
}
