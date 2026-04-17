'use client'

import { useState } from 'react'
import SectionHeading from '@/app/_components/SectionHeading'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('')

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setStatus('Sending reset link...')

    const res = await fetch('/api/auth/forgot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })

    if (res.ok) {
      setStatus('If that email exists, a reset link has been sent.')
    } else {
      setStatus('Unable to process reset request. Try again.')
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-10 px-6 py-16">
      <SectionHeading
        eyebrow="Account"
        title="Reset your password"
        description="Enter the email associated with your Timberbell account."
      />
      <form onSubmit={handleSubmit} className="space-y-4 rounded-3xl border border-white/70 bg-white/70 p-6">
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Email address"
          className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm"
        />
        <button
          type="submit"
          className="w-full rounded-full bg-neutral-900 px-5 py-3 text-sm font-semibold text-white"
        >
          Send reset link
        </button>
        {status ? <p className="text-sm text-neutral-600">{status}</p> : null}
      </form>
    </div>
  )
}
