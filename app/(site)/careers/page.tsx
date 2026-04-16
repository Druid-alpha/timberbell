'use client'

import SectionHeading from '@/app/_components/SectionHeading'
import Breadcrumb from '@/app/_components/Breadcrumb'

export default function CareersPage() {
  const roles = [
    { title: 'Senior Woodworker', location: 'Lagos Workshop', type: 'Full-time' },
    { title: 'Finishing Specialist', location: 'Lagos Workshop', type: 'Full-time' },
    { title: 'Logistics Lead', location: 'Abuja Hub', type: 'Full-time' },
    { title: 'Client Curator', location: 'Remote / Lagos', type: 'Part-time' },
  ]

  return (
    <div className="mx-auto max-w-5xl space-y-24 px-6 py-16">
      <div className="flex flex-col gap-6">
        <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Careers' }]} />
        <SectionHeading
          eyebrow="Join the Atelier"
          title="Build for generations"
          description="We are a collective of artisans, designers, and logistical thinkers dedicated to the slow craft of modern living."
        />
      </div>

      <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
         <div className="aspect-[4/5] rounded-[48px] overflow-hidden bg-[#F4EEE4]">
            <img src="/hero-room.svg" alt="Workshop" className="h-full w-full object-cover" />
         </div>
         <div className="space-y-8">
            <h2 className="font-display text-4xl text-[#2B2119]">Open Roles</h2>
            <div className="divide-y divide-[#E6D9C8]">
                {roles.map((role) => (
                    <div key={role.title} className="group py-6 flex items-center justify-between cursor-pointer">
                        <div className="space-y-1">
                            <h3 className="font-bold text-[#2B2119] group-hover:text-[#7C4E2F] transition-colors">{role.title}</h3>
                            <p className="text-[10px] uppercase tracking-widest text-[#8C7A6B]">{role.location} &bull; {role.type}</p>
                        </div>
                        <div className="h-10 w-10 flex items-center justify-center rounded-full border border-[#E6D9C8] group-hover:bg-[#7C4E2F] group-hover:text-white transition-all">
                             &rarr;
                        </div>
                    </div>
                ))}
            </div>
         </div>
      </div>
    </div>
  )
}
