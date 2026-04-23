'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatMoney } from '@/lib/utils/format'
import { TRACKING_STAGES, getTrackingEntries, getTrackingStageLabel, normalizeTrackingStage } from '@/lib/orderTracking'
import ConfirmDialog from '@/app/_components/ConfirmDialog'
import { notifyAdminActivitySeen } from '@/lib/adminActivity'

type OrderItem = {
  productId: string
  purchaseType?: 'main' | 'variant'
  variantName?: string | null
  quantity: number
  price?: number
  originalPrice?: number
  lineDiscount?: number
  lineTotal?: number
  name?: string
  image?: string | null
}

type Order = {
  id: string
  status: string
  paymentStatus?: string
  paymentProvider?: string
  total: number
  subtotal: number
  deliveryFee?: number
  catalogDiscountTotal?: number
  couponDiscountTotal?: number
  discountTotal: number
  createdAt: string
  updatedAt?: string
  trackingStage?: string
  trackingUpdatedAt?: string
  trackingNote?: string
  notes?: string
  customer: {
    name: string
    email: string
  }
  items: OrderItem[]
}

const statusColors: Record<string, string> = {
  pending_payment: 'bg-amber-100 text-amber-700 border-amber-200',
  pending: 'bg-orange-100 text-orange-700 border-orange-200',
  paid: 'bg-blue-100 text-blue-700 border-blue-200',
  processing: 'bg-purple-100 text-purple-700 border-purple-200',
  shipped: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  delivered: 'bg-green-100 text-green-700 border-green-200',
  cancelled: 'bg-red-100 text-red-700 border-red-200',
  payment_failed: 'bg-red-100 text-red-700 border-red-200',
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Order | null>(null)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [notice, setNotice] = useState('')
  const [busyKey, setBusyKey] = useState<string | null>(null)
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [trackingStageDraft, setTrackingStageDraft] = useState('processing')
  const [trackingNoteDraft, setTrackingNoteDraft] = useState('')

  function openSelected(order: Order) {
    setSelected(order)
    setTrackingStageDraft(normalizeTrackingStage(order.trackingStage))
    setTrackingNoteDraft(order.trackingNote || '')
    notifyAdminActivitySeen('orders', order.createdAt)
  }

  async function loadOrders(selectedId?: string | null, next?: { search?: string; filter?: string }) {
    const activeSearch = next?.search ?? search
    const activeFilter = next?.filter ?? filter
    const params = new URLSearchParams({ limit: '80' })
    if (activeSearch.trim()) params.set('q', activeSearch.trim())
    if (activeFilter && activeFilter !== 'all') params.set('status', activeFilter)
    const res = await fetch(`/api/admin/orders?${params.toString()}`, { cache: 'no-store' })
    const json = await res.json().catch(() => ({}))
    const nextOrders = json?.orders || []
    setOrders(nextOrders)
    if (selectedId) {
      const nextSelected = nextOrders.find((order: Order) => order.id === selectedId) || null
      setSelected(nextSelected)
      if (nextSelected) {
        setTrackingStageDraft(normalizeTrackingStage(nextSelected.trackingStage))
        setTrackingNoteDraft(nextSelected.trackingNote || '')
      }
    }
    setLoading(false)
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadOrders()
    }, 0)

    return () => window.clearTimeout(timer)
  }, [])

  function downloadOrderDocument(id: string, document: 'receipt' | 'invoice') {
    window.open(`/api/orders/${id}/receipt?document=${document}`, '_blank', 'noopener,noreferrer')
  }

  async function updateOrder(id: string, payload: Record<string, string>) {
    setBusyKey(id)
    setNotice('')
    const res = await fetch('/api/admin/orders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...payload }),
    })
    const json = await res.json().catch(() => ({}))
    setBusyKey(null)
    setNotice(json.message || (res.ok ? 'Order updated.' : 'Unable to update order.'))
    if (res.ok) {
      await loadOrders(selected?.id === id ? id : null)
    }
  }

  async function deleteOrder(id: string) {
    setBusyKey(id)
    setNotice('')
    const orderToDelete = orders.find((order) => order.id === id) || null
    const res = await fetch('/api/admin/orders', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    const json = await res.json().catch(() => ({}))
    setBusyKey(null)
    setNotice(json.message || (res.ok ? 'Order deleted.' : 'Unable to delete order.'))
    if (res.ok) {
      if (orderToDelete?.createdAt) {
        notifyAdminActivitySeen('orders', orderToDelete.createdAt)
      }
      if (selected?.id === id) setSelected(null)
      await loadOrders()
    }
  }

  const filteredOrders = useMemo(() => orders, [orders])

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-4 px-2 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h1 className="font-display text-4xl text-[#2B2119]">Order Management</h1>
          <p className="mt-1 text-sm text-[#8C7A6B]">Review orders, update delivery progress, and export sales records in one place.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-full border border-[#E6D9C8] bg-[#FCFAF6] px-4 py-3">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  loadOrders(undefined, { search: e.currentTarget.value, filter })
                }
              }}
              placeholder="Search by customer, item, order ref, status"
              className="w-[15rem] max-w-full bg-transparent text-sm outline-none"
            />
            <button
              type="button"
              onClick={() => loadOrders(undefined, { search, filter })}
              className="rounded-full bg-[#7C4E2F] px-4 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-white"
            >
              Search
            </button>
          </div>
          <div className="flex flex-wrap rounded-2xl border border-[#E6D9C8] bg-[#FCFAF6] p-1">
            {['all', 'pending_payment', 'pending', 'paid', 'processing', 'shipped'].map((f) => (
              <button
                key={f}
                onClick={() => {
                  setFilter(f)
                  loadOrders(undefined, { search, filter: f })
                }}
                className={`rounded-xl px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-all ${filter === f ? 'bg-[#7C4E2F] text-white shadow-lg' : 'text-[#8C7A6B] hover:text-[#2B2119]'}`}
              >
                {f.replace('_', ' ')}
              </button>
            ))}
          </div>
          <a
            href="/api/admin/sales-report/export"
            className="rounded-full border border-[#E6D9C8] bg-white px-4 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-[#2B2119] transition hover:bg-[#F4EEE4]"
          >
            Export Fulfillment Report
          </a>
        </div>
      </div>

      {notice ? (
        <div className="rounded-3xl border border-[#E6D9C8] bg-[#FDF7F0] px-5 py-4 text-sm text-[#6B594A]">{notice}</div>
      ) : null}

      <div className="overflow-hidden rounded-[40px] border border-[#E6D9C8] bg-white shadow-xl shadow-[#C5A070]/5">
        <div className="grid gap-4 p-4 md:hidden">
          {filteredOrders.map((o) => (
            <div key={o.id} className="rounded-[28px] border border-[#F4EEE4] bg-[#FCFAF6] p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="break-all text-xs font-bold text-[#2B2119]">Reference #{o.id.slice(-8).toUpperCase()}</p>
                  <p className="text-[10px] text-[#8C7A6B]">{new Date(o.createdAt).toLocaleDateString()}</p>
                </div>
                <button
                  onClick={() => openSelected(o)}
                  className="rounded-full border border-[#E6D9C8] px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest text-[#2B2119] transition hover:bg-white"
                >
                  Details
                </button>
              </div>
              <div className="mt-4 space-y-3">
                <div>
                  <p className="text-xs font-bold text-[#2B2119]">{o.customer.name}</p>
                  <p className="text-[10px] text-[#8C7A6B]">{o.customer.email}</p>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className={`inline-flex rounded-full border px-3 py-1 text-[9px] font-bold uppercase tracking-widest ${statusColors[o.status] || ''}`}>
                      {o.status.replace('_', ' ')}
                    </div>
                    <p className="text-[9px] uppercase tracking-widest text-[#8C7A6B]">
                      Stage: {getTrackingStageLabel(normalizeTrackingStage(o.trackingStage))}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-[#2B2119]">{formatMoney(o.total)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="overflow-x-auto">
          <table className="hidden min-w-[860px] w-full text-left md:table">
            <thead className="border-b border-[#E6D9C8] bg-[#FCFAF6]">
              <tr>
                <th className="px-8 py-5 text-[10px] uppercase tracking-widest text-[#8C7A6B]">Reference</th>
                <th className="px-8 py-5 text-[10px] uppercase tracking-widest text-[#8C7A6B]">Client</th>
                <th className="px-8 py-5 text-[10px] uppercase tracking-widest text-[#8C7A6B]">Status</th>
                <th className="px-8 py-5 text-[10px] uppercase tracking-widest text-[#8C7A6B]">Tracking Stage</th>
                <th className="px-8 py-5 text-[10px] uppercase tracking-widest text-[#8C7A6B]">Payment</th>
                <th className="px-8 py-5 text-[10px] uppercase tracking-widest text-[#8C7A6B]">Investment</th>
                <th className="px-8 py-5 text-[10px] uppercase tracking-widest text-[#8C7A6B]">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4EEE4]">
              <AnimatePresence mode="popLayout">
                {filteredOrders.map((o) => (
                  <motion.tr
                    layout
                    key={o.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="group transition-colors hover:bg-[#FCFAF6]/50"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F4EEE4] text-xs font-bold text-[#7C4E2F]">
                          O{o.id.slice(-3).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="max-w-[13rem] break-all text-xs font-bold text-[#2B2119]">Reference #{o.id.slice(-8).toUpperCase()}</p>
                          <p className="text-[10px] text-[#8C7A6B]">{new Date(o.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-xs font-bold text-[#2B2119]">{o.customer.name}</p>
                      <p className="text-[10px] text-[#8C7A6B]">{o.customer.email}</p>
                    </td>
                    <td className="px-8 py-6">
                      <div className={`inline-flex rounded-full border px-3 py-1 text-[9px] font-bold uppercase tracking-widest ${statusColors[o.status] || ''}`}>
                        {o.status.replace('_', ' ')}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <button
                        onClick={() => openSelected(o)}
                        className="rounded-full border border-[#E6D9C8] bg-[#F8F4EE] px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-[#2B2119] transition hover:border-[#7C4E2F]"
                      >
                        {getTrackingStageLabel(normalizeTrackingStage(o.trackingStage))}
                      </button>
                    </td>
                    <td className="px-8 py-6">
                      <div className="space-y-1">
                        <div className="rounded-full border border-[#E6D9C8] bg-[#F8F4EE] px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-[#2B2119]">
                          {String(o.paymentStatus || 'unpaid').replace('_', ' ')}
                        </div>
                        <p className="text-[10px] text-[#8C7A6B]">{o.paymentProvider || 'paystack'}</p>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-xs font-bold text-[#2B2119]">{formatMoney(o.total)}</td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openSelected(o)}
                          className="rounded-full border border-[#E6D9C8] px-4 py-2 text-[9px] font-bold uppercase tracking-widest text-[#2B2119] transition hover:bg-[#F4EEE4]"
                        >
                          Details
                        </button>
                        <button
                          onClick={() => setDeleteTargetId(o.id)}
                          disabled={busyKey === o.id}
                          className="rounded-full border border-red-100 px-4 py-2 text-[9px] font-bold uppercase tracking-widest text-red-700 transition hover:bg-red-50 disabled:opacity-60"
                        >
                          {busyKey === o.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
        {!loading && filteredOrders.length === 0 ? (
          <div className="py-20 text-center">
            <p className="font-display text-sm italic text-[#8C7A6B]">No orders found for this view.</p>
          </div>
        ) : null}
      </div>

      <AnimatePresence>
        {selected && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelected(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-[48px] border border-[#E6D9C8] bg-[#FDFCFB] shadow-2xl"
            >
              <div className="grid lg:grid-cols-[1fr_360px]">
                <div className="p-6 sm:p-10">
                  <div className="flex items-center justify-between border-b border-[#F4EEE4] pb-6">
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[#C5A070]">Order Details</p>
                      <h2 className="mt-1 font-display text-3xl text-[#2B2119]">Delivery Flow</h2>
                      <p className="mt-2 break-all text-[10px] uppercase tracking-widest text-[#8C7A6B]">
                        Ref: {selected.id}
                      </p>
                    </div>
                    <div className={`rounded-full border px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest ${statusColors[selected.status]}`}>
                      {selected.status.replace('_', ' ')}
                    </div>
                  </div>

                  <div className="mt-8 space-y-4">
                    {selected.items.map((item, i) => (
                      <div key={i} className="flex items-center gap-6 rounded-3xl border border-[#F4EEE4] bg-white p-4">
                        <div className="h-16 w-16 overflow-hidden rounded-2xl border border-[#F4EEE4] bg-[#FCFAF6]">
                          {item.image ? <img src={item.image} className="h-full w-full object-cover" alt="" /> : <div className="h-full w-full bg-[#F4EEE4]" />}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-bold text-[#2B2119]">{item.name || 'Bespoke Piece'}</h4>
                          <p className="mt-1 text-[10px] uppercase tracking-widest text-[#8C7A6B]">
                            {item.purchaseType === 'variant'
                              ? item.variantName
                                ? `Variant Purchase: ${item.variantName}`
                                : 'Variant Purchase'
                              : 'Main Product Purchase'}
                          </p>
                          <p className="text-[10px] uppercase tracking-widest text-[#8C7A6B]">Quantity: {item.quantity}</p>
                          {Number(item.lineDiscount || 0) > 0 ? (
                            <p className="text-[10px] uppercase tracking-widest text-[#C5A070]">
                              Discount Saved: {formatMoney(Number(item.lineDiscount || 0))}
                            </p>
                          ) : null}
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-[#7C4E2F]">{formatMoney(Number(item.lineTotal || (item.price || 0) * item.quantity))}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                    <div className="mt-10 rounded-[32px] bg-[#2B2119] p-8 text-[#F4EEE4]">
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest opacity-60">
                      <span>Subtotal</span>
                      <span>{formatMoney(selected.subtotal)}</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest opacity-60">
                      <span>Catalog Discount</span>
                      <span>-{formatMoney(selected.catalogDiscountTotal ?? 0)}</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest opacity-60">
                      <span>Coupon Discount</span>
                      <span>-{formatMoney(selected.couponDiscountTotal ?? Math.max(0, Number(selected.discountTotal || 0) - Number(selected.catalogDiscountTotal || 0)))}</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest opacity-60">
                      <span>Delivery</span>
                      <span>{formatMoney(selected.deliveryFee ?? 0)}</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest opacity-60">
                      <span>Total Discount</span>
                      <span>-{formatMoney(selected.discountTotal)}</span>
                    </div>
                    <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
                      <span className="font-display text-xl">Investment Total</span>
                      <span className="font-display text-2xl text-[#C5A070]">{formatMoney(selected.total)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-[#FCFAF6] p-6 sm:border-l sm:border-[#F4EEE4] sm:p-10">
                  <div className="mb-10 text-right">
                    <button onClick={() => setSelected(null)} className="text-[10px] font-bold uppercase tracking-widest text-[#8C7A6B] transition-colors hover:text-[#2B2119]">Close Manifest</button>
                  </div>

                  <div className="space-y-8">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[#8C7A6B]">Client Details</p>
                      <div className="mt-4 space-y-1">
                        <p className="text-sm font-bold text-[#2B2119]">{selected.customer.name}</p>
                        <p className="text-xs text-[#8C7A6B]">{selected.customer.email}</p>
                      </div>
                    </div>

                    <div className="border-t border-[#F4EEE4] pt-6">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[#8C7A6B]">Tracking Updates</p>
                      <div className="mt-4 grid gap-3">
                        <div className="rounded-2xl border border-[#E6D9C8] bg-white px-4 py-3">
                          <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#8C7A6B]">Payment</p>
                          <input
                            readOnly
                            value={`${String(selected.paymentStatus || 'pending').replace('_', ' ')}${selected.paymentProvider ? ` via ${selected.paymentProvider}` : ''}`}
                            className="mt-2 h-11 w-full rounded-2xl border border-[#E6D9C8] bg-[#F8F4EE] px-4 text-sm font-semibold capitalize text-[#2B2119] outline-none"
                          />
                          <p className="mt-2 text-[11px] text-[#8C7A6B]">
                            {selected.paymentProvider === 'paystack'
                              ? 'Payment is synced from Paystack confirmation and is not editable from admin.'
                              : 'Manual payment order.'}
                          </p>
                        </div>
                        <div className="rounded-2xl border border-[#E6D9C8] bg-white px-4 py-3">
                          <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#8C7A6B]">Order Status</p>
                          <p className={`mt-2 inline-flex rounded-full border px-3 py-1 text-[9px] font-bold uppercase tracking-widest ${statusColors[selected.status] || ''}`}>
                            {selected.status.replace('_', ' ')}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 space-y-3">
                        <select
                          value={trackingStageDraft}
                          onChange={(e) => setTrackingStageDraft(e.target.value)}
                          className="h-11 w-full rounded-2xl border border-[#E6D9C8] bg-white px-4 text-sm outline-none"
                        >
                          {TRACKING_STAGES.map((stage) => (
                            <option key={stage} value={stage}>
                              {getTrackingStageLabel(stage)}
                            </option>
                          ))}
                        </select>
                        <textarea
                          value={trackingNoteDraft}
                          onChange={(e) => setTrackingNoteDraft(e.target.value)}
                          placeholder="Add the tracking note customers should see in their account."
                          className="h-24 w-full rounded-2xl border border-[#E6D9C8] bg-white px-4 py-3 text-sm outline-none"
                        />
                        <button
                          onClick={() => updateOrder(selected.id, { trackingStage: trackingStageDraft, trackingNote: trackingNoteDraft })}
                          disabled={busyKey === selected.id}
                          className="w-full rounded-2xl bg-[#7C4E2F] py-3 text-[10px] font-bold uppercase tracking-widest text-white disabled:opacity-60"
                        >
                          {busyKey === selected.id ? 'Saving...' : 'Update Tracking'}
                        </button>
                      </div>

                      <div className="mt-6 space-y-4">
                        {getTrackingEntries({
                          trackingStage: selected.trackingStage,
                          trackingUpdatedAt: selected.trackingUpdatedAt || selected.updatedAt || selected.createdAt,
                        }).map((step) => (
                          <div key={step.stage} className="flex gap-4">
                            <div className={`mt-1 h-4 w-4 shrink-0 rounded-full border-2 border-white shadow-sm ${step.completed ? 'bg-[#C5A070]' : step.current ? 'bg-[#7C4E2F]' : 'bg-[#E6D9C8]'}`} />
                            <div>
                              <p className={`text-[10px] font-bold uppercase tracking-widest ${step.completed || step.current ? 'text-[#2B2119]' : 'text-[#8C7A6B]'}`}>{step.label}</p>
                              <p className="text-[9px] text-[#8C7A6B]">{step.detail}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {selected.notes ? (
                        <div className="mt-6 rounded-2xl border border-[#E6D9C8] bg-white px-4 py-3">
                          <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#8C7A6B]">Delivery Note</p>
                          <p className="mt-2 text-sm text-[#6B594A]">{selected.notes}</p>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div className="mt-12 space-y-3">
                    <button disabled={busyKey === selected.id} onClick={() => setDeleteTargetId(selected.id)} className="w-full rounded-2xl border border-red-100 py-3 text-[9px] font-bold uppercase tracking-widest text-red-700 transition hover:bg-red-50 disabled:opacity-60">{busyKey === selected.id ? 'Deleting...' : 'Delete Order'}</button>
                    <button onClick={() => downloadOrderDocument(selected.id, 'receipt')} className="w-full rounded-2xl border border-[#E6D9C8] py-3 text-[9px] font-bold uppercase tracking-widest text-[#2B2119] transition hover:bg-white hover:shadow-md">Export Receipt</button>
                    <button onClick={() => downloadOrderDocument(selected.id, 'invoice')} className="w-full rounded-2xl border border-[#E6D9C8] py-3 text-[9px] font-bold uppercase tracking-widest text-[#2B2119] transition hover:bg-white hover:shadow-md">Generate Invoice</button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        open={Boolean(deleteTargetId)}
        title="Delete order?"
        description="This removes the order from admin records. Use this only when you are sure the order should no longer appear in fulfillment history."
        confirmLabel="Delete Order"
        tone="danger"
        busy={Boolean(deleteTargetId && busyKey === deleteTargetId)}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={() => {
          if (!deleteTargetId) return
          void deleteOrder(deleteTargetId).finally(() => setDeleteTargetId(null))
        }}
      />
    </div>
  )
}
