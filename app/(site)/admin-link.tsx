"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

export default function AdminLink() {
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    let active = true
    async function checkAdmin() {
      const res = await fetch("/api/admin")
      if (!active) return
      setIsAdmin(res.ok)
    }
    checkAdmin()
    return () => {
      active = false
    }
  }, [])

  if (!isAdmin) return null

  return (
    <Link
      href="/admin"
      className="text-[11px] uppercase tracking-[0.3em] text-[#8A836F] hover:text-[#2A3320]"
    >
      Admin
    </Link>
  )
}

