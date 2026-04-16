const RESERVATION_KEY = 'timberbellReservationExpiresAt'
const RESERVATION_EVENT = 'timberbell-reservation-updated'
const RESERVATION_DURATION_MS = 10 * 60 * 1000

function canUseStorage() {
  return typeof window !== 'undefined'
}

function notifyReservationUpdate() {
  if (!canUseStorage()) return
  window.dispatchEvent(new Event(RESERVATION_EVENT))
}

export function getReservationExpiry() {
  if (!canUseStorage()) return null
  const raw = window.localStorage.getItem(RESERVATION_KEY)
  if (!raw) return null

  const value = Number(raw)
  if (!Number.isFinite(value)) {
    window.localStorage.removeItem(RESERVATION_KEY)
    return null
  }

  return value
}

export function getReservationTimeLeft() {
  const expiry = getReservationExpiry()
  if (!expiry) return 0
  return Math.max(0, Math.ceil((expiry - Date.now()) / 1000))
}

export function ensureReservationCountdown() {
  if (!canUseStorage()) return null

  const current = getReservationExpiry()
  if (current && current > Date.now()) {
    notifyReservationUpdate()
    return current
  }

  const nextExpiry = Date.now() + RESERVATION_DURATION_MS
  window.localStorage.setItem(RESERVATION_KEY, String(nextExpiry))
  notifyReservationUpdate()
  return nextExpiry
}

export function clearReservationCountdown() {
  if (!canUseStorage()) return
  window.localStorage.removeItem(RESERVATION_KEY)
  notifyReservationUpdate()
}

export function subscribeToReservationUpdates(callback: () => void) {
  if (!canUseStorage()) return () => {}

  const handleStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === RESERVATION_KEY) callback()
  }

  window.addEventListener('storage', handleStorage)
  window.addEventListener(RESERVATION_EVENT, callback)

  return () => {
    window.removeEventListener('storage', handleStorage)
    window.removeEventListener(RESERVATION_EVENT, callback)
  }
}
