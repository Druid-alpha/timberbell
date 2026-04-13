'use client'

import { useEffect, useState } from 'react'

type Metrics = {
  products: number
  categories: number
  orders: number
  showroomVisits: number
}

export default function AdminOverviewPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const res = await fetch('/api/admin', { cache: 'no-store' })
        const json = await res.json().catch(() => ({}))
        if (!active) return
        setMetrics(json?.metrics ?? null)
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [])

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-4">
        {['Products', 'Categories', 'Orders', 'Showroom'].map((label, index) => (
          <div
            key={label}
            className="rounded-[1.75rem] border border-[#E4DDCF] bg-white/70 p-5"
          >
            <p className="text-xs uppercase tracking-[0.3em] text-[#8B9A78]">{label}</p>
            <div className="mt-3 text-3xl font-semibold text-[#2A3320]">
              {loading || !metrics
                ? '—'
                : index === 0
                ? metrics.products
                : index === 1
                ? metrics.categories
                : index === 2
                ? metrics.orders
                : metrics.showroomVisits}
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[2rem] border border-[#E4DDCF] bg-white/70 p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-[#8B9A78]">Highlights</p>
          <h2 className="mt-3 font-display text-2xl text-[#2A3320]">
            Executive summary
          </h2>
          <p className="mt-3 text-sm text-[#6B665A]">
            Track catalog growth, order volume, and customer activity in one place. Use the tabs to
            manage your products, orders, and users.
          </p>
          <div className="mt-6 grid gap-3 text-sm text-[#6B665A]">
            <div className="rounded-2xl border border-[#E4DDCF] bg-[#FCFAF6] p-4">
              Monitor your bestselling categories and update featured pieces weekly.
            </div>
            <div className="rounded-2xl border border-[#E4DDCF] bg-[#FCFAF6] p-4">
              Keep an eye on pending orders and follow up with customer service promptly.
            </div>
          </div>
        </div>
        <div className="rounded-[2rem] border border-[#E4DDCF] bg-[#2A3320] p-6 text-white">
          <p className="text-xs uppercase tracking-[0.3em] text-white/60">Next actions</p>
          <h2 className="mt-3 font-display text-2xl">Design direction</h2>
          <p className="mt-3 text-sm text-white/70">
            Add new arrivals, refresh hero imagery, and create promotional bundles for the next
            collection drop.
          </p>
          <div className="mt-6 grid gap-3 text-sm text-white/80">
            <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
              Schedule seasonal campaigns and update pricing tiers.
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
              Review inventory and production lead times.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
