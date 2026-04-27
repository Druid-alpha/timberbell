'use client'

const SHARED_AUDIO_KEY = 'timberbell_shared_audio_armed'

declare global {
  interface Window {
    __timberbellSharedAudioContext?: AudioContext | null
  }
}

function getAudioContextClass() {
  if (typeof window === 'undefined') return null
  return window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext || null
}

export function readSharedAudioArmed() {
  if (typeof window === 'undefined') return false
  return window.localStorage.getItem(SHARED_AUDIO_KEY) === 'true'
}

export function getSharedAudioContext() {
  if (typeof window === 'undefined') return null
  if (window.__timberbellSharedAudioContext) return window.__timberbellSharedAudioContext
  const AudioContextClass = getAudioContextClass()
  if (!AudioContextClass) return null
  window.__timberbellSharedAudioContext = new AudioContextClass()
  return window.__timberbellSharedAudioContext
}

export async function armSharedAudio() {
  const context = getSharedAudioContext()
  if (!context) return false

  if (context.state === 'suspended') {
    await context.resume().catch(() => null)
  }

  const unlocked = context.state === 'running'
  if (unlocked && typeof window !== 'undefined') {
    window.localStorage.setItem(SHARED_AUDIO_KEY, 'true')
  }

  return unlocked
}

export function clearSharedAudioReference() {
  if (typeof window === 'undefined') return
  window.__timberbellSharedAudioContext = null
}
