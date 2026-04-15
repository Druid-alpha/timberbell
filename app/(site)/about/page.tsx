import SectionHeading from '@/app/_components/SectionHeading'
import Breadcrumb from '@/app/_components/Breadcrumb'

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-12 px-6 py-16">
      <div className="flex flex-col gap-6">
        <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'About' }]} />
        <SectionHeading
          eyebrow="About"
          title="Our craft begins with quiet rituals"
          description="Timberbell is a furniture atelier blending Pacific Northwest craftsmanship with calm, modern design."
        />
      </div>
      <div className="grid gap-6 rounded-[2.5rem] border border-white/70 bg-white/70 p-8 sm:grid-cols-2">
        <div className="space-y-4 text-sm text-neutral-600">
          <p>
            We partner with small workshops to build pieces in small batches, emphasizing natural
            materials, thoughtful joinery, and long-lasting comfort.
          </p>
          <p>
            Every Timberbell order is reviewed by our design concierge, ensuring the dimensions,
            finishes, and delivery details align with your space.
          </p>
        </div>
        <div className="space-y-4 text-sm text-neutral-600">
          <p>
            Sustainability is woven into our process. We prioritize FSC-certified woods, low-VOC
            finishes, and recyclable packaging to minimize our footprint.
          </p>
          <p>
            We design for longevity. Every piece includes a care kit and a promise of continued
            support for future refinishing or reupholstery needs.
          </p>
        </div>
      </div>
      <div className="grid gap-6 sm:grid-cols-3">
        {[
          {
            title: 'Workshops',
            detail: '6 artisan studios across the West Coast.',
          },
          {
            title: 'Materials',
            detail: 'Sustainably sourced hardwoods and natural fabrics.',
          },
          {
            title: 'Support',
            detail: 'Lifetime care guidance and refinishing options.',
          },
        ].map((item) => (
          <div key={item.title} className="rounded-3xl border border-white/70 bg-white/70 p-6">
            <div className="text-xs uppercase tracking-[0.3em] text-neutral-500">
              {item.title}
            </div>
            <p className="mt-3 text-sm text-neutral-700">{item.detail}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

