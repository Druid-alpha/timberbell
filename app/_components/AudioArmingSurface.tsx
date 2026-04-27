'use client'

import type { ReactNode } from 'react'
import { armSharedAudio } from '@/lib/utils/sharedAudio'

export default function AudioArmingSurface({
  className,
  children,
}: {
  className?: string
  children: ReactNode
}) {
  return (
    <div
      className={className}
      onPointerDown={() => { void armSharedAudio() }}
      onClick={() => { void armSharedAudio() }}
    >
      {children}
    </div>
  )
}
