import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Breadcrumb from '@/app/_components/Breadcrumb'
import ProductCard from '@/app/_components/ProductCard'
import SectionHeading from '@/app/_components/SectionHeading'
import { getCategories, getProducts } from '@/lib/services/catalog'
import { absoluteUrl } from '@/lib/site'

async function getCollectionData(slug: string) {
  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts({ category: slug }),
  ])

  const category = categories.find((item) => item.slug === slug) ?? null
  return { category, products }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const { category } = await getCollectionData(slug)

  if (!category) {
    return { title: 'Collection Not Found' }
  }

  return {
    title: `${category.name} Collection`,
    description: category.description || `Explore Timberbell's ${category.name.toLowerCase()} collection.`,
    alternates: {
      canonical: absoluteUrl(`/collections/${category.slug}`),
    },
  }
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const { category, products } = await getCollectionData(slug)

  if (!category) {
    notFound()
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${category.name} Collection`,
    url: absoluteUrl(`/collections/${category.slug}`),
    description: category.description || 'Curated pieces designed to create a layered, welcoming home.',
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: products.map((product, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: absoluteUrl(`/products/${encodeURIComponent(product.slug || product.id)}`),
        name: product.name,
      })),
    },
  }

  return (
    <div className="mx-auto max-w-7xl space-y-12 px-6 py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="flex flex-col gap-6">
        <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Collections', href: '/collections' }, { label: category.name }]} />
        <SectionHeading
          eyebrow="Collection"
          title={category.name}
          description={category.description || 'Curated pieces designed to create a layered, welcoming home.'}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {products.length === 0 ? (
        <div className="rounded-[28px] border border-[#E6D9C8] bg-white p-12 text-center text-sm text-[#6B594A] shadow-sm">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="mx-auto mb-4 h-12 w-12 opacity-20">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          No products yet in this collection.
        </div>
      ) : null}
    </div>
  )
}
