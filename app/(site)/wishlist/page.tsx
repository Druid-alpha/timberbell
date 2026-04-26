'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Breadcrumb from '@/app/_components/Breadcrumb'
import ProductCard from '@/app/_components/ProductCard'
import SectionHeading from '@/app/_components/SectionHeading'
import StateCard from '@/app/_components/StateCard'
import { readSavedBoard, type SavedBoard } from '@/lib/utils/savedBoard'

type Product = {
  id: string
  name: string
  price: number
  category: string
  description: string
  palette?: string[]
}

export default function WishlistPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [savedBoard, setSavedBoard] = useState<SavedBoard | null>(null)

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const res = await fetch('/api/wishlist', { cache: 'no-store' })
        const json = await res.json().catch(() => ({}))
        if (!active) return
        if (!res.ok) {
          if (res.status === 401) {
            window.location.href = `/login?next=${encodeURIComponent('/wishlist')}`
            return
          }
          setError(json?.message || 'Please sign in to view your wishlist.')
          setProducts([])
        } else {
          setProducts(json?.products ?? [])
        }
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    let active = true

    async function loadBoard() {
      const localBoard = readSavedBoard()
      try {
        const res = await fetch('/api/saved-board', { cache: 'no-store' })
        const json = await res.json().catch(() => ({}))
        if (!active) return
        setSavedBoard(json?.board ?? localBoard)
      } catch {
        if (active) setSavedBoard(localBoard)
      }
    }

    void loadBoard()
    return () => {
      active = false
    }
  }, [])

  return (
    <div className="mx-auto max-w-7xl space-y-10 px-4 py-12 sm:px-6 sm:py-16">
      <section className="overflow-hidden rounded-[40px] border border-[#E6D9C8] bg-[radial-gradient(circle_at_top_right,rgba(124,78,47,0.16),transparent_30%),linear-gradient(135deg,#fffdf9,#f4eee4)] px-6 py-8 shadow-[0_30px_90px_-65px_rgba(55,32,15,0.5)] sm:px-8 sm:py-10">
        <div className="flex flex-col gap-6">
          <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Wishlist' }]} />
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <SectionHeading eyebrow="Wishlist" title="Saved pieces" description="Keep track of the furniture pieces you love." />
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { label: 'Saved', value: String(products.length) },
                { label: 'Intent', value: 'Curated' },
                { label: 'Next Step', value: 'Compare' },
              ].map((item) => (
                <div key={item.label} className="rounded-[24px] border border-[#E6D9C8] bg-white/80 px-4 py-5 shadow-sm">
                  <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#8C7A6B]">{item.label}</p>
                  <div className="mt-3 font-display text-2xl leading-tight text-[#2B2119]">{item.value}</div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <Link
              href="/productfilter"
              className="inline-flex rounded-full border border-[#7C4E2F] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#7C4E2F]"
            >
              Continue shopping
            </Link>
          </div>
        </div>
      </section>

      {loading ? (
        <StateCard
          eyebrow="Wishlist"
          title="Curating saved favorites"
          description="Laying out the pieces you marked for a second look."
          compact
        />
      ) : error ? (
        <StateCard
          eyebrow="Wishlist"
          title="We could not open your wishlist"
          description={error}
          actionHref="/login"
          actionLabel="Go to login"
          compact
        />
      ) : products.length ? (
        <div className="space-y-8">
          {savedBoard ? (
            <div className="rounded-[32px] border border-[#E6D9C8] bg-[linear-gradient(180deg,#f8f1e8,#fffdfa)] p-6 shadow-sm">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="space-y-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#8C7A6B]">Saved Room Board</p>
                  <h3 className="font-display text-2xl text-[#2B2119]">
                    {savedBoard.projectType} direction with a {savedBoard.budget} budget
                  </h3>
                  <p className="max-w-2xl text-sm leading-relaxed text-[#6B594A]">
                    {savedBoard.notes || 'Your saved room advisor board is still available here while you compare wishlist pieces and shape the final room plan.'}
                  </p>
                </div>
                <Link href="/room-advisor" className="w-fit rounded-full border border-[#7C4E2F] px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#7C4E2F] transition hover:bg-white">
                  Reopen room advisor
                </Link>
              </div>
              {savedBoard.items?.length ? (
                <div className="mt-5 flex flex-wrap gap-2">
                  {savedBoard.items.slice(0, 4).map((item) => (
                    <span key={item.id} className="rounded-full border border-[#E6D9C8] bg-white px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-[#6B594A]">
                      {item.name}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {savedBoard ? (
            <div className="rounded-[32px] border border-[#E6D9C8] bg-[linear-gradient(180deg,#f8f1e8,#fffdfa)] p-6 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#8C7A6B]">Saved Room Board</p>
              <h3 className="mt-3 font-display text-2xl text-[#2B2119]">{savedBoard.projectType} direction still waiting here</h3>
              <p className="mt-3 text-sm leading-relaxed text-[#6B594A]">
                {savedBoard.notes || 'Your room advisor board is saved locally. Use it as a guide while you begin saving pieces into your wishlist.'}
              </p>
              <div className="mt-5">
                <Link href="/room-advisor" className="inline-flex rounded-full border border-[#7C4E2F] px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#7C4E2F] transition hover:bg-white">
                  Reopen room advisor
                </Link>
              </div>
            </div>
          ) : null}
          <StateCard
            eyebrow="Wishlist"
            title="Your wishlist is still open for its first save"
            description="Start saving pieces you want to compare, revisit, or bring into a future room plan."
            actionHref="/productfilter"
            actionLabel="Browse products"
            compact
          />
        </div>
      )}
    </div>
  )
}
