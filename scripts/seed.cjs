const { MongoClient } = require('mongodb')
const path = require('path')
const dotenv = require('dotenv')

dotenv.config({ path: path.join(process.cwd(), '.env.local') })

const uri = process.env.MONGODB_URI
if (!uri) {
  console.error('Missing MONGODB_URI')
  process.exit(1)
}

const isProd = process.env.NODE_ENV === 'production'
const allowProd = process.env.SEED_ALLOW === 'true'

if (isProd && !allowProd) {
  console.error('Refusing to seed in production. Set SEED_ALLOW=true to override.')
  process.exit(1)
}

const categories = [
  {
    slug: 'living',
    name: 'Living Room',
    description: 'Layered seating, sculpted silhouettes, and lounge-ready textures.',
    tone: 'from-amber-200/70 via-orange-100/70 to-rose-100/60',
  },
  {
    slug: 'dining',
    name: 'Dining',
    description: 'Gathering tables, tactile ceramics, and slow Sunday moments.',
    tone: 'from-emerald-100/70 via-teal-100/60 to-lime-50/60',
  },
  {
    slug: 'bedroom',
    name: 'Bedroom',
    description: 'Soft forms, warm lighting, and restorative sleep rituals.',
    tone: 'from-indigo-100/70 via-sky-100/60 to-slate-100/70',
  },
  {
    slug: 'workspace',
    name: 'Workspace',
    description: 'Crafted desks and calm organizers for focused flow.',
    tone: 'from-stone-100/70 via-neutral-100/60 to-amber-50/70',
  },
  {
    slug: 'outdoor',
    name: 'Outdoor',
    description: 'Weather-ready seating and sculptural tables for open-air rituals.',
    tone: 'from-lime-100/70 via-emerald-100/60 to-teal-50/70',
  },
  {
    slug: 'entry',
    name: 'Entryway',
    description: 'Console tables, benches, and storage to welcome you home.',
    tone: 'from-rose-100/70 via-orange-100/60 to-amber-50/70',
  },
]

