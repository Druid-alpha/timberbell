'use client'

import { useEffect, useState } from 'react'
import { formatMoney } from '@/lib/utils/format'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from 'recharts'

type AnalyticsSummary = {
  totals: {
    revenue: number
    orders: number
    avgOrderValue: number
    discountTotal: number
    couponOrders: number
    users: number
    newUsers: number
    admins: number
    wishlistItems: number
  }
  series: {
    name: string
    revenue: number
    orders: number
  }[]
  topProducts: {
    id: string
    name: string
    count: number
    revenue: number
  }[]
}

export default function AdminAnalyticsPage() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const res = await fetch('/api/admin/analytics', { cache: 'no-store' })
        const json = await res.json().catch(() => ({}))
        if (!active) return
        setSummary(json?.summary ?? null)
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [])

  const chartData = summary?.series ?? []

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-[#E6D9C8] bg-white/70 p-6">
        <p className="text-xs uppercase tracking-[0.3em] text-[#8C7A6B]">Analytics</p>
        <h2 className="mt-3 font-display text-2xl text-[#2B2119]">Executive overview</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: 'Revenue', value: summary?.totals.revenue ?? 0, currency: true },
            { label: 'Orders', value: summary?.totals.orders ?? 0 },
            { label: 'Avg Order', value: summary?.totals.avgOrderValue ?? 0, currency: true },
            { label: 'Discounts', value: summary?.totals.discountTotal ?? 0, currency: true },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-[#E6D9C8] bg-[#F4EEE4] p-4"
            >
              <p className="text-xs uppercase tracking-[0.3em] text-[#8C7A6B]">{item.label}</p>
              <div className="mt-3 text-2xl font-semibold text-[#2B2119]">
                {loading
                  ? '—'
                  : item.currency
                  ? formatMoney(Number(item.value))
                  : item.value}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: 'Users', value: summary?.totals.users ?? 0 },
            { label: 'New users', value: summary?.totals.newUsers ?? 0 },
            { label: 'Admins', value: summary?.totals.admins ?? 0 },
            { label: 'Wishlist items', value: summary?.totals.wishlistItems ?? 0 },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-[#E6D9C8] bg-[#F4EEE4] p-4"
            >
              <p className="text-xs uppercase tracking-[0.3em] text-[#8C7A6B]">{item.label}</p>
              <div className="mt-3 text-2xl font-semibold text-[#2B2119]">
                {loading ? '—' : item.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[2rem] border border-[#E6D9C8] bg-white/70 p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[#8C7A6B]">Revenue</p>
              <h3 className="mt-3 font-display text-xl text-[#2B2119]">Daily revenue</h3>
            </div>
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#8C7A6B]">
              Last 7 days
            </span>
          </div>
          <div className="mt-6 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="4 4" stroke="#E6D9C8" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip formatter={(value: number) => formatMoney(Number(value || 0))} />
                <Line type="monotone" dataKey="revenue" stroke="#2B2119" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-[2rem] border border-[#E6D9C8] bg-white/70 p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[#8C7A6B]">Orders</p>
              <h3 className="mt-3 font-display text-xl text-[#2B2119]">Order volume</h3>
            </div>
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#8C7A6B]">
              Last 7 days
            </span>
          </div>
          <div className="mt-6 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="4 4" stroke="#E6D9C8" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar dataKey="orders" fill="#8C7A6B" radius={[12, 12, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="rounded-[2rem] border border-[#E6D9C8] bg-white/70 p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[#8C7A6B]">Top products</p>
            <h3 className="mt-3 font-display text-xl text-[#2B2119]">Best performers</h3>
          </div>
        </div>
        <div className="mt-6 space-y-3">
          {(summary?.topProducts ?? []).length ? (
            summary?.topProducts.map((item) => (
              <div
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#E6D9C8] bg-[#F4EEE4] p-4"
              >
                <div>
                  <div className="text-sm font-semibold text-[#2B2119]">{item.name}</div>
                  <div className="text-[10px] uppercase tracking-[0.3em] text-[#8C7A6B]">
                    {item.count} orders
                  </div>
                </div>
                <div className="text-sm font-semibold text-[#2B2119]">
                  {formatMoney(item.revenue)}
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-[#E6D9C8] bg-[#F4EEE4] p-4 text-sm text-[#6B665A]">
              No product analytics yet.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


