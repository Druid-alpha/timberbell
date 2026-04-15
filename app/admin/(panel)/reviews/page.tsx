'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { formatMoney } from '@/lib/utils/format'

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
    
    // Enrich reviews with product names
    const productsRes = await fetch('/api/products?limit=100')
    const productsData = await productsRes.json()
    const productMap = new Map(productsData.products.map((p: any) => [p.id, p.name]))

    const enriched = (data.reviews || []).map((r: Review) => ({
      ...r,
      productName: productMap.get(r.productId) || 'Unknown Product'
    }))

    setReviews(enriched)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to remove this community note?')) return
    setDeletingId(id)
    const res = await fetch(`/api/reviews/${id}`, { method: 'DELETE' })
    if (res.ok) {
       setReviews(prev => prev.filter(r => r.id !== id))
    }
    setDeletingId(null)
  }

  if (loading) return <div className="p-8 text-center text-xs uppercase tracking-widest text-[#8C7A6B]">Auditing community notes...</div>

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-end justify-between">
        <div className="space-y-1">
          <h2 className="font-display text-4xl text-[#2B2119]">Community Notes</h2>
          <p className="text-sm text-[#6B594A]">Monitor and manage curator feedback across all pieces.</p>
        </div>
        <div className="text-[10px] uppercase tracking-widest font-bold text-[#8C7A6B]">
          {reviews.length} total notes
        </div>
      </div>

      <div className="overflow-hidden rounded-[32px] border border-[#E6D9C8] bg-white shadow-sm">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-[#F4EEE4]/50 text-[10px] uppercase tracking-widest text-[#8C7A6B]">
              <th className="px-6 py-4 font-bold">Curator</th>
              <th className="px-6 py-4 font-bold">Piece</th>
              <th className="px-6 py-4 font-bold">Rating</th>
              <th className="px-6 py-4 font-bold">Message</th>
              <th className="px-6 py-4 font-bold">Date</th>
              <th className="px-6 py-4 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E6D9C8]/50 text-sm">
            {reviews.map((review) => (
              <tr key={review.id} className="group transition hover:bg-[#F4EEE4]/30">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2B2119] text-[10px] font-bold text-white">
                      {review.customer[0].toUpperCase()}
                    </div>
                    <span className="font-semibold text-[#2B2119]">{review.customer}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <Link href={`/products/${review.productId}`} className="text-[#7C4E2F] hover:underline font-medium">
                    {review.productName}
                  </Link>
                </td>
                <td className="px-6 py-4">
                   <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className={`h-2 w-2 rounded-full ${i < review.rating ? 'bg-[#7C4E2F]' : 'bg-[#E6D9C8]'}`} />
                      ))}
                   </div>
                </td>
                <td className="px-6 py-4 max-w-xs">
                  <p className="line-clamp-2 text-[#6B594A] text-xs leading-relaxed italic">"{review.message}"</p>
                </td>
                <td className="px-6 py-4 text-[10px] text-[#8C7A6B]">
                  {new Date(review.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => handleDelete(review.id)}
                    disabled={deletingId === review.id}
                    className="rounded-full border border-red-200 px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-red-800 transition hover:bg-red-50 disabled:opacity-50"
                  >
                    {deletingId === review.id ? 'Removing...' : 'Delete'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {reviews.length === 0 && (
          <div className="p-12 text-center text-sm text-[#6B594A]">No community notes found.</div>
        )}
      </div>
    </div>
  )
}
