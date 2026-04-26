export type Category = {
  id: string
  slug: string
  name: string
  description?: string
  tone?: string
}

export type Product = {
  id: string
  slug?: string
  name: string
  price: number
  inventoryCount?: number
  stockStatus?: 'in_stock' | 'low_stock' | 'out_of_stock' | 'preorder'
  discountType?: 'percentage' | 'fixed'
  discountValue?: number
  finalPrice?: number
  saleDiscount?: number
  saleStartAt?: string | Date | null
  saleEndAt?: string | Date | null
  compareAt?: number
  category: string
  description: string
  materials?: string[]
  finishes?: string[]
  badge?: string
  rating?: number
  reviewCount?: number
  leadTime?: string
  dimensions?: string
  palette?: string[]
  images?: ProductImage[]
  variants?: ProductVariant[]
}

export type ProductFacetSummary = {
  priceRange: {
    min: number
    max: number
  }
  colors: string[]
  materials: string[]
}

export type ProductSearchResult = {
  total: number
  page: number
  limit: number
  products: Product[]
  facets: ProductFacetSummary
}

export type ProductImage = {
  url: string
  publicId: string
}

export type ProductVariant = {
  id: string
  name: string
  sku?: string
  price?: number
  discountType?: 'percentage' | 'fixed'
  discountValue?: number
  stockStatus?: 'in_stock' | 'low_stock' | 'out_of_stock' | 'preorder'
  stockCount?: number
  color?: string
  image?: ProductImage | null
  materials?: string[]
  finishes?: string[]
  specifications?: string[]
}

export type Review = {
  id: string
  productId: string
  customer: string
  location?: string
  rating: number
  message: string
  createdAt?: string
}

export type CartItem = {
  productId: string
  purchaseType?: 'main' | 'variant'
  variantId?: string
  variantName?: string
  color?: string
  quantity: number
  saved?: boolean
}

export type Cart = {
  id: string
  items: CartItem[]
}

export type Order = {
  id: string
  items: CartItem[]
  total: number
  status: 'pending_payment' | 'pending' | 'processing' | 'paid' | 'payment_failed' | 'shipped' | 'delivered' | 'cancelled'
  trackingStage?: 'processing' | 'wood_selection' | 'crafting' | 'quality_check' | 'in_transit' | 'delivered'
  createdAt: string
}
