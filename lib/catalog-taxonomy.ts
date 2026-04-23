export const FURNITURE_CATEGORIES = [
  { slug: 'living', name: 'Living Room' },
  { slug: 'bedroom', name: 'Bedroom' },
  { slug: 'dining', name: 'Dining' },
  { slug: 'entry', name: 'Entryway' },
] as const

export const FURNITURE_CATEGORY_SLUGS = FURNITURE_CATEGORIES.map((category) => category.slug)

export const FURNITURE_CATEGORY_NAMES = FURNITURE_CATEGORIES.map((category) => category.name)

const CATEGORY_ALIAS_MAP = new Map<string, (typeof FURNITURE_CATEGORIES)[number]>(
  FURNITURE_CATEGORIES.flatMap((category) => [
    [category.slug.toLowerCase(), category],
    [category.name.toLowerCase(), category],
  ])
)

export function normalizeFurnitureCategory(value: unknown) {
  const normalized = String(value || '').trim().toLowerCase()
  return CATEGORY_ALIAS_MAP.get(normalized) ?? null
}

export function isSupportedFurnitureCategory(value: unknown) {
  return Boolean(normalizeFurnitureCategory(value))
}
