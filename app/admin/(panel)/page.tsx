'use client'

import { useEffect, useState } from 'react'
import { formatMoney } from '@/lib/utils/format'
import { motion } from 'framer-motion'

type Metrics = {
  products: number
  categories: number
  orders: number
  showroomVisits: number
}

type Order = {
    id: string
    customer: string
    total: number
    status: string
    createdAt: string
}

type Review = {
    id: string
    customer: string
    rating: number
    message: string
    createdAt: string
}

const Sparkline = ({ color = '#C5A070' }) => (
  <svg className="h-10 w-24 opacity-50" viewBox="0 0 100 40">
    <path
      d="M0 35 Q 10 35, 20 25 T 40 15 T 60 25 T 80 5 T 100 15"
      fill="none"
      stroke={color}
      strokeWidth="2"
    />
  </svg>
)

export default function AdminOverviewPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/admin', { cache: 'no-store' })
      const json = await res.json()
      setData(json)
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <div className="text-[10px] uppercase tracking-widest text-[#8C7A6B]">Calibrating studio metrics...</div>

  const metrics = [
    { label: 'Total Catalog', value: data?.metrics.products, trend: '+12%', sub: 'Pieces in circulation' },
    { label: 'Active Curators', value: 48, trend: '+4%', sub: 'Verified members' },
    { label: 'Completed Orders', value: data?.metrics.orders, trend: '+28%', sub: 'Fulfilled bundles' },
    { label: 'Showroom Reach', value: data?.metrics.showroomVisits, trend: '+15%', sub: 'Virtual tour visits' },
  ]

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m, i) => (
          <div key={i} className="group relative overflow-hidden rounded-[32px] border border-[#E6D9C8] bg-white p-6 transition-all hover:shadow-xl hover:shadow-[#C5A070]/5">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#8C7A6B]">{m.label}</p>
                <h3 className="text-3xl font-display text-[#2B2119]">{m.value}</h3>
              </div>
              <Sparkline />
            </div>
            <div className="mt-4 flex items-center gap-2">
               <span className="text-[10px] font-bold text-green-600">{m.trend}</span>
               <span className="text-[10px] text-[#8C7A6B]">{m.sub}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_0.4fr]">
         <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
               <h2 className="font-display text-2xl text-[#2B2119]">Live Pulse</h2>
               <div className="flex items-center gap-2 rounded-full bg-[#FCFAF6] border border-[#E6D9C8] px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-[#8C7A6B]">
                  Real-time activity
               </div>
            </div>
            
            <div className="overflow-hidden rounded-[40px] border border-[#E6D9C8] bg-white shadow-sm">
               <table className="w-full text-left">
                  <thead className="bg-[#FCFAF6] border-b border-[#E6D9C8]">
                     <tr>
                        <th className="px-8 py-4 text-[9px] uppercase tracking-widest text-[#8C7A6B]">Fulfillment</th>
                        <th className="px-8 py-4 text-[9px] uppercase tracking-widest text-[#8C7A6B]">Curator</th>
                        <th className="px-8 py-4 text-[9px] uppercase tracking-widest text-[#8C7A6B]">Value</th>
                        <th className="px-8 py-4 text-[9px] uppercase tracking-widest text-[#8C7A6B]">Status</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F4EEE4]">
                     {data?.recentOrders?.map((o: Order) => (
                        <tr key={o.id} className="group transition-colors hover:bg-[#FCFAF6]/50">
                           <td className="px-8 py-5">
                              <p className="text-xs font-bold text-[#2B2119]">Order #{o.id.slice(-6).toUpperCase()}</p>
                              <p className="text-[10px] text-[#8C7A6B]">{new Date(o.createdAt).toLocaleDateString()}</p>
                           </td>
                           <td className="px-8 py-5">
                              <span className="text-xs text-[#2B2119]">{o.customer}</span>
                           </td>
                           <td className="px-8 py-5">
                              <span className="text-xs font-bold text-[#7C4E2F]">{formatMoney(o.total)}</span>
                           </td>
                           <td className="px-8 py-5">
                              <span className={`inline-block rounded-full px-3 py-1 text-[9px] font-bold uppercase tracking-widest ${o.status === 'Delivered' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                 {o.status}
                              </span>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>

         <div className="space-y-6">
            <h2 className="font-display text-2xl text-[#2B2119] px-2">Community</h2>
            <div className="space-y-4">
               {data?.recentReviews?.map((r: Review) => (
                  <div key={r.id} className="rounded-3xl border border-[#E6D9C8] bg-white p-5 shadow-sm transition hover:shadow-md">
                     <div className="flex items-center justify-between mb-3">
                        <div className="flex gap-0.5">
                           {Array.from({ length: 5 }).map((_, i) => (
                              <div key={i} className={`h-2 w-2 rounded-full ${i < r.rating ? 'bg-[#C5A070]' : 'bg-[#E6D9C8]'}`} />
                           ))}
                        </div>
                        <span className="text-[9px] uppercase tracking-widest text-[#8C7A6B]">12m ago</span>
                     </div>
                     <p className="text-[11px] font-medium leading-relaxed text-[#2B2119] line-clamp-2">"{r.message}"</p>
                     <p className="mt-3 text-[9px] font-bold uppercase tracking-widest text-[#C5A070]">{r.customer}</p>
                  </div>
               ))}
            </div>
            <div className="rounded-[32px] bg-[#2B2119] p-6 text-white shadow-xl">
               <p className="text-[8px] uppercase tracking-[0.3em] opacity-60">System Health</p>
               <h4 className="mt-2 text-sm font-semibold">Inventory Level</h4>
               <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                  <motion.div 
                     initial={{ width: 0 }}
                     animate={{ width: '84%' }}
                     transition={{ duration: 1.5, ease: 'easeOut' }}
                     className="h-full bg-[#C5A070]" 
                  />
               </div>
               <p className="mt-2 text-[9px] text-white/60">84% Capacity utilized across ateliers</p>
            </div>
         </div>
      </div>
    </div>
  )
}
