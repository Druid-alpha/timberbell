'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

const baseLinks = [
  { href: '/productfilter', label: 'Shop' },
  { href: '/collections/living', label: 'Living' },
  { href: '/collections/dining', label: 'Dining' },
  { href: '/wishlist', label: 'Wishlist' },
  { href: '/login', label: 'Login' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
]

export default function SiteHeader() {
  const [open, setOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    let active = true
    async function checkAdmin() {
      const res = await fetch('/api/admin')
      if (!active) return
      setIsAdmin(res.ok)
    }
    checkAdmin()
    return () => {
      active = false
    }
  }, [])

  const navLinks = isAdmin ? [...baseLinks, { href: '/admin', label: 'Admin' }] : baseLinks

  return (
    <header className="sticky top-0 z-20 border-b border-[#E6D9C8] bg-[#F4EEE4]/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <img src="/brand.svg" alt="Timberbell" className="h-10 w-auto" />
          <div className="leading-tight">
            <div className="text-lg font-semibold tracking-[0.2em] uppercase text-[#2A3320]">
              Timberbell
            </div>
            <div className="text-[10px] uppercase tracking-[0.45em] text-[#8B9A78]">
              Atelier
            </div>
          </div>
        </Link>
        <nav className="hidden items-center gap-6 text-[11px] uppercase tracking-[0.3em] text-[#8C7A6B] lg:flex">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="transition hover:text-[#2B2119]">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href="/register"
            className="hidden rounded-full border border-[#7C4E2F] px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#7C4E2F] transition hover:bg-[#7C4E2F] hover:text-white sm:inline-flex"
          >
            Create account
          </Link>
          <Link
            href="/cart"
            className="inline-flex items-center gap-2 rounded-full bg-[#7C4E2F] px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-[#6A3F24]"
          >
            Cart
            <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px]">0</span>
          </Link>
          <button
            type="button"
            aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
            onClick={() => setOpen((prev) => !prev)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#E6D9C8] text-[#2B2119] transition hover:bg-white/70 lg:hidden"
          >
            <span className="sr-only">Toggle menu</span>
            <span className="relative block h-4 w-5">
              <span
                className={`absolute left-0 top-0 h-0.5 w-full bg-current transition ${open ? 'translate-y-1.5 rotate-45' : ''}`}
              />
              <span
                className={`absolute left-0 top-1.5 h-0.5 w-full bg-current transition ${open ? 'opacity-0' : ''}`}
              />
              <span
                className={`absolute left-0 top-3 h-0.5 w-full bg-current transition ${open ? '-translate-y-1.5 -rotate-45' : ''}`}
              />
            </span>
          </button>
        </div>
      </div>
      <div className="lg:hidden">
        <div
          className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-80' : 'max-h-0'}`}
        >
          <div className="flex flex-col gap-4 border-t border-[#E6D9C8] bg-[#F4EEE4] px-6 py-4 text-[11px] uppercase tracking-[0.3em] text-[#8C7A6B]">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setOpen(false)}>
                {link.label}
              </Link>
            ))}
            <div className="flex flex-col gap-2 pt-2">
              <Link
                href="/register"
                onClick={() => setOpen(false)}
                className="inline-flex items-center justify-center rounded-full border border-[#7C4E2F] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#7C4E2F]"
              >
                Create account
              </Link>
              <Link
                href="/cart"
                onClick={() => setOpen(false)}
                className="inline-flex items-center justify-center rounded-full bg-[#7C4E2F] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-white"
              >
                View cart
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
