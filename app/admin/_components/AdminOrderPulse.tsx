'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ADMIN_ACTIVITY_EVENT,
  notifyAdminActivitySeen,
  readAdminActivitySeenAt,
  type AdminActivitySection,
} from '@/lib/adminActivity'

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

const SOUND_ARMED_KEY = 'timberbell_admin_activity_sound_armed'

function readSoundArmed() {
  if (typeof window === 'undefined') return false
  return window.localStorage.getItem(SOUND_ARMED_KEY) === 'true'
}

export default function AdminOrderPulse() {
  const [summary, setSummary] = useState<ActivitySummary | null>(null)
  const [open, setOpen] = useState(false)
  const [seenAt, setSeenAt] = useState<Record<AdminActivitySection, string | null>>(() => ({
    orders: readAdminActivitySeenAt('orders'),
    refunds: readAdminActivitySeenAt('refunds'),
    users: readAdminActivitySeenAt('users'),
  }))
  const [soundArmed, setSoundArmed] = useState<boolean>(() => readSoundArmed())
  const initializedRef = useRef(false)
  const previousOrderCountRef = useRef(0)
  const previousRefundCountRef = useRef(0)
  const previousUserCountRef = useRef(0)
  const pollMs = 5000

  useEffect(() => {
    let active = true

    async function loadSummary(currentSeenAt: Record<AdminActivitySection, string | null>) {
      const params = new URLSearchParams()
      if (currentSeenAt.orders) params.set('sinceOrders', currentSeenAt.orders)
      if (currentSeenAt.refunds) params.set('sinceRefunds', currentSeenAt.refunds)
      if (currentSeenAt.users) params.set('sinceUsers', currentSeenAt.users)
      const res = await fetch(`/api/admin/orders/summary${params.toString() ? `?${params.toString()}` : ''}`, { cache: 'no-store' })
      const data = await res.json().catch(() => null)
      if (!active || !res.ok || !data) return

      setSummary(data)
    }

    void loadSummary(seenAt)
    const interval = window.setInterval(() => {
      void loadSummary({
        orders: readAdminActivitySeenAt('orders'),
        refunds: readAdminActivitySeenAt('refunds'),
        users: readAdminActivitySeenAt('users'),
      })
    }, pollMs)

    return () => {
      active = false
      window.clearInterval(interval)
    }
  }, [seenAt])

  const badgeCount = useMemo(() => Number(summary?.newCounts?.total || 0), [summary])

  useEffect(() => {
    if (!summary) return
    const nextOrderCount = Number(summary.newCounts?.orders || 0)
    const nextRefundCount = Number(summary.newCounts?.refunds || 0)
    const nextUserCount = Number(summary.newCounts?.users || 0)
    const shouldPlayOrder = initializedRef.current && soundArmed && nextOrderCount > previousOrderCountRef.current
    const shouldPlayRefund = initializedRef.current && soundArmed && nextRefundCount > previousRefundCountRef.current
    const shouldPlayUser = initializedRef.current && soundArmed && nextUserCount > previousUserCountRef.current
    previousOrderCountRef.current = nextOrderCount
    previousRefundCountRef.current = nextRefundCount
    previousUserCountRef.current = nextUserCount
    initializedRef.current = true

    const queue: Array<'orders' | 'refunds' | 'users'> = []
    if (shouldPlayOrder) queue.push('orders')
    if (shouldPlayRefund) queue.push('refunds')
    if (shouldPlayUser) queue.push('users')
    if (queue.length) playNotificationQueue(queue)
  }, [summary, soundArmed])

  useEffect(() => {
    function handleSeenEvent(event: Event) {
      const detail = (event as CustomEvent<{ section?: AdminActivitySection; value?: string }>).detail
      if (!detail?.section || !detail?.value) return
      const section = detail.section as AdminActivitySection
      const value = detail.value
      setSeenAt((current) => ({ ...current, [section]: value || null }))
      setSummary((current) =>
        current
          ? {
              ...current,
              newCounts: {
                ...current.newCounts,
                [section]: 0,
                total:
                  (section === 'orders' ? 0 : Number(current.newCounts.orders || 0)) +
                  (section === 'refunds' ? 0 : Number(current.newCounts.refunds || 0)) +
                  (section === 'users' ? 0 : Number(current.newCounts.users || 0)),
              },
            }
          : current
      )
    }

    window.addEventListener(ADMIN_ACTIVITY_EVENT, handleSeenEvent as EventListener)

    return () => {
      window.removeEventListener(ADMIN_ACTIVITY_EVENT, handleSeenEvent as EventListener)
    }
  }, [])

  useEffect(() => {
    if (soundArmed) return

    function armSound() {
      window.localStorage.setItem(SOUND_ARMED_KEY, 'true')
      setSoundArmed(true)
      window.removeEventListener('pointerdown', armSound)
      window.removeEventListener('keydown', armSound)
    }

    window.addEventListener('pointerdown', armSound)
    window.addEventListener('keydown', armSound)

    return () => {
      window.removeEventListener('pointerdown', armSound)
      window.removeEventListener('keydown', armSound)
    }
  }, [soundArmed])

  function markSeen(section: AdminActivitySection | 'all') {
    if (!summary) return

    if (section === 'all') {
      ;(['orders', 'refunds', 'users'] as AdminActivitySection[]).forEach((entry) => {
        const value =
          entry === 'orders'
            ? summary.latestOrder?.createdAt || null
            : entry === 'refunds'
              ? summary.latestRefund?.createdAt || null
              : summary.latestUser?.createdAt || null
        notifyAdminActivitySeen(entry, value)
      })
      return
    }

    const value =
      section === 'orders'
        ? summary.latestOrder?.createdAt || null
        : section === 'refunds'
          ? summary.latestRefund?.createdAt || null
          : summary.latestUser?.createdAt || null
    notifyAdminActivitySeen(section, value)
  }

  function togglePanel() {
    setOpen((current) => !current)
  }

  function playNotificationQueue(queue: Array<'orders' | 'refunds' | 'users'>) {
    if (typeof window === 'undefined') return
    const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AudioContextClass) return

    const audioContext = new AudioContextClass()
    const now = audioContext.currentTime
    const gain = audioContext.createGain()
    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.exponentialRampToValueAtTime(0.18, now + 0.02)
    gain.connect(audioContext.destination)

    queue.forEach((type, queueIndex) => {
      const startAt = now + queueIndex * 1.1
      const pattern =
        type === 'orders'
          ? { frequencies: [1046, 1318, 1567, 1318], wave: 'sine' as OscillatorType, length: 0.16, gap: 0.18 }
          : type === 'refunds'
            ? { frequencies: [740, 622, 740, 622], wave: 'triangle' as OscillatorType, length: 0.14, gap: 0.18 }
            : { frequencies: [523, 659, 784, 988], wave: 'square' as OscillatorType, length: 0.12, gap: 0.16 }

      gain.gain.exponentialRampToValueAtTime(0.0001, startAt + pattern.frequencies.length * pattern.gap + 0.28)

      pattern.frequencies.forEach((frequency, index) => {
        const oscillator = audioContext.createOscillator()
        oscillator.type = pattern.wave
        oscillator.frequency.setValueAtTime(frequency, startAt + index * pattern.gap)
        oscillator.connect(gain)
        oscillator.start(startAt + index * pattern.gap)
        oscillator.stop(startAt + index * pattern.gap + pattern.length)
      })
    })

    window.setTimeout(() => {
      void audioContext.close().catch(() => null)
    }, Math.max(1400, queue.length * 1300))
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
              <div className="flex items-center gap-2">
                {badgeCount > 0 ? (
                  <button
                    type="button"
                    onClick={() => markSeen('all')}
                    className="rounded-full border border-[#E6D9C8] px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-[#7C4E2F] transition hover:bg-[#FCFAF6]"
                  >
                    Mark all seen
                  </button>
                ) : null}
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
            </div>

            {badgeCount > 0 ? (
              <div className="mt-4 space-y-3">
                {sections
                  .filter((section) => section.count > 0)
                  .map((section) => (
                    <Link
                      key={section.key}
                      href={section.href}
                      onClick={() => {
                        markSeen(section.key as AdminActivitySection)
                        setOpen(false)
                      }}
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
