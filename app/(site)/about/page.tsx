'use client'

import SectionHeading from '@/app/_components/SectionHeading'
import Breadcrumb from '@/app/_components/Breadcrumb'

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-24 px-6 py-16">
      <div className="flex flex-col gap-6">
        <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'About Us' }]} />
        <SectionHeading
          eyebrow="Our Story"
          title="Architectural furniture for modern rituals"
          description="Built for generations, with a focus on calm spaces, honest materials, and thoughtful craftsmanship."
        />
      </div>

      <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
        <div className="space-y-6 text-[#6B594A]">
          <h2 className="font-display text-3xl text-[#2B2119]">The Studio</h2>
          <p className="leading-relaxed">
            Timberbell began as a small woodworking studio dedicated to the idea that furniture 
            should be more than just functional — it should be a quiet companion to our daily rituals.
          </p>
          <p className="leading-relaxed">
            Every piece is designed with architectural precision and built using traditional 
            joinery techniques that have stood the test of time.
          </p>
        </div>
        <div className="aspect-[4/3] overflow-hidden rounded-[40px] bg-[#F4EEE4]">
          <img src="/hero-room.svg" alt="Studio" className="h-full w-full object-cover" />
        </div>
      </div>

      <div className="rounded-[48px] border border-[#E6D9C8] bg-[#2B2119] p-12 text-[#E6D9C8]">
        <div className="grid gap-12 md:grid-cols-3">
          <div className="space-y-4">
            <h3 className="text-[10px] uppercase tracking-[0.4em] text-white/50">Honest Materials</h3>
            <p className="text-sm">We use only sustainably sourced hardwoods and organic fabrics that patina beautifully over time.</p>
          </div>
          <div className="space-y-4">
            <h3 className="text-[10px] uppercase tracking-[0.4em] text-white/50">Modern Utility</h3>
            <p className="text-sm">Function is never sacrificed. Our pieces are designed for real life, with smart storage and ergonomic fit.</p>
          </div>
          <div className="space-y-4">
            <h3 className="text-[10px] uppercase tracking-[0.4em] text-white/50">Timeless Form</h3>
            <p className="text-sm">We avoid trends in favor of silhouettes that remain relevant decade after decade.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
