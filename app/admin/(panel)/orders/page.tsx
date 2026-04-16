'use client'

import { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatMoney } from '@/lib/utils/format'

type OrderItem = {
  productId: string
  quantity: number
  price?: number
  name?: string
  image?: string | null
}

type Order = {
  id: string
  status: string
  total: number
  subtotal: number
  discountTotal: number
  couponCode?: string | null
  createdAt: string
  customer: {
    name: string
    email: string
  }
  items: OrderItem[]
}

const statusOptions = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled']

const statusColors: Record<string, string> = {
  pending: 'bg-orange-100 text-orange-700 border-orange-200',
  paid: 'bg-blue-100 text-blue-700 border-blue-200',
  processing: 'bg-purple-100 text-purple-700 border-purple-200',
  shipped: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  delivered: 'bg-green-100 text-green-700 border-green-200',
  cancelled: 'bg-red-100 text-red-700 border-red-200',
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Order | null>(null)
  const [filter, setFilter] = useState('all')

  async function loadOrders() {
    const res = await fetch('/api/admin/orders', { cache: 'no-store' })
    const json = await res.json()
    setOrders(json?.orders || [])
    setLoading(false)
  }

  useEffect(() => { loadOrders() }, [])

  async function updateStatus(id: string, status: string) {
    await fetch('/api/admin/orders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    loadOrders()
  }

  const filteredOrders = useMemo(() => {
    if (filter === 'all') return orders
    return orders.filter(o => o.status === filter)
  }, [orders, filter])

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-4 px-2 xl:flex-row xl:items-center xl:justify-between">
         <div>
            <h1 className="font-display text-4xl text-[#2B2119]">Fulfillment Engine</h1>
            <p className="mt-1 text-sm text-[#8C7A6B]">Audit atelier orders and logistics timelines.</p>
         </div>
         <div className="flex items-center gap-3">
            <div className="flex flex-wrap rounded-2xl bg-[#FCFAF6] border border-[#E6D9C8] p-1">
               {['all', 'pending', 'processing', 'shipped'].map((f) => (
                  <button 
                     key={f}
                     onClick={() => setFilter(f)}
                     className={`px-4 py-1.5 text-[10px] uppercase tracking-widest font-bold transition-all rounded-xl ${filter === f ? 'bg-[#7C4E2F] text-white shadow-lg' : 'text-[#8C7A6B] hover:text-[#2B2119]'}`}
                  >
                     {f}
                  </button>
               ))}
            </div>
         </div>
      </div>

      <div className="overflow-hidden rounded-[40px] border border-[#E6D9C8] bg-white shadow-xl shadow-[#C5A070]/5">
         <div className="grid gap-4 p-4 md:hidden">
            {filteredOrders.map((o) => (
               <div key={o.id} className="rounded-[28px] border border-[#F4EEE4] bg-[#FCFAF6] p-4">
                  <div className="flex items-start justify-between gap-3">
                     <div>
                        <p className="text-xs font-bold text-[#2B2119]">Reference #{o.id.slice(-8).toUpperCase()}</p>
                        <p className="text-[10px] text-[#8C7A6B]">{new Date(o.createdAt).toLocaleDateString()}</p>
                     </div>
                     <button
                        onClick={() => setSelected(o)}
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
                        <select
                           value={o.status}
                           onChange={(e) => updateStatus(o.id, e.target.value)}
                           className={`rounded-full border px-3 py-1 text-[9px] font-bold uppercase tracking-widest outline-none transition-all ${statusColors[o.status] || ''}`}
                        >
                           {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <span className="text-sm font-bold text-[#2B2119]">{formatMoney(o.total)}</span>
                     </div>
                  </div>
               </div>
            ))}
         </div>
         <div className="overflow-x-auto">
         <table className="hidden min-w-[760px] w-full text-left md:table">
            <thead className="bg-[#FCFAF6] border-b border-[#E6D9C8]">
               <tr>
                  <th className="px-8 py-5 text-[10px] uppercase tracking-widest text-[#8C7A6B]">Reference</th>
                  <th className="px-8 py-5 text-[10px] uppercase tracking-widest text-[#8C7A6B]">Client</th>
                  <th className="px-8 py-5 text-[10px] uppercase tracking-widest text-[#8C7A6B]">Fulfillment</th>
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
                              <div>
                                 <p className="text-xs font-bold text-[#2B2119]">Reference #{o.id.slice(-8).toUpperCase()}</p>
                                 <p className="text-[10px] text-[#8C7A6B]">{new Date(o.createdAt).toLocaleDateString()}</p>
                              </div>
                           </div>
                        </td>
                        <td className="px-8 py-6">
                           <p className="text-xs font-bold text-[#2B2119]">{o.customer.name}</p>
                           <p className="text-[10px] text-[#8C7A6B]">{o.customer.email}</p>
                        </td>
                        <td className="px-8 py-6">
                           <select 
                              value={o.status}
                              onChange={(e) => updateStatus(o.id, e.target.value)}
                              className={`rounded-full border px-3 py-1 text-[9px] font-bold uppercase tracking-widest outline-none transition-all ${statusColors[o.status] || ''}`}
                           >
                              {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                           </select>
                        </td>
                        <td className="px-8 py-6 text-xs font-bold text-[#2B2119]">
                           {formatMoney(o.total)}
                        </td>
                        <td className="px-8 py-6">
                           <button 
                              onClick={() => setSelected(o)}
                              className="rounded-full border border-[#E6D9C8] px-4 py-2 text-[9px] font-bold uppercase tracking-widest text-[#2B2119] transition hover:bg-[#F4EEE4]"
                           >
                              Details
                           </button>
                        </td>
                     </motion.tr>
                  ))}
               </AnimatePresence>
            </tbody>
         </table>
         </div>
         {filteredOrders.length === 0 && (
            <div className="py-20 text-center">
               <p className="text-sm text-[#8C7A6B] italic font-display">No orders awaiting fulfillment in this vault.</p>
            </div>
         )}
      </div>

      {/* Detail Overlay */}
      <AnimatePresence>
         {selected && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
               <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  onClick={() => setSelected(null)}
                  className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
               />
               <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-[48px] border border-[#E6D9C8] bg-[#FDFCFB] shadow-2xl"
               >
                  <div className="grid lg:grid-cols-[1fr_350px]">
                     <div className="p-6 sm:p-10">
                        <div className="flex items-center justify-between border-b border-[#F4EEE4] pb-6">
                           <div>
                              <p className="text-[10px] font-bold uppercase tracking-widest text-[#C5A070]">Order Manifest</p>
                              <h2 className="mt-1 font-display text-3xl text-[#2B2119]">Logistics Flow</h2>
                           </div>
                           <div className={`rounded-full border px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest ${statusColors[selected.status]}`}>
                              {selected.status}
                           </div>
                        </div>

                        <div className="mt-8 space-y-4">
                           {selected.items.map((item, i) => (
                              <div key={i} className="flex items-center gap-6 rounded-3xl border border-[#F4EEE4] bg-white p-4">
                                 <div className="h-16 w-16 overflow-hidden rounded-2xl bg-[#FCFAF6] border border-[#F4EEE4]">
                                    {item.image ? <img src={item.image} className="h-full w-full object-cover" /> : <div className="h-full w-full bg-[#F4EEE4]" />}
                                 </div>
                                 <div className="flex-1">
                                    <h4 className="text-sm font-bold text-[#2B2119]">{item.name || 'Bespoke Piece'}</h4>
                                    <p className="text-[10px] uppercase tracking-widest text-[#8C7A6B]">Quantity: {item.quantity}</p>
                                 </div>
                                 <div className="text-right">
                                    <p className="text-sm font-bold text-[#7C4E2F]">{formatMoney((item.price || 0) * item.quantity)}</p>
                                 </div>
                              </div>
                           ))}
                        </div>

                        <div className="mt-10 rounded-[32px] bg-[#2B2119] p-8 text-[#F4EEE4]">
                           <div className="flex items-center justify-between opacity-60 text-[10px] uppercase tracking-widest font-bold">
                              <span>Subtotal</span>
                              <span>{formatMoney(selected.subtotal)}</span>
                           </div>
                           <div className="mt-2 flex items-center justify-between opacity-60 text-[10px] uppercase tracking-widest font-bold">
                              <span>Studio Discount</span>
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
                           <button onClick={() => setSelected(null)} className="text-[10px] font-bold uppercase tracking-widest text-[#8C7A6B] hover:text-[#2B2119] transition-colors">Close Manifest</button>
                        </div>
                        
                        <div className="space-y-8">
                           <div>
                              <p className="text-[10px] font-bold uppercase tracking-widest text-[#8C7A6B]">Client Details</p>
                              <div className="mt-4 space-y-1">
                                 <p className="text-sm font-bold text-[#2B2119]">{selected.customer.name}</p>
                                 <p className="text-xs text-[#8C7A6B]">{selected.customer.email}</p>
                              </div>
                           </div>
                           
                           <div className="pt-6 border-t border-[#F4EEE4]">
                              <p className="text-[10px] font-bold uppercase tracking-widest text-[#8C7A6B]">Atelier Fulfillment</p>
                              <div className="mt-6 space-y-6 relative">
                                 <div className="absolute left-[7px] top-2 bottom-2 w-px bg-[#E6D9C8]" />
                                 {[
                                    { step: 'Validated', done: true, sub: 'Order authenticated' },
                                    { step: 'Processing', done: ['processing', 'shipped', 'delivered'].includes(selected.status), sub: 'Quality audit started' },
                                    { step: 'Shipped', done: ['shipped', 'delivered'].includes(selected.status), sub: 'In transit to Nigerian hub' },
                                    { step: 'Delivered', done: selected.status === 'delivered', sub: 'Handover complete' }
                                 ].map((s, i) => (
                                    <div key={i} className="flex gap-4 relative">
                                       <div className={`h-4 w-4 rounded-full border-2 border-white shadow-sm shrink-0 z-10 ${s.done ? 'bg-[#C5A070]' : 'bg-[#E6D9C8]'}`} />
                                       <div>
                                          <p className={`text-[10px] font-bold uppercase tracking-widest ${s.done ? 'text-[#2B2119]' : 'text-[#8C7A6B]'}`}>{s.step}</p>
                                          <p className="text-[9px] text-[#8C7A6B]">{s.sub}</p>
                                       </div>
                                    </div>
                                 ))}
                              </div>
                           </div>
                        </div>

                        <div className="mt-12 space-y-3">
                           <button className="w-full rounded-2xl border border-[#E6D9C8] py-3 text-[9px] font-bold uppercase tracking-widest text-[#2B2119] transition hover:bg-white hover:shadow-md">Export Receipt</button>
                           <button className="w-full rounded-2xl border border-[#E6D9C8] py-3 text-[9px] font-bold uppercase tracking-widest text-[#2B2119] transition hover:bg-white hover:shadow-md">Generate Invoice</button>
                        </div>
                     </div>
                  </div>
               </motion.div>
            </div>
         )}
      </AnimatePresence>
    </div>
  )
}
