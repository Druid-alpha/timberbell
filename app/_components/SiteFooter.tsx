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
    <footer className="border-t border-[#E6D9C8] bg-[#2B2119] text-[#E6D9C8]">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 lg:grid-cols-[1.3fr_2fr]">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <img src="/brand.svg" alt="Timberbell" className="h-10 w-auto invert filter" />
            <div>
              <div className="text-lg font-semibold tracking-[0.25em] uppercase text-white">Timberbell</div>
              <div className="text-[10px] uppercase tracking-[0.45em] text-[#CBB9A2]">Atelier</div>
            </div>
          </div>
          <p className="text-sm text-[#E6D9C8]">
            Crafting heirloom pieces for modern rituals. Designed in the Pacific Northwest and
            delivered with white glove care.
          </p>
          <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-[#CBB9A2]">
            <span>hello@timberbell.com</span>
            <span>+1 (206) 555-0139</span>
          </div>
        </div>
        <div className="grid gap-8 sm:grid-cols-3">
          {footerLinks.map((group) => (
            <div key={group.title} className="space-y-3 text-sm">
              <div className="text-[10px] uppercase tracking-[0.3em] text-[#CBB9A2]">
                {group.title}
              </div>
              <div className="flex flex-col gap-2 text-[#E6D9C8]">
                {group.links.map((link) => (
                  <Link key={link.label} href={link.href} className="hover:text-white">
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-[10px] text-[#CBB9A2] uppercase tracking-[0.3em]">
        (c) 2026 Timberbell Atelier. All rights reserved.
      </div>
    </footer>
  )
}
