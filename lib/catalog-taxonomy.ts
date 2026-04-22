export const FURNITURE_CATEGORIES = [
  { slug: 'living', name: 'Living Room' },
  { slug: 'bedroom', name: 'Bedroom' },
  { slug: 'dining', name: 'Dining' },
  { slug: 'entry', name: 'Entryway' },
] as const

export const FURNITURE_CATEGORY_SLUGS = FURNITURE_CATEGORIES.map((category) => category.slug)

export const FURNITURE_CATEGORY_NAMES = FURNITURE_CATEGORIES.map((category) => category.name)

export function isSupportedFurnitureCategory(value: unknown) {
  const normalized = String(value || '').trim().toLowerCase()
  return FURNITURE_CATEGORY_SLUGS.includes(normalized as (typeof FURNITURE_CATEGORY_SLUGS)[number])
}

