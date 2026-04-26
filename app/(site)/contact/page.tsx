'use client'

import { useState } from 'react'
import Breadcrumb from '@/app/_components/Breadcrumb'
import SectionHeading from '@/app/_components/SectionHeading'

export default function ContactPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    location: '',
    message: '',
  })
  const [status, setStatus] = useState('')
  const [sending, setSending] = useState(false)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setSending(true)
    setStatus('')

    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    const data = await res.json().catch(() => ({}))
    if (res.ok) {
      setStatus('Your message has been sent to the Timberbell team.')
      setForm({ name: '', email: '', location: '', message: '' })
    } else {
      setStatus(data.message || 'Unable to send your message right now.')
    }
    setSending(false)
  }

  return (
    <div className="mx-auto max-w-7xl space-y-10 px-4 py-12 sm:px-6 sm:py-16">
      <section className="overflow-hidden rounded-[40px] border border-[#E6D9C8] bg-[radial-gradient(circle_at_top_right,rgba(124,78,47,0.16),transparent_30%),linear-gradient(135deg,#fffdf9,#f4eee4)] px-6 py-8 shadow-[0_30px_90px_-65px_rgba(55,32,15,0.5)] sm:px-8 sm:py-10">
        <div className="flex flex-col gap-6">
          <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Contact' }]} />
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <SectionHeading
              eyebrow="Contact"
              title="Connect with the Timberbell studio"
              description="Ask about deliveries, product guidance, complaints, or general support."
            />
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { label: 'Studio', value: 'Lagos' },
                { label: 'Response', value: 'Guided' },
                { label: 'Support', value: 'Direct' },
              ].map((item) => (
                <div key={item.label} className="rounded-[24px] border border-[#E6D9C8] bg-white/80 px-4 py-5 shadow-sm">
                  <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#8C7A6B]">{item.label}</p>
                  <div className="mt-3 font-display text-2xl leading-tight text-[#2B2119]">{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <form onSubmit={handleSubmit} className="space-y-6 rounded-[36px] border border-[#E6D9C8] bg-[linear-gradient(180deg,#f8f1e8,#fffdfa)] p-6 shadow-[0_24px_60px_-48px_rgba(55,32,15,0.45)]">
          <div className="rounded-[24px] border border-[#E8DCCB] bg-white/80 p-5">
            <p className="text-[10px] uppercase tracking-[0.28em] text-[#8C7A6B]">Studio Brief</p>
            <p className="mt-3 text-sm leading-relaxed text-[#6B594A]">
              Share your request and the Timberbell team will respond with delivery help, product guidance, or next steps.
            </p>
          </div>
          <input
            placeholder="Full name"
            className="w-full rounded-2xl border border-[#E6D9C8] bg-white px-4 py-3 text-sm"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <input
            type="email"
            placeholder="Email address"
            className="w-full rounded-2xl border border-[#E6D9C8] bg-white px-4 py-3 text-sm"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <input
            placeholder="State / city"
            className="w-full rounded-2xl border border-[#E6D9C8] bg-white px-4 py-3 text-sm"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
          />
          <textarea
            placeholder="Tell us what you need help with"
            className="h-36 w-full rounded-[24px] border border-[#E6D9C8] bg-white px-4 py-3 text-sm"
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            required
          />
          {status ? <p className="text-sm text-[#7C4E2F]">{status}</p> : null}
          <button
            type="submit"
            disabled={sending}
            className="w-full rounded-full bg-[#2B2119] px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.28em] text-white disabled:opacity-60"
          >
            {sending ? 'Sending...' : 'Send message'}
          </button>
        </form>
        <div className="space-y-6 rounded-[36px] border border-[#E6D9C8] bg-white/80 p-6 text-sm text-[#6B594A] shadow-sm">
          <div className="rounded-[24px] border border-[#E8DCCB] bg-[linear-gradient(180deg,#fffdf9,#f7efe4)] p-5">
            <p className="text-[10px] uppercase tracking-[0.28em] text-[#8C7A6B]">Contact Routes</p>
            <p className="mt-3 leading-relaxed">Use this page for product questions, delivery issues, refund complaints, or general support requests.</p>
          </div>
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-[#8C7A6B]">Studio</div>
            <p className="mt-2 text-[#2B2119]">Lagos, Nigeria</p>
          </div>
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-[#8C7A6B]">Email</div>
            <p className="mt-2 text-[#2B2119]">hello@timberbell.com</p>
          </div>
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-[#8C7A6B]">Studio Promise</div>
            <p className="mt-2">We aim to answer with clarity, product context, and the right next action instead of generic support copy.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
