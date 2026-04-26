import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Breadcrumb from '@/app/_components/Breadcrumb'
import ProductCard from '@/app/_components/ProductCard'
import SectionHeading from '@/app/_components/SectionHeading'
import { getJournalPostBySlug, journalPosts } from '@/lib/content/journal'
import { getProducts } from '@/lib/services/catalog'
import { absoluteUrl } from '@/lib/site'

export async function generateStaticParams() {
  return journalPosts.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = getJournalPostBySlug(slug)

  if (!post) {
    return { title: 'Article Not Found' }
  }

  return {
    title: post.title,
    description: post.excerpt,
    alternates: {
      canonical: absoluteUrl(`/journal/${post.slug}`),
    },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: absoluteUrl(`/journal/${post.slug}`),
      images: [{ url: absoluteUrl(post.image), alt: post.title }],
    },
  }
}

export default async function JournalArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = getJournalPostBySlug(slug)

  if (!post) {
    notFound()
  }

  const relatedProducts = await getProducts({ category: post.associatedCategory })
  const picks = relatedProducts.slice(0, 3)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    datePublished: post.date,
    articleSection: post.category,
    description: post.excerpt,
    image: absoluteUrl(post.image),
    mainEntityOfPage: absoluteUrl(`/journal/${post.slug}`),
  }

  return (
    <article className="mx-auto max-w-6xl space-y-16 px-6 py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="flex flex-col gap-6">
        <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Journal', href: '/journal' }, { label: post.title }]} />
        <SectionHeading eyebrow={post.category} title={post.title} description={post.excerpt} />
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#8C7A6B]">
          {new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
      </div>

      <div className="overflow-hidden rounded-[40px] border border-[#E6D9C8] bg-[#F4EEE4]">
        <img src={post.image} alt={post.title} className="h-[28rem] w-full object-cover" />
      </div>

      <div className="grid gap-12 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-6 rounded-[36px] border border-[#E6D9C8] bg-white p-8 shadow-sm">
          {post.body.map((block, index) =>
            block.type === 'quote' ? (
              <blockquote key={index} className="border-l-2 border-[#7C4E2F] pl-5 font-display text-2xl italic leading-relaxed text-[#2B2119]">
                {block.content}
              </blockquote>
            ) : (
              <p key={index} className="text-base leading-8 text-[#5F564D]">
                {block.content}
              </p>
            )
          )}
        </div>

        <aside className="space-y-6">
          <div className="rounded-[36px] border border-[#E6D9C8] bg-[linear-gradient(180deg,#fffdf9,#f4eee4)] p-8 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-[#8C7A6B]">Shop the Story</p>
            <h2 className="mt-3 font-display text-3xl text-[#2B2119]">Editorial picks inspired by this article</h2>
            <p className="mt-3 text-sm leading-relaxed text-[#6B594A]">
              Explore pieces that echo the mood, materiality, or architectural direction behind this story.
            </p>
          </div>
          <div className="grid gap-6">
            {picks.map((product) => (
              <ProductCard key={product.id} product={product} variant="list" />
            ))}
          </div>
        </aside>
      </div>
    </article>
  )
}
