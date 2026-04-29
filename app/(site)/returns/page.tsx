'use client'

import SectionHeading from '@/app/_components/SectionHeading'
import Breadcrumb from '@/app/_components/Breadcrumb'

export default function ReturnsPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-12 px-4 py-10 sm:px-6 sm:py-16">
      <div className="flex flex-col gap-4">
        <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Returns & Exchanges' }]} />
        <SectionHeading
          eyebrow="Guarantee"
          title="Heirlooms are forever"
          description="We stand behind every joint, finish, and material. If it's not perfect, we'll make it right."
        />
      </div>

      <div className="space-y-12 text-[#6B594A]">
        <section className="space-y-4">
          <h2 className="font-display text-2xl text-[#2B2119]">30-Day Curated Window</h2>
          <p className="leading-relaxed">
            If a piece doesn't sit quite right in your space, you may return it within 30 days of delivery. 
            Because we build to order, a 15% restocking fee applies to large furniture items.
          </p>
        </section>

        <section className="rounded-[40px] border border-[#E6D9C8] p-10 bg-[#F4EEE4]/30 space-y-6">
          <h2 className="font-display text-2xl text-[#2B2119]">How to initiate</h2>
          <div className="grid gap-6 sm:grid-cols-3 text-center">
            <div className="space-y-2">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#7C4E2F] text-white font-bold">1</div>
              <p className="text-xs uppercase tracking-widest font-bold text-[#2B2119]">Email Us</p>
              <p className="text-[10px]">hello@timberbell.com</p>
            </div>
            <div className="space-y-2">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#7C4E2F] text-white font-bold">2</div>
              <p className="text-xs uppercase tracking-widest font-bold text-[#2B2119]">Scheduling</p>
              <p className="text-[10px]">We pick it up</p>
            </div>
            <div className="space-y-2">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#7C4E2F] text-white font-bold">3</div>
              <p className="text-xs uppercase tracking-widest font-bold text-[#2B2119]">Refund</p>
              <p className="text-[10px]">Within 5-7 days</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
