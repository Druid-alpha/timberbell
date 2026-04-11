export async function GET() {
  const db = await (await import('@/lib/db')).getDb()
  const [productsCount, categoriesCount, ordersCount] = await Promise.all([
    db.collection('products').countDocuments(),
    db.collection('categories').countDocuments(),
    db.collection('orders').countDocuments(),
  ])

  return Response.json({
    metrics: {
      products: productsCount,
      categories: categoriesCount,
      orders: ordersCount,
      showroomVisits: 0,
    },
  })
}
