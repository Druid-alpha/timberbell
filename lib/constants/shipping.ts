export type DeliveryMethod = 'standard' | 'priority'

export type DeliveryZone = {
  id: 'lagos' | 'abuja' | 'port-harcourt' | 'nationwide'
  label: string
  standardFee: number
  priorityFee: number
  standardEta: string
  priorityEta: string
  coverage: string[]
}

export const NIGERIA_STATES = [
  'Abia',
  'Adamawa',
  'Akwa Ibom',
  'Anambra',
  'Bauchi',
  'Bayelsa',
  'Benue',
  'Borno',
  'Cross River',
  'Delta',
  'Ebonyi',
  'Edo',
  'Ekiti',
  'Enugu',
  'Federal Capital Territory',
  'Gombe',
  'Imo',
  'Jigawa',
  'Kaduna',
  'Kano',
  'Katsina',
  'Kebbi',
  'Kogi',
  'Kwara',
  'Lagos',
  'Nasarawa',
  'Niger',
  'Ogun',
  'Ondo',
  'Osun',
  'Oyo',
  'Plateau',
  'Rivers',
  'Sokoto',
  'Taraba',
  'Yobe',
  'Zamfara',
] as const

export const DELIVERY_ZONES: DeliveryZone[] = [
  {
    id: 'lagos',
    label: 'Lagos',
    standardFee: 3000,
    priorityFee: 7500,
    standardEta: '3-5 business days',
    priorityEta: '24-48 hours after dispatch',
    coverage: ['Lagos'],
  },
  {
    id: 'abuja',
    label: 'Abuja / FCT',
    standardFee: 5000,
    priorityFee: 9000,
    standardEta: '4-7 business days',
    priorityEta: '48-72 hours after dispatch',
    coverage: ['Federal Capital Territory'],
  },
  {
    id: 'port-harcourt',
    label: 'Port Harcourt / Rivers',
    standardFee: 6500,
    priorityFee: 10500,
    standardEta: '5-8 business days',
    priorityEta: '2-4 business days after dispatch',
    coverage: ['Rivers'],
  },
  {
    id: 'nationwide',
    label: 'Rest of Nigeria',
    standardFee: 8000,
    priorityFee: 14000,
    standardEta: '6-12 business days',
    priorityEta: '3-6 business days after dispatch',
    coverage: ['All other states'],
  },
]

export const STANDARD_DELIVERY_FEE = DELIVERY_ZONES[0].standardFee

function normalizeText(value?: string | null) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
}

export function resolveDeliveryZone(input: { state?: string | null; city?: string | null }) {
  const normalizedState = normalizeText(input.state)
  const normalizedCity = normalizeText(input.city)

  if (normalizedState === 'lagos' || normalizedCity === 'lagos') {
    return DELIVERY_ZONES[0]
  }

  if (
    normalizedState === 'federal capital territory' ||
    normalizedState === 'abuja' ||
    normalizedCity.includes('abuja')
  ) {
    return DELIVERY_ZONES[1]
  }

  if (
    normalizedState === 'rivers' ||
    normalizedCity.includes('port harcourt') ||
    normalizedCity === 'ph'
  ) {
    return DELIVERY_ZONES[2]
  }

  return DELIVERY_ZONES[3]
}

export function getDeliveryQuote(input: {
  state?: string | null
  city?: string | null
  method?: DeliveryMethod | null
}) {
  const zone = resolveDeliveryZone(input)
  const method: DeliveryMethod = input.method === 'priority' ? 'priority' : 'standard'
  const fee = method === 'priority' ? zone.priorityFee : zone.standardFee
  const eta = method === 'priority' ? zone.priorityEta : zone.standardEta

  return { zone, method, fee, eta }
}
