'use client'

import SectionHeading from '@/app/_components/SectionHeading'
import Breadcrumb from '@/app/_components/Breadcrumb'
import { motion } from 'framer-motion'

export default function VirtualTourPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-24 px-6 py-16">
      <div className="flex flex-col gap-6">
        <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Virtual Tour' }]} />
        <SectionHeading
          eyebrow="Immersive Experience"
          title="The Atelier, from home"
          description="A spatial digital showcase of our core collections in architectural contexts."
        />
      </div>

      <div className="relative h-[600px] overflow-hidden rounded-[48px] border border-[#E6D9C8] bg-[#2B2119]">
        <img src="/lifestyle-1.svg" alt="Tour" className="h-full w-full object-cover opacity-60" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-12">
            <div className="h-20 w-20 flex items-center justify-center rounded-full bg-white/10 border border-white/20 backdrop-blur-md cursor-pointer hover:scale-110 transition-transform">
                <div className="h-0 w-0 border-t-[10px] border-t-transparent border-l-[15px] border-l-white border-b-[10px] border-b-transparent ml-1" />
            </div>
            <p className="mt-6 text-[10px] uppercase tracking-[0.4em] text-white/50">Coming Soon</p>
            <h3 className="mt-2 font-display text-4xl text-white">Spatial Rendering v1.0</h3>
        </div>
      </div>
    </div>
  )
}
