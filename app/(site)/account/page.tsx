'use client'

import { useEffect, useState } from 'react'
import SectionHeading from '@/app/_components/SectionHeading'

export default function AccountPage() {
  const [profile, setProfile] = useState<any>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('')

  useEffect(() => {
    let active = true

    async function load() {
      const [profileRes, ordersRes] = await Promise.all([
        fetch('/api/users/me'),
        fetch('/api/orders'),
      ])

      const profileJson = await profileRes.json().catch(() => ({}))
      const ordersJson = await ordersRes.json().catch(() => ({}))

      if (!active) return

      if (!profileRes.ok && profileRes.status === 401) {
        setStatus('Please sign in to view your account.')
      } else {
        setProfile(profileRes.ok ? profileJson.user : null)
      }

      setOrders(ordersRes.ok ? ordersJson.orders ?? [] : [])
      setLoading(false)
    }

    load()

    return () => {
      active = false
    }
  }, [])

  return (
    <div className="mx-auto max-w-6xl space-y-10 px-6 py-16">
      <SectionHeading
        eyebrow="Account"
        title="Welcome back, Atelier member"
        description="Manage orders, track deliveries, and curate your next room."
      />

      {loading ? (
        <div className="rounded-3xl border border-white/70 bg-white/70 p-6 text-sm text-neutral-600">
          Loading account...
        </div>
      ) : status ? (
        <div className="rounded-3xl border border-white/70 bg-white/70 p-6 text-sm text-neutral-600">
          <p>{status}</p>
          <p className="mt-2">
            <a href="/login" className="underline">Go to login</a>
          </p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            <div className="rounded-3xl border border-white/70 bg-white/70 p-6">
              <div className="text-xs uppercase tracking-[0.3em] text-neutral-500">Profile</div>
              {profile ? (
                <div className="mt-3 space-y-2 text-sm text-neutral-600">
                  <p>Name: {profile.name}</p>
                  <p>Email: {profile.email}</p>
                  <p>Phone: {profile.phone ?? 'Not set'}</p>
                </div>
              ) : (
                <p className="mt-3 text-sm text-neutral-600">No profile data.</p>
              )}
            </div>
            <div className="rounded-3xl border border-white/70 bg-white/70 p-6">
              <div className="text-xs uppercase tracking-[0.3em] text-neutral-500">Orders</div>
              {orders.length ? (
                <div className="mt-4 space-y-3 text-sm text-neutral-600">
                  {orders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between">
                      <span>Order {order.id.slice(-6)}</span>
                      <span className="font-semibold text-neutral-900">${order.total?.toLocaleString?.() ?? 0}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm text-neutral-600">No orders yet.</p>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-white/70 bg-white/80 p-6 text-sm text-neutral-600">
            <div className="text-xs uppercase tracking-[0.3em] text-neutral-500">Concierge notes</div>
            <p className="mt-4">
              Keep your profile updated so the studio can reach you about delivery windows and styling notes.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
