'use client'

import { useEffect, useState } from 'react'
import SectionHeading from '@/app/_components/SectionHeading'

export default function AccountPage() {
  const [profile, setProfile] = useState<any>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('')
  const [avatarUploading, setAvatarUploading] = useState(false)

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
      <SectionHeading
        eyebrow="Account"
        title="Welcome back, Atelier member"
        description="Manage orders, track deliveries, and curate your next room."
      />

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
                      <p>Name: {profile.name}</p>
                      <p>Email: {profile.email}</p>
                      <p>Phone: {profile.phone ?? 'Not set'}</p>
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
                <div className="mt-4 space-y-3 text-sm text-[#6B594A]">
                  {orders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between">
                      <span>Order {order.id.slice(-6)}</span>
                      <span className="font-semibold text-[#2B2119]">
                        ${order.total?.toLocaleString?.() ?? 0}
                      </span>
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
