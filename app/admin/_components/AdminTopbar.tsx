'use client'

import { useRouter } from 'next/navigation'

export default function AdminTopbar() {
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' }).catch(() => null)
    router.push('/admin/login')
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-[#8C7A6B]">Admin</p>
        <h1 className="font-display text-3xl text-[#2B2119]">Timberbell Atelier</h1>
      </div>
      <button
        type="button"
        onClick={handleLogout}
        className="rounded-full border border-[#7C4E2F] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.3em] text-[#2B2119] transition hover:bg-[#7C4E2F] hover:text-white"
      >
        Logout
      </button>
    </div>
  )
}

