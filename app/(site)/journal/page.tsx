import type { Metadata } from 'next'
import Link from 'next/link'
import Breadcrumb from '@/app/_components/Breadcrumb'
import SectionHeading from '@/app/_components/SectionHeading'
import { journalPosts } from '@/lib/content/journal'
import { absoluteUrl } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Journal',
  description: 'Reflections on design, materiality, and the slower rhythms of modern life from Timberbell.',
  alternates: {
    canonical: absoluteUrl('/journal'),
  },
}

export default function JournalPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'The Timberbell Journal',
    url: absoluteUrl('/journal'),
    description: 'Reflections on design, materiality, and the slower rhythms of modern life.',
    blogPost: journalPosts.map((post) => ({
      '@type': 'BlogPosting',
      headline: post.title,
      datePublished: post.date,
      image: absoluteUrl(post.image),
      url: absoluteUrl(`/journal#${post.slug}`),
      articleSection: post.category,
      description: post.excerpt,
    })),
  }

  return (
    <div className="mx-auto max-w-5xl space-y-16 px-4 py-6 sm:px-6 sm:py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="flex flex-col gap-3">
        <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Journal' }]} />
        <SectionHeading
          eyebrow="Stories"
          title="The Timberbell Journal"
          description="Reflections on design, materiality, and the slower rhythms of modern life."
        />
      </div>

      <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
        {journalPosts.map((post) => (
          <Link key={post.slug} href={`/journal/${post.slug}`} className="group block" id={post.slug}>
            <article>
              <div className="aspect-[4/5] overflow-hidden rounded-[40px] border border-[#E6D9C8] bg-[#F4EEE4]">
                <img src={post.image} alt={post.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
              </div>
              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-[#8C7A6B]">
                  <span>{post.category}</span>
                  <span className="h-1 w-1 rounded-full bg-[#E6D9C8]" />
                  <span>{new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                </div>
                <h3 className="font-display text-2xl text-[#2B2119] transition-colors group-hover:text-[#7C4E2F]">{post.title}</h3>
                <p className="line-clamp-2 text-sm leading-relaxed text-[#6B594A]">{post.excerpt}</p>
                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#7C4E2F]">Read story</p>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </div>
  )
}
