'use client'

import { motion } from 'framer-motion'
import { clsx } from 'clsx'

type LuxuryLoaderProps = {
  label?: string
  caption?: string
  className?: string
  compact?: boolean
}

export default function LuxuryLoader({
  label = 'Preparing the experience',
  caption = 'Calibrating texture, light, and detail.',
  className,
  compact = false,
}: LuxuryLoaderProps) {
  return (
    <div
      className={clsx(
        'relative overflow-hidden rounded-[2rem] border border-[#E6D9C8] bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.92),_rgba(244,238,228,0.9)_42%,_rgba(229,215,198,0.9)_100%)] px-6 py-8 shadow-[0_30px_90px_-55px_rgba(43,33,25,0.55)]',
        compact ? 'min-h-[180px]' : 'min-h-[52vh]',
        className
      )}
    >
      <motion.div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(120deg,transparent_12%,rgba(255,255,255,0.5)_36%,transparent_60%)]"
        animate={{ x: ['-120%', '120%'] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        aria-hidden="true"
        className="absolute -left-16 top-8 h-32 w-32 rounded-full bg-[#D9BBA0]/30 blur-3xl"
        animate={{ scale: [0.92, 1.14, 0.94], opacity: [0.35, 0.6, 0.35] }}
        transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        aria-hidden="true"
        className="absolute -right-10 bottom-4 h-40 w-40 rounded-full bg-[#AAB89C]/25 blur-3xl"
        animate={{ scale: [1.08, 0.94, 1.08], opacity: [0.3, 0.55, 0.3] }}
        transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className={clsx('relative z-10 flex h-full flex-col items-center justify-center text-center', compact ? 'gap-5' : 'gap-7')}>
        <div className="relative flex h-24 w-24 items-center justify-center">
          <motion.div
            aria-hidden="true"
            className="absolute inset-0 rounded-full border border-[#C8AA8E]/55"
            animate={{ scale: [0.88, 1.12, 0.88], opacity: [0.2, 0.7, 0.2] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            aria-hidden="true"
            className="absolute inset-[10px] rounded-full border border-dashed border-[#7C4E2F]/45"
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div
            aria-hidden="true"
            className="h-10 w-10 rounded-full bg-[#2B2119]"
            animate={{ scale: [0.9, 1.08, 0.9], boxShadow: ['0 0 0 rgba(43,33,25,0.08)', '0 0 36px rgba(124,78,47,0.18)', '0 0 0 rgba(43,33,25,0.08)'] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        <div className="space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.42em] text-[#8C7A6B]">Timberbell atelier</p>
          <h2 className={clsx('font-display text-[#2B2119]', compact ? 'text-xl' : 'text-3xl sm:text-4xl')}>{label}</h2>
          <p className="mx-auto max-w-xl text-sm text-[#6B594A]">{caption}</p>
        </div>

        <div className="flex items-center gap-2">
          {[0, 1, 2].map((index) => (
            <motion.span
              key={index}
              className="h-2.5 w-10 rounded-full bg-[#7C4E2F]/70"
              animate={{ opacity: [0.25, 1, 0.25], scaleX: [0.72, 1, 0.72] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: index * 0.18 }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
