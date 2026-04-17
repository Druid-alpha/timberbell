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
import {
  clearReservationCountdown,
  ensureReservationCountdown,
  getReservationTimeLeft,
  subscribeToReservationUpdates,
} from '@/lib/reservation'

export default function CartPage() {
  const [cart, setCart] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [timeLeft, setTimeLeft] = useState(0)

  const dispatch = useAppDispatch()
  const { toast } = useToast()
  const getItemKey = (item: any) => `${item.productId}::${item.variantId || 'base'}`
  const getItemUnitPrice = (item: any) => item.product?.finalPrice ?? item.price ?? item.product?.price ?? 0
  const getItemImage = (item: any) => item.selectedVariant?.image?.url || item.product?.images?.[0]?.url || ''
  const getItemLabel = (item: any) => item.variantName || item.selectedVariant?.name || null

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  useEffect(() => {
    const syncTimeLeft = () => setTimeLeft(getReservationTimeLeft())

    syncTimeLeft()
    const timer = setInterval(syncTimeLeft, 1000)
    const unsubscribe = subscribeToReservationUpdates(syncTimeLeft)

    return () => {
      clearInterval(timer)
      unsubscribe()
    }
  }, [])

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

      const activeServerItems = data.cart?.items?.filter((item: any) => !item.saved) || []
      if (activeServerItems.length > 0) {
        ensureReservationCountdown()
      } else {
        clearReservationCountdown()
      }

      const reduxItems = data.cart.items.map((item: any) => ({
        productId: item.productId,
        name: item.product?.name,
        price: item.product?.finalPrice ?? item.product?.price,
        quantity: item.quantity,
        imageUrl: item.selectedVariant?.image?.url || item.product?.images?.[0]?.url,
        variantId: item.variantId ?? undefined,
        variantName: item.variantName ?? item.selectedVariant?.name ?? undefined,
        color: item.color ?? item.selectedVariant?.color ?? undefined,
        saved: item.saved,
      }))
      dispatch(syncCart(reduxItems))
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  async function updateItem(itemKey: string, updates: any) {
    setUpdatingId(itemKey)
    const updatedItems = cart.items.map((item: any) =>
      getItemKey(item) === itemKey ? { ...item, ...updates } : item
    )

    const finalItems = updatedItems.filter((item: any) => item.quantity > 0)

    const res = await fetch('/api/cart', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: finalItems.map((it: any) => ({
          productId: it.productId,
          variantId: it.variantId,
          variantName: it.variantName,
          color: it.color,
          quantity: it.quantity,
          saved: it.saved,
        })),
      }),
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

  async function cancelReservation() {
    if (!activeItems.length) return

    setUpdatingId('reservation')
    const releasedItems = cart.items.map((item: any) =>
      item.saved ? item : { ...item, saved: true }
    )

    const res = await fetch('/api/cart', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: releasedItems.map((item: any) => ({
          productId: item.productId,
          variantId: item.variantId,
          variantName: item.variantName,
          color: item.color,
          quantity: item.quantity,
          saved: item.saved,
        })),
      }),
    })

    if (res.ok) {
      clearReservationCountdown()
      toast('Reservation cancelled. Your pieces were moved to saved for later.', 'info')
      load()
    }

    setUpdatingId(null)
  }

  const subtotal = activeItems.reduce(
    (sum: number, item: any) => sum + getItemUnitPrice(item) * item.quantity,
    0
  )
  const delivery = subtotal > 0 ? 14000 : 0
  const total = subtotal + delivery

  if (loading) {
    return <div className="mx-auto max-w-6xl px-6 py-16 text-sm text-[#6B594A]">Curating your studio bundle...</div>
  }

  if (error && !cart) {
    return <div className="mx-auto max-w-6xl px-6 py-16 text-sm text-[#6B594A]">{error}</div>
  }

  return (
    <div className="mx-auto max-w-6xl space-y-12 overflow-x-hidden px-4 py-10 sm:px-6 sm:py-16">
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
          {activeItems.length > 0 && timeLeft > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-4 rounded-3xl bg-[#2B2119] px-5 py-5 text-white shadow-xl sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-4"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#7C4E2F] text-[9px] font-bold uppercase animate-pulse">
                  Hold
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] uppercase tracking-[0.2em] opacity-60">Atelier Reserve</p>
                  <p className="text-xs font-medium">Pieces in your bundle are held for your review.</p>
                </div>
              </div>
              <div className="flex items-center justify-between gap-4 sm:block sm:text-right">
                <p className="font-display text-2xl text-[#CBB9A2] tabular-nums">{formatTime(timeLeft)}</p>
                <button
                  onClick={cancelReservation}
                  disabled={updatingId === 'reservation'}
                  className="rounded-full border border-white/15 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.25em] text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60 sm:mt-2"
                >
                  Cancel Reservation
                </button>
              </div>
            </motion.div>
          )}

          {activeItems.length > 0 ? (
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {activeItems.map((item: any) => (
                  <motion.div
                    key={getItemKey(item)}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`flex flex-col gap-6 rounded-[32px] border border-[#E6D9C8] bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:p-6 ${updatingId === getItemKey(item) || updatingId === 'reservation' ? 'opacity-50' : 'opacity-100'}`}
                  >
                    <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl bg-[#F4EEE4]">
                      <img src={getItemImage(item)} alt="" className="h-full w-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[#8C7A6B]">{item.product?.category}</p>
                      <h3 className="break-words text-lg font-display text-[#2B2119]">{item.product?.name}</h3>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        {getItemLabel(item) ? (
                          <span className="rounded-full bg-[#F4EEE4] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#7C4E2F]">
                            {getItemLabel(item)}
                          </span>
                        ) : (
                          <span className="rounded-full bg-[#F4EEE4] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#8C7A6B]">
                            Main Piece
                          </span>
                        )}
                        {item.color ? (
                          <span className="inline-flex items-center gap-2 rounded-full border border-[#E6D9C8] px-3 py-1 text-[10px] uppercase tracking-widest text-[#6B594A]">
                            <span className="h-3 w-3 rounded-full border border-black/10" style={{ backgroundColor: item.color }} />
                            Selected Color
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-3 text-sm font-bold text-[#7C4E2F]">{formatMoney(getItemUnitPrice(item))}</p>
                    </div>
                    <div className="flex flex-col gap-3 sm:items-end">
                      <div className="flex items-center gap-3 rounded-full border border-[#E6D9C8] p-1">
                        <button disabled={item.quantity <= 1} onClick={() => updateItem(getItemKey(item), { quantity: item.quantity - 1 })} className="h-8 w-8 rounded-full bg-[#F4EEE4] transition hover:bg-[#E6D9C8] disabled:cursor-not-allowed disabled:opacity-40">-</button>
                        <span className="w-6 text-center text-sm font-bold">{item.quantity}</span>
                        <button onClick={() => updateItem(getItemKey(item), { quantity: item.quantity + 1 })} className="h-8 w-8 rounded-full bg-[#F4EEE4] transition hover:bg-[#E6D9C8]">+</button>
                      </div>
                      <div className="flex flex-wrap gap-4 sm:justify-end">
                        <button onClick={() => updateItem(getItemKey(item), { saved: true })} className="text-[10px] font-bold uppercase tracking-widest text-[#8C7A6B] transition-colors hover:text-[#7C4E2F]">Save for later</button>
                        <button onClick={() => updateItem(getItemKey(item), { quantity: 0 })} className="text-[10px] font-bold uppercase tracking-widest text-red-800 hover:underline">Remove</button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="rounded-[40px] border-2 border-dashed border-[#E6D9C8] py-20 text-center">
              <p className="text-sm text-[#8C7A6B]">Your bundle is currently empty.</p>
              <Link href="/productfilter" className="mt-4 inline-block border-b-2 border-[#7C4E2F] text-[10px] font-bold uppercase tracking-widest text-[#7C4E2F]">Explore the collection</Link>
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
                      key={getItemKey(item)}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="group flex gap-4 rounded-3xl border border-[#E6D9C8] bg-[#F4EEE4]/30 p-4 transition hover:bg-white"
                    >
                      <img src={getItemImage(item)} alt="" className="h-16 w-16 rounded-xl object-cover grayscale transition-all group-hover:grayscale-0" />
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-[#2B2119]">{item.product?.name}</h4>
                        {getItemLabel(item) ? <p className="mt-1 text-[10px] uppercase tracking-widest text-[#8C7A6B]">{getItemLabel(item)}</p> : null}
                        <button onClick={() => updateItem(getItemKey(item), { saved: false })} className="mt-2 border-b border-[#7C4E2F] text-[9px] font-bold uppercase tracking-widest text-[#7C4E2F]">Add back to bundle</button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>

        <div className="h-fit space-y-6 lg:sticky lg:top-28">
          <div className="rounded-[40px] border border-[#E6D9C8] bg-[#F4EEE4] p-6 sm:p-8">
            <h2 className="mb-6 text-[10px] font-bold uppercase tracking-widest text-[#8C7A6B]">Summary</h2>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span className="font-bold text-[#2B2119]">{formatMoney(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Delivery</span>
                <span className="font-bold text-[#2B2119]">{formatMoney(delivery)}</span>
              </div>
              <div className="flex items-end justify-between border-t border-[#E6D9C8] pt-4">
                <span className="text-[10px] font-bold uppercase tracking-widest">Total cost</span>
                <span className="text-2xl font-display text-[#7C4E2F]">{formatMoney(total)}</span>
              </div>
              <Link
                href="/checkout"
                className={`flex w-full items-center justify-center rounded-full py-4 text-[10px] font-bold uppercase tracking-[0.4em] text-white transition-all ${activeItems.length > 0 ? 'bg-[#7C4E2F] shadow-lg hover:bg-[#5C3A24]' : 'cursor-not-allowed bg-[#D8C7B3]'}`}
                onClick={(e) => activeItems.length === 0 && e.preventDefault()}
              >
                Proceed to checkout
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-3 px-2 text-[10px] uppercase tracking-widest text-[#8C7A6B] sm:px-8">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#2A3320] text-[9px] font-bold text-white">OK</div>
            <span>Insured Nigeria logistics</span>
          </div>
        </div>
      </div>
    </div>
  )
}
