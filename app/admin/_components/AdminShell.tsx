import type { ReactNode } from 'react'
import DiamondSidebar from './DiamondSidebar'
import AdminTopbar from './AdminTopbar'

export default function AdminShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#FDFCFB]">
      <DiamondSidebar />
      <main className="ml-64 flex-1">
        <div className="mx-auto max-w-6xl px-8 py-10">
          <AdminTopbar />
          <div className="mt-10">{children}</div>
        </div>
      </main>
    </div>
  )
}

