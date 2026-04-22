'use client'

export default function AdminTopbar({ onMenuToggle }: { onMenuToggle: () => void }) {
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
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-xl text-[#2B2119] sm:text-2xl">Timberbell Admin</h1>
            <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
            <span className="text-[9px] font-bold uppercase tracking-widest text-green-700">Live</span>
          </div>
          <p className="mt-1 text-xs text-[#8C7A6B]">Orders, refunds, customers, and catalog in one calm workspace.</p>
        </div>
      </div>
    </div>
  )
}
