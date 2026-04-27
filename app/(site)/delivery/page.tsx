'use client'

import SectionHeading from '@/app/_components/SectionHeading'
import Breadcrumb from '@/app/_components/Breadcrumb'
import { DELIVERY_ZONES } from '@/lib/constants/shipping'

export default function DeliveryPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-24 px-6 py-16">
      <div className="flex flex-col gap-6">
        <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Delivery Zones' }]} />
        <SectionHeading
          eyebrow="Logistics"
          title="Pan-Nigerian White-Glove Care"
          description="Every Timberbell piece is transported with climate-controlled logistics to ensure the structural integrity of the wood."
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {DELIVERY_ZONES.map((zone) => (
          <div key={zone.id} className="rounded-[32px] border border-[#E6D9C8] bg-white p-8 shadow-sm transition-all hover:shadow-md">
            <h3 className="font-display text-xl text-[#2B2119]">{zone.label}</h3>
            <div className="mt-4 space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#7C4E2F]">Standard: {zone.standardEta}</p>
              <p className="text-xs text-[#8C7A6B]">Priority: {zone.priorityEta}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-[48px] border border-[#E6D9C8] bg-[#F4EEE4] p-12 lg:p-16">
        <div className="mx-auto max-w-3xl space-y-8">
          <h2 className="font-display text-4xl text-[#2B2119]">The Delivery Ritual</h2>
          <div className="space-y-6 text-sm leading-relaxed text-[#6B594A]">
            <p>
              Our delivery is the final stage of the artisan process.
              Our technicians assemble, place, and inspect your furniture in its new sanctuary.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <p className="font-bold text-[#2B2119]">Unpacking</p>
                <p className="text-xs">We remove all protective layering and recycle the remains.</p>
              </div>
              <div className="space-y-1">
                <p className="font-bold text-[#2B2119]">Placement</p>
                <p className="text-xs">Precise positioning guided by your aesthetic preference.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
