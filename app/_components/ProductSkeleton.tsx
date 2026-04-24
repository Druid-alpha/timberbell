'use client'

import { motion } from 'framer-motion'

export default function ProductSkeleton() {
  return (
    <div className="space-y-4">
      <div className="relative aspect-[4/5] overflow-hidden rounded-[32px] border border-[#E6D9C8]/70 bg-[linear-gradient(160deg,#f8f2ea_0%,#efe3d2_52%,#f7f1e8_100%)] shadow-[0_24px_70px_-50px_rgba(43,33,25,0.55)]">
        <motion.div
          aria-hidden="true"
          className="absolute inset-y-0 -left-1/3 w-1/2 bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.7),transparent)]"
          animate={{ x: ['-30%', '210%'] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          aria-hidden="true"
          className="absolute left-5 top-5 h-16 w-16 rounded-full bg-[#D7C1A8]/45 blur-2xl"
          animate={{ scale: [0.92, 1.12, 0.92], opacity: [0.35, 0.65, 0.35] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          aria-hidden="true"
          className="absolute bottom-5 right-5 h-20 w-20 rounded-full bg-[#AAB89C]/35 blur-2xl"
          animate={{ scale: [1.08, 0.92, 1.08], opacity: [0.28, 0.55, 0.28] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>
      <div className="space-y-2 px-2">
        <motion.div
          className="h-4 w-2/3 rounded-full bg-[#DDC7AF]"
          animate={{ opacity: [0.4, 0.9, 0.4], scaleX: [0.94, 1, 0.94] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="h-3 w-1/3 rounded-full bg-[#E9DCCB]"
          animate={{ opacity: [0.35, 0.75, 0.35], scaleX: [0.9, 1, 0.9] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut', delay: 0.12 }}
        />
      </div>
    </div>
  )
}
