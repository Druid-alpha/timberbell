'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/admin', label: 'Overview' },
  { href: '/admin/products', label: 'Products' },
  { href: '/admin/orders', label: 'Orders' },
  { href: '/admin/users', label: 'Users' },
  { href: '/admin/analytics', label: 'Analytics' },
]

export default function AdminNav() {
  const pathname = usePathname()

  return (
    <nav className="flex flex-wrap gap-2">
      {links.map((link) => {
        const isActive = pathname === link.href
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded-full px-4 py-2 text-[11px] uppercase tracking-[0.3em] transition ${
              isActive
                ? 'bg-[#7C4E2F] text-white'
                : 'border border-[#E6D9C8] bg-white/70 text-[#8C7A6B] hover:text-[#2B2119]'
            }`}
          >
            {link.label}
          </Link>
        )
      })}
    </nav>
  )
}

