'use client'

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { armSharedAudio, clearSharedAudioReference, getSharedAudioContext } from '@/lib/utils/sharedAudio'

type Toast = {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
}

type ToastContextType = {
  toast: (message: string, type?: 'success' | 'error' | 'info') => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const audioContextRef = useRef<AudioContext | null>(null)
  const soundReadyRef = useRef(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const armSound = async () => {
      const unlocked = await armSharedAudio()
      audioContextRef.current = getSharedAudioContext()
      soundReadyRef.current = unlocked
    }

    window.addEventListener('pointerdown', armSound, { passive: true })
    window.addEventListener('click', armSound, { passive: true })
    window.addEventListener('touchstart', armSound, { passive: true })
    window.addEventListener('keydown', armSound)

    return () => {
      window.removeEventListener('pointerdown', armSound)
      window.removeEventListener('click', armSound)
      window.removeEventListener('touchstart', armSound)
      window.removeEventListener('keydown', armSound)
      const context = audioContextRef.current
      if (context) {
        void context.close().catch(() => null)
        clearSharedAudioReference()
      }
    }
  }, [])

  const playToastSound = useCallback(async (type: Toast['type']) => {
    if (typeof window === 'undefined') return

    const context = audioContextRef.current ?? getSharedAudioContext()
    if (!context) return
    audioContextRef.current = context

    if (context.state === 'suspended') {
      await context.resume().catch(() => null)
    }

    if (context.state !== 'running' || !soundReadyRef.current) return

    const now = context.currentTime
    const gain = context.createGain()
    gain.connect(context.destination)
    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.exponentialRampToValueAtTime(0.05, now + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45)

    const oscillator = context.createOscillator()
    oscillator.connect(gain)
    oscillator.type = type === 'error' ? 'sawtooth' : 'sine'
    oscillator.frequency.setValueAtTime(type === 'success' ? 880 : type === 'info' ? 740 : 320, now)
    oscillator.frequency.exponentialRampToValueAtTime(type === 'error' ? 220 : 990, now + 0.24)
    oscillator.start(now)
    oscillator.stop(now + 0.45)
  }, [])

  const toast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts((prev) => [...prev, { id, message, type }])
    void playToastSound(type)
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }, [playToastSound])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-8 right-8 z-[100] flex flex-col gap-3">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className={`flex min-w-[300px] items-center gap-3 rounded-2xl border px-6 py-4 shadow-2xl backdrop-blur-md ${
                t.type === 'success'
                  ? 'border-[#7C4E2F]/20 bg-[#F4EEE4]/90 text-[#2B2119]'
                  : t.type === 'error'
                    ? 'border-red-200 bg-red-50 text-red-900'
                    : 'border-[#E6D9C8] bg-white text-[#2B2119]'
              }`}
            >
              {t.type === 'success' && (
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#7C4E2F] text-[10px] text-white">✓</div>
              )}
              <p className="text-xs font-bold uppercase tracking-widest">{t.message}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used within a ToastProvider')
  return context
}
