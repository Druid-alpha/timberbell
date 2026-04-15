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
          title="White glove delivery"
          description="Every piece of Timberbell furniture is delivered with the same care it was built with."
        />
      </div>

      <div className="space-y-12 text-[#6B594A]">
        <section className="space-y-4">
          <h2 className="font-display text-2xl text-[#2B2119]">White Glove Service</h2>
          <p className="leading-relaxed">
            Our white glove delivery service is standard for all large furniture items. This includes 
            placement in your room of choice, assembly, and removal of all packaging materials.
          </p>
        </section>

        <section className="grid gap-8 sm:grid-cols-2">
          <div className="rounded-3xl border border-[#E6D9C8] bg-[#F4EEE4] p-8">
            <h3 className="font-bold uppercase tracking-widest text-[#2B2119] text-[10px] mb-3">Pacific Northwest</h3>
            <p className="text-sm">2-3 weeks from completion</p>
            <p className="mt-2 text-xs opacity-80">Complimentary for orders over $2,500</p>
          </div>
          <div className="rounded-3xl border border-[#E6D9C8] bg-[#F4EEE4] p-8">
            <h3 className="font-bold uppercase tracking-widest text-[#2B2119] text-[10px] mb-3">Continental US</h3>
            <p className="text-sm">4-6 weeks from completion</p>
            <p className="mt-2 text-xs opacity-80">Flat rate based on region</p>
          </div>
        </section>

        <section className="rounded-[40px] border border-[#E6D9C8] p-10 space-y-4">
          <h2 className="font-display text-2xl text-[#2B2119]">Preparation</h2>
          <p className="leading-relaxed">
            Before delivery, please ensure the pathway to the final destination is clear and that 
            the space is roughly ready for your new piece. Our team will handle the rest.
          </p>
        </section>
      </div>
    </div>
  )
}
