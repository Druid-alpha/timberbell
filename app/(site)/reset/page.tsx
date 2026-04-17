'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import SectionHeading from '@/app/_components/SectionHeading'

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState('')

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setStatus('Updating password...')

    const res = await fetch('/api/auth/reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
    })

    if (res.ok) {
      setStatus('Password updated. You can now log in.')
    } else {
      setStatus('Reset failed. Request a new link.')
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-10 px-6 py-16">
      <SectionHeading
        eyebrow="Account"
        title="Set a new password"
        description="Enter the new password for your Timberbell account."
      />
      <form onSubmit={handleSubmit} className="space-y-4 rounded-3xl border border-white/70 bg-white/70 p-6">
        <input
          type="password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="New password"
          className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm"
        />
        <button
          type="submit"
          disabled={!token}
          className="w-full rounded-full bg-neutral-900 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
        >
          Update password
        </button>
        {!token ? (
          <p className="text-sm text-neutral-600">
            Missing reset token. Use the reset link from your email.
          </p>
        ) : null}
        {status ? <p className="text-sm text-neutral-600">{status}</p> : null}
      </form>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-3xl px-6 py-16 text-sm text-neutral-600">
          Loading reset form...
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  )
}
