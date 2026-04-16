const NAMED_COLORS = [
  { name: 'White', hex: '#ffffff' },
  { name: 'Ivory', hex: '#f4e7d2' },
  { name: 'Cream', hex: '#f2ebdd' },
  { name: 'Sand', hex: '#e6d8c7' },
  { name: 'Beige', hex: '#d8c7b3' },
  { name: 'Taupe', hex: '#b8a48c' },
  { name: 'Mocha', hex: '#8c7a6b' },
  { name: 'Walnut', hex: '#8b6a4e' },
  { name: 'Brown', hex: '#6b4f3a' },
  { name: 'Terracotta', hex: '#c59a6b' },
  { name: 'Olive', hex: '#8b9a78' },
  { name: 'Green', hex: '#5d7a5a' },
  { name: 'Blue', hex: '#6f8fa8' },
  { name: 'Gray', hex: '#8e8e8e' },
  { name: 'Charcoal', hex: '#5b5a52' },
  { name: 'Black', hex: '#1f1f1f' },
]

function hexToRgb(hex: string) {
  const clean = hex.replace('#', '').trim()
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) return null

  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16),
  }
}

export function getColorName(hex?: string | null) {
  if (!hex) return 'Natural'
  const rgb = hexToRgb(hex)
  if (!rgb) return hex

  let closest = { name: hex, distance: Number.POSITIVE_INFINITY }

  for (const color of NAMED_COLORS) {
    const candidate = hexToRgb(color.hex)
    if (!candidate) continue
    const distance =
      (rgb.r - candidate.r) ** 2 +
      (rgb.g - candidate.g) ** 2 +
      (rgb.b - candidate.b) ** 2

    if (distance < closest.distance) {
      closest = { name: color.name, distance }
    }
  }

  return closest.name
}
