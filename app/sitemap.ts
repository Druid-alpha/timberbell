import type { MetadataRoute } from 'next'
import { absoluteUrl } from '@/lib/site'
import { getCategories, getProducts } from '@/lib/services/catalog'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts(),
  ])

  const staticRoutes = [
    '/',
    '/productfilter',
    '/journal',
    '/trade',
    '/virtual-tour',
    '/room-advisor',
    '/about',
    '/contact',
  ]

  return [
    ...staticRoutes.map((path) => ({
      url: absoluteUrl(path),
      changeFrequency: path === '/' ? 'daily' as const : 'weekly' as const,
      priority: path === '/' ? 1 : 0.7,
    })),
    ...categories.map((category) => ({
      url: absoluteUrl(`/productfilter?category=${encodeURIComponent(category.slug)}`),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    ...products.map((product) => ({
      url: absoluteUrl(`/products/${encodeURIComponent(product.slug || product.id)}`),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    })),
  ]
}
