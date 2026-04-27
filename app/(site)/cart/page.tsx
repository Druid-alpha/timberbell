'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import SectionHeading from '@/app/_components/SectionHeading'
import Breadcrumb from '@/app/_components/Breadcrumb'
import StateCard from '@/app/_components/StateCard'
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
import { STANDARD_DELIVERY_FEE } from '@/lib/constants/shipping'

export default function CartPage() {
  const [cart, setCart] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [timeLeft, setTimeLeft] = useState(0)
  const [emailVerified, setEmailVerified] = useState(true)

  const dispatch = useAppDispatch()
  const { toast } = useToast()
  const getPurchaseType = (item: any) => (item.purchaseType === 'variant' && item.variantId ? 'variant' : 'main')
  const getItemKey = (item: any) => `${item.saved ? 'saved' : 'active'}::${item.productId}::${getPurchaseType(item)}::${item.variantId || 'base'}`
  const getItemUnitPrice = (item: any) => item.product?.finalPrice ?? item.price ?? item.product?.price ?? 0
  const getItemImage = (item: any) => item.selectedVariant?.image?.url || item.product?.images?.[0]?.url || ''
  const getItemLabel = (item: any) => (getPurchaseType(item) === 'variant' ? item.variantName || item.selectedVariant?.name || null : null)
  const getVariantOptions = (item: any) => (Array.isArray(item.product?.variants) ? item.product.variants : [])

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
    const [res, profileRes] = await Promise.all([
      fetch('/api/cart'),
      fetch('/api/users/me'),
    ])
    const data = await res.json().catch(() => ({}))
    const profileData = await profileRes.json().catch(() => ({}))

    if (!res.ok) {
      setError(data.message || 'Unable to load cart')
      if (res.status === 401) {
        window.location.href = `/login?next=${encodeURIComponent('/cart')}`
        return
      }
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
        purchaseType: item.purchaseType ?? (item.variantId ? 'variant' : 'main'),
        variantId: item.variantId ?? undefined,
        variantName: item.variantName ?? item.selectedVariant?.name ?? undefined,
        color: item.color ?? item.selectedVariant?.color ?? undefined,
        saved: item.saved,
      }))
      dispatch(syncCart(reduxItems))
    }
    setEmailVerified(Boolean(profileData?.user?.emailVerified ?? true))
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
          purchaseType: getPurchaseType(it),
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

  async function switchItemVariant(itemKey: string, variantId?: string) {
    if (!cart?.items?.length) return

    const currentItem = cart.items.find((item: any) => getItemKey(item) === itemKey)
    if (!currentItem) return

    const targetVariant = getVariantOptions(currentItem).find((variant: any) => variant.id === variantId) ?? null
    const targetPurchaseType = variantId ? 'variant' : 'main'
    const targetKey = `${currentItem.saved ? 'saved' : 'active'}::${currentItem.productId}::${targetPurchaseType}::${variantId || 'base'}`
    setUpdatingId(itemKey)

    const nextItems: any[] = []

    for (const item of cart.items) {
      const key = getItemKey(item)

      if (key === itemKey) continue

      if (key === targetKey) {
        nextItems.push({
          ...item,
          quantity: item.quantity + currentItem.quantity,
          saved: currentItem.saved,
          purchaseType: targetPurchaseType,
        })
        continue
      }

      nextItems.push(item)
    }

    const targetAlreadyExists = cart.items.some((item: any) => getItemKey(item) === targetKey && getItemKey(item) !== itemKey)

    if (!targetAlreadyExists) {
      nextItems.push({
        ...currentItem,
        purchaseType: targetPurchaseType,
        variantId: variantId ?? undefined,
        variantName: targetVariant?.name ?? undefined,
        color: targetVariant?.color ?? undefined,
      })
    }

    const res = await fetch('/api/cart', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: nextItems.map((item: any) => ({
          productId: item.productId,
          purchaseType: getPurchaseType(item),
          variantId: item.variantId,
          variantName: item.variantName,
          color: item.color,
          quantity: item.quantity,
          saved: item.saved,
        })),
      }),
    })

    if (res.ok) {
      toast(variantId ? 'Variant updated in your bundle' : 'Main product restored in your bundle', 'success')
      load()
    }

    setUpdatingId(null)
  }

  const activeItems = cart?.items?.filter((item: any) => !item.saved) || []
  const savedItems = cart?.items?.filter((item: any) => item.saved) || []
  const groupedSavedItems = useMemo(() => {
    const groups = new Map<string, any>()

    for (const item of savedItems) {
      const key = getItemKey(item)
      const existing = groups.get(key)
      if (existing) {
        existing.quantity += item.quantity
      } else {
        groups.set(key, { ...item })
      }
    }

    return Array.from(groups.values())
  }, [savedItems])

  async function updateSavedGroup(groupKey: string, updates: any) {
    if (!cart?.items?.length) return

    setUpdatingId(groupKey)
    const updatedItems = cart.items.map((item: any) =>
      getItemKey(item) === groupKey ? { ...item, ...updates } : item
    )

    const finalItems = updatedItems.filter((item: any) => item.quantity > 0)

    const res = await fetch('/api/cart', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: finalItems.map((it: any) => ({
          productId: it.productId,
          purchaseType: getPurchaseType(it),
          variantId: it.variantId,
          variantName: it.variantName,
          color: it.color,
          quantity: it.quantity,
          saved: it.saved,
        })),
      }),
    })

    if (res.ok) {
      if (updates.saved === false) toast('Piece moved to active bundle', 'success')
      if (updates.quantity === 0) toast('Piece removed from bundle', 'info')
      load()
    }
    setUpdatingId(null)
  }

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
          purchaseType: getPurchaseType(item),
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
  const delivery = subtotal > 0 ? STANDARD_DELIVERY_FEE : 0
  const total = subtotal + delivery

  if (loading) {
    return <div className="mx-auto max-w-6xl px-6 py-16 text-sm text-[#6B594A]">Curating your studio bundle...</div>
  }

  if (error && !cart) {
    return <div className="mx-auto max-w-6xl px-6 py-16 text-sm text-[#6B594A]">{error}</div>
  }

  return (
    <div className="mx-auto max-w-7xl space-y-12 overflow-x-hidden px-4 py-10 sm:px-6 sm:py-16">
      <section className="overflow-hidden rounded-[40px] border border-[#E6D9C8] bg-[radial-gradient(circle_at_top_right,rgba(124,78,47,0.14),transparent_30%),linear-gradient(135deg,#fffdf9,#f4eee4)] px-6 py-8 shadow-[0_30px_90px_-65px_rgba(55,32,15,0.5)] sm:px-8 sm:py-10">
        <div className="flex flex-col gap-6">
          <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Cart' }]} />
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <SectionHeading
              eyebrow="Shopping Cart"
              title="Your Curated Bundle"
              description="Review your selected pieces and continue to checkout."
            />
          </div>
        </div>
      </section>

      <div className="grid min-w-0 gap-12 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="min-w-0 space-y-8">
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
                    className={`flex flex-col gap-6 rounded-[32px] border border-[#E6D9C8] bg-[linear-gradient(180deg,#fffdfa,#ffffff)] p-5 shadow-[0_20px_50px_-42px_rgba(55,32,15,0.45)] sm:flex-row sm:items-center sm:p-6 ${updatingId === getItemKey(item) || updatingId === 'reservation' ? 'opacity-50' : 'opacity-100'}`}
                  >
                    <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl bg-[#F4EEE4]">
                      <img src={getItemImage(item)} alt="" className="h-full w-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[10px] font-bold uppercase tracking-[0.14em] text-[#8C7A6B]">{item.product?.category}</p>
                      <h3 className="break-words text-lg font-display text-[#2B2119]">{item.product?.name}</h3>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        {getItemLabel(item) ? (
                          <span className="rounded-full bg-[#F4EEE4] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#7C4E2F]">
                            {getItemLabel(item)}
                          </span>
                        ) : (
                          <span className="rounded-full bg-[#F4EEE4] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#8C7A6B]">
                            Main Piece
                          </span>
                        )}
                        {item.color ? (
                          <span className="inline-flex max-w-full items-center gap-2 rounded-full border border-[#E6D9C8] px-3 py-1 text-[10px] uppercase tracking-[0.12em] text-[#6B594A]">
                            <span className="h-3 w-3 rounded-full border border-black/10" style={{ backgroundColor: item.color }} />
                            Selected Color
                          </span>
                        ) : null}
                      </div>
                      {getVariantOptions(item).length > 0 ? (
                        <div className="mt-3 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => switchItemVariant(getItemKey(item))}
                            className={`rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] transition-all active:scale-[0.98] ${!item.variantId ? 'translate-y-[1px] border-[#7C4E2F] bg-[#2B2119] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]' : 'border-[#E6D9C8] bg-white text-[#6B594A] hover:border-[#7C4E2F]'}`}
                          >
                            Main Product
                          </button>
                          {getVariantOptions(item).map((variant: any) => (
                            <button
                              key={variant.id}
                              type="button"
                              onClick={() => switchItemVariant(getItemKey(item), variant.id)}
                              className={`rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] transition-all active:scale-[0.98] ${item.variantId === variant.id ? 'translate-y-[1px] border-[#7C4E2F] bg-[#2B2119] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]' : 'border-[#E6D9C8] bg-white text-[#6B594A] hover:border-[#7C4E2F]'}`}
                            >
                              {variant.name}
                            </button>
                          ))}
                        </div>
                      ) : null}
                      <p className="mt-3 text-sm font-bold text-[#7C4E2F]">{formatMoney(getItemUnitPrice(item))}</p>
                    </div>
                    <div className="flex flex-col gap-3 sm:items-end">
                      <div className="flex items-center gap-3 rounded-full border border-[#E6D9C8] p-1">
                        <button disabled={item.quantity <= 1} onClick={() => updateItem(getItemKey(item), { quantity: item.quantity - 1 })} className="h-8 w-8 rounded-full bg-[#F4EEE4] transition hover:bg-[#E6D9C8] disabled:cursor-not-allowed disabled:opacity-40">-</button>
                        <span className="w-6 text-center text-sm font-bold">{item.quantity}</span>
                        <button onClick={() => updateItem(getItemKey(item), { quantity: item.quantity + 1 })} className="h-8 w-8 rounded-full bg-[#F4EEE4] transition hover:bg-[#E6D9C8]">+</button>
                      </div>
                      <div className="flex flex-wrap gap-4 sm:justify-end">
                        <button onClick={() => updateItem(getItemKey(item), { saved: true })} className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#8C7A6B] transition-colors hover:text-[#7C4E2F]">Save for later</button>
                        <button onClick={() => updateItem(getItemKey(item), { quantity: 0 })} className="text-[10px] font-bold uppercase tracking-[0.12em] text-red-800 hover:underline">Remove</button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <StateCard
              eyebrow="Curated Bundle"
              title="Your bundle is currently empty"
              description="Start gathering pieces for review, comparison, and checkout in one calmer flow."
              actionHref="/productfilter"
              actionLabel="Explore the collection"
            />
          )}

          {groupedSavedItems.length > 0 && (
            <div className="mt-10 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-display text-xl text-[#2B2119]">Saved for later</h2>
                <p className="text-[10px] uppercase tracking-[0.18em] text-[#8C7A6B]">{groupedSavedItems.length} items</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <AnimatePresence>
                  {groupedSavedItems.map((item: any) => (
                    <motion.div
                      key={getItemKey(item)}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="group flex gap-3 rounded-[24px] border border-[#E6D9C8] bg-[linear-gradient(180deg,#f8f1e8,#fffdfa)] p-3 transition hover:bg-white"
                    >
                      <img src={getItemImage(item)} alt="" className="h-14 w-14 rounded-xl object-cover grayscale transition-all group-hover:grayscale-0" />
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-[#2B2119]">{item.product?.name}</h4>
                        {getItemLabel(item) ? <p className="mt-1 text-[10px] uppercase tracking-widest text-[#8C7A6B]">{getItemLabel(item)}</p> : null}
                        {getVariantOptions(item).length > 0 ? (
                          <div className="mt-2 flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => switchItemVariant(getItemKey(item))}
                              className={`rounded-full border px-3 py-1 text-[9px] font-bold uppercase tracking-[0.12em] transition-all active:scale-[0.98] ${!item.variantId ? 'translate-y-[1px] border-[#7C4E2F] bg-[#2B2119] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]' : 'border-[#E6D9C8] bg-white text-[#6B594A] hover:border-[#7C4E2F]'}`}
                            >
                              Main
                            </button>
                            {getVariantOptions(item).map((variant: any) => (
                              <button
                                key={variant.id}
                                type="button"
                                onClick={() => switchItemVariant(getItemKey(item), variant.id)}
                                className={`rounded-full border px-3 py-1 text-[9px] font-bold uppercase tracking-[0.12em] transition-all active:scale-[0.98] ${item.variantId === variant.id ? 'translate-y-[1px] border-[#7C4E2F] bg-[#2B2119] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]' : 'border-[#E6D9C8] bg-white text-[#6B594A] hover:border-[#7C4E2F]'}`}
                              >
                                {variant.name}
                              </button>
                            ))}
                          </div>
                        ) : null}
                        <div className="mt-2 flex flex-wrap items-center gap-3">
                          <button onClick={() => updateSavedGroup(getItemKey(item), { saved: false })} className="border-b border-[#7C4E2F] text-[9px] font-bold uppercase tracking-[0.12em] text-[#7C4E2F]">Add back to bundle</button>
                          <button onClick={() => updateSavedGroup(getItemKey(item), { quantity: 0 })} className="text-[9px] font-bold uppercase tracking-[0.12em] text-red-800 hover:underline">Remove</button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>

        <div className="min-w-0 h-fit space-y-6 lg:sticky lg:top-28">
          <div className="rounded-[40px] border border-[#E6D9C8] bg-[linear-gradient(180deg,#f8f1e8,#fffdfa)] p-6 shadow-[0_24px_60px_-50px_rgba(55,32,15,0.5)] sm:p-8">
            <h2 className="mb-6 text-[10px] font-bold uppercase tracking-widest text-[#8C7A6B]">Summary</h2>
            {!emailVerified && activeItems.length > 0 ? (
              <div className="mb-5 rounded-3xl border border-[#E6D9C8] bg-[#FFF7EF] px-4 py-3 text-xs text-[#6B594A]">
                Verify your email before checkout. <Link href="/verify" className="font-semibold underline">Verify now</Link>
              </div>
            ) : null}
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
                className={`flex w-full items-center justify-center rounded-full py-4 text-[10px] font-bold uppercase tracking-[0.18em] text-white transition-all ${activeItems.length > 0 && emailVerified ? 'bg-[#7C4E2F] shadow-lg hover:bg-[#5C3A24]' : 'cursor-not-allowed bg-[#D8C7B3]'}`}
                onClick={(e) => (activeItems.length === 0 || !emailVerified) && e.preventDefault()}
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
