'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import AdminOrderPulse from '@/app/admin/_components/AdminOrderPulse'

export default function AdminOrderPulseGate() {
  const pathname = usePathname()
  const [isAdminSession, setIsAdminSession] = useState(false)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    let active = true

    async function verifyAdminSession() {
      const res = await fetch('/api/admin/verify', { cache: 'no-store' }).catch(() => null)
      if (!active) return
      setIsAdminSession(Boolean(res?.ok))
      setChecked(true)
    }

    void verifyAdminSession()
    return () => {
      active = false
    }
  }, [pathname])

  if (!checked || !isAdminSession) return null

  return (
    <div className="fixed right-3 top-3 z-[90] sm:right-5 sm:top-5">
      <AdminOrderPulse />
    </div>
  )
}
