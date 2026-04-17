import type { Product } from '@/types/catalog'

type DiscountInput = Pick<
  Product,
  'price' | 'discountType' | 'discountValue' | 'saleDiscount' | 'saleStartAt' | 'saleEndAt'
>

const isSaleActive = (product: DiscountInput) => {
  const saleDiscount = Number(product.saleDiscount || 0)
  if (!saleDiscount) return false
  const now = Date.now()
  const start = product.saleStartAt ? new Date(product.saleStartAt).getTime() : null
  const end = product.saleEndAt ? new Date(product.saleEndAt).getTime() : null
  if (start && now < start) return false
  if (end && now > end) return false
  return true
}

export function computeFinalPrice(product: DiscountInput) {
  const price = Number(product.price || 0)
  const discountType = product.discountType
  const discountValue = Number(product.discountValue || 0)

  let best = price

  if (discountType && discountValue) {
    if (discountType === 'percentage') {
      const discounted = price - price * (discountValue / 100)
      best = Math.min(best, Math.max(0, Math.round(discounted)))
    } else if (discountType === 'fixed') {
      best = Math.min(best, Math.max(0, price - discountValue))
    }
  }

  if (isSaleActive(product)) {
    const saleDiscount = Number(product.saleDiscount || 0)
    const discounted = price - price * (saleDiscount / 100)
    best = Math.min(best, Math.max(0, Math.round(discounted)))
  }

  return best
}

export function computeLineTotal(product: DiscountInput, quantity: number) {
  return computeFinalPrice(product) * Math.max(1, quantity)
}
