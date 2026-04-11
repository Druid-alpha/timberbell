import SectionHeading from '@/app/_components/SectionHeading'

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-12 px-6 py-16">
      <SectionHeading
        eyebrow="Contact"
        title="Connect with the Timberbell studio"
        description="Book a consultation, request swatches, or plan a delivery with our concierge team."
      />
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <form className="space-y-6 rounded-3xl border border-white/70 bg-white/70 p-6">
          <input
            placeholder="Full name"
            className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm"
          />
          <input
            placeholder="Email address"
            className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm"
          />
          <input
            placeholder="Project location"
            className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm"
          />
          <textarea
            placeholder="Tell us about your space"
            className="h-32 w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm"
          />
          <button
            type="button"
            className="w-full rounded-full bg-neutral-900 px-5 py-3 text-sm font-semibold text-white"
          >
            Send message
          </button>
        </form>
        <div className="space-y-6 rounded-3xl border border-white/70 bg-white/80 p-6 text-sm text-neutral-600">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-neutral-500">Studio</div>
            <p className="mt-2">416 Cedar Street, Seattle, WA</p>
          </div>
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-neutral-500">Email</div>
            <p className="mt-2">hello@timberbell.com</p>
          </div>
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-neutral-500">Phone</div>
            <p className="mt-2">+1 (206) 555-0139</p>
          </div>
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-neutral-500">Showroom hours</div>
            <p className="mt-2">Mon-Sat, 10am-6pm</p>
          </div>
        </div>
      </div>
    </div>
  )
}

