'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

type RefundMessage = {
  sender: 'admin' | 'customer'
  message: string
  createdAt: string
}

type Refund = {
  id: string
  orderId: string
  customerName: string
  customerEmail: string
  reason: string
  message: string
  attachments?: string[]
  status: string
  adminMessage?: string
  conversation?: RefundMessage[]
  createdAt: string
}

const statusOptions = ['pending', 'approved', 'rejected']
const statusClasses: Record<string, string> = {
  pending: 'border-amber-200 bg-amber-50 text-amber-700',
  approved: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  rejected: 'border-red-200 bg-red-50 text-red-700',
}

export default function AdminRefundsPage() {
  const searchParams = useSearchParams()
  const [refunds, setRefunds] = useState<Refund[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Refund | null>(null)
  const [adminMessage, setAdminMessage] = useState('')
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')

  async function loadRefunds(selectedId?: string | null) {
    const res = await fetch('/api/refunds', { cache: 'no-store' })
    const data = await res.json().catch(() => ({}))
    const nextRefunds = data.refunds || []
    setRefunds(nextRefunds)
    if (selectedId) {
      const nextSelected = nextRefunds.find((refund: Refund) => refund.id === selectedId) || null
      setSelected(nextSelected)
      if (nextSelected) {
        setAdminMessage('')
      }
    }
    setLoading(false)
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadRefunds()
    }, 0)

    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    const selectedId = searchParams.get('refund')
    if (!selectedId || !refunds.length) return
    const match = refunds.find((refund) => refund.id === selectedId) || null
    setSelected(match)
    setAdminMessage('')
  }, [searchParams, refunds])

  const filteredRefunds = refunds.filter((refund) => {
    const matchesFilter = filter === 'all' ? true : refund.status === filter
    const needle = query.trim().toLowerCase()
    const matchesQuery =
      !needle ||
      refund.customerName.toLowerCase().includes(needle) ||
      refund.customerEmail.toLowerCase().includes(needle) ||
      refund.orderId.toLowerCase().includes(needle) ||
      refund.reason.toLowerCase().includes(needle)

    return matchesFilter && matchesQuery
  })

  async function updateRefund(id: string, payload: Record<string, string>) {
    setBusy(true)
    setNotice('')
    const res = await fetch(`/api/refunds/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const json = await res.json().catch(() => ({}))
    setBusy(false)
    setNotice(json.message || (res.ok ? 'Refund updated.' : 'Unable to update refund request.'))
    if (res.ok) {
      setAdminMessage('')
      await loadRefunds(selected?.id === id ? id : null)
    }
  }

  if (loading) {
    return <div className="text-[10px] uppercase tracking-widest text-[#8C7A6B]">Loading refund desk...</div>
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-4xl text-[#2B2119]">Refund Desk</h1>
        <p className="mt-2 text-sm text-[#8C7A6B]">Review customer complaints, attachments, status actions, and message replies.</p>
      </div>

      {notice ? (
        <div className="rounded-[28px] border border-[#E6D9C8] bg-[#FDF7F0] px-5 py-4 text-sm text-[#6B594A]">{notice}</div>
      ) : null}

      <div className="flex flex-col gap-3 rounded-[28px] border border-[#E6D9C8] bg-[#FCFAF6] p-4 sm:flex-row sm:items-center sm:justify-between">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by customer, email, reason, or order"
          className="h-11 w-full rounded-full border border-[#E6D9C8] bg-white px-4 text-sm outline-none sm:max-w-md"
        />
        <div className="flex flex-wrap gap-2">
          {['all', ...statusOptions].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`rounded-full border px-4 py-2 text-[10px] font-bold uppercase tracking-widest ${
                filter === status ? 'border-[#7C4E2F] bg-[#7C4E2F] text-white' : 'border-[#E6D9C8] bg-white text-[#7C4E2F]'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4">
        {filteredRefunds.map((refund) => (
          <div key={refund.id} className="rounded-[28px] border border-[#E6D9C8] bg-white p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-bold text-[#2B2119]">{refund.customerName}</p>
                <p className="text-[10px] uppercase tracking-widest text-[#8C7A6B]">Order #{refund.orderId.slice(-6).toUpperCase()}</p>
              </div>
              <span className={`rounded-full border px-3 py-1 text-[9px] font-bold uppercase tracking-widest ${statusClasses[refund.status] || 'border-[#E6D9C8] bg-[#FCFAF6] text-[#7C4E2F]'}`}>
                {refund.status}
              </span>
              <Link
                href={`/admin/refunds?refund=${refund.id}`}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-[#E6D9C8] px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-[#7C4E2F] transition hover:bg-[#FCFAF6] active:scale-[0.98]"
              >
                Review
              </Link>
            </div>
            <p className="mt-3 text-sm text-[#6B594A]">{refund.reason}</p>
          </div>
        ))}
        {filteredRefunds.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-[#E6D9C8] bg-white p-10 text-center text-sm text-[#8C7A6B]">
            No refund requests match this search yet.
          </div>
        ) : null}
      </div>

      {selected ? (
        <div className="rounded-[32px] border border-[#E6D9C8] bg-[#F4EEE4] p-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-display text-2xl text-[#2B2119]">Refund Review</h2>
            <button onClick={() => setSelected(null)} className="text-[10px] font-bold uppercase tracking-widest text-[#8C7A6B]">Close</button>
          </div>
          <div className="mt-4 space-y-4 text-sm text-[#2B2119]">
            <p><strong>Customer:</strong> {selected.customerName} ({selected.customerEmail})</p>
            <p><strong>Reason:</strong> {selected.reason}</p>
            <p><strong>Complaint:</strong> {selected.message}</p>
            {selected.attachments?.length ? (
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#8C7A6B]">Attachments</p>
                <div className="flex flex-wrap gap-3">
                  {selected.attachments.map((file) => (
                    <a key={file} href={file} target="_blank" rel="noreferrer" className="rounded-full border border-[#E6D9C8] bg-white px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-[#7C4E2F]">
                      Open file
                    </a>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="space-y-3 rounded-3xl border border-[#E6D9C8] bg-white p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#8C7A6B]">Conversation</p>
              {(selected.conversation?.length ? selected.conversation : [{ sender: 'customer', message: selected.message, createdAt: selected.createdAt }]).map((entry, index) => (
                <div key={`${entry.createdAt}-${index}`} className={`rounded-2xl px-4 py-3 ${entry.sender === 'admin' ? 'bg-[#2B2119] text-[#F4EEE4]' : 'bg-[#FCFAF6] text-[#2B2119]'}`}>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-[10px] font-bold uppercase tracking-widest">{entry.sender === 'admin' ? 'Timberbell' : selected.customerName}</span>
                    <span className="text-[10px] opacity-70">{new Date(entry.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-sm">{entry.message}</p>
                </div>
              ))}
            </div>

            <textarea
              value={adminMessage}
              onChange={(e) => setAdminMessage(e.target.value)}
              placeholder="Reply to customer..."
              className="h-28 w-full rounded-2xl border border-[#E6D9C8] bg-white px-4 py-3"
            />
            <div className="flex flex-wrap gap-3">
              {statusOptions.map((status) => (
                <button
                  key={status}
                  onClick={() => updateRefund(selected.id, { status, adminMessage })}
                  disabled={busy}
                  className={`rounded-full border px-4 py-2 text-[10px] font-bold uppercase tracking-widest disabled:opacity-60 ${statusClasses[status] || 'border-[#7C4E2F] text-[#7C4E2F]'}`}
                >
                  {busy ? 'Saving...' : status}
                </button>
              ))}
              <button
                onClick={() => updateRefund(selected.id, { adminMessage })}
                disabled={busy || !adminMessage.trim()}
                className="rounded-full bg-[#7C4E2F] px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-white disabled:opacity-60"
              >
                {busy ? 'Sending...' : 'Send Message'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
