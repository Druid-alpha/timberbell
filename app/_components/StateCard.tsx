'use client'

import Link from 'next/link'

type StateCardProps = {
  eyebrow?: string
  title: string
  description: string
  actionHref?: string
  actionLabel?: string
  compact?: boolean
}

export default function StateCard({
  eyebrow = 'Timberbell',
  title,
  description,
  actionHref,
  actionLabel,
  compact = false,
}: StateCardProps) {
  return (
    <div
      className={`rounded-[32px] border border-[#E6D9C8] bg-[linear-gradient(180deg,#f8f1e8,#fffdfa)] text-center shadow-[0_20px_55px_-48px_rgba(55,32,15,0.5)] ${
        compact ? 'px-6 py-10' : 'px-6 py-14 sm:px-10 sm:py-16'
      }`}
    >
      <div className="mx-auto max-w-xl space-y-4">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-[#E6D9C8] bg-white shadow-sm">
          <div className="h-2.5 w-2.5 rounded-full bg-[#7C4E2F]" />
        </div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#8C7A6B]">{eyebrow}</p>
        <h3 className="font-display text-2xl text-[#2B2119] sm:text-3xl">{title}</h3>
        <p className="text-sm leading-relaxed text-[#6B594A] sm:text-base">{description}</p>
        {actionHref && actionLabel ? (
          <div className="pt-2">
            <Link
              href={actionHref}
              className="inline-flex rounded-full border border-[#7C4E2F] px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#7C4E2F] transition hover:bg-white"
            >
              {actionLabel}
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  )
}
