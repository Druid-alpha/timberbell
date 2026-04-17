'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import QuickViewModal from '@/app/_components/QuickViewModal'

export default function QuickViewPage() {
  const params = useParams<{ id: string }>()
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!params?.id) return
    let active = true
    async function load() {
      const res = await fetch(`/api/products/${params.id}`)
      const data = await res.json()
      if (active) {
        setProduct(res.ok ? data : null)
        setLoading(false)
      }
    }
    load()
    return () => { active = false }
  }, [params?.id])

  if (loading || !product) return null

  return <QuickViewModal product={product} />
}
