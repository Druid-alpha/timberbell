'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

const links = [
  { href: '/admin', label: 'Overview', icon: 'M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z' },
  { href: '/admin/products', label: 'Catalog', icon: 'M20 7h-4V4c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v3H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zM10 4h4v3h-4V4zm10 16H4V9h16v11z' },
  { href: '/admin/orders', label: 'Fulfillment', icon: 'M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm7 16H5V5h2v3h10V5h2v14z' },
  { href: '/admin/refunds', label: 'Refunds', icon: 'M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm1 17.93V20h-2v-.07A8.001 8.001 0 0 1 4.07 13H4v-2h.07A8.001 8.001 0 0 1 11 4.07V4h2v.07A8.001 8.001 0 0 1 19.93 11H20v2h-.07A8.001 8.001 0 0 1 13 19.93ZM15.59 8 10 13.59 8.41 12 7 13.41 10 16.41 17 9.41 15.59 8Z' },
  { href: '/admin/users', label: 'Curators', icon: 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z' },
  { href: '/admin/reviews', label: 'Community', icon: 'M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z' },
  { href: '/admin/analytics', label: 'Vault', icon: 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z' },
]

export default function DiamondSidebar({
  open = false,
  onClose,
}: {
  open?: boolean
  onClose?: () => void
}) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' }).catch(() => null)
    onClose?.()
    router.push('/admin/login')
  }

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition lg:hidden ${
          open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />
      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-72 max-w-[85vw] flex-col border-r border-white/5 bg-[#1A1A1A] p-6 text-white shadow-2xl transition-transform duration-300 lg:w-64 lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="mb-10 px-2 pt-4">
          <p className="text-[10px] uppercase tracking-[0.4em] text-[#C5A070]/60">Atelier Admin</p>
          <h2 className="mt-1 font-display text-xl text-[#F4EEE4]">Diamond Panel</h2>
        </div>

        <nav className="flex-1 space-y-1.5">
          {links.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                className={`group flex items-center gap-4 rounded-xl px-4 py-3.5 text-[11px] font-bold uppercase tracking-[0.2em] transition-all ${
                  isActive
                    ? 'bg-[#C5A070] text-[#1A1A1A] shadow-lg shadow-[#C5A070]/20'
                    : 'text-[#8C8C8C] hover:bg-white/5 hover:text-white'
                }`}
              >
                <svg
                  className={`h-4 w-4 fill-current transition-colors ${isActive ? 'text-[#1A1A1A]' : 'text-[#C5A070]'}`}
                  viewBox="0 0 24 24"
                >
                  <path d={link.icon} />
                </svg>
                <span>{link.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="active-pill"
                    className="ml-auto h-1 w-1 rounded-full bg-[#1A1A1A]"
                  />
                )}
              </Link>
            )
          })}
        </nav>

        <div className="mt-auto space-y-4 border-t border-white/5 pt-6">
          <Link
            href="/"
            onClick={onClose}
            className="flex items-center gap-3 px-4 text-[10px] uppercase tracking-widest text-[#8C8C8C] transition-colors hover:text-[#C5A070]"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            View Studio
          </Link>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl bg-red-900/10 px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-red-500 transition-all hover:bg-red-900/20"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Exit Panel
          </button>
        </div>
      </aside>
    </>
  )
}
