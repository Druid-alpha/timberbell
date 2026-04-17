import type { ReactNode } from 'react'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getAdminCookieName, isAdminCookieValid } from '@/lib/admin'
import AdminShell from '@/app/admin/_components/AdminShell'

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies()
  const cookieValue = cookieStore.get(getAdminCookieName())?.value
  if (!isAdminCookieValid(cookieValue)) {
    redirect('/admin/login')
  }

  return <AdminShell>{children}</AdminShell>
}
