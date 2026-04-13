import type { ReactNode } from 'react'
import AdminNav from '@/app/admin/_components/AdminNav'
import AdminTopbar from '@/app/admin/_components/AdminTopbar'

export default function AdminShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F4EEE4]">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-10">
        <AdminTopbar />
        <div className="rounded-[2.5rem] border border-[#E6D9C8] bg-[#F4EEE4] p-6 shadow-sm sm:p-8">
          <AdminNav />
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  )
}

