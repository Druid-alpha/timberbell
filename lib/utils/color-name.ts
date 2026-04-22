import { PRODUCT_COLOR_OPTIONS } from '@/lib/constants/product-colors'

export function normalizeHexColor(hex?: string | null) {
  const clean = String(hex || '').trim().replace(/^#/, '')
  if (!clean) return null

  if (/^[0-9a-fA-F]{3}$/.test(clean)) {
    return `#${clean
      .split('')
      .map((char) => `${char}${char}`)
      .join('')
      .toLowerCase()}`
  }

  if (!/^[0-9a-fA-F]{6}$/.test(clean)) return null
  return `#${clean.toLowerCase()}`
}

function hexToRgb(hex: string) {
  const normalized = normalizeHexColor(hex)
  if (!normalized) return null
  const clean = normalized.slice(1)

  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16),
  }
}

function rgbToHsl(r: number, g: number, b: number) {
  const red = r / 255
  const green = g / 255
  const blue = b / 255
  const max = Math.max(red, green, blue)
  const min = Math.min(red, green, blue)
  const lightness = (max + min) / 2
  const delta = max - min

  if (delta === 0) {
    return { h: 0, s: 0, l: lightness * 100 }
  }

  const saturation =
    lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min)

  let hue = 0
  switch (max) {
    case red:
      hue = (green - blue) / delta + (green < blue ? 6 : 0)
      break
    case green:
      hue = (blue - red) / delta + 2
      break
    default:
      hue = (red - green) / delta + 4
      break
  }

  return {
    h: Math.round(hue * 60),
    s: Math.round(saturation * 100),
    l: Math.round(lightness * 100),
  }
}

export function getColorName(hex?: string | null) {
  const normalized = normalizeHexColor(hex)
  if (!normalized) return 'Natural'

  const exactMatch = PRODUCT_COLOR_OPTIONS.find((color) => color.hex === normalized)
  if (exactMatch) return exactMatch.name

  const rgb = hexToRgb(normalized)
  if (!rgb) return normalized

  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)

  if (hsl.s <= 8) {
    if (hsl.l >= 94) return 'Snow White'
    if (hsl.l >= 84) return 'Pearl Gray'
    if (hsl.l >= 68) return 'Silver Gray'
    if (hsl.l >= 42) return 'Slate Gray'
    if (hsl.l >= 22) return 'Charcoal Gray'
    return 'Onyx Black'
  }

  let tone = 'Classic'
  if (hsl.l >= 86) tone = 'Pale'
  else if (hsl.l >= 72) tone = hsl.s <= 35 ? 'Powder' : 'Soft'
  else if (hsl.l <= 18) tone = 'Midnight'
  else if (hsl.l <= 32) tone = 'Deep'
  else if (hsl.s >= 78) tone = 'Vivid'
  else if (hsl.s <= 28) tone = 'Muted'

  let family = 'Rose'
  if (hsl.h < 15 || hsl.h >= 345) family = 'Red'
  else if (hsl.h < 35) family = 'Orange'
  else if (hsl.h < 50) family = 'Amber'
  else if (hsl.h < 70) family = 'Yellow'
  else if (hsl.h < 95) family = 'Lime'
  else if (hsl.h < 150) family = 'Green'
  else if (hsl.h < 175) family = 'Teal'
  else if (hsl.h < 200) family = 'Cyan'
  else if (hsl.h < 220) family = 'Sky'
  else if (hsl.h < 250) family = 'Blue'
  else if (hsl.h < 275) family = 'Indigo'
  else if (hsl.h < 310) family = 'Violet'
  else if (hsl.h < 345) family = 'Rose'

  return `${tone} ${family}`
}

const COLOR_FAMILY_SWATCHES: Record<string, string> = {
  White: '#f5f1e8',
  Beige: '#d8c7b3',
  Brown: '#8b6a4e',
  Green: '#6f7f61',
  Blue: '#6f8fa8',
  Gray: '#8e8e8e',
  Black: '#1f1f1f',
}

function getGeneratedColorFamily(hex?: string | null) {
  const rgb = hex ? hexToRgb(hex) : null
  if (!rgb) return 'Beige'

  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
  if (hsl.s <= 8) {
    if (hsl.l >= 80) return 'White'
    if (hsl.l >= 35) return 'Gray'
    return 'Black'
  }

  if (hsl.h < 15 || hsl.h >= 345) return 'Brown'
  if (hsl.h < 55) return 'Brown'
  if (hsl.h < 80) return 'Beige'
  if (hsl.h < 175) return 'Green'
  if (hsl.h < 250) return 'Blue'
  if (hsl.h < 345) return 'Gray'
  return 'Beige'
}

export function getColorFamily(hex?: string | null) {
  const normalized = normalizeHexColor(hex)
  const exactMatch = PRODUCT_COLOR_OPTIONS.find((color) => color.hex === normalized)
  if (exactMatch) return exactMatch.family

  const rgb = normalized ? hexToRgb(normalized) : null
  if (rgb) {
    let closestFamily = { name: 'Beige', distance: Number.POSITIVE_INFINITY }
    for (const [family, swatch] of Object.entries(COLOR_FAMILY_SWATCHES)) {
      const candidate = hexToRgb(swatch)
      if (!candidate) continue
      const distance =
        (rgb.r - candidate.r) ** 2 +
        (rgb.g - candidate.g) ** 2 +
        (rgb.b - candidate.b) ** 2

      if (distance < closestFamily.distance) {
        closestFamily = { name: family, distance }
      }
    }

    return closestFamily.name
  }

  return getGeneratedColorFamily(normalized)
}

export function getColorFamilySwatch(family: string) {
  return COLOR_FAMILY_SWATCHES[family] || '#d8c7b3'
}
