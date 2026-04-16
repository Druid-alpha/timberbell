'use client'

import { usePathname } from 'next/navigation'

export default function AdminTopbar() {
  const pathname = usePathname()
  const segments = pathname.split('/').filter(Boolean).slice(1)

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#C5A070]/10 text-xl shadow-inner">
           🏛️
        </div>
        <div>
          <nav className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-bold text-[#8C7A6B]">
            <span>Admin</span>
            {segments.map((seg, i) => (
              <span key={i} className="flex items-center gap-2">
                <span className="opacity-30">/</span>
                <span className={i === segments.length - 1 ? 'text-[#7C4E2F]' : ''}>{seg}</span>
              </span>
            ))}
          </nav>
          <div className="mt-1 flex items-center gap-3">
             <h1 className="font-display text-2xl text-[#2B2119]">Timberbell Atelier</h1>
             <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
             <span className="text-[9px] uppercase tracking-widest text-green-700 font-bold">Live Pulse</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
         <button className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E6D9C8] transition hover:bg-white">
            <svg className="h-4 w-4 text-[#8C7A6B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
         </button>
         <div className="h-10 w-10 rounded-full bg-[#E6D9C8] p-0.5 shadow-md">
            <div className="h-full w-full rounded-full bg-white flex items-center justify-center text-[10px] font-bold text-[#7C4E2F]">AD</div>
         </div>
      </div>
    </div>
  )
}