const products = [
  {
    slug: 'harborline-modular-sofa',
    name: 'Harborline Modular Sofa',
    price: 2890,
    compareAt: 3190,
    category: 'living',
    description:
      'A low-slung modular sofa with deep cushions and a subtle curve that invites long evenings.',
    materials: ['Kiln-dried hardwood', 'Feather blend', 'Performance weave'],
    finishes: ['Dune', 'Seagrass', 'Onyx'],
    badge: 'Bestseller',
    rating: 4.9,
    reviewCount: 124,
    leadTime: '4-6 weeks',
    dimensions: '114" W x 39" D x 27" H',
    palette: ['#f4e7d2', '#f7d6b4', '#eab38b'],
  },
  {
    slug: 'crescent-ridge-lounge-chair',
    name: 'Crescent Ridge Lounge Chair',
    price: 940,
    category: 'living',
    description:
      'Sculpted oak arms meet a suspended seat for a chair that feels light yet grounded.',
    materials: ['White oak', 'Vegetable-tanned leather'],
    finishes: ['Sand', 'Saddle'],
    rating: 4.7,
    reviewCount: 58,
    leadTime: '3-5 weeks',
    dimensions: '29" W x 30" D x 31" H',
    palette: ['#f1e3d0', '#e4c8a4', '#c59a6b'],
  },
  {
    slug: 'mariner-coffee-table',
    name: 'Mariner Coffee Table',
    price: 1180,
    category: 'living',
    description:
      'A wide oval table with hand-planed edges and a warm oil finish.',
    materials: ['Walnut', 'Brushed brass inlay'],
    finishes: ['Walnut'],
    badge: 'New',
    rating: 4.8,
    reviewCount: 42,
    leadTime: '2-4 weeks',
    dimensions: '54" W x 28" D x 15" H',
    palette: ['#f3e7d7', '#ddbfa0', '#b48763'],
  },
  {
    slug: 'asterra-dining-table',
    name: 'Asterra Dining Table',
    price: 2320,
    category: 'dining',
    description:
      'A generous table with softly chamfered legs and a light-catching edge profile.',
    materials: ['Ash wood', 'Natural oil finish'],
    finishes: ['Mist', 'Honey'],
    rating: 4.9,
    reviewCount: 71,
    leadTime: '5-7 weeks',
    dimensions: '84" W x 40" D x 30" H',
    palette: ['#f1ecd9', '#d9e3c9', '#b9caa2'],
  },
  {
    slug: 'rill-dining-chair',
    name: 'Rill Dining Chair',
    price: 420,
    category: 'dining',
    description:
      'A breathable cane backrest with a supportive seat for long conversations.',
    materials: ['Beech', 'Cane webbing'],
    finishes: ['Wheat', 'Natural'],
    rating: 4.6,
    reviewCount: 33,
    leadTime: '2-3 weeks',
    dimensions: '19" W x 22" D x 33" H',
    palette: ['#f6efe3', '#e3d2b6', '#c4a67b'],
  },
  {
    slug: 'solace-sideboard',
    name: 'Solace Sideboard',
    price: 1890,
    category: 'dining',
    description:
      'A long, low storage piece with quiet sliding doors and adjustable shelving.',
    materials: ['Oak veneer', 'Soft-close hardware'],
    finishes: ['Flax', 'Charcoal'],
    rating: 4.8,
    reviewCount: 29,
    leadTime: '4-6 weeks',
    dimensions: '72" W x 18" D x 28" H',
    palette: ['#f4eee7', '#d9c9b8', '#b39a86'],
  },
  {
    slug: 'luna-platform-bed',
    name: 'Luna Platform Bed',
    price: 2460,
    category: 'bedroom',
    description:
      'A cloud-like headboard paired with a floating platform for an airy bedroom.',
    materials: ['Maple', 'Performance boucle'],
    finishes: ['Ivory', 'Stone'],
    badge: 'Editor pick',
    rating: 4.9,
    reviewCount: 92,
    leadTime: '5-8 weeks',
    dimensions: '80" W x 90" D x 46" H',
    palette: ['#eef1f5', '#d8e2ee', '#b4c5dc'],
  },
  {
    slug: 'drift-nightstand',
    name: 'Drift Nightstand',
    price: 540,
    category: 'bedroom',
    description:
      'Rounded corners, push-latch drawers, and a softly curved silhouette.',
    materials: ['Walnut', 'Matte lacquer'],
    finishes: ['Walnut', 'Smoke'],
    rating: 4.7,
    reviewCount: 41,
    leadTime: '2-3 weeks',
    dimensions: '24" W x 18" D x 22" H',
    palette: ['#e7e4e1', '#c7b9ad', '#9b8173'],
  },
  {
    slug: 'haven-writing-desk',
    name: 'Haven Writing Desk',
    price: 1290,
    category: 'workspace',
    description:
      'A slim-profile desk with built-in cable grooves and a soft matte finish.',
    materials: ['Birch plywood', 'Matte lacquer'],
    finishes: ['Clay', 'Midnight'],
    rating: 4.8,
    reviewCount: 37,
    leadTime: '3-4 weeks',
    dimensions: '52" W x 26" D x 30" H',
    palette: ['#efe4d9', '#dfc9b3', '#b8977b'],
  },
  {
    slug: 'cirrus-shelving-system',
    name: 'Cirrus Shelving System',
    price: 1760,
    category: 'workspace',
    description:
      'Modular shelving with softly rounded uprights and adjustable shelves.',
    materials: ['Powder-coated steel', 'Ash wood'],
    finishes: ['Fog', 'Sable'],
    rating: 4.6,
    reviewCount: 26,
    leadTime: '4-5 weeks',
    dimensions: '64" W x 16" D x 72" H',
    palette: ['#e7eef0', '#c4d3d9', '#93aab3'],
  },
  {
    slug: 'solstice-patio-lounge',
    name: 'Solstice Patio Lounge',
    price: 2120,
    category: 'outdoor',
    description:
      'Weather-ready lounge seating with quick-dry cushions and teak accents.',
    materials: ['Powder-coated aluminum', 'Quick-dry foam'],
    finishes: ['Ivory', 'Seagrass'],
    rating: 4.5,
    reviewCount: 18,
    leadTime: '4-6 weeks',
    dimensions: '78" W x 35" D x 28" H',
    palette: ['#eef3f0', '#d8e3dc', '#b3c5b9'],
  },
  {
    slug: 'harbor-entry-console',
    name: 'Harbor Entry Console',
    price: 860,
    category: 'entry',
    description:
      'Slim-profile console with soft-close drawers and bronze pulls.',
    materials: ['Oak veneer', 'Bronze hardware'],
    finishes: ['Natural', 'Sable'],
    rating: 4.7,
    reviewCount: 22,
    leadTime: '3-4 weeks',
    dimensions: '48" W x 14" D x 32" H',
    palette: ['#f4eee7', '#d6c8b4', '#b0917b'],
  },
]

async function run() {
  const client = new MongoClient(uri)
  await client.connect()
  const db = client.db()

  await db.collection('categories').createIndex({ slug: 1 }, { unique: true })
  await db.collection('products').createIndex({ slug: 1 }, { unique: true })
  await db.collection('products').createIndex({ category: 1 })

  const categoryOps = categories.map((category) => ({
    updateOne: {
      filter: { slug: category.slug },
      update: { $set: { ...category, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } },
      upsert: true,
    },
  }))

  const productOps = products.map((product) => ({
    updateOne: {
      filter: { slug: product.slug },
      update: { $set: { ...product, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } },
      upsert: true,
    },
  }))

  if (categoryOps.length) {
    await db.collection('categories').bulkWrite(categoryOps)
  }

  if (productOps.length) {
    await db.collection('products').bulkWrite(productOps)
  }

  await client.close()
  console.log('Seeding complete.')
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
