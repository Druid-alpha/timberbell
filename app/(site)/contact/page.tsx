'use client'

import { useState } from 'react'
import SectionHeading from '@/app/_components/SectionHeading'
import Breadcrumb from '@/app/_components/Breadcrumb'

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
    <div className="mx-auto max-w-5xl space-y-12 px-6 py-16">
      <div className="flex flex-col gap-6">
        <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Contact' }]} />
        <SectionHeading
          eyebrow="Contact"
          title="Connect with the Timberbell studio"
          description="Ask about deliveries, product guidance, complaints, or general support."
        />
      </div>
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl border border-white/70 bg-white/70 p-6">
          <input
            placeholder="Full name"
            className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <input
            type="email"
            placeholder="Email address"
            className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <input
            placeholder="State / city"
            className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
          />
          <textarea
            placeholder="Tell us what you need help with"
            className="h-32 w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm"
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            required
          />
          {status ? <p className="text-sm text-[#7C4E2F]">{status}</p> : null}
          <button
            type="submit"
            disabled={sending}
            className="w-full rounded-full bg-neutral-900 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {sending ? 'Sending...' : 'Send message'}
          </button>
        </form>
        <div className="space-y-6 rounded-3xl border border-white/70 bg-white/80 p-6 text-sm text-neutral-600">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-neutral-500">Studio</div>
            <p className="mt-2">Lagos, Nigeria</p>
          </div>
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-neutral-500">Email</div>
            <p className="mt-2">hello@timberbell.com</p>
          </div>
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-neutral-500">Support</div>
            <p className="mt-2">Use this form for product questions, delivery issues, and refund complaints.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
