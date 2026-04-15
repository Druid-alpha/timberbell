'use client'

export default function ProductSkeleton() {
  return (
    <div className="space-y-4">
      <div className="aspect-[4/5] animate-pulse rounded-[32px] bg-[#E6D9C8]/30" />
      <div className="px-2 space-y-2">
        <div className="h-4 w-2/3 animate-pulse rounded bg-[#E6D9C8]/40" />
        <div className="h-3 w-1/3 animate-pulse rounded bg-[#E6D9C8]/20" />
      </div>
    </div>
  )
}
