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
    description: 'A low-slung modular sofa with deep cushions and a subtle curve that invites long evenings.',
    materials: ['Kiln-dried hardwood', 'Feather blend', 'Performance weave'],
    finishes: ['Dune', 'Seagrass', 'Onyx'],
    badge: 'Bestseller',
    rating: 4.9,
    reviewCount: 124,
    dimensions: '114" W x 39" D x 27" H',
    palette: ['#f4e7d2', '#f7d6b4', '#eab38b'],
  },
  {
    slug: 'crescent-ridge-lounge-chair',
    name: 'Crescent Ridge Lounge Chair',
    price: 940,
    category: 'living',
    description: 'Sculpted oak arms meet a suspended seat for a chair that feels light yet grounded.',
    materials: ['White oak', 'Vegetable-tanned leather'],
    finishes: ['Sand', 'Saddle'],
    rating: 4.7,
    reviewCount: 58,
    dimensions: '29" W x 30" D x 31" H',
    palette: ['#f1e3d0', '#e4c8a4', '#c59a6b'],
  },
  {
    slug: 'mariner-coffee-table',
    name: 'Mariner Coffee Table',
    price: 1180,
    category: 'living',
    description: 'A wide oval table with hand-planed edges and a warm oil finish.',
    materials: ['Walnut', 'Brushed brass inlay'],
    finishes: ['Walnut'],
    badge: 'New',
    rating: 4.8,
    reviewCount: 42,
    dimensions: '54" W x 28" D x 15" H',
    palette: ['#f3e7d7', '#ddbfa0', '#b48763'],
  },
  {
    slug: 'asterra-dining-table',
    name: 'Asterra Dining Table',
    price: 2320,
    category: 'dining',
    description: 'A generous table with softly chamfered legs and a light-catching edge profile.',
    materials: ['Ash wood', 'Natural oil finish'],
    finishes: ['Mist', 'Honey'],
    rating: 4.9,
    reviewCount: 71,
    dimensions: '84" W x 40" D x 30" H',
    palette: ['#f1ecd9', '#d9e3c9', '#b9caa2'],
  },
  {
    slug: 'rill-dining-chair',
    name: 'Rill Dining Chair',
    price: 420,
    category: 'dining',
    description: 'A breathable cane backrest with a supportive seat for long conversations.',
    materials: ['Beech', 'Cane webbing'],
    finishes: ['Wheat', 'Natural'],
    rating: 4.6,
    reviewCount: 33,
    dimensions: '19" W x 22" D x 33" H',
    palette: ['#f6efe3', '#e3d2b6', '#c4a67b'],
  },
  {
    slug: 'solace-sideboard',
    name: 'Solace Sideboard',
    price: 1890,
    category: 'dining',
    description: 'A long, low storage piece with quiet sliding doors and adjustable shelving.',
    materials: ['Oak veneer', 'Soft-close hardware'],
    finishes: ['Flax', 'Charcoal'],
    rating: 4.8,
    reviewCount: 29,
    dimensions: '72" W x 18" D x 28" H',
    palette: ['#f4eee7', '#d9c9b8', '#b39a86'],
  },
  {
    slug: 'luna-platform-bed',
    name: 'Luna Platform Bed',
    price: 2460,
    category: 'bedroom',
    description: 'A cloud-like headboard paired with a floating platform for an airy bedroom.',
    materials: ['Maple', 'Performance boucle'],
    finishes: ['Ivory', 'Stone'],
    badge: 'Editor pick',
    rating: 4.9,
    reviewCount: 92,
    dimensions: '80" W x 90" D x 46" H',
    palette: ['#eef1f5', '#d8e2ee', '#b4c5dc'],
  },
  {
    slug: 'drift-nightstand',
    name: 'Drift Nightstand',
    price: 540,
    category: 'bedroom',
    description: 'Rounded corners, push-latch drawers, and a softly curved silhouette.',
    materials: ['Walnut', 'Matte lacquer'],
    finishes: ['Walnut', 'Smoke'],
    rating: 4.7,
    reviewCount: 41,
    dimensions: '24" W x 18" D x 22" H',
    palette: ['#e7e4e1', '#c7b9ad', '#9b8173'],
  },
  {
    slug: 'harbor-entry-console',
    name: 'Harbor Entry Console',
    price: 860,
    category: 'entry',
    description: 'Slim-profile console with soft-close drawers and bronze pulls.',
    materials: ['Oak veneer', 'Bronze hardware'],
    finishes: ['Natural', 'Sable'],
    rating: 4.7,
    reviewCount: 22,
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

  await db.collection('categories').deleteMany({ slug: { $nin: categories.map((category) => category.slug) } })
  await db.collection('products').deleteMany({ category: { $nin: categories.map((category) => category.slug) } })

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
