export const ADMIN_ACTIVITY_EVENT = 'timberbell-admin-activity-seen'

export const ADMIN_ACTIVITY_KEYS = {
  orders: 'timberbell_admin_activity_seen_orders_at',
  refunds: 'timberbell_admin_activity_seen_refunds_at',
  users: 'timberbell_admin_activity_seen_users_at',
} as const

export type AdminActivitySection = keyof typeof ADMIN_ACTIVITY_KEYS

export function readAdminActivitySeenAt(section: AdminActivitySection) {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem(ADMIN_ACTIVITY_KEYS[section])
}

export function writeAdminActivitySeenAt(section: AdminActivitySection, value: string | null) {
  if (typeof window === 'undefined' || !value) return
  window.localStorage.setItem(ADMIN_ACTIVITY_KEYS[section], value)
}

export function notifyAdminActivitySeen(section: AdminActivitySection, value: string | null) {
  if (typeof window === 'undefined' || !value) return
  writeAdminActivitySeenAt(section, value)
  window.dispatchEvent(new CustomEvent(ADMIN_ACTIVITY_EVENT, { detail: { section, value } }))
}
