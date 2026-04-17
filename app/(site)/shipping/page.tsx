'use client'

import SectionHeading from '@/app/_components/SectionHeading'
import Breadcrumb from '@/app/_components/Breadcrumb'

export default function ShippingPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-12 px-6 py-16">
      <div className="flex flex-col gap-6">
        <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Shipping & Delivery' }]} />
        <SectionHeading
          eyebrow="Logistics"
          title="Nigeria delivery logistics"
          description="Every piece of Timberbell furniture is delivered with the same care it was built with."
        />
      </div>

      <div className="space-y-12 text-[#6B594A]">
        <section className="space-y-4">
          <h2 className="font-display text-2xl text-[#2B2119]">Standard Delivery Service</h2>
          <p className="leading-relaxed">
            Our delivery service is built around secure transport, careful handling, and clear delivery coordination
            across Nigeria.
          </p>
        </section>

        <section className="grid gap-8 sm:grid-cols-2">
          <div className="rounded-3xl border border-[#E6D9C8] bg-[#F4EEE4] p-8">
            <h3 className="font-bold uppercase tracking-widest text-[#2B2119] text-[10px] mb-3">Lagos</h3>
            <p className="text-sm">3-5 business days from dispatch</p>
            <p className="mt-2 text-xs opacity-80">Fastest delivery window</p>
          </div>
          <div className="rounded-3xl border border-[#E6D9C8] bg-[#F4EEE4] p-8">
            <h3 className="font-bold uppercase tracking-widest text-[#2B2119] text-[10px] mb-3">Abuja / Port Harcourt</h3>
            <p className="text-sm">5-9 business days from dispatch</p>
            <p className="mt-2 text-xs opacity-80">Regional delivery pricing applies</p>
          </div>
        </section>

        <section className="rounded-[40px] border border-[#E6D9C8] p-10 space-y-4">
          <h2 className="font-display text-2xl text-[#2B2119]">Preparation</h2>
          <p className="leading-relaxed">
            Before delivery, please ensure the pathway to the final destination is clear and that 
            the space is roughly ready for your new piece. Our logistics team will coordinate the final handoff with you.
          </p>
        </section>
      </div>
    </div>
  )
}
