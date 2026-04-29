'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import Breadcrumb from '@/app/_components/Breadcrumb'
import SectionHeading from '@/app/_components/SectionHeading'

type RefundMessage = {
  sender: 'admin' | 'customer'
  message: string
  createdAt: string
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

export default function RefundDetailPage() {
  const params = useParams<{ id: string }>()
  const refundId = params?.id
  const [refund, setRefund] = useState<RefundRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [notice, setNotice] = useState('')
  const [reply, setReply] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (!refundId) return

    let active = true

    async function loadRefund() {
      const res = await fetch(`/api/refunds/${refundId}`, { cache: 'no-store' })
      const data = await res.json().catch(() => ({}))

      if (!active) return

      if (!res.ok) {
        setNotice(data.message || 'Unable to load refund request.')
        setRefund(null)
      } else {
        setRefund(data.refund || null)
      }
      setLoading(false)
    }

    void loadRefund()

    return () => {
      active = false
    }
  }, [refundId])

  async function sendReply() {
    if (!refundId || !reply.trim()) {
      setNotice('Write a message before sending.')
      return
    }

    setSending(true)
    const res = await fetch(`/api/refunds/${refundId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: reply.trim() }),
    })
    const data = await res.json().catch(() => ({}))
    setSending(false)

    if (!res.ok) {
      setNotice(data.message || 'Unable to send message.')
      return
    }

    setReply('')
    setNotice('Message sent to the refund desk.')

    const refresh = await fetch(`/api/refunds/${refundId}`, { cache: 'no-store' })
    const refreshData = await refresh.json().catch(() => ({}))
    if (refresh.ok) {
      setRefund(refreshData.refund || null)
    }
  }

  const conversation = refund?.conversation?.length
    ? refund.conversation
    : refund
      ? [{ sender: 'customer' as const, message: refund.message, createdAt: refund.createdAt }]
      : []

  if (loading) {
    return <div className="mx-auto max-w-5xl px-4 py-16 text-sm text-[#6B594A]">Opening refund thread...</div>
  }

  if (!refund) {
    return (
      <div className="mx-auto max-w-5xl space-y-6 px-4 py-16 sm:px-6">
        <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Account', href: '/account' }, { label: 'Refund' }]} />
        <div className="rounded-3xl border border-[#E6D9C8] bg-white p-6 text-sm text-[#6B594A]">
          {notice || 'Refund request not found.'}
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-12 sm:px-6 sm:py-16">
      <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Account', href: '/account' }, { label: `Refund ${refund.id.slice(-6).toUpperCase()}` }]} />

      <SectionHeading
        eyebrow="Refund Thread"
        title={`Refund ${refund.id.slice(-6).toUpperCase()}`}
        description=""
      />

      {notice ? (
        <div className="rounded-3xl border border-[#E6D9C8] bg-white p-4 text-sm text-[#6B594A]">{notice}</div>
      ) : null}

      <div className="rounded-3xl border border-[#E6D9C8] bg-[linear-gradient(180deg,#f8f1e8,#fffdfa)] p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#8C7A6B]">Refund status</p>
            <p className="mt-2 text-lg font-semibold capitalize text-[#2B2119]">{refund.status}</p>
          </div>
          <div className="text-sm text-[#6B594A]">Order: {refund.orderId}</div>
        </div>

        <div className="mt-6 rounded-2xl border border-[#E6D9C8] bg-white p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#8C7A6B]">Reason</p>
          <p className="mt-2 text-sm text-[#2B2119]">{refund.reason}</p>
        </div>

        {refund.attachments?.length ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {refund.attachments.map((file) => (
              <a key={file} href={file} target="_blank" rel="noreferrer" className="rounded-full border border-[#E6D9C8] bg-white px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-[#7C4E2F]">
                Attachment
              </a>
            ))}
          </div>
        ) : null}
      </div>

      <div className="space-y-4">
        {conversation.map((entry, index) => (
          <div key={`${entry.createdAt}-${index}`} className={`rounded-2xl border border-[#E6D9C8] px-5 py-4 text-sm shadow-sm ${entry.sender === 'admin' ? 'bg-white text-[#2B2119]' : 'bg-[#F7F1E7] text-[#2B2119]'}`}>
            <div className="flex items-center justify-between gap-4">
              <span className="text-[10px] font-bold uppercase tracking-widest">{entry.sender === 'admin' ? 'Timberbell' : 'You'}</span>
              <span className="text-[10px] text-[#8C7A6B]">{new Date(entry.createdAt).toLocaleString()}</span>
            </div>
            <p className="mt-2 whitespace-pre-wrap">{entry.message}</p>
          </div>
        ))}
      </div>

      <div className="rounded-3xl border border-[#E6D9C8] bg-white p-6 shadow-sm">
        <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#8C7A6B]">Reply</p>
        <textarea
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          placeholder="Reply to the refund desk..."
          className="mt-4 h-28 w-full rounded-2xl border border-[#E6D9C8] px-4 py-3 text-sm"
        />
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={sendReply}
            disabled={sending}
            className="rounded-full bg-[#7C4E2F] px-6 py-3 text-[10px] font-bold uppercase tracking-[0.25em] text-white disabled:opacity-60"
          >
            {sending ? 'Sending...' : 'Send Message'}
          </button>
          <Link href="/account" className="rounded-full border border-[#E6D9C8] px-6 py-3 text-[10px] font-bold uppercase tracking-[0.25em] text-[#2B2119]">
            Back to account
          </Link>
        </div>
      </div>
    </div>
  )
}
