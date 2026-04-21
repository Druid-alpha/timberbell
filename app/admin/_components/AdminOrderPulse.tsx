'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { formatMoney } from '@/lib/utils/format'

type ActivitySummary = {
  latestOrder: {
    id: string
    customerName: string
    total: number
    createdAt?: string
    status: string
  } | null
  latestRefund: {
    id: string
    customerName: string
    createdAt?: string
    status: string
  } | null
  latestUser: {
    id: string
    name: string
    email: string
    createdAt?: string
  } | null
  newCounts: {
    orders: number
    refunds: number
    users: number
    total: number
  }
  lastActivityAt: string | null
}

const STORAGE_KEY = 'timberbell_admin_activity_seen_at'

export default function AdminOrderPulse() {
  const [summary, setSummary] = useState<ActivitySummary | null>(null)
  const [open, setOpen] = useState(false)
  const [seenAt, setSeenAt] = useState<string | null>(null)

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    setSeenAt(stored)
  }, [])

  useEffect(() => {
    let active = true
    let isInitialLoad = true

    async function loadSummary(currentSeenAt?: string | null) {
      const params = new URLSearchParams()
      if (currentSeenAt) params.set('since', currentSeenAt)
      const query = params.toString()
      const res = await fetch(`/api/admin/orders/summary${query ? `?${query}` : ''}`, { cache: 'no-store' })
      const data = await res.json().catch(() => null)
      if (!active || !res.ok || !data) return

      setSummary(data)

      if (isInitialLoad && !currentSeenAt && data.lastActivityAt) {
        window.localStorage.setItem(STORAGE_KEY, data.lastActivityAt)
        setSeenAt(data.lastActivityAt)
      }

      if (!isInitialLoad && data.newCounts?.total > 0 && 'Notification' in window && Notification.permission === 'granted') {
        new Notification('New Timberbell admin activity', {
          body: [
            data.newCounts.orders ? `${data.newCounts.orders} order${data.newCounts.orders > 1 ? 's' : ''}` : null,
            data.newCounts.refunds ? `${data.newCounts.refunds} refund${data.newCounts.refunds > 1 ? 's' : ''}` : null,
            data.newCounts.users ? `${data.newCounts.users} user${data.newCounts.users > 1 ? 's' : ''}` : null,
          ].filter(Boolean).join(' • '),
        })
      }

      isInitialLoad = false
    }

    void loadSummary(seenAt)
    const interval = window.setInterval(() => {
      void loadSummary(window.localStorage.getItem(STORAGE_KEY))
    }, 30000)

    return () => {
      active = false
      window.clearInterval(interval)
    }
  }, [seenAt])

  const badgeCount = useMemo(() => Number(summary?.newCounts?.total || 0), [summary])

  function markSeen() {
    if (!summary?.lastActivityAt) return
    window.localStorage.setItem(STORAGE_KEY, summary.lastActivityAt)
    setSeenAt(summary.lastActivityAt)
    setSummary((current) =>
      current
        ? {
            ...current,
            newCounts: { orders: 0, refunds: 0, users: 0, total: 0 },
          }
        : current
    )
  }

  function openPanel() {
    markSeen()
    setOpen(true)
  }

  function closePanel() {
    setOpen(false)
  }

  async function enableAlerts() {
    if ('Notification' in window) {
      await Notification.requestPermission()
    }
  }

  return (
    <div className="relative sm:static">
      <button
        type="button"
        onClick={() => (open ? closePanel() : openPanel())}
        title="Admin activity"
        className="relative flex h-10 min-w-10 items-center justify-center rounded-full border border-[#E6D9C8] bg-white px-3 transition hover:bg-[#FCFAF6]"
      >
        <svg className="h-4 w-4 text-[#8C7A6B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {badgeCount > 0 ? (
          <span className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-[#7C4E2F] px-1 text-[10px] font-bold text-white">
            {badgeCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <>
          <button
            type="button"
            aria-label="Close admin activity"
            onClick={closePanel}
            className="fixed inset-0 z-[19] bg-black/20 backdrop-blur-[1px] sm:hidden"
          />
          <div className="fixed left-1/2 top-20 z-20 w-[min(20rem,calc(100vw-1.5rem))] -translate-x-1/2 rounded-[28px] border border-[#E6D9C8] bg-white p-4 shadow-2xl sm:absolute sm:right-0 sm:top-full sm:mt-3 sm:w-[20rem] sm:translate-x-0">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#8C7A6B]">Admin Activity</p>
                <h3 className="mt-1 font-display text-xl text-[#2B2119]">What&apos;s new</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-[#F4EEE4] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#7C4E2F]">
                  {badgeCount} new
                </span>
                <button
                  type="button"
                  onClick={closePanel}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#E6D9C8] text-[#8C7A6B] transition hover:bg-[#FCFAF6]"
                  aria-label="Close activity panel"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <div className="rounded-3xl border border-[#E6D9C8] bg-[#FCFAF6] p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#8C7A6B]">
                  Orders
                  {summary?.newCounts?.orders ? ` • ${summary.newCounts.orders} new` : ''}
                </p>
                <p className="mt-1 text-sm font-bold text-[#2B2119]">{summary?.latestOrder?.customerName || 'No recent order'}</p>
                {summary?.latestOrder ? (
                  <p className="mt-1 text-xs text-[#8C7A6B]">
                    {summary.latestOrder.status.replace('_', ' ')} • {formatMoney(summary.latestOrder.total)}
                  </p>
                ) : null}
              </div>

              <div className="rounded-3xl border border-[#E6D9C8] bg-[#FCFAF6] p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#8C7A6B]">
                  Refunds
                  {summary?.newCounts?.refunds ? ` • ${summary.newCounts.refunds} new` : ''}
                </p>
                <p className="mt-1 text-sm font-bold text-[#2B2119]">{summary?.latestRefund?.customerName || 'No recent refund'}</p>
                {summary?.latestRefund ? (
                  <p className="mt-1 text-xs text-[#8C7A6B]">{summary.latestRefund.status.replace('_', ' ')}</p>
                ) : null}
              </div>

              <div className="rounded-3xl border border-[#E6D9C8] bg-[#FCFAF6] p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#8C7A6B]">
                  New Users
                  {summary?.newCounts?.users ? ` • ${summary.newCounts.users} new` : ''}
                </p>
                <p className="mt-1 text-sm font-bold text-[#2B2119]">{summary?.latestUser?.name || 'No recent user'}</p>
                {summary?.latestUser ? (
                  <p className="mt-1 text-xs text-[#8C7A6B]">{summary.latestUser.email}</p>
                ) : null}
              </div>
            </div>

            {'Notification' in window && Notification.permission !== 'granted' ? (
              <button
                type="button"
                onClick={enableAlerts}
                className="mt-4 w-full rounded-full border border-[#E6D9C8] px-4 py-3 text-[10px] font-bold uppercase tracking-[0.12em] text-[#2B2119] transition hover:bg-[#FCFAF6]"
              >
                Enable Browser Alerts
              </button>
            ) : null}

            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              <Link
                href="/admin/orders"
                onClick={closePanel}
                className="inline-flex items-center justify-center rounded-full bg-[#2B2119] px-4 py-3 text-[10px] font-bold uppercase tracking-[0.12em] text-white"
              >
                Orders
              </Link>
              <Link
                href="/admin/refunds"
                onClick={closePanel}
                className="inline-flex items-center justify-center rounded-full border border-[#E6D9C8] px-4 py-3 text-[10px] font-bold uppercase tracking-[0.12em] text-[#2B2119]"
              >
                Refunds
              </Link>
              <Link
                href="/admin/users"
                onClick={closePanel}
                className="inline-flex items-center justify-center rounded-full border border-[#E6D9C8] px-4 py-3 text-[10px] font-bold uppercase tracking-[0.12em] text-[#2B2119]"
              >
                Users
              </Link>
            </div>

            {seenAt ? (
              <p className="mt-3 text-center text-[10px] text-[#8C7A6B]">
                Last checked {new Date(seenAt).toLocaleString()}
              </p>
            ) : null}
          </div>
        </>
      ) : null}
    </div>
  )
}
