'use client'

import Link from 'next/link'
import Breadcrumb from '@/app/_components/Breadcrumb'
import SectionHeading from '@/app/_components/SectionHeading'

export default function ShowroomPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-16 px-4 py-10 sm:px-6 sm:py-16">
      <section className="overflow-hidden rounded-[40px] border border-[#E6D9C8] bg-[radial-gradient(circle_at_top_right,rgba(124,78,47,0.16),transparent_30%),linear-gradient(135deg,#fffdf9,#f4eee4)] px-6 py-8 shadow-[0_30px_90px_-65px_rgba(55,32,15,0.5)] sm:px-8 sm:py-10">
        <div className="flex flex-col gap-6">
          <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Showroom' }]} />
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <SectionHeading
              eyebrow="The Atelier"
              title="Visit our physical sanctuary"
              description="Experience the texture of raw oak and the weight of artisan craftsmanship in person."
            />
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { label: 'Format', value: 'Private' },
                { label: 'City', value: 'Lagos' },
                { label: 'Access', value: 'Guided' },
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

      <section className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-center">
        <div className="aspect-[4/3] overflow-hidden rounded-[40px] border border-[#E6D9C8] bg-[#F4EEE4] shadow-[0_24px_60px_-45px_rgba(55,32,15,0.45)]">
          <img src="/hero-room.svg" alt="Showroom" className="h-full w-full object-cover" />
        </div>
        <div className="space-y-8">
          <div className="space-y-4">
            <h2 className="font-display text-3xl text-[#2B2119]">Private Appointments</h2>
            <p className="text-sm leading-relaxed text-[#6B594A]">
              We offer personalized one-on-one consultations with senior curators. During your visit, you can review material samples,
              compare finishes, and speak through room direction in person.
            </p>
          </div>
          <div className="grid gap-4">
            <div className="rounded-3xl border border-[#E6D9C8] bg-white p-6 shadow-sm">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-[#8C7A6B]">Location</p>
              <p className="text-sm text-[#2B2119]">1245 Timberbell St, Design District, Lagos</p>
            </div>
            <div className="rounded-3xl border border-[#E6D9C8] bg-white p-6 shadow-sm">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-[#8C7A6B]">Hours</p>
              <p className="text-sm text-[#2B2119]">Mon - Sat: 10am - 7pm</p>
            </div>
            <div className="rounded-[28px] border border-[#E8DCCB] bg-[linear-gradient(180deg,#fffdf9,#f7efe4)] p-5 shadow-sm">
              <p className="text-[10px] uppercase tracking-[0.28em] text-[#8C7A6B]">Visit Experience</p>
              <p className="mt-3 text-sm leading-relaxed text-[#6B594A]">
                Bring room dimensions, finish questions, and inspiration references so the studio can guide you with more precision.
              </p>
            </div>
          </div>
          <Link
            href="/contact?topic=consultation"
            className="flex w-full items-center justify-center rounded-full bg-[#7C4E2F] py-4 text-[10px] font-bold uppercase tracking-[0.32em] text-white shadow-lg transition hover:bg-[#5C3A24]"
          >
            Book a consultation
          </Link>
        </div>
      </section>
    </div>
  )
}
