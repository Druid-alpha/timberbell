export const CATEGORY_IMAGES: Record<string, string> = {
  living: '/living.jpeg',
  bedroom: '/bedroom.jpeg',
  dining: '/dining.jpeg',
  entry: '/entry.jpeg',
}

export const CATEGORY_COPY: Record<string, string> = {
  living: 'Soft forms for slow evenings.',
  bedroom: 'Quiet comfort for rest.',
  dining: 'Gather beautifully every day.',
  entry: 'A graceful welcome home.',
}

export function getCategoryImage(slug?: string | null) {
  return CATEGORY_IMAGES[String(slug || '').trim().toLowerCase()] || '/livingroom-chairs-table.jpg'
}

export function getCategoryCopy(slug?: string | null, fallback?: string | null) {
  return CATEGORY_COPY[String(slug || '').trim().toLowerCase()] || fallback || 'Natural essence'
}
