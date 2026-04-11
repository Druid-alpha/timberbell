'use client'

import { useState } from 'react'
import Link from 'next/link'
import SectionHeading from '@/app/_components/SectionHeading'

export default function RegisterPage() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState('')

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setStatus('Creating your account...')

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: `${firstName} ${lastName}`.trim(),
        email,
        password,
      }),
    })

    const data = await res.json().catch(() => ({}))

    if (res.ok) {
      setStatus(data.message || 'Check your inbox to verify your email.')
      return
    }

    setStatus(data.message || 'Registration failed. Try again.')
  }

  return (
    <div className="mx-auto max-w-4xl space-y-10 px-6 py-16">
      <SectionHeading
        eyebrow="Register"
        title="Create your Timberbell profile"
        description="Save favorites, track orders, and access concierge styling support."
      />
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <form onSubmit={handleSubmit} className="space-y-5 rounded-3xl border border-white/70 bg-white/70 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <input
              placeholder="First name"
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              className="rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm"
            />
            <input
              placeholder="Last name"
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
              className="rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm"
            />
          </div>
          <input
            type="email"
            required
            placeholder="Email address"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm"
          />
          <input
            placeholder="Password"
            type="password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm"
          />
          <button
            type="submit"
            className="w-full rounded-full bg-neutral-900 px-5 py-3 text-sm font-semibold text-white"
          >
            Create account
          </button>
          {status ? <p className="text-sm text-neutral-600">{status}</p> : null}
          <p className="text-xs text-neutral-500">
            Already have an account?{' '}
            <Link href="/login" className="text-neutral-900 underline">
              Sign in
            </Link>
          </p>
        </form>
        <div className="rounded-3xl border border-white/70 bg-white/80 p-6 text-sm text-neutral-600">
          <div className="text-xs uppercase tracking-[0.3em] text-neutral-500">Member benefits</div>
          <ul className="mt-4 space-y-3">
            <li>Private studio sessions and early access to limited drops.</li>
            <li>Personalized finish and upholstery recommendations.</li>
            <li>Streamlined delivery scheduling and order tracking.</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
