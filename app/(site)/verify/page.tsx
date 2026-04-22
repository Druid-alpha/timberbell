'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import SectionHeading from '@/app/_components/SectionHeading'

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const emailFromQuery = searchParams.get('email') ?? ''
  const [email, setEmail] = useState(emailFromQuery)
  const [code, setCode] = useState('')
  const [status, setStatus] = useState(token ? 'Verifying your email...' : '')

  useEffect(() => {
    setEmail(emailFromQuery)
  }, [emailFromQuery])

  useEffect(() => {
    if (!token) return

    fetch('/api/auth/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then((res) => {
        if (res.ok) {
          setStatus('Email verified. You can now log in.')
        } else {
          setStatus('Verification failed. Request a new code.')
        }
      })
      .catch(() => setStatus('Verification failed. Request a new code.'))
  }, [token])

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setStatus('Checking your code...')

    const res = await fetch('/api/auth/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code }),
    })

    const data = await res.json().catch(() => ({}))
    setStatus(data.message || (res.ok ? 'Email verified. You can now log in.' : 'Unable to verify code.'))
  }

  async function handleResend() {
    if (!email.trim()) {
      setStatus('Enter your email address first.')
      return
    }

    setStatus('Sending a fresh code...')
    const res = await fetch('/api/auth/resend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    const data = await res.json().catch(() => ({}))
    setStatus(data.message || (res.ok ? 'Verification code sent.' : 'Unable to resend code.'))
  }

  return (
    <div className="mx-auto max-w-3xl space-y-10 px-6 py-16">
      <SectionHeading
        eyebrow="Account"
        title="Verify your email"
        description="Enter the one-time code we sent to your inbox."
      />
      {token ? (
        <div className="rounded-3xl border border-white/70 bg-white/70 p-6 text-sm text-neutral-600">
          {status}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5 rounded-3xl border border-[#E6D9C8] bg-[#F4EEE4] p-6">
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Email address"
            className="w-full rounded-2xl border border-[#E6D9C8] bg-white px-4 py-3 text-sm"
          />
          <input
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]{6}"
            maxLength={6}
            required
            value={code}
            onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="6-digit code"
            className="w-full rounded-2xl border border-[#E6D9C8] bg-white px-4 py-3 text-center text-lg tracking-[0.35em]"
          />
          <button
            type="submit"
            className="w-full rounded-full bg-[#7C4E2F] px-5 py-3 text-sm font-semibold text-white"
          >
            Verify email
          </button>
          <button
            type="button"
            onClick={handleResend}
            className="w-full rounded-full border border-[#7C4E2F] px-5 py-3 text-sm font-semibold text-[#7C4E2F]"
          >
            Resend code
          </button>
          {status ? <p className="text-sm text-[#6B594A]">{status}</p> : null}
          <p className="text-xs text-[#8C7A6B]">
            Already verified? <Link href="/login" className="underline">Go to login</Link>
          </p>
        </form>
      )}
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-3xl px-6 py-16 text-sm text-neutral-600">
          Loading verification...
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  )
}
