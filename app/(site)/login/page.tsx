'use client'

import { useState } from 'react'
import Link from 'next/link'
import SectionHeading from '@/app/_components/SectionHeading'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState('')

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setStatus('Signing you in...')

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    if (res.ok) {
      setStatus('Signed in. Redirecting...')
      window.location.href = '/account'
      return
    }

    const data = await res.json().catch(() => ({}))
    const message = data.message || 'Login failed. Try again.'
    setStatus(message)
    if (res.status === 403) {
      window.setTimeout(() => {
        window.location.href = `/verify?email=${encodeURIComponent(email.trim().toLowerCase())}`
      }, 700)
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-10 px-6 py-16">
      <SectionHeading
        eyebrow="Login"
        title="Welcome back to Timberbell"
        description="Access your saved pieces and delivery schedule."
      />
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
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
            type="password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Password"
            className="w-full rounded-2xl border border-[#E6D9C8] bg-white px-4 py-3 text-sm"
          />
          <button
            type="submit"
            className="w-full rounded-full bg-[#7C4E2F] px-5 py-3 text-sm font-semibold text-white"
          >
            Sign in
          </button>
          {status ? <p className="text-sm text-[#6B594A]">{status}</p> : null}
          <div className="flex items-center justify-between text-xs text-[#8C7A6B]">
            <Link href="/forgot" className="underline">
              Forgot password?
            </Link>
            <Link href="/register" className="underline">
              Create account
            </Link>
          </div>
        </form>
        <div className="rounded-3xl border border-[#E6D9C8] bg-[#F4EEE4] p-6 text-sm text-[#6B594A]">
          <div className="text-xs uppercase tracking-[0.3em] text-[#8C7A6B]">Need verification?</div>
          <p className="mt-3">If you have not received your verification code, resend it below.</p>
          <ResendVerification />
        </div>
      </div>
    </div>
  )
}

function ResendVerification() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('')

  const handleResend = async () => {
    if (!email) {
      setStatus('Enter your email first.')
      return
    }

    setStatus('Sending verification code...')
    const res = await fetch('/api/auth/resend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })

    if (res.ok) {
      const data = await res.json().catch(() => ({}))
      setStatus(data.message || 'Verification code sent.')
    } else {
      setStatus('Unable to resend code. Try again.')
    }
  }

  return (
    <div className="mt-4 space-y-3">
      <input
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="Email address"
        className="w-full rounded-2xl border border-[#E6D9C8] bg-white px-4 py-3 text-sm"
      />
      <button
        type="button"
        onClick={handleResend}
        className="w-full rounded-full border border-[#7C4E2F] px-4 py-2 text-sm font-semibold text-[#7C4E2F]"
      >
        Resend verification code
      </button>
      {status ? <p className="text-sm text-[#6B594A]">{status}</p> : null}
    </div>
  )
}
