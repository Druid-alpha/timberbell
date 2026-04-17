'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AdminLoginPage() {
  const router = useRouter()
  const [key, setKey] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setLoading(true)

    const res = await fetch('/api/admin/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key }),
    })

    setLoading(false)

    if (!res.ok) {
      const message = await res.json().catch(() => ({}))
      setError(message?.message || 'Invalid key')
      return
    }

    router.push('/admin')
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-4xl items-center justify-center px-6">
      <div className="w-full max-w-lg rounded-[2.5rem] border border-[#E4DDCF] bg-[#FCFAF6] p-8 shadow-sm">
        <p className="text-xs uppercase tracking-[0.3em] text-[#8B9A78]">Admin access</p>
        <h1 className="mt-3 font-display text-3xl text-[#2A3320]">Enter the secret key</h1>
        <p className="mt-2 text-sm text-[#6B665A]">
          This portal is protected. Use your Timberbell admin key to continue.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input
            type="password"
            value={key}
            onChange={(event) => setKey(event.target.value)}
            placeholder="Admin secret key"
            className="h-12 w-full rounded-full border border-[#E4DDCF] bg-white px-5 text-sm text-[#2A3320] placeholder:text-[#8A836F]"
          />
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <button
            type="submit"
            disabled={loading}
            className="h-12 w-full rounded-full bg-[#2A3320] text-xs font-bold uppercase tracking-[0.3em] text-white transition hover:bg-[#232B1B] disabled:opacity-60"
          >
            {loading ? 'Signing in...' : 'Enter admin'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs uppercase tracking-[0.3em] text-[#8A836F]">
          <Link href="/">Back to store</Link>
        </div>
      </div>
    </div>
  )
}
