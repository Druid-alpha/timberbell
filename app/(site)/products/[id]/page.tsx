import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import ProductDetailClient from '@/app/(site)/_components/ProductDetailClient'
import { absoluteUrl } from '@/lib/site'
import { getProductByIdOrSlug } from '@/lib/services/catalog'
import { getOptimizedImageUrl } from '@/lib/utils/image'
import { formatMoney } from '@/lib/utils/format'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const product = await getProductByIdOrSlug(id)

  if (!product) {
    return {
      title: 'Product Not Found',
    }
  }

  const url = absoluteUrl(`/products/${encodeURIComponent(product.slug || product.id)}`)
  const image = product.images?.[0]?.url ? getOptimizedImageUrl(product.images[0].url) : absoluteUrl('/modern-cool-white-furniture.jpg')
  const title = `${product.name} | Timberbell`
  const description = product.description || `Explore ${product.name} from Timberbell.`

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      type: 'website',
      url,
      images: [{ url: image, alt: product.name }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  }
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const product = await getProductByIdOrSlug(id)

  if (!product) {
    notFound()
  }

  const canonicalUrl = absoluteUrl(`/products/${encodeURIComponent(product.slug || product.id)}`)
  const productImage = product.images?.[0]?.url ? getOptimizedImageUrl(product.images[0].url) : absoluteUrl('/modern-cool-white-furniture.jpg')
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: [productImage],
    sku: product.slug || product.id,
    category: product.category,
    brand: {
      '@type': 'Brand',
      name: 'Timberbell',
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'NGN',
      price: Number(product.finalPrice ?? product.price ?? 0),
      availability: product.stockStatus === 'out_of_stock' ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
      url: canonicalUrl,
    },
    aggregateRating: product.reviewCount
      ? {
          '@type': 'AggregateRating',
          ratingValue: Number(product.rating || 0).toFixed(1),
          reviewCount: product.reviewCount,
        }
      : undefined,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetailClient productId={id} initialProduct={product} />
    </>
  )
}
