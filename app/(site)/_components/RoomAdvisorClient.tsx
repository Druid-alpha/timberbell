'use client'

import { useEffect, useMemo, useState } from 'react'
import Breadcrumb from '@/app/_components/Breadcrumb'
import ProductCard from '@/app/_components/ProductCard'
import SectionHeading from '@/app/_components/SectionHeading'
import { writeSavedBoard, type SavedBoard } from '@/lib/utils/savedBoard'
import type { Product } from '@/types/catalog'

type AdvisorProductBucket = {
  living: Product[]
  bedroom: Product[]
  dining: Product[]
  entry: Product[]
}

function budgetAllows(product: Product, budget: string) {
  const price = Number(product.finalPrice ?? product.price ?? 0)
  const normalized = budget.toLowerCase()
  if (!normalized) return true
  if (normalized.includes('entry')) return price <= 100000
  if (normalized.includes('mid')) return price <= 250000
  return true
}

export default function RoomAdvisorClient({
  productsByRoom,
}: {
  productsByRoom: AdvisorProductBucket
}) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    location: '',
    projectType: 'living room',
    budget: 'mid-range',
    timeline: '',
    message: '',
  })
  const [status, setStatus] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [boardSaved, setBoardSaved] = useState(false)

  async function persistBoard(payload: SavedBoard) {
    const res = await fetch('/api/saved-board', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(() => null)

    return res
  }

  const recommendedProducts = useMemo(() => {
    const project = form.projectType.toLowerCase()
    const bucket = project.includes('bed')
      ? productsByRoom.bedroom
      : project.includes('din')
        ? productsByRoom.dining
        : project.includes('entry') || project.includes('foyer')
          ? productsByRoom.entry
          : productsByRoom.living

    return bucket.filter((product) => budgetAllows(product, form.budget)).slice(0, 3)
  }, [form.projectType, form.budget, productsByRoom])

  useEffect(() => {
    setBoardSaved(false)
  }, [form.projectType, form.budget, form.message])

  async function saveBoard() {
    if (typeof window === 'undefined') return
    const payload: SavedBoard = {
      createdAt: new Date().toISOString(),
      projectType: form.projectType,
      budget: form.budget,
      notes: form.message,
      items: recommendedProducts.map((product) => ({
        id: product.id,
        name: product.name,
        price: product.finalPrice ?? product.price,
      })),
    }
    writeSavedBoard(payload)
    const persisted = await persistBoard(payload)
    setBoardSaved(true)
    setStatus(
      persisted?.ok
        ? 'Recommendation board saved to your account and this device.'
        : 'Recommendation board saved on this device. Sign in to keep it with your account.'
    )
  }

  function downloadBoard() {
    if (typeof window === 'undefined') return
    const lines = [
      'Timberbell Room Advisor Board',
      `Project type: ${form.projectType}`,
      `Budget: ${form.budget}`,
      `Timeline: ${form.timeline || 'Not provided'}`,
      `Location: ${form.location || 'Not provided'}`,
      '',
      'Recommended pieces:',
      ...recommendedProducts.map((product) => `- ${product.name} (${product.finalPrice ?? product.price})`),
      '',
      'Notes:',
      form.message || 'No extra notes provided.',
    ]
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'timberbell-room-board.txt'
    link.click()
    window.URL.revokeObjectURL(url)
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    setStatus('')

    const recommendedNames = recommendedProducts.map((product) => product.name).join(', ')
    const res = await fetch('/api/studio-intake', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        type: 'room_advisor',
        message: `${form.message}\n\nSuggested shortlist shown to customer: ${recommendedNames || 'None yet'}`.trim(),
      }),
    })

    const data = await res.json().catch(() => ({}))
    setStatus(data.message || (res.ok ? 'Room advisor request received.' : 'Unable to send request right now.'))
    if (res.ok) {
      setForm({
        name: '',
        email: '',
        location: '',
        projectType: 'living room',
        budget: 'mid-range',
        timeline: '',
        message: '',
      })
    }
    setSubmitting(false)
  }

  return (
    <div className="mx-auto max-w-7xl space-y-16 px-6 py-16">
      <div className="flex flex-col gap-6">
        <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Room Advisor' }]} />
        <SectionHeading
          eyebrow="Phase 4 Experience"
          title="Meet the Timberbell Room Advisor"
          description="Tell us about your room, your taste, and your budget. We will turn that into a more curated direction for what to buy next."
        />
      </div>

      <div className="grid gap-10 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-8 rounded-[44px] border border-[#E6D9C8] bg-[radial-gradient(circle_at_top_right,rgba(124,78,47,0.12),transparent_28%),linear-gradient(180deg,#fffdf9,#f4eee4)] p-8 shadow-[0_30px_90px_-65px_rgba(55,32,15,0.5)]">
          <div className="space-y-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-[#8C7A6B]">How It Works</p>
            <h2 className="font-display text-4xl text-[#2B2119]">A faster path from inspiration to a furnished room</h2>
            <p className="text-sm leading-relaxed text-[#6B594A]">
              This advisor responds immediately with a directional shortlist before the studio team follows up with deeper recommendations.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { title: 'Room Context', detail: 'Living room, bedroom, dining, office, or hospitality project.' },
              { title: 'Budget Fit', detail: 'We shape the shortlist around the price band you are truly considering.' },
              { title: 'Design Direction', detail: 'We translate room intent into product recommendations.' },
            ].map((item) => (
              <div key={item.title} className="rounded-3xl border border-[#E6D9C8] bg-white/80 p-5">
                <h3 className="font-display text-xl text-[#2B2119]">{item.title}</h3>
                <p className="mt-3 text-xs leading-relaxed text-[#6B594A]">{item.detail}</p>
              </div>
            ))}
          </div>

          <div className="overflow-hidden rounded-[36px] border border-[#E6D9C8] bg-white/75 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#EDE2D3] px-6 py-5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#8C7A6B]">Recommendation Board</p>
                <h3 className="mt-2 font-display text-2xl text-[#2B2119]">Instant Shortlist</h3>
              </div>
              <div className="rounded-full border border-[#E6D9C8] bg-[#F8F1E8] px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-[#7C4E2F]">
                {form.projectType}
              </div>
            </div>

            <div className="space-y-6 p-6">
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={saveBoard}
                  className="rounded-full border border-[#7C4E2F] px-4 py-2 text-[10px] font-bold uppercase tracking-[0.22em] text-[#7C4E2F]"
                >
                  {boardSaved ? 'Board Saved' : 'Save Board'}
                </button>
                <button
                  type="button"
                  onClick={downloadBoard}
                  disabled={!recommendedProducts.length}
                  className="rounded-full border border-[#E6D9C8] px-4 py-2 text-[10px] font-bold uppercase tracking-[0.22em] text-[#2B2119] disabled:opacity-40"
                >
                  Download Brief
                </button>
                <a
                  href="/wishlist"
                  className="rounded-full border border-[#E6D9C8] px-4 py-2 text-[10px] font-bold uppercase tracking-[0.22em] text-[#2B2119]"
                >
                  Open Wishlist
                </a>
              </div>

              <div className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-[28px] border border-[#EFE2D1] bg-[linear-gradient(135deg,#fff,#f6eee3)] p-5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#8C7A6B]">Board Notes</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {[form.projectType, form.budget, form.timeline || 'Flexible timeline'].map((item) => (
                      <span key={item} className="rounded-full bg-white px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-[#6B594A] shadow-sm">
                        {item}
                      </span>
                    ))}
                  </div>
                  <p className="mt-5 text-sm leading-7 text-[#6B594A]">
                    {form.message || 'Add room notes, references, and constraints to make this recommendation board feel even more tailored.'}
                  </p>
                </div>

                <div className="rounded-[28px] border border-[#EFE2D1] bg-[#2B2119] p-5 text-white shadow-[0_24px_60px_-45px_rgba(43,33,25,0.75)]">
                  <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-white/55">What You Will Receive</p>
                  <ul className="mt-4 space-y-3 text-sm leading-relaxed text-white/82">
                    <li>A studio-refined shortlist matched to your room type</li>
                    <li>Material and price guidance shaped around your brief</li>
                    <li>Follow-up recommendations from the Timberbell team</li>
                  </ul>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {recommendedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {!recommendedProducts.length ? (
                <div className="rounded-3xl border border-dashed border-[#E6D9C8] bg-white/80 p-6 text-sm text-[#6B594A]">
                  Adjust the room type or budget range to generate a stronger shortlist.
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 rounded-[44px] border border-[#E6D9C8] bg-white p-8 shadow-[0_30px_90px_-65px_rgba(55,32,15,0.5)]">
          <div className="rounded-[28px] border border-[#EFE2D1] bg-[linear-gradient(180deg,#fffdf9,#f7efe4)] p-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#8C7A6B]">Studio Brief</p>
            <p className="mt-3 text-sm leading-relaxed text-[#6B594A]">
              Submit your details and the Timberbell team will refine the board with more precise suggestions.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <input placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-full border border-[#E6D9C8] px-5 py-3 text-sm focus:outline-none" required />
            <input type="email" placeholder="Email address" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="rounded-full border border-[#E6D9C8] px-5 py-3 text-sm focus:outline-none" required />
            <input placeholder="City / region" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="rounded-full border border-[#E6D9C8] px-5 py-3 text-sm focus:outline-none" />
            <select value={form.projectType} onChange={(e) => setForm({ ...form, projectType: e.target.value })} className="rounded-full border border-[#E6D9C8] px-5 py-3 text-sm focus:outline-none">
              <option value="living room">Living room</option>
              <option value="bedroom">Bedroom</option>
              <option value="dining room">Dining room</option>
              <option value="entryway">Entryway</option>
            </select>
            <select value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} className="rounded-full border border-[#E6D9C8] px-5 py-3 text-sm focus:outline-none">
              <option value="entry">Entry budget</option>
              <option value="mid-range">Mid-range</option>
              <option value="premium">Premium</option>
            </select>
            <input placeholder="Desired timeline" value={form.timeline} onChange={(e) => setForm({ ...form, timeline: e.target.value })} className="rounded-full border border-[#E6D9C8] px-5 py-3 text-sm focus:outline-none" />
          </div>

          <textarea placeholder="Describe your room, style references, materials you like, constraints, or pieces you already own." value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="h-40 w-full rounded-[28px] border border-[#E6D9C8] px-5 py-4 text-sm focus:outline-none" required />
          {status ? <p className="text-sm text-[#6B594A]">{status}</p> : null}
          <button disabled={submitting} className="w-full rounded-full bg-[#2B2119] py-4 text-[10px] font-bold uppercase tracking-[0.38em] text-white disabled:opacity-60">
            {submitting ? 'Sending...' : 'Request Room Guidance'}
          </button>
        </form>
      </div>
    </div>
  )
}
