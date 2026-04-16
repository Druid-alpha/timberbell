'use client'

import SectionHeading from '@/app/_components/SectionHeading'
import Breadcrumb from '@/app/_components/Breadcrumb'

export default function TradeProgramPage() {
  const benefits = [
    { title: 'Exclusive Pricing', detail: 'Artisan rates for architects, designers, and developers.' },
    { title: 'Dedicated Concierge', detail: 'A single point of contact for your project specifications and logistics.' },
    { title: 'Early Access', detail: 'Priority reservations for limited drop collections and material prototypes.' },
  ]

  return (
    <div className="mx-auto max-w-5xl space-y-24 px-6 py-16">
      <div className="flex flex-col gap-6">
        <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Trade Program' }]} />
        <SectionHeading
          eyebrow="B2B & Partners"
          title="Designed for Industry"
          description="We partner with the world's leading architects and designers to furnish thoughtful commercial and residential spaces."
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

      <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
         <div className="space-y-6">
            <h2 className="font-display text-4xl text-[#2B2119]">Commercial Scale</h2>
            <p className="text-sm leading-relaxed text-[#6B594A]">
                From boutique hotels in Abuja to modern workspaces in Lagos, our production line is equipped 
                for bulk orders without sacrificing the artisan touch. 
            </p>
            <div className="flex flex-col gap-3">
                <input placeholder="Project Name" className="rounded-full border border-[#E6D9C8] bg-white px-6 py-3 text-sm focus:outline-none" />
                <input placeholder="Email Address" className="rounded-full border border-[#E6D9C8] bg-white px-6 py-3 text-sm focus:outline-none" />
                <button className="rounded-full bg-[#7C4E2F] py-4 text-[10px] font-bold uppercase tracking-[0.4em] text-white">Apply for Trade Access</button>
            </div>
         </div>
         <div className="aspect-square rounded-[48px] overflow-hidden bg-[#F4EEE4]">
            <img src="/lifestyle-2.svg" alt="Trade" className="h-full w-full object-cover" />
         </div>
      </div>
    </div>
  )
}
