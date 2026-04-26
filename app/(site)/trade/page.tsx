'use client'

import { useState } from 'react'
import SectionHeading from '@/app/_components/SectionHeading'
import Breadcrumb from '@/app/_components/Breadcrumb'

export default function TradeProgramPage() {
  const benefits = [
    { title: 'Exclusive Pricing', detail: 'Artisan rates for architects, designers, and developers.' },
    { title: 'Dedicated Concierge', detail: 'A single point of contact for your project specifications and logistics.' },
    { title: 'Early Access', detail: 'Priority reservations for limited drop collections and material prototypes.' },
  ]

  const [form, setForm] = useState({
    name: '',
    email: '',
    location: '',
    projectType: '',
    budget: '',
    timeline: '',
    message: '',
  })
  const [status, setStatus] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    setStatus('')

    const res = await fetch('/api/studio-intake', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        type: 'trade',
      }),
    })

    const data = await res.json().catch(() => ({}))
    setStatus(data.message || (res.ok ? 'Trade application received.' : 'Unable to send application right now.'))
    if (res.ok) {
      setForm({
        name: '',
        email: '',
        location: '',
        projectType: '',
        budget: '',
        timeline: '',
        message: '',
      })
    }
    setSubmitting(false)
  }

  return (
    <div className="mx-auto max-w-6xl space-y-20 px-6 py-16">
      <div className="flex flex-col gap-6">
        <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Trade Program' }]} />
        <SectionHeading
          eyebrow="B2B & Partners"
          title="Designed for Industry"
          description="We partner with architects, designers, hospitality teams, and developers furnishing thoughtful commercial and residential spaces."
        />
      </div>

      <div className="grid gap-8 sm:grid-cols-3">
        {benefits.map((b) => (
          <div key={b.title} className="rounded-3xl border border-[#E6D9C8] bg-white p-8 shadow-sm">
            <h3 className="font-display text-xl text-[#2B2119]">{b.title}</h3>
            <p className="mt-4 text-xs leading-relaxed text-[#6B594A]">{b.detail}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
        <div className="space-y-6 rounded-[40px] border border-[#E6D9C8] bg-[linear-gradient(180deg,#f8f1e8,#ffffff)] p-8 shadow-sm">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-[#8C7A6B]">Project Scale</p>
            <h2 className="mt-3 font-display text-4xl text-[#2B2119]">Commercial capacity, studio-level detail</h2>
          </div>
          <p className="text-sm leading-relaxed text-[#6B594A]">
            From boutique hotels in Abuja to modern workspaces in Lagos, Timberbell supports specification, procurement, and custom furnishing with a more personal process.
          </p>
          <div className="aspect-[4/5] overflow-hidden rounded-[32px] border border-[#E6D9C8] bg-[#F4EEE4]">
            <img src="/lifestyle-2.svg" alt="Trade program" className="h-full w-full object-cover" />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 rounded-[40px] border border-[#E6D9C8] bg-[#F4EEE4] p-8 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-2">
            <input placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-full border border-[#E6D9C8] bg-white px-5 py-3 text-sm focus:outline-none" required />
            <input type="email" placeholder="Email address" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="rounded-full border border-[#E6D9C8] bg-white px-5 py-3 text-sm focus:outline-none" required />
            <input placeholder="City / region" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="rounded-full border border-[#E6D9C8] bg-white px-5 py-3 text-sm focus:outline-none" />
            <input placeholder="Project type" value={form.projectType} onChange={(e) => setForm({ ...form, projectType: e.target.value })} className="rounded-full border border-[#E6D9C8] bg-white px-5 py-3 text-sm focus:outline-none" />
            <input placeholder="Estimated budget" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} className="rounded-full border border-[#E6D9C8] bg-white px-5 py-3 text-sm focus:outline-none" />
            <input placeholder="Timeline" value={form.timeline} onChange={(e) => setForm({ ...form, timeline: e.target.value })} className="rounded-full border border-[#E6D9C8] bg-white px-5 py-3 text-sm focus:outline-none" />
          </div>
          <textarea placeholder="Tell us about your project, quantities, design direction, or support needed." value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="h-36 w-full rounded-[28px] border border-[#E6D9C8] bg-white px-5 py-4 text-sm focus:outline-none" required />
          {status ? <p className="text-sm text-[#6B594A]">{status}</p> : null}
          <button disabled={submitting} className="w-full rounded-full bg-[#7C4E2F] py-4 text-[10px] font-bold uppercase tracking-[0.4em] text-white disabled:opacity-60">
            {submitting ? 'Sending...' : 'Apply for Trade Access'}
          </button>
        </form>
      </div>
    </div>
  )
}
