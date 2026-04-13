'use client'

import { useEffect, useMemo, useState } from 'react'

type OrderItem = {
  productId: string
  quantity: number
  price?: number
  name?: string
  slug?: string | null
  category?: string | null
  image?: string | null
}

type Order = {
  id: string
  status?: string
  total?: number
  subtotal?: number
  discountTotal?: number
  couponCode?: string | null
  createdAt?: string
  customer?: {
    name?: string
    email?: string
  }
  items?: OrderItem[]
}

const statusOptions = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled']

const currency = new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' })

function formatDate(value?: string) {
  if (!value) return '—'
  return new Date(value).toLocaleString()
}

function buildReceiptHtml(order: Order, type: 'Receipt' | 'Invoice') {
  const items = order.items ?? []
  const subtotal = order.subtotal ?? items.reduce((sum, item) => sum + (item.price ?? 0) * item.quantity, 0)
  const discountTotal = order.discountTotal ?? 0
  const total = order.total ?? Math.max(0, subtotal - discountTotal)

  const rows = items
    .map(
      (item) => `
      <tr>
        <td>${item.name ?? item.productId}</td>
        <td>${item.quantity}</td>
        <td>${currency.format(item.price ?? 0)}</td>
        <td>${currency.format((item.price ?? 0) * item.quantity)}</td>
      </tr>
    `
    )
    .join('')

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <title>${type} - ${order.id}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 32px; color: #1f241b; }
          h1 { margin-bottom: 8px; }
          table { width: 100%; border-collapse: collapse; margin-top: 24px; }
          th, td { border-bottom: 1px solid #e5e0d8; padding: 10px; text-align: left; }
          .summary { margin-top: 20px; }
        </style>
      </head>
      <body>
        <h1>${type}</h1>
        <p>Order ID: ${order.id}</p>
        <p>Date: ${formatDate(order.createdAt)}</p>
        <p>Customer: ${order.customer?.name || 'Guest'} (${order.customer?.email || 'no-email'})</p>
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
        <div class="summary">
          <p>Subtotal: ${currency.format(subtotal)}</p>
          <p>Discount: ${currency.format(discountTotal)}</p>
          <p><strong>Total: ${currency.format(total)}</strong></p>
        </div>
      </body>
    </html>
  `
}

function downloadHtml(filename: string, html: string) {
  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Order | null>(null)

  async function loadOrders() {
    const res = await fetch('/api/admin/orders', { cache: 'no-store' })
    const json = await res.json().catch(() => ({}))
    setOrders(json?.orders ?? [])
  }

  useEffect(() => {
    let active = true
    async function load() {
      try {
        await loadOrders()
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [])

  async function updateStatus(id: string, status: string) {
    await fetch('/api/admin/orders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    await loadOrders()
  }

  const selectedTotals = useMemo(() => {
    if (!selected) return null
    const items = selected.items ?? []
    const subtotal =
      selected.subtotal ??
      items.reduce((sum, item) => sum + (item.price ?? 0) * item.quantity, 0)
    const discountTotal = selected.discountTotal ?? 0
    const total = selected.total ?? Math.max(0, subtotal - discountTotal)
    return { subtotal, discountTotal, total }
  }, [selected])

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-[#E6D9C8] bg-white/70 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[#8C7A6B]">Orders</p>
            <h2 className="mt-3 font-display text-2xl text-[#2B2119]">Manage orders</h2>
          </div>
          <span className="text-xs uppercase tracking-[0.3em] text-[#8C7A6B]">
            {orders.length} orders
          </span>
        </div>
        <div className="mt-6 space-y-4">
          {loading ? (
            <div className="rounded-2xl border border-[#E6D9C8] bg-[#F4EEE4] p-4 text-sm text-[#6B665A]">
              Loading orders...
            </div>
          ) : orders.length ? (
            orders.map((order) => (
              <div
                key={order.id}
                className="rounded-2xl border border-[#E6D9C8] bg-[#F4EEE4] p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-[#2B2119]">
                      {order.customer?.name || 'Guest customer'}
                    </div>
                    <div className="text-[10px] uppercase tracking-[0.3em] text-[#8C7A6B]">
                      {order.customer?.email || 'no-email'}
                    </div>
                    <div className="mt-2 text-[10px] uppercase tracking-[0.3em] text-[#8C7A6B]">
                      {formatDate(order.createdAt)}
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-[#2B2119]">
                    {currency.format(order.total ?? 0)}
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-[#8C7A6B]">
                  <span className="uppercase tracking-[0.3em]">Status</span>
                  <select
                    value={order.status ?? 'pending'}
                    onChange={(event) => updateStatus(order.id, event.target.value)}
                    className="rounded-full border border-[#E6D9C8] bg-white px-3 py-1 text-[11px] uppercase tracking-[0.3em] text-[#2B2119]"
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setSelected(order)}
                    className="rounded-full border border-[#7C4E2F] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.3em] text-[#2B2119]"
                  >
                    View details
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-[#E6D9C8] bg-[#F4EEE4] p-4 text-sm text-[#6B665A]">
              No orders yet.
            </div>
          )}
        </div>
      </div>

      {selected ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 px-4 py-10">
          <div className="w-full max-w-3xl rounded-[2rem] border border-[#E6D9C8] bg-[#F4EEE4] p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-[#8C7A6B]">Order details</p>
                <h3 className="mt-2 font-display text-2xl text-[#2B2119]">
                  {selected.customer?.name || 'Guest customer'}
                </h3>
                <p className="text-sm text-[#6B665A]">{selected.customer?.email || 'no-email'}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.3em] text-[#8C7A6B]">
                  {formatDate(selected.createdAt)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-full border border-[#7C4E2F] px-3 py-2 text-[10px] uppercase tracking-[0.3em] text-[#2B2119]"
              >
                Close
              </button>
            </div>

            <div className="mt-6 space-y-3">
              {(selected.items ?? []).length ? (
                selected.items?.map((item) => (
                  <div
                    key={`${item.productId}-${item.name ?? 'item'}`}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#E6D9C8] bg-white/80 p-4"
                  >
                    <div className="flex items-center gap-3">
                      {item.image ? (
                        <img src={item.image} alt="" className="h-12 w-12 rounded-xl object-cover" />
                      ) : (
                        <div className="h-12 w-12 rounded-xl bg-[#E9E1D4]" />
                      )}
                      <div>
                        <div className="text-sm font-semibold text-[#2B2119]">
                          {item.name ?? item.productId}
                        </div>
                        <div className="text-[10px] uppercase tracking-[0.3em] text-[#8C7A6B]">
                          Qty {item.quantity}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-[#2B2119]">
                      {currency.format((item.price ?? 0) * item.quantity)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-[#E6D9C8] bg-white/80 p-4 text-sm text-[#6B665A]">
                  No items available for this order.
                </div>
              )}
            </div>

            {selectedTotals ? (
              <div className="mt-6 grid gap-3 text-sm text-[#6B665A]">
                <div className="flex items-center justify-between">
                  <span>Subtotal</span>
                  <span>{currency.format(selectedTotals.subtotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Discount</span>
                  <span>-{currency.format(selectedTotals.discountTotal)}</span>
                </div>
                <div className="flex items-center justify-between text-base font-semibold text-[#2B2119]">
                  <span>Total</span>
                  <span>{currency.format(selectedTotals.total)}</span>
                </div>
              </div>
            ) : null}

            <div className="mt-6 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() =>
                  downloadHtml(`receipt-${selected.id}.html`, buildReceiptHtml(selected, 'Receipt'))
                }
                className="rounded-full bg-[#7C4E2F] px-4 py-2 text-[10px] font-bold uppercase tracking-[0.3em] text-white"
              >
                Download receipt
              </button>
              <button
                type="button"
                onClick={() =>
                  downloadHtml(`invoice-${selected.id}.html`, buildReceiptHtml(selected, 'Invoice'))
                }
                className="rounded-full border border-[#7C4E2F] px-4 py-2 text-[10px] font-bold uppercase tracking-[0.3em] text-[#2B2119]"
              >
                Download invoice
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}


