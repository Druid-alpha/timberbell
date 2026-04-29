'use client'

import Breadcrumb from '@/app/_components/Breadcrumb'
import SectionHeading from '@/app/_components/SectionHeading'

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-16 px-4 py-10 sm:px-6 sm:py-16">
      <section className="overflow-hidden rounded-[40px] border border-[#E6D9C8] bg-[radial-gradient(circle_at_top_right,rgba(124,78,47,0.16),transparent_30%),linear-gradient(135deg,#fffdf9,#f4eee4)] px-6 py-8 shadow-[0_30px_90px_-65px_rgba(55,32,15,0.5)] sm:px-8 sm:py-10">
        <div className="flex flex-col gap-6">
          <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'About Us' }]} />
          <div className="grid gap-8 lg:grid-cols-[1fr] lg:items-end">
            <SectionHeading
              eyebrow="Our Story"
              title="Architectural furniture for modern rituals"
              description="Built for generations, with a focus on calm spaces, honest materials, and thoughtful craftsmanship."
            />
          </div>
        </div>
      </section>

      <section className="grid gap-10 lg:grid-cols-[1fr_1.05fr] lg:items-center">
        <div className="space-y-6 text-[#6B594A]">
          <h2 className="font-display text-3xl text-[#2B2119]">The Studio</h2>
          <p className="leading-relaxed">
            Timberbell began as a small woodworking studio dedicated to the idea that furniture should be more than just functional.
            It should be a quiet companion to our daily rituals.
          </p>
          <p className="leading-relaxed">
            Every piece is designed with architectural precision and built using traditional joinery techniques that have stood the test of time.
          </p>
          <div className="rounded-[28px] border border-[#E6D9C8] bg-[linear-gradient(180deg,#fffdf9,#f7efe4)] p-5 shadow-sm">
            <p className="text-[10px] uppercase tracking-[0.28em] text-[#8C7A6B]">Studio Note</p>
            <p className="mt-3 text-sm leading-relaxed">
              We design for rooms that need restraint, warmth, and a longer view than trend cycles allow.
            </p>
          </div>
        </div>
        <div className="aspect-[4/3] overflow-hidden rounded-[40px] border border-[#E6D9C8] bg-[#F4EEE4] shadow-[0_24px_60px_-45px_rgba(55,32,15,0.45)]">
          <img src="/hero-room.svg" alt="Studio" className="h-full w-full object-cover" />
        </div>
      </section>

      <section className="rounded-[48px] border border-[#E6D9C8] bg-[#2B2119] p-8 text-[#E6D9C8] shadow-[0_28px_80px_-60px_rgba(0,0,0,0.8)] sm:p-12">
        <div className="grid gap-12 md:grid-cols-3">
          <div className="space-y-4">
            <h3 className="text-[10px] uppercase tracking-[0.4em] text-white/50">Honest Materials</h3>
            <p className="text-sm leading-relaxed">We use sustainably sourced hardwoods and tactile fabrics that age with grace over time.</p>
          </div>
          <div className="space-y-4">
            <h3 className="text-[10px] uppercase tracking-[0.4em] text-white/50">Modern Utility</h3>
            <p className="text-sm leading-relaxed">Function is never sacrificed. Each piece is made for real rooms, real rituals, and long-term comfort.</p>
          </div>
          <div className="space-y-4">
            <h3 className="text-[10px] uppercase tracking-[0.4em] text-white/50">Timeless Form</h3>
            <p className="text-sm leading-relaxed">We avoid trend cycles in favor of silhouettes that remain relevant year after year.</p>
          </div>
        </div>
      </section>
    </div>
  )
}
