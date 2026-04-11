import Link from 'next/link'

const navLinks = [
  { href: '/shop', label: 'Shop' },
  { href: '/collections/living', label: 'Living' },
  { href: '/collections/dining', label: 'Dining' },
  { href: '/login', label: 'Login' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
]

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-white/40 bg-white/70 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-neutral-900 text-white flex items-center justify-center text-xs font-semibold">
            TB
          </div>
          <div>
            <div className="text-lg font-semibold text-neutral-900">
              Timberbell
            </div>
            <div className="text-xs uppercase tracking-[0.4em] text-neutral-500">
              Atelier
            </div>
          </div>
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-neutral-600 lg:flex">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="transition hover:text-neutral-900">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href="/register"
            className="hidden rounded-full border border-neutral-900 px-4 py-2 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-900 hover:text-white sm:inline-flex"
          >
            Create account
          </Link>
          <Link
            href="/cart"
            className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-neutral-800"
          >
            Cart
            <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs">0</span>
          </Link>
        </div>
      </div>
      <div className="flex gap-4 overflow-x-auto px-6 pb-3 text-xs uppercase tracking-[0.3em] text-neutral-500 lg:hidden">
        {navLinks.map((link) => (
          <Link key={link.href} href={link.href} className="whitespace-nowrap">
            {link.label}
          </Link>
        ))}
      </div>
    </header>
  )
}

