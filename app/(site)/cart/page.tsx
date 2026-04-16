'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import SectionHeading from '@/app/_components/SectionHeading'
import Breadcrumb from '@/app/_components/Breadcrumb'
import { useAppDispatch } from '@/lib/redux/hooks'
import { syncCart } from '@/lib/redux/cartSlice'
import { formatMoney } from '@/lib/utils/format'
import { motion, AnimatePresence } from 'framer-motion'
import { useToast } from '@/app/_components/ToastProvider'

export default function CartPage() {
  const [cart, setCart] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [timeLeft, setTimeLeft] = useState(600) // 10 minutes in seconds

  const dispatch = useAppDispatch()
  const { toast } = useToast()

  useEffect(() => {
    if (timeLeft <= 0) return
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [timeLeft])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  async function load() {
    const res = await fetch('/api/cart')
    const data = await res.json().catch(() => ({}))

    if (!res.ok) {
      setError(data.message || 'Unable to load cart')
      if (res.status === 401) setError('Please sign in to view your cart.')
      setCart(null)
    } else {
      setCart(data.cart)
      setError('')
      // Sync Redux
      const reduxItems = data.cart.items.map((item: any) => ({
        productId: item.productId,
        name: item.product?.name,
        price: item.product?.price,
        quantity: item.quantity,
        imageUrl: item.product?.images?.[0]?.url,
        saved: item.saved
      }))
      dispatch(syncCart(reduxItems))
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  async function updateItem(productId: string, updates: any) {
    setUpdatingId(productId)
    const updatedItems = cart.items.map((item: any) => 
      item.productId === productId ? { ...item, ...updates } : item
    )
    
    // Remove if quantity 0
    const finalItems = updatedItems.filter((item: any) => item.quantity > 0)

    const res = await fetch('/api/cart', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: finalItems.map((it: any) => ({ productId: it.productId, quantity: it.quantity, saved: it.saved })) })
    })

    if (res.ok) {
      if (updates.saved === true) toast('Piece saved for later', 'info')
      if (updates.saved === false) toast('Piece moved to active bundle', 'success')
      if (updates.quantity === 0) toast('Piece removed from bundle', 'info')
      load()
    }
    setUpdatingId(null)
  }

  const activeItems = cart?.items?.filter((item: any) => !item.saved) || []
  const savedItems = cart?.items?.filter((item: any) => item.saved) || []

  const subtotal = activeItems.reduce(
    (sum: number, item: any) => sum + (item.product?.price ?? 0) * item.quantity,
    0
  )
  const delivery = subtotal > 0 ? 140 : 0
  const total = subtotal + delivery

  if (loading) return <div className="mx-auto max-w-6xl px-6 py-16 text-sm text-[#6B594A]">Curating your studio bundle...</div>

  return (
    <div className="mx-auto max-w-6xl space-y-12 px-6 py-16">
      <div className="flex flex-col gap-6">
        <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Cart' }]} />
        <SectionHeading
          eyebrow="Shopping Cart"
          title="Your Curated Bundle"
          description="Pieces currently held in your session for review and checkout."
        />
      </div>

      <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-8">
          {activeItems.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between rounded-3xl bg-[#2B2119] px-6 py-4 text-white shadow-xl"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#7C4E2F] text-[10px] animate-pulse">
                   ⏳
                </div>
                <div className="space-y-0.5">
                   <p className="text-[10px] uppercase tracking-[0.2em] opacity-60">Atelier Reserve</p>
                   <p className="text-xs font-medium">Pieces in your bundle are held for your review</p>
                </div>
              </div>
              <div className="text-right">
                 <p className="font-display text-2xl text-[#CBB9A2] tabular-nums">{formatTime(timeLeft)}</p>
              </div>
            </motion.div>
          )}

          {activeItems.length > 0 ? (
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {activeItems.map((item: any) => (
                  <motion.div
                    key={item.productId}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`flex flex-col gap-6 rounded-[32px] border border-[#E6D9C8] bg-white p-6 shadow-sm sm:flex-row sm:items-center ${updatingId === item.productId ? 'opacity-50' : 'opacity-100'}`}
                  >
                    <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl bg-[#F4EEE4]">
                      <img src={item.product?.images?.[0]?.url || ''} alt="" className="h-full w-full object-cover" />
                    </div>
                    <div className="flex-1">
                       <p className="text-[10px] uppercase tracking-widest text-[#8C7A6B] font-bold">{item.product?.category}</p>
                       <h3 className="text-lg font-display text-[#2B2119]">{item.product?.name}</h3>
                       <p className="text-sm font-bold text-[#7C4E2F]">{formatMoney(item.product?.price)}</p>
                    </div>
                    <div className="flex flex-col items-end gap-3">
                       <div className="flex items-center gap-3 rounded-full border border-[#E6D9C8] p-1">
                          <button onClick={() => updateItem(item.productId, { quantity: item.quantity - 1 })} className="h-8 w-8 rounded-full bg-[#F4EEE4] transition hover:bg-[#E6D9C8]">-</button>
                          <span className="w-6 text-center text-sm font-bold">{item.quantity}</span>
                          <button onClick={() => updateItem(item.productId, { quantity: item.quantity + 1 })} className="h-8 w-8 rounded-full bg-[#F4EEE4] transition hover:bg-[#E6D9C8]">+</button>
                       </div>
                       <div className="flex gap-4">
                          <button onClick={() => updateItem(item.productId, { saved: true })} className="text-[10px] uppercase tracking-widest font-bold text-[#8C7A6B] hover:text-[#7C4E2F] transition-colors">Save for later</button>
                          <button onClick={() => updateItem(item.productId, { quantity: 0 })} className="text-[10px] uppercase tracking-widest font-bold text-red-800 hover:underline">Remove</button>
                       </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="rounded-[40px] border-2 border-dashed border-[#E6D9C8] py-20 text-center">
              <p className="text-sm text-[#8C7A6B]">Your bundle is currently empty.</p>
              <Link href="/productfilter" className="mt-4 inline-block text-[10px] uppercase tracking-widest font-bold text-[#7C4E2F] border-b-2 border-[#7C4E2F]">Explore the collection</Link>
            </div>
          )}

          {savedItems.length > 0 && (
            <div className="mt-16 space-y-6">
              <div>
                <h2 className="font-display text-2xl text-[#2B2119]">Saved for later</h2>
                <p className="text-xs text-[#8C7A6B]">Items you're keeping an eye on for future curation.</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <AnimatePresence>
                  {savedItems.map((item: any) => (
                    <motion.div
                      key={item.productId}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="group flex gap-4 rounded-3xl border border-[#E6D9C8] bg-[#F4EEE4]/30 p-4 transition hover:bg-white"
                    >
                      <img src={item.product?.images?.[0]?.url || ''} alt="" className="h-16 w-16 rounded-xl object-cover grayscale group-hover:grayscale-0 transition-all" />
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-[#2B2119]">{item.product?.name}</h4>
                        <button onClick={() => updateItem(item.productId, { saved: false })} className="mt-2 text-[9px] uppercase tracking-widest font-bold text-[#7C4E2F] border-b border-[#7C4E2F]">Add back to bundle</button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>

        <div className="sticky top-28 h-fit space-y-6">
          <div className="rounded-[40px] border border-[#E6D9C8] bg-[#F4EEE4] p-8">
            <h2 className="text-[10px] uppercase tracking-widest font-bold text-[#8C7A6B] mb-6">Summary</h2>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span className="font-bold text-[#2B2119]">${subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>White-Glove Tier</span>
                <span className="font-bold text-[#2B2119]">${delivery.toLocaleString()}</span>
              </div>
              <div className="pt-4 border-t border-[#E6D9C8] flex justify-between items-end">
                <span className="text-[10px] uppercase font-bold tracking-widest">Total cost</span>
                <span className="text-2xl font-display text-[#7C4E2F]">{formatMoney(total)}</span>
              </div>
              <Link
                href="/checkout"
                className={`flex w-full items-center justify-center rounded-full py-4 text-[10px] font-bold uppercase tracking-[0.4em] text-white transition-all ${activeItems.length > 0 ? 'bg-[#7C4E2F] shadow-lg hover:bg-[#5C3A24]' : 'bg-[#D8C7B3] cursor-not-allowed'}`}
                onClick={(e) => activeItems.length === 0 && e.preventDefault()}
              >
                Proceed to delivery
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-3 px-8 text-[10px] text-[#8C7A6B] uppercase tracking-widest">
             <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#2A3320] text-white">✓</div>
             <span>Insured for transit</span>
          </div>
        </div>
      </div>
    </div>
  )
}
