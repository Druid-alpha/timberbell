import Link from 'next/link'

const footerLinks = [
  {
    title: 'Showroom',
    links: [
      { label: 'Appointments', href: '/contact' },
      { label: 'Virtual tours', href: '/contact' },
      { label: 'Delivery zones', href: '/contact' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Care guide', href: '/about' },
      { label: 'Returns', href: '/about' },
      { label: 'Trade program', href: '/contact' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Timberbell', href: '/about' },
      { label: 'Journal', href: '/about' },
      { label: 'Careers', href: '/contact' },
    ],
  },
]

export default function SiteFooter() {
  return (
    <footer className="border-t border-white/60 bg-white/70">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 lg:grid-cols-[1.3fr_2fr]">
        <div className="space-y-4">
          <div className="text-xl font-semibold text-neutral-900">Timberbell Atelier</div>
          <p className="text-sm text-neutral-600">
            Crafting heirloom pieces for modern rituals. Designed in the Pacific Northwest and
            delivered with white glove care.
          </p>
          <div className="flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-neutral-500">
            <span>hello@timberbell.com</span>
            <span>+1 (206) 555-0139</span>
          </div>
        </div>
        <div className="grid gap-8 sm:grid-cols-3">
          {footerLinks.map((group) => (
            <div key={group.title} className="space-y-3 text-sm">
              <div className="text-xs uppercase tracking-[0.3em] text-neutral-500">
                {group.title}
              </div>
              <div className="flex flex-col gap-2 text-neutral-600">
                {group.links.map((link) => (
                  <Link key={link.label} href={link.href} className="hover:text-neutral-900">
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-white/70 py-4 text-center text-xs text-neutral-500">
        (c) 2026 Timberbell Atelier. All rights reserved.
      </div>
    </footer>
  )
}
