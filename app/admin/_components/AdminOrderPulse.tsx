'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'

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

function readSeenAt() {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem(STORAGE_KEY)
}

export default function AdminOrderPulse() {
  const [summary, setSummary] = useState<ActivitySummary | null>(null)
  const [open, setOpen] = useState(false)
  const [seenAt, setSeenAt] = useState<string | null>(() => readSeenAt())

  useEffect(() => {
    let active = true
    let firstLoad = true

    async function loadSummary(currentSeenAt: string | null) {
      const params = new URLSearchParams()
      if (currentSeenAt) params.set('since', currentSeenAt)
      const res = await fetch(`/api/admin/orders/summary${params.toString() ? `?${params.toString()}` : ''}`, { cache: 'no-store' })
      const data = await res.json().catch(() => null)
      if (!active || !res.ok || !data) return

      if (firstLoad && !currentSeenAt && data.lastActivityAt) {
        window.localStorage.setItem(STORAGE_KEY, data.lastActivityAt)
        setSeenAt(data.lastActivityAt)
        setSummary({
          ...data,
          newCounts: { orders: 0, refunds: 0, users: 0, total: 0 },
        })
        firstLoad = false
        return
      }

      setSummary(data)
      firstLoad = false
    }

    void loadSummary(seenAt)
    const interval = window.setInterval(() => {
      void loadSummary(readSeenAt())
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

  function togglePanel() {
    if (open) {
      setOpen(false)
      return
    }
    markSeen()
    setOpen(true)
  }

  const sections = [
    {
      key: 'orders',
      title: 'Orders',
      href: '/admin/orders',
      count: summary?.newCounts?.orders || 0,
      name: summary?.latestOrder?.customerName || 'No new order',
      meta: summary?.latestOrder?.status || '',
    },
    {
      key: 'refunds',
      title: 'Refunds',
      href: '/admin/refunds',
      count: summary?.newCounts?.refunds || 0,
      name: summary?.latestRefund?.customerName || 'No new refund',
      meta: summary?.latestRefund?.status || '',
    },
    {
      key: 'users',
      title: 'New Users',
      href: '/admin/users',
      count: summary?.newCounts?.users || 0,
      name: summary?.latestUser?.name || 'No new user',
      meta: summary?.latestUser?.email || '',
    },
  ]

  return (
    <div className="relative sm:static">
      <button
        type="button"
        onClick={togglePanel}
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
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[19] bg-black/20 backdrop-blur-[1px] sm:hidden"
          />
          <div className="fixed left-1/2 top-20 z-20 w-[min(20rem,calc(100vw-1.5rem))] -translate-x-1/2 rounded-[28px] border border-[#E6D9C8] bg-white p-4 shadow-2xl sm:absolute sm:right-0 sm:top-full sm:mt-3 sm:w-[20rem] sm:translate-x-0">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#8C7A6B]">Admin Activity</p>
                <h3 className="mt-1 font-display text-xl text-[#2B2119]">{badgeCount > 0 ? `${badgeCount} new` : 'You are up to date'}</h3>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#E6D9C8] text-[#8C7A6B] transition hover:bg-[#FCFAF6]"
                aria-label="Close activity panel"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            {badgeCount > 0 ? (
              <div className="mt-4 space-y-3">
                {sections
                  .filter((section) => section.count > 0)
                  .map((section) => (
                    <Link
                      key={section.key}
                      href={section.href}
                      onClick={() => setOpen(false)}
                      className="block rounded-3xl border border-[#E6D9C8] bg-[#FCFAF6] p-4 transition hover:bg-white"
                    >
                      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#8C7A6B]">{section.title}</p>
                      <p className="mt-1 text-sm font-bold text-[#2B2119]">{section.name}</p>
                      <p className="mt-1 text-xs text-[#8C7A6B]">{section.count} new</p>
                      {section.meta ? <p className="mt-1 text-xs text-[#8C7A6B]">{section.meta.replaceAll('_', ' ')}</p> : null}
                    </Link>
                  ))}
              </div>
            ) : (
              <div className="mt-4 rounded-3xl border border-dashed border-[#E6D9C8] bg-[#FCFAF6] px-4 py-6 text-center text-sm text-[#8C7A6B]">
                No unseen orders, refunds, or new users right now.
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  )
}
