import type { ReactNode } from 'react'

export default function AdminAuthLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-[#F8F3EA]">{children}</div>
}
