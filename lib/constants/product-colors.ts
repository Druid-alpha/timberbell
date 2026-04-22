export const PRODUCT_COLOR_OPTIONS = [
  { name: 'White', hex: '#ffffff', family: 'White' },
  { name: 'Ivory', hex: '#f4e7d2', family: 'White' },
  { name: 'Cream', hex: '#f2ebdd', family: 'White' },
  { name: 'Sand', hex: '#e6d8c7', family: 'Beige' },
  { name: 'Beige', hex: '#d8c7b3', family: 'Beige' },
  { name: 'Taupe', hex: '#b8a48c', family: 'Beige' },
  { name: 'Mocha', hex: '#8c7a6b', family: 'Brown' },
  { name: 'Walnut', hex: '#8b6a4e', family: 'Brown' },
  { name: 'Brown', hex: '#6b4f3a', family: 'Brown' },
  { name: 'Terracotta', hex: '#c59a6b', family: 'Brown' },
  { name: 'Olive', hex: '#8b9a78', family: 'Green' },
  { name: 'Green', hex: '#5d7a5a', family: 'Green' },
  { name: 'Blue', hex: '#6f8fa8', family: 'Blue' },
  { name: 'Gray', hex: '#8e8e8e', family: 'Gray' },
  { name: 'Charcoal', hex: '#5b5a52', family: 'Black' },
  { name: 'Black', hex: '#1f1f1f', family: 'Black' },
] as const

export const PRODUCT_COLOR_HEXES = PRODUCT_COLOR_OPTIONS.map((color) => color.hex)
