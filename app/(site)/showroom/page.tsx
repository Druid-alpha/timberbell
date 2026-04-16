'use client'

import SectionHeading from '@/app/_components/SectionHeading'
import Breadcrumb from '@/app/_components/Breadcrumb'
import { motion } from 'framer-motion'

export default function ShowroomPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-24 px-6 py-16">
      <div className="flex flex-col gap-6">
        <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Showroom' }]} />
        <SectionHeading
          eyebrow="The Atelier"
          title="Visit our physical sanctuary"
          description="Experience the texture of raw oak and the weight of artisan craftsmanship in person."
        />
      </div>

      <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
        <div className="aspect-[4/3] overflow-hidden rounded-[48px] bg-[#F4EEE4] border border-[#E6D9C8]">
          <img src="/hero-room.svg" alt="Showroom" className="h-full w-full object-cover" />
        </div>
        <div className="space-y-8">
          <div className="space-y-4">
            <h2 className="font-display text-3xl text-[#2B2119]">Private Appointments</h2>
            <p className="text-sm leading-relaxed text-[#6B594A]">
              We offer personalized 1-on-1 consultations with our senior curators. 
              During your visit, you'll have full access to our material library and 
              bespoke finishing samples.
            </p>
          </div>
          <div className="grid gap-4">
            <div className="rounded-3xl border border-[#E6D9C8] bg-white p-6 shadow-sm">
                <p className="text-[10px] uppercase tracking-widest font-bold text-[#8C7A6B] mb-2">Location</p>
                <p className="text-sm text-[#2B2119]">1245 Timberbell St, Design District, Lagos</p>
            </div>
            <div className="rounded-3xl border border-[#E6D9C8] bg-white p-6 shadow-sm">
                <p className="text-[10px] uppercase tracking-widest font-bold text-[#8C7A6B] mb-2">Hours</p>
                <p className="text-sm text-[#2B2119]">Mon - Sat: 10am - 7pm</p>
            </div>
          </div>
          <button className="w-full rounded-full bg-[#7C4E2F] py-4 text-[10px] font-bold uppercase tracking-[0.4em] text-white shadow-lg transition hover:bg-[#5C3A24]">
            Book a consultation
          </button>
        </div>
      </div>
    </div>
  )
}
