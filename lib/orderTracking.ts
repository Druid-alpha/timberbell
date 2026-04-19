export const TRACKING_STAGES = [
  'processing',
  'wood_selection',
  'crafting',
  'quality_check',
  'in_transit',
  'delivered',
] as const

export type TrackingStage = (typeof TRACKING_STAGES)[number]

export type TrackingEntry = {
  stage: TrackingStage
  label: string
  detail: string
  completed: boolean
  current: boolean
  updatedAt?: string | Date | null
}

const TRACKING_STAGE_DETAILS: Record<TrackingStage, { label: string; detail: string }> = {
  processing: {
    label: 'Processing',
    detail: 'Order received and being reviewed by our concierge.',
  },
  wood_selection: {
    label: 'Wood Selection',
    detail: 'Selecting premium hardwoods and matching the best grain pattern for your piece.',
  },
  crafting: {
    label: 'Crafting',
    detail: 'Your furniture is being shaped, joined, and finished by the workshop team.',
  },
  quality_check: {
    label: 'Quality Check',
    detail: 'Final inspection of structure, finish, and overall presentation before dispatch.',
  },
  in_transit: {
    label: 'In Transit',
    detail: 'The order has left the studio and is on its way to the delivery address.',
  },
  delivered: {
    label: 'Delivered',
    detail: 'The order has been completed and handed over successfully.',
  },
}

export function getTrackingStageLabel(stage: TrackingStage) {
  return TRACKING_STAGE_DETAILS[stage].label
}

export function normalizeTrackingStage(input: unknown, fallback: TrackingStage = 'processing'): TrackingStage {
  const value = String(input || '').trim().toLowerCase() as TrackingStage
  return TRACKING_STAGES.includes(value) ? value : fallback
}

export function getTrackingEntries(input: {
  trackingStage?: unknown
  trackingUpdatedAt?: string | Date | null
}) {
  const currentStage = normalizeTrackingStage(input.trackingStage)
  const currentIndex = TRACKING_STAGES.indexOf(currentStage)

  return TRACKING_STAGES.map((stage, index) => ({
    stage,
    label: TRACKING_STAGE_DETAILS[stage].label,
    detail: TRACKING_STAGE_DETAILS[stage].detail,
    completed: index < currentIndex,
    current: index === currentIndex,
    updatedAt: index <= currentIndex ? input.trackingUpdatedAt || null : null,
  }))
}

export function getOrderProgressFromStatus(status: unknown) {
  const normalized = String(status || '').trim().toLowerCase()

  if (normalized === 'delivered') {
    return { trackingStage: 'delivered' as TrackingStage, orderStatus: 'delivered' }
  }

  if (normalized === 'shipped') {
    return { trackingStage: 'in_transit' as TrackingStage, orderStatus: 'shipped' }
  }

  if (['processing', 'paid', 'pending', 'pending_payment'].includes(normalized)) {
    return { trackingStage: 'processing' as TrackingStage, orderStatus: normalized === 'pending_payment' ? 'pending_payment' : 'processing' }
  }

  return { trackingStage: 'processing' as TrackingStage, orderStatus: normalized || 'pending' }
}

export function getOrderStatusForTrackingStage(stage: TrackingStage) {
  if (stage === 'delivered') return 'delivered'
  if (stage === 'in_transit') return 'shipped'
  return 'processing'
}
