'use client'

import SectionHeading from '@/app/_components/SectionHeading'
import Breadcrumb from '@/app/_components/Breadcrumb'

export default function CareGuidePage() {
  const sections = [
    {
      title: 'Solid Hardwoods',
      detail: 'Our oak and walnut are finished with natural oils. Dust regularly with a dry micro-fiber cloth. For spills, use a slightly damp cloth and wipe dry immediately.',
    },
    {
      title: 'Organic Textiles',
      detail: 'Avoid direct sunlight to prevent fiber degradation. Vacuum regularly with a soft brush attachment. Professional cleaning recommended for deep stains.',
    },
    {
      title: 'Natural Stones',
      detail: 'Marble and travertine are porous. Use coasters for all liquids. Clean with pH-neutral stone cleaner only.',
    },
  ]

  return (
    <div className="mx-auto max-w-5xl space-y-20 px-4 py-10 sm:px-6 sm:py-16">
      <div className="flex flex-col gap-4">
        <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Care Guide' }]} />
        <SectionHeading
          eyebrow="Preservation"
          title="Heirlooms require care"
          description="Timberbell pieces are designed to patina with time, telling the story of your home through their grain and texture."
        />
      </div>

      <div className="grid gap-12 lg:grid-cols-3">
        {sections.map((s) => (
          <div key={s.title} className="space-y-4">
            <h3 className="font-display text-2xl text-[#2B2119]">{s.title}</h3>
            <p className="text-sm leading-relaxed text-[#6B594A]">{s.detail}</p>
          </div>
        ))}
      </div>

      <div className="rounded-[48px] border border-[#E6D9C8] bg-[#2B2119] p-12 text-[#E6D9C8]">
         <div className="mx-auto max-w-2xl text-center space-y-6">
            <h2 className="font-display text-3xl text-white">The Long View</h2>
            <p className="text-sm italic opacity-80">
                "We don't build furniture for the next season; we build it for the next century. 
                Proper care ensures your piece remains a silent witness to generations."
            </p>
         </div>
      </div>
    </div>
  )
}
