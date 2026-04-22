'use client'

import { AnimatePresence, motion } from 'framer-motion'

type ConfirmDialogProps = {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  tone?: 'default' | 'danger'
  busy?: boolean
  onConfirm: () => void
  onClose: () => void
}

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'default',
  busy = false,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 sm:p-6">
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={busy ? undefined : onClose}
            className="absolute inset-0 bg-[#2B2119]/55 backdrop-blur-sm"
            aria-label="Close confirmation dialog"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            className="relative w-full max-w-md rounded-[32px] border border-[#E6D9C8] bg-white p-6 shadow-2xl sm:p-7"
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8C7A6B]">Confirm Action</p>
            <h3 className="mt-2 font-display text-2xl text-[#2B2119]">{title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-[#6B594A]">{description}</p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                disabled={busy}
                className="rounded-full border border-[#E6D9C8] px-5 py-3 text-[10px] font-bold uppercase tracking-[0.12em] text-[#7C4E2F] disabled:opacity-50"
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={busy}
                className={`rounded-full px-5 py-3 text-[10px] font-bold uppercase tracking-[0.12em] text-white disabled:opacity-50 ${
                  tone === 'danger' ? 'bg-red-600' : 'bg-[#2B2119]'
                }`}
              >
                {busy ? 'Working...' : confirmLabel}
              </button>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  )
}
