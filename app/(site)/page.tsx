import HomePageClient from '@/app/(site)/_components/HomePageClient'
import { getCategories, getProducts } from '@/lib/services/catalog'

export default async function HomePage() {
  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts(),
  ])

  return <HomePageClient categories={categories} products={products} />
}
