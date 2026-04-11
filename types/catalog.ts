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
  images?: string[]
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
  quantity: number
}

export type Cart = {
  id: string
  items: CartItem[]
}

export type Order = {
  id: string
  items: CartItem[]
  total: number
  status: 'pending' | 'paid' | 'payment_failed' | 'shipped' | 'delivered'
  createdAt: string
}
