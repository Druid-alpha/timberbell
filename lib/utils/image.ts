export function getOptimizedImageUrl(url?: string | null, transformations = 'f_auto,q_auto') {
  if (!url) return ''

  if (!url.includes('/upload/')) {
    return url
  }

  const marker = '/upload/'
  const [prefix, suffix] = url.split(marker)

  if (!prefix || !suffix) {
    return url
  }

  if (suffix.startsWith(`${transformations}/`)) {
    return url
  }

  return `${prefix}${marker}${transformations}/${suffix}`
}
