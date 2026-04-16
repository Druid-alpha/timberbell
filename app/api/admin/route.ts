export async function GET() {
  const { isAdminCookieValid, getAdminCookieName } = await import('@/lib/admin')
  const { cookies } = await import('next/headers')
  const cookieStore = await cookies()
  const cookieValue = cookieStore.get(getAdminCookieName())?.value
  if (!isAdminCookieValid(cookieValue)) {
    return Response.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const db = await (await import('@/lib/db')).getDb()
  const [productsCount, categoriesCount, ordersCount, usersCount, adminsCount, recentOrders, recentReviews] = await Promise.all([
    db.collection('products').countDocuments(),
    db.collection('categories').countDocuments(),
    db.collection('orders').countDocuments(),
    db.collection('users').countDocuments(),
    db.collection('users').countDocuments({ role: 'admin' }),
    db.collection('orders').find().sort({ createdAt: -1 }).limit(5).toArray(),
    db.collection('reviews').find().sort({ createdAt: -1 }).limit(5).toArray(),
  ])

  return Response.json({
    metrics: {
      products: productsCount,
      categories: categoriesCount,
      orders: ordersCount,
      users: usersCount,
      admins: adminsCount,
    },
    recentOrders: recentOrders.map(o => ({
      id: o._id,
      customer: o.customer?.name || o.shippingAddress?.fullName || 'Guest',
      total: o.total,
      status: o.status || 'Pending',
      createdAt: o.createdAt
    })),
    recentReviews: recentReviews.map(r => ({
      id: r._id,
      customer: r.customer,
      rating: r.rating,
      message: r.message,
      createdAt: r.createdAt
    }))
  })
}
