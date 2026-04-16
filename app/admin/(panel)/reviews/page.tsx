'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

type Review = {
  id: string
  productId: string
  customer: string
  rating: number
  message: string
  createdAt: string
  productName?: string
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    const res = await fetch('/api/reviews')
    const data = await res.json()
    
    const productsRes = await fetch('/api/products?limit=100')
    const productsData = await productsRes.json()
    const productMap = new Map(productsData.products.map((p: any) => [p.id, p.name]))

    const enriched = (data.reviews || []).map((r: Review) => ({
      ...r,
      productName: productMap.get(r.productId) || 'Unknown Piece'
    }))

    setReviews(enriched)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleDelete(id: string) {
    if (!confirm('Permanently remove this community note?')) return
    setDeletingId(id)
    const res = await fetch(`/api/reviews/${id}`, { method: 'DELETE' })
    if (res.ok) {
       setReviews(prev => prev.filter(r => r.id !== id))
    }
    setDeletingId(null)
  }

  if (loading) return <div className="text-[10px] uppercase tracking-widest text-[#8C7A6B]">Auditing curator feedback...</div>

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between px-2">
         <div>
            <h1 className="font-display text-4xl text-[#2B2119]">Community Notes</h1>
            <p className="mt-1 text-sm text-[#8C7A6B]">Moderate and curate client observations across the collection.</p>
         </div>
         <div className="flex items-center gap-3">
            <span className="rounded-full bg-[#FCFAF6] border border-[#E6D9C8] px-4 py-2 text-[10px] uppercase tracking-widest font-bold text-[#7C4E2F]">
               {reviews.length} Verified Notes
            </span>
         </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
         <AnimatePresence mode="popLayout">
            {reviews.map((r) => (
               <motion.div 
                  layout
                  key={r.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-[40px] border border-[#E6D9C8] bg-white p-8 transition-all hover:shadow-xl hover:shadow-[#C5A070]/5"
               >
                  <div>
                     <div className="flex items-center justify-between mb-6">
                        <div className="flex gap-1">
                           {Array.from({ length: 5 }).map((_, i) => (
                              <div key={i} className={`h-2.5 w-2.5 rounded-full ${i < r.rating ? 'bg-[#C5A070]' : 'bg-[#E6D9C8]'}`} />
                           ))}
                        </div>
                        <span className="text-[10px] uppercase tracking-widest font-bold text-[#8C7A6B]">Audit ID: {r.id.slice(-4).toUpperCase()}</span>
                     </div>
                     <p className="text-sm font-medium leading-relaxed italic text-[#2B2119]">"{r.message}"</p>
                  </div>

                  <div className="mt-8 pt-6 border-t border-[#F4EEE4]">
                     <div className="flex items-center justify-between">
                        <div>
                           <p className="text-[10px] font-bold uppercase tracking-widest text-[#C5A070]">{r.customer}</p>
                           <Link href={`/products/${r.productId}`} className="mt-1 block text-[10px] uppercase tracking-widest font-medium text-[#8C7A6B] hover:text-[#2B2119] transition-colors">
                              {r.productName}
                           </Link>
                        </div>
                        <button 
                           onClick={() => handleDelete(r.id)}
                           disabled={deletingId === r.id}
                           className="rounded-full border border-red-50 p-2.5 text-red-400 transition hover:bg-red-50 hover:text-red-600"
                        >
                           <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                           </svg>
                        </button>
                     </div>
                  </div>
               </motion.div>
            ))}
         </AnimatePresence>
      </div>

      {reviews.length === 0 && (
         <div className="py-20 text-center">
            <p className="text-sm text-[#8C7A6B] italic font-display">The community vault is currently empty.</p>
         </div>
      )}
    </div>
  )
}
