'use client'

import SectionHeading from '@/app/_components/SectionHeading'
import Breadcrumb from '@/app/_components/Breadcrumb'
import Link from 'next/link'

export default function JournalPage() {
  const posts = [
    {
      title: 'The Art of Timber Selection',
      category: 'Design',
      date: 'April 12, 2026',
      image: '/lifestyle-1.svg',
      excerpt: 'Exploring the slow growth cycles of West African mahogany and its architectural resilience.',
    },
    {
      title: 'Living with Less',
      category: 'Philosophy',
      date: 'March 28, 2026',
      image: '/lifestyle-2.svg',
      excerpt: 'How sculptural furniture can create space for silence in a maximalist world.',
    },
    {
      title: 'Studio Visit: The Carvers',
      category: 'Atelier',
      date: 'March 15, 2026',
      image: '/hero-room.svg',
      excerpt: 'A morning spent in our Lagos workshop watching raw timber transform into functional art.',
    },
  ]

  return (
    <div className="mx-auto max-w-5xl space-y-24 px-6 py-16">
      <div className="flex flex-col gap-6">
        <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Journal' }]} />
        <SectionHeading
          eyebrow="Stories"
          title="The Timberbell Journal"
          description="Reflections on design, materiality, and the slower rhythms of modern life."
        />
      </div>

      <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <article key={post.title} className="group cursor-pointer">
            <div className="aspect-[4/5] overflow-hidden rounded-[40px] border border-[#E6D9C8] bg-[#F4EEE4]">
              <img src={post.image} alt="" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
            </div>
            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest font-bold text-[#8C7A6B]">
                <span>{post.category}</span>
                <span className="h-1 w-1 rounded-full bg-[#E6D9C8]" />
                <span>{post.date}</span>
              </div>
              <h3 className="font-display text-2xl text-[#2B2119] group-hover:text-[#7C4E2F] transition-colors">{post.title}</h3>
              <p className="text-sm leading-relaxed text-[#6B594A] line-clamp-2">{post.excerpt}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
