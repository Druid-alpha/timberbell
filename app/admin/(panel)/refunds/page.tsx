'use client'

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
    if (!selected) return

    const previousBodyOverflow = document.body.style.overflow
    const previousHtmlOverflow = document.documentElement.style.overflow
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousBodyOverflow
      document.documentElement.style.overflow = previousHtmlOverflow
    }
  }, [selected])

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
              <button
                type="button"
                onClick={() => {
                  setSelected(refund)
                  setAdminMessage('')
                }}
                className="rounded-full border border-[#E6D9C8] px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-[#7C4E2F] transition hover:bg-[#FCFAF6] active:scale-[0.98]"
              >
                Review
              </button>
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
        <div className="fixed inset-0 z-[90] flex items-end justify-center bg-[#2B2119]/50 p-0 backdrop-blur-sm sm:items-center sm:p-6">
          <button type="button" aria-label="Close refund review" className="absolute inset-0" onClick={() => setSelected(null)} />
          <div className="relative flex max-h-[94vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-[32px] border border-[#E6D9C8] bg-[#F4EEE4] shadow-2xl sm:rounded-[32px]">
            <div className="sticky top-0 z-10 border-b border-[#E6D9C8] bg-[#F4EEE4]/95 px-5 pb-4 pt-3 backdrop-blur sm:px-6 sm:pt-5">
              <div className="mx-auto mb-3 h-1.5 w-16 rounded-full bg-[#D8C7B3] sm:hidden" />
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#8C7A6B]">Refund Review</p>
                  <h2 className="mt-2 font-display text-2xl text-[#2B2119]">{selected.customerName}</h2>
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-[#8C7A6B]">Order #{selected.orderId.slice(-6).toUpperCase()}</p>
                </div>
                <button onClick={() => setSelected(null)} className="text-[10px] font-bold uppercase tracking-widest text-[#8C7A6B]">Close</button>
              </div>
            </div>

            <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5 text-sm text-[#2B2119] sm:px-6 sm:py-6">
              <div className="grid gap-4 rounded-[28px] border border-[#E6D9C8] bg-white p-4 sm:grid-cols-2">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#8C7A6B]">Customer</p>
                  <p className="mt-2 font-semibold text-[#2B2119]">{selected.customerName}</p>
                  <p className="mt-1 text-sm text-[#6B594A]">{selected.customerEmail}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#8C7A6B]">Reason</p>
                  <p className="mt-2 text-[#2B2119]">{selected.reason}</p>
                </div>
              </div>

              <div className="rounded-[28px] border border-[#E6D9C8] bg-white p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#8C7A6B]">Complaint</p>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-[#2B2119]">{selected.message}</p>
              </div>

              {selected.attachments?.length ? (
                <div className="space-y-2 rounded-[28px] border border-[#E6D9C8] bg-white p-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#8C7A6B]">Attachments</p>
                  <div className="flex flex-wrap gap-3">
                    {selected.attachments.map((file) => (
                      <a key={file} href={file} target="_blank" rel="noreferrer" className="rounded-full border border-[#E6D9C8] bg-[#FCFAF6] px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-[#7C4E2F]">
                        Open file
                      </a>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="space-y-3 rounded-[28px] border border-[#E6D9C8] bg-white p-4">
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
                className="h-32 w-full rounded-2xl border border-[#E6D9C8] bg-white px-4 py-3"
              />
            </div>

            <div className="sticky bottom-0 z-10 border-t border-[#E6D9C8] bg-[#F4EEE4]/95 px-5 py-4 backdrop-blur sm:px-6">
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
        </div>
      ) : null}
    </div>
  )
}
