export const journalPosts = [
  {
    slug: 'art-of-timber-selection',
    title: 'The Art of Timber Selection',
    category: 'Design',
    date: '2026-04-12',
    image: '/lifestyle-1.svg',
    excerpt: 'Exploring the slow growth cycles of West African mahogany and its architectural resilience.',
    associatedCategory: 'dining',
    body: [
      {
        type: 'paragraph',
        content:
          'Material selection is one of the quiet decisions that defines whether a room feels temporary or enduring. Timberbell studies grain, density, and finish behavior so every silhouette ages with dignity rather than novelty.',
      },
      {
        type: 'paragraph',
        content:
          'West African hardwoods reward slower design thinking. Their depth of tone and structural resilience make them especially suited to statement dining tables, sideboards, and pieces intended to gather people for years.',
      },
      {
        type: 'quote',
        content:
          'A room begins to feel permanent when the materials look like they belong there even before styling begins.',
      },
      {
        type: 'paragraph',
        content:
          'That is why our selection process considers more than surface beauty. We look at how timber responds to light, how it pairs with stone and upholstery, and how a finish settles into everyday use without losing presence.',
      },
    ],
  },
  {
    slug: 'living-with-less',
    title: 'Living with Less',
    category: 'Philosophy',
    date: '2026-03-28',
    image: '/lifestyle-2.svg',
    excerpt: 'How sculptural furniture can create space for silence in a maximalist world.',
    associatedCategory: 'living',
    body: [
      {
        type: 'paragraph',
        content:
          'A quieter room is not an emptier room. It is a room where each object has earned its place through proportion, texture, and emotional weight.',
      },
      {
        type: 'paragraph',
        content:
          'Instead of filling every corner, we prefer composing fewer, better anchors: a sofa with presence, a table with architectural clarity, a chair that feels collected rather than merely useful.',
      },
      {
        type: 'quote',
        content:
          'Less works when what remains is confident enough to carry the room.',
      },
      {
        type: 'paragraph',
        content:
          'That philosophy shapes Timberbell’s living collections. The goal is not minimalism for its own sake, but a more breathable, intentional home that leaves space for texture, ritual, and calm.',
      },
    ],
  },
  {
    slug: 'studio-visit-the-carvers',
    title: 'Studio Visit: The Carvers',
    category: 'Atelier',
    date: '2026-03-15',
    image: '/hero-room.svg',
    excerpt: 'A morning spent in our Lagos workshop watching raw timber transform into functional art.',
    associatedCategory: 'entry',
    body: [
      {
        type: 'paragraph',
        content:
          'Inside the workshop, speed is never the marker of quality. The best moments happen in the pauses: studying the joinery line, checking edge softness, testing whether a curve feels intentional from every angle.',
      },
      {
        type: 'paragraph',
        content:
          'Our carvers work between structure and feeling. They preserve enough discipline for durability while still allowing the piece to hold the character of the hand that shaped it.',
      },
      {
        type: 'quote',
        content:
          'Craftsmanship becomes visible when precision still leaves room for warmth.',
      },
      {
        type: 'paragraph',
        content:
          'That is especially true for entrance pieces and smaller architectural accents. Their scale may be quieter, but they are often the first note a home plays when someone walks in.',
      },
    ],
  },
] as const

export function getJournalPostBySlug(slug: string) {
  return journalPosts.find((post) => post.slug === slug) ?? null
}
