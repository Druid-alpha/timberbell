export async function GET() {
  const { isAdminCookieValid, getAdminCookieName } = await import('@/lib/admin')
  const { cookies } = await import('next/headers')
  const cookieStore = await cookies()
  const cookieValue = cookieStore.get(getAdminCookieName())?.value
  if (!isAdminCookieValid(cookieValue)) {
    return Response.json({ message: 'Unauthorized' }, { status: 401 })
  }

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
