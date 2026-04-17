'use client'

import type { ReactNode } from 'react'
import { useState } from 'react'
import DiamondSidebar from './DiamondSidebar'
import AdminTopbar from './AdminTopbar'

export default function AdminShell({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#FDFCFB]">
      <DiamondSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="min-h-screen lg:ml-64">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
          <AdminTopbar onMenuToggle={() => setSidebarOpen((prev) => !prev)} />
          <div className="mt-10">{children}</div>
        </div>
      </main>
    </div>
  )
}
