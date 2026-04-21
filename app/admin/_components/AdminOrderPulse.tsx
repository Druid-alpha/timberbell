'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { formatMoney } from '@/lib/utils/format'

type OrderSummary = {
  id: string
  customerName: string
  total: number
  createdAt?: string
  status: string
}

const STORAGE_KEY = 'timberbell_admin_last_seen_order'

export default function AdminOrderPulse() {
  const [latestOrder, setLatestOrder] = useState<OrderSummary | null>(null)
  const [pendingCount, setPendingCount] = useState(0)
  const [unseenCount, setUnseenCount] = useState(0)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    let active = true
    let isFirstLoad = true

    async function loadSummary() {
      const res = await fetch('/api/admin/orders/summary', { cache: 'no-store' })
      const data = await res.json().catch(() => ({}))
      if (!active || !res.ok) return

      const nextLatest = data.latestOrder ?? null
      const lastSeen = window.localStorage.getItem(STORAGE_KEY)
      setPendingCount(Number(data.pendingCount || 0))
      setLatestOrder(nextLatest)

      if (nextLatest?.id) {
        if (isFirstLoad) {
          if (!lastSeen) window.localStorage.setItem(STORAGE_KEY, nextLatest.id)
          isFirstLoad = false
        } else if (lastSeen && lastSeen !== nextLatest.id) {
          setUnseenCount((count) => count + 1)
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('New Timberbell order', {
              body: `${nextLatest.customerName} placed ${formatMoney(nextLatest.total)}`,
            })
          }
        }
      }
    }

    void loadSummary()
    const interval = window.setInterval(loadSummary, 30000)
    return () => {
      active = false
      window.clearInterval(interval)
    }
  }, [])

  const badgeCount = useMemo(() => unseenCount, [unseenCount])

  function markLatestSeen() {
    if (latestOrder?.id) {
      window.localStorage.setItem(STORAGE_KEY, latestOrder.id)
    }
    setUnseenCount(0)
  }

  function toggleOpen() {
    markLatestSeen()
    setOpen((current) => !current)
  }

  async function enableAlerts() {
    if ('Notification' in window) {
      await Notification.requestPermission()
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={toggleOpen}
        title="Order pulse"
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
        <div className="absolute left-1/2 z-20 mt-3 w-[min(20rem,calc(100vw-1rem))] -translate-x-1/2 rounded-[28px] border border-[#E6D9C8] bg-white p-4 shadow-2xl sm:left-auto sm:right-0 sm:w-[20rem] sm:translate-x-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#8C7A6B]">Order Pulse</p>
              <h3 className="mt-1 font-display text-xl text-[#2B2119]">Fulfillment radar</h3>
            </div>
            <span className="rounded-full bg-[#F4EEE4] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#7C4E2F]">
              {pendingCount} active
            </span>
          </div>

          {latestOrder ? (
            <div className="mt-4 rounded-3xl border border-[#E6D9C8] bg-[#FCFAF6] p-4">
              <p className="text-sm font-bold text-[#2B2119]">{latestOrder.customerName}</p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-[#8C7A6B]">
                {latestOrder.status.replace('_', ' ')} • {formatMoney(latestOrder.total)}
              </p>
              <p className="mt-1 text-xs text-[#8C7A6B]">
                {latestOrder.createdAt ? new Date(latestOrder.createdAt).toLocaleString() : 'Just now'}
              </p>
            </div>
          ) : (
            <p className="mt-4 text-sm text-[#8C7A6B]">No new orders yet.</p>
          )}

          {'Notification' in window && Notification.permission !== 'granted' ? (
            <button
              type="button"
              onClick={enableAlerts}
              className="mt-4 w-full rounded-full border border-[#E6D9C8] px-4 py-3 text-[10px] font-bold uppercase tracking-[0.12em] text-[#2B2119] transition hover:bg-[#FCFAF6]"
            >
              Enable Browser Alerts
            </button>
          ) : null}

          <Link
            href="/admin/orders"
            onClick={() => {
              markLatestSeen()
              setOpen(false)
            }}
            className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-[#2B2119] px-4 py-3 text-[10px] font-bold uppercase tracking-[0.12em] text-white"
          >
            Open Fulfillment
          </Link>
        </div>
      ) : null}
    </div>
  )
}
