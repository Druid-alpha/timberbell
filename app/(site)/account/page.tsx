'use client'

import { useEffect, useState } from 'react'
import SectionHeading from '@/app/_components/SectionHeading'
import Breadcrumb from '@/app/_components/Breadcrumb'
import ShipmentTracking from '@/app/_components/ShipmentTracking'
import { formatMoney } from '@/lib/utils/format'

type RefundMessage = {
  sender: 'admin' | 'customer'
  message: string
  createdAt: string
}

type RefundFormState = {
  reason: string
  message: string
  attachments: string[]
}

type Profile = {
  name?: string
  email: string
  phone?: string
  avatarUrl?: string
  role?: string
}

type OrderSummary = {
  id: string
  createdAt: string
  updatedAt?: string
  status: string
  total: number
  items?: Array<{ quantity?: number }>
  trackingStage?: string
  trackingUpdatedAt?: string
  trackingNote?: string
}

type RefundRecord = {
  id: string
  orderId: string
  status: string
  reason: string
  message: string
  createdAt: string
  attachments?: string[]
  conversation?: RefundMessage[]
}

const emptyRefundForm = (): RefundFormState => ({ reason: '', message: '', attachments: [] })

export default function AccountPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [orders, setOrders] = useState<OrderSummary[]>([])
  const [refunds, setRefunds] = useState<RefundRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [authStatus, setAuthStatus] = useState('')
  const [notice, setNotice] = useState('')
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [trackingOrderId, setTrackingOrderId] = useState<string | null>(null)
  const [refundOrderId, setRefundOrderId] = useState<string | null>(null)
  const [refundForms, setRefundForms] = useState<Record<string, RefundFormState>>({})
  const [refundUploadingFor, setRefundUploadingFor] = useState<string | null>(null)
  const [refundSubmittingFor, setRefundSubmittingFor] = useState<string | null>(null)
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({})
  const [replyingRefundId, setReplyingRefundId] = useState<string | null>(null)
  const statusStyles: Record<string, string> = {
    pending_payment: 'border-amber-200 bg-amber-50 text-amber-700',
    pending: 'border-orange-200 bg-orange-50 text-orange-700',
    paid: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    processing: 'border-purple-200 bg-purple-50 text-purple-700',
    payment_failed: 'border-red-200 bg-red-50 text-red-700',
    shipped: 'border-sky-200 bg-sky-50 text-sky-700',
    delivered: 'border-green-200 bg-green-50 text-green-700',
    cancelled: 'border-slate-200 bg-slate-100 text-slate-700',
  }

  async function loadAccount() {
    const [profileRes, ordersRes, refundsRes] = await Promise.all([
      fetch('/api/users/me'),
      fetch('/api/orders'),
      fetch('/api/refunds'),
    ])

    const profileJson = await profileRes.json().catch(() => ({}))
    const ordersJson = await ordersRes.json().catch(() => ({}))
    const refundsJson = await refundsRes.json().catch(() => ({}))

    if (!profileRes.ok && profileRes.status === 401) {
      window.location.href = `/login?next=${encodeURIComponent('/account')}`
      return
    } else {
      setProfile(profileRes.ok ? profileJson.user : null)
    }

    setOrders(ordersRes.ok ? ordersJson.orders ?? [] : [])
    setRefunds(refundsRes.ok ? refundsJson.refunds ?? [] : [])
    setLoading(false)
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadAccount()
    }, 0)

    return () => window.clearTimeout(timer)
  }, [])

  function getRefundForm(orderId: string) {
    return refundForms[orderId] || emptyRefundForm()
  }

  function updateRefundForm(orderId: string, updater: (current: RefundFormState) => RefundFormState) {
    setRefundForms((prev) => {
      const current = prev[orderId] || emptyRefundForm()
      return { ...prev, [orderId]: updater(current) }
    })
  }

  async function uploadAvatar(file: File) {
    setAvatarUploading(true)
    try {
      const signatureRes = await fetch('/api/cloudinary/signature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folder: 'timberbell/avatars' }),
      })
      const signatureData = await signatureRes.json().catch(() => ({}))
      if (!signatureRes.ok) {
        setNotice(signatureData.message || 'Unable to prepare avatar upload.')
        return
      }

      const formData = new FormData()
      formData.append('file', file)
      formData.append('api_key', signatureData.apiKey)
      formData.append('timestamp', String(signatureData.timestamp))
      formData.append('signature', signatureData.signature)
      formData.append('folder', signatureData.folder)

      const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${signatureData.cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      })
      const uploadJson = await uploadRes.json().catch(() => ({}))
      if (!uploadRes.ok) {
        setNotice(uploadJson.error?.message || 'Unable to upload avatar.')
        return
      }

      await fetch('/api/users/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatarUrl: uploadJson.secure_url }),
      })

      setProfile((prev) => (prev ? { ...prev, avatarUrl: uploadJson.secure_url } : prev))
      setNotice('Avatar updated.')
    } finally {
      setAvatarUploading(false)
    }
  }

  async function uploadRefundFile(orderId: string, file: File) {
    setRefundUploadingFor(orderId)
    try {
      const signatureRes = await fetch('/api/cloudinary/signature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folder: 'timberbell/refunds' }),
      })
      const signatureData = await signatureRes.json().catch(() => ({}))
      if (!signatureRes.ok) {
        setNotice(signatureData.message || 'Unable to prepare refund file upload.')
        return
      }

      const formData = new FormData()
      formData.append('file', file)
      formData.append('api_key', signatureData.apiKey)
      formData.append('timestamp', String(signatureData.timestamp))
      formData.append('signature', signatureData.signature)
      formData.append('folder', signatureData.folder)

      const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${signatureData.cloudName}/auto/upload`, {
        method: 'POST',
        body: formData,
      })
      const uploadJson = await uploadRes.json().catch(() => ({}))
      if (!uploadRes.ok) {
        setNotice(uploadJson.error?.message || 'Unable to upload refund file.')
        return
      }

      updateRefundForm(orderId, (current) => ({
        ...current,
        attachments: [...current.attachments, uploadJson.secure_url].slice(0, 3),
      }))
      setNotice('Refund attachment added.')
    } finally {
      setRefundUploadingFor(null)
    }
  }

  async function submitRefund(order: OrderSummary) {
    const form = getRefundForm(order.id)
    if (!form.reason.trim() || !form.message.trim()) {
      setNotice('Please add a refund reason and message before sending the request.')
      return
    }

    setRefundSubmittingFor(order.id)
    const res = await fetch('/api/refunds', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: order.id,
        customerName: profile?.name,
        customerEmail: profile?.email,
        ...form,
      }),
    })
    const data = await res.json().catch(() => ({}))
    setRefundSubmittingFor(null)
    setNotice(data.message || (res.ok ? 'Refund request submitted.' : 'Unable to submit refund request.'))
    if (res.ok) {
      await loadAccount()
      setRefundForms((prev) => ({ ...prev, [order.id]: emptyRefundForm() }))
      setRefundOrderId(null)
    }
  }

  async function sendRefundReply(refundId: string) {
    const message = (replyDrafts[refundId] || '').trim()
    if (!message) {
      setNotice('Write a message before sending it to the refund desk.')
      return
    }

    setReplyingRefundId(refundId)
    const res = await fetch(`/api/refunds/${refundId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    })
    const data = await res.json().catch(() => ({}))
    setReplyingRefundId(null)
    setNotice(data.message || (res.ok ? 'Message sent to the refund desk.' : 'Unable to send message.'))
    if (res.ok) {
      setReplyDrafts((prev) => ({ ...prev, [refundId]: '' }))
      await loadAccount()
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-10 px-4 py-12 sm:px-6 sm:py-16">
      <div className="flex flex-col gap-6">
        <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Account' }]} />
        <SectionHeading
          eyebrow="Account"
          title={`Welcome back, ${profile?.name || 'Atelier member'}`}
          description="Manage orders, track deliveries, and stay in touch with the studio."
        />
      </div>

      {loading ? (
        <div className="rounded-3xl border border-[#E6D9C8] bg-[#F4EEE4] p-6 text-sm text-[#6B594A]">Loading account...</div>
      ) : authStatus ? (
        <div className="rounded-3xl border border-[#E6D9C8] bg-[#F4EEE4] p-6 text-sm text-[#6B594A]">
          <p>{authStatus}</p>
          <p className="mt-2">
            <a href="/login" className="underline">Go to login</a>
          </p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            {notice ? (
              <div className="rounded-3xl border border-[#E6D9C8] bg-white p-4 text-sm text-[#6B594A]">{notice}</div>
            ) : null}

            <div className="rounded-3xl border border-[#E6D9C8] bg-[#F4EEE4] p-6">
              <div className="text-xs uppercase tracking-[0.3em] text-[#8C7A6B]">Profile</div>
              {profile ? (
                <div className="mt-3 space-y-2 text-sm text-[#6B594A]">
                  <div className="flex items-center gap-3">
                    {profile.avatarUrl ? (
                      <img src={profile.avatarUrl} alt="" className="h-12 w-12 rounded-full object-cover" />
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
                    <span className="inline-flex rounded-full border border-[#7C4E2F] px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-[#7C4E2F]">Admin</span>
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
                  {orders.map((order) => {
                    const orderRefunds = refunds.filter((refund) => refund.orderId === order.id)
                    const form = getRefundForm(order.id)

                    return (
                      <div key={order.id} className="space-y-4">
                        <div className="flex flex-col gap-4 rounded-2xl border border-[#E6D9C8] bg-white p-4 xl:flex-row xl:items-center xl:justify-between">
                          <div className="min-w-0 space-y-1">
                            <p className="break-all text-[10px] font-bold uppercase tracking-[0.2em] text-[#2B2119]">Order {order.id}</p>
                            <p className="text-[11px] text-[#8C7A6B]">
                              {new Date(order.createdAt).toLocaleDateString()} - {order.items?.length || 0} items
                            </p>
                          </div>
                          <div className="flex flex-wrap items-center gap-3 xl:justify-end">
                            <span className={`rounded-full border px-3 py-1 text-[9px] font-bold uppercase tracking-[0.2em] ${statusStyles[order.status] || 'border-[#E6D9C8] bg-white text-[#8C7A6B]'}`}>
                              {String(order.status || 'pending').replace('_', ' ')}
                            </span>
                            <span className="text-sm font-semibold text-[#2B2119]">{formatMoney(Number(order.total || 0))}</span>
                            <button
                              onClick={() => setTrackingOrderId(trackingOrderId === order.id ? null : order.id)}
                              className="rounded-full border border-[#7C4E2F] px-4 py-1.5 text-[9px] font-bold uppercase tracking-[0.2em] text-[#7C4E2F] transition hover:bg-[#7C4E2F] hover:text-white"
                            >
                              {trackingOrderId === order.id ? 'Hide Tracking' : 'Track Order'}
                            </button>
                            <a href={`/api/orders/${order.id}/receipt`} className="rounded-full border border-[#E6D9C8] px-4 py-1.5 text-[9px] font-bold uppercase tracking-[0.2em] text-[#2B2119]">
                              Receipt PDF
                            </a>
                            <button
                              onClick={() => setRefundOrderId(refundOrderId === order.id ? null : order.id)}
                              className="rounded-full border border-[#E6D9C8] px-4 py-1.5 text-[9px] font-bold uppercase tracking-[0.2em] text-[#2B2119]"
                            >
                              Refund
                            </button>
                          </div>
                        </div>

                        {trackingOrderId === order.id ? (
                          <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                            <ShipmentTracking
                              trackingStage={order.trackingStage}
                              trackingUpdatedAt={order.trackingUpdatedAt || order.updatedAt || order.createdAt}
                              trackingNote={order.trackingNote}
                            />
                          </div>
                        ) : null}

                        {refundOrderId === order.id ? (
                          <div className="space-y-4 rounded-2xl border border-[#E6D9C8] bg-white p-4">
                            <input
                              value={form.reason}
                              onChange={(e) => updateRefundForm(order.id, (current) => ({ ...current, reason: e.target.value }))}
                              placeholder="Reason for refund"
                              className="w-full rounded-2xl border border-[#E6D9C8] px-4 py-3 text-sm"
                            />
                            <textarea
                              value={form.message}
                              onChange={(e) => updateRefundForm(order.id, (current) => ({ ...current, message: e.target.value }))}
                              placeholder="Explain the issue, add any complaint details, and what resolution you need."
                              className="h-28 w-full rounded-2xl border border-[#E6D9C8] px-4 py-3 text-sm"
                            />
                            <div className="flex flex-wrap gap-3">
                              {form.attachments.map((file) => (
                                <div key={file} className="flex items-center gap-2 rounded-full border border-[#E6D9C8] px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-[#7C4E2F]">
                                  <a href={file} target="_blank" rel="noreferrer">File</a>
                                  <button
                                    type="button"
                                    onClick={() => updateRefundForm(order.id, (current) => ({
                                      ...current,
                                      attachments: current.attachments.filter((item) => item !== file),
                                    }))}
                                    className="text-red-600"
                                  >
                                    Remove
                                  </button>
                                </div>
                              ))}
                              {form.attachments.length < 3 ? (
                                <label className="rounded-full border border-[#7C4E2F] px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-[#7C4E2F]">
                                  {refundUploadingFor === order.id ? 'Uploading...' : 'Add file'}
                                  <input
                                    type="file"
                                    accept="image/*,.pdf,.doc,.docx"
                                    className="hidden"
                                    onChange={(event) => {
                                      const file = event.target.files?.[0]
                                      if (file) uploadRefundFile(order.id, file)
                                      event.target.value = ''
                                    }}
                                  />
                                </label>
                              ) : null}
                            </div>
                            <button
                              onClick={() => submitRefund(order)}
                              disabled={refundSubmittingFor === order.id}
                              className="rounded-full bg-[#7C4E2F] px-6 py-3 text-[10px] font-bold uppercase tracking-[0.25em] text-white disabled:opacity-60"
                            >
                              {refundSubmittingFor === order.id ? 'Sending...' : 'Submit Refund Request'}
                            </button>
                          </div>
                        ) : null}

                        {orderRefunds.map((refund) => {
                          const conversation: RefundMessage[] = refund.conversation?.length
                            ? refund.conversation
                            : [{ sender: 'customer', message: refund.message, createdAt: refund.createdAt }]

                          return (
                            <div key={refund.id} className="rounded-2xl border border-[#E6D9C8] bg-[#FCFAF6] p-4 text-sm text-[#6B594A]">
                              <p className="text-[10px] font-bold uppercase tracking-widest text-[#8C7A6B]">Refund status: {refund.status}</p>
                              <p className="mt-2">{refund.reason}</p>
                              {refund.attachments?.length ? (
                                <div className="mt-3 flex flex-wrap gap-2">
                                  {refund.attachments.map((file: string) => (
                                    <a key={file} href={file} target="_blank" rel="noreferrer" className="rounded-full border border-[#E6D9C8] px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-[#7C4E2F]">
                                      Attachment
                                    </a>
                                  ))}
                                </div>
                              ) : null}

                              <div className="mt-4 space-y-3">
                                {conversation.map((entry, index) => (
                                  <div key={`${entry.createdAt}-${index}`} className={`rounded-2xl px-4 py-3 ${entry.sender === 'admin' ? 'bg-white text-[#2B2119]' : 'bg-[#F7F1E7] text-[#2B2119]'}`}>
                                    <div className="flex items-center justify-between gap-4">
                                      <span className="text-[10px] font-bold uppercase tracking-widest">{entry.sender === 'admin' ? 'Timberbell' : 'You'}</span>
                                      <span className="text-[10px] text-[#8C7A6B]">{new Date(entry.createdAt).toLocaleString()}</span>
                                    </div>
                                    <p className="mt-2 whitespace-pre-wrap text-sm">{entry.message}</p>
                                  </div>
                                ))}
                              </div>

                              <div className="mt-4 space-y-3">
                                <textarea
                                  value={replyDrafts[refund.id] || ''}
                                  onChange={(e) => setReplyDrafts((prev) => ({ ...prev, [refund.id]: e.target.value }))}
                                  placeholder="Reply to the refund desk..."
                                  className="h-24 w-full rounded-2xl border border-[#E6D9C8] bg-white px-4 py-3 text-sm"
                                />
                                <button
                                  onClick={() => sendRefundReply(refund.id)}
                                  disabled={replyingRefundId === refund.id}
                                  className="rounded-full border border-[#7C4E2F] px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-[#7C4E2F] disabled:opacity-60"
                                >
                                  {replyingRefundId === refund.id ? 'Sending...' : 'Send Message'}
                                </button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="mt-3 text-sm text-[#6B594A]">No orders yet.</p>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-[#E6D9C8] bg-[#F4EEE4] p-6 text-sm text-[#6B594A] lg:sticky lg:top-28">
            <div className="text-xs uppercase tracking-[0.3em] text-[#8C7A6B]">Concierge notes</div>
            <p className="mt-4">Keep your profile updated so the studio can reach you about delivery windows, refund replies, and styling notes.</p>
          </div>
        </div>
      )}
    </div>
  )
}
