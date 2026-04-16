'use client'

import { useEffect, useState } from 'react'
import SectionHeading from '@/app/_components/SectionHeading'
import Breadcrumb from '@/app/_components/Breadcrumb'
import ShipmentTracking from '@/app/_components/ShipmentTracking'

export default function AccountPage() {
  const [profile, setProfile] = useState<any>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('')
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [trackingOrderId, setTrackingOrderId] = useState<string | null>(null)
  const statusStyles: Record<string, string> = {
    pending_payment: 'border-amber-200 bg-amber-50 text-amber-700',
    pending: 'border-orange-200 bg-orange-50 text-orange-700',
    paid: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    payment_failed: 'border-red-200 bg-red-50 text-red-700',
    shipped: 'border-sky-200 bg-sky-50 text-sky-700',
    delivered: 'border-green-200 bg-green-50 text-green-700',
  }

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

  async function uploadAvatar(file: File) {
    setAvatarUploading(true)
    try {
      const signatureRes = await fetch('/api/cloudinary/signature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folder: 'timberbell/avatars' }),
      })
      const signatureData = await signatureRes.json()
      if (!signatureRes.ok) return

      const formData = new FormData()
      formData.append('file', file)
      formData.append('api_key', signatureData.apiKey)
      formData.append('timestamp', String(signatureData.timestamp))
      formData.append('signature', signatureData.signature)
      formData.append('folder', signatureData.folder)

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${signatureData.cloudName}/image/upload`,
        { method: 'POST', body: formData }
      )
      const uploadJson = await uploadRes.json()
      if (!uploadRes.ok) return

      await fetch('/api/users/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatarUrl: uploadJson.secure_url }),
      })

      setProfile((prev: any) => ({ ...prev, avatarUrl: uploadJson.secure_url }))
    } finally {
      setAvatarUploading(false)
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-10 px-6 py-16">
      <div className="flex flex-col gap-6">
        <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Account' }]} />
        <SectionHeading
          eyebrow="Account"
          title={`Welcome back, ${profile?.name || 'Atelier member'}`}
          description="Manage orders, track deliveries, and curate your next room."
        />
      </div>

      {loading ? (
        <div className="rounded-3xl border border-[#E6D9C8] bg-[#F4EEE4] p-6 text-sm text-[#6B594A]">
          Loading account...
        </div>
      ) : status ? (
        <div className="rounded-3xl border border-[#E6D9C8] bg-[#F4EEE4] p-6 text-sm text-[#6B594A]">
          <p>{status}</p>
          <p className="mt-2">
            <a href="/login" className="underline">
              Go to login
            </a>
          </p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            <div className="rounded-3xl border border-[#E6D9C8] bg-[#F4EEE4] p-6">
              <div className="text-xs uppercase tracking-[0.3em] text-[#8C7A6B]">
                Profile
              </div>
              {profile ? (
                <div className="mt-3 space-y-2 text-sm text-[#6B594A]">
                  <div className="flex items-center gap-3">
                    {profile.avatarUrl ? (
                      <img
                        src={profile.avatarUrl}
                        alt=""
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E9E1D4] text-sm font-semibold text-[#2B2119]">
                        {(profile.name || 'U').slice(0, 1).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-[#2B2119]">Name: {profile.name?.trim() || 'Not provided'}</p>
                      <p>Email: {profile.email}</p>
                      {profile.phone ? <p>Phone: {profile.phone}</p> : null}
                    </div>
                  </div>
                  <label className="mt-3 inline-flex cursor-pointer items-center rounded-full border border-[#7C4E2F] px-4 py-2 text-[10px] uppercase tracking-[0.3em] text-[#7C4E2F]">
                    {avatarUploading ? 'Uploading...' : 'Upload avatar'}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(event) => {
                        const file = event.target.files?.[0]
                        if (!file) return
                        uploadAvatar(file)
                        event.target.value = ''
                      }}
                    />
                  </label>
                  {profile.role === 'admin' ? (
                    <span className="inline-flex rounded-full border border-[#7C4E2F] px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-[#7C4E2F]">
                      Admin
                    </span>
                  ) : null}
                </div>
              ) : (
                <p className="mt-3 text-sm text-[#6B594A]">No profile data.</p>
              )}
            </div>
            <div className="rounded-3xl border border-[#E6D9C8] bg-[#F4EEE4] p-6">
              <div className="text-xs uppercase tracking-[0.3em] text-[#8C7A6B]">Orders</div>
              {orders.length ? (
                <div className="mt-4 space-y-6">
                  {orders.map((order) => (
                    <div key={order.id} className="space-y-4">
                      <div className="flex items-center justify-between rounded-2xl border border-[#E6D9C8] bg-white p-4">
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#2B2119]">
                            Order {order.id.slice(-6)}
                          </p>
                          <p className="text-[11px] text-[#8C7A6B]">
                            {new Date(order.createdAt).toLocaleDateString()} - {order.items?.length || 0} items
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className={`rounded-full border px-3 py-1 text-[9px] font-bold uppercase tracking-[0.2em] ${statusStyles[order.status] || 'border-[#E6D9C8] bg-white text-[#8C7A6B]'}`}>
                            {String(order.status || 'pending').replace('_', ' ')}
                          </span>
                          <span className="text-sm font-semibold text-[#2B2119]">
                            ${order.total?.toLocaleString?.() ?? 0}
                          </span>
                          <button
                            onClick={() => setTrackingOrderId(trackingOrderId === order.id ? null : order.id)}
                            className="rounded-full border border-[#7C4E2F] px-4 py-1.5 text-[9px] font-bold uppercase tracking-[0.2em] text-[#7C4E2F] transition hover:bg-[#7C4E2F] hover:text-white"
                          >
                            {trackingOrderId === order.id ? 'Hide Tracking' : 'Track Order'}
                          </button>
                        </div>
                      </div>
                      
                      {trackingOrderId === order.id && (
                        <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                          <ShipmentTracking createdAt={order.createdAt} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm text-[#6B594A]">No orders yet.</p>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-[#E6D9C8] bg-[#F4EEE4] p-6 text-sm text-[#6B594A]">
            <div className="text-xs uppercase tracking-[0.3em] text-[#8C7A6B]">
              Concierge notes
            </div>
            <p className="mt-4">
              Keep your profile updated so the studio can reach you about delivery windows and
              styling notes.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

