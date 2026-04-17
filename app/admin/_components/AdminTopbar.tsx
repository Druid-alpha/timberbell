'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

export default function AdminTopbar({ onMenuToggle }: { onMenuToggle: () => void }) {
  const pathname = usePathname()
  const router = useRouter()
  const segments = pathname.split('/').filter(Boolean).slice(1)

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-4 sm:items-center sm:gap-6">
        <button
          type="button"
          onClick={onMenuToggle}
          className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[#E6D9C8] bg-white text-[#2B2119] shadow-sm lg:hidden"
          aria-label="Toggle admin navigation"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#C5A070]/10 text-[11px] font-bold uppercase tracking-[0.2em] text-[#7C4E2F] shadow-inner">
          TB
        </div>
        <div>
          <nav className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#8C7A6B]">
            <span>Admin</span>
            {segments.map((seg, i) => (
              <span key={i} className="flex items-center gap-2">
                <span className="opacity-30">/</span>
                <span className={i === segments.length - 1 ? 'text-[#7C4E2F]' : ''}>{seg}</span>
              </span>
            ))}
          </nav>
          <div className="mt-1 flex flex-wrap items-center gap-3">
            <h1 className="font-display text-xl text-[#2B2119] sm:text-2xl">Timberbell Atelier</h1>
            <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
            <span className="text-[9px] font-bold uppercase tracking-widest text-green-700">Live Pulse</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 self-end sm:self-auto">
        <button
          type="button"
          onClick={() => {
            router.refresh()
            router.replace(pathname)
          }}
          title="Refresh admin data"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E6D9C8] transition hover:bg-white"
        >
          <svg className="h-4 w-4 text-[#8C7A6B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </button>
        <Link href="/admin/users" title="Open admin users" className="block h-10 w-10 rounded-full bg-[#E6D9C8] p-0.5 shadow-md">
          <div className="flex h-full w-full items-center justify-center rounded-full bg-white text-[10px] font-bold text-[#7C4E2F]">AD</div>
        </Link>
      </div>
    </div>
  )
}
