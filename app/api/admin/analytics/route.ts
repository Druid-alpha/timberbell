import { NextRequest } from 'next/server'
import { ObjectId } from 'mongodb'
import { isAdminRequest } from '@/lib/admin'

function startOfDay(date: Date) {
  const next = new Date(date)
  next.setHours(0, 0, 0, 0)
  return next
}

function formatDay(date: Date) {
  return date.toLocaleDateString(undefined, { weekday: 'short' })
}

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return Response.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const db = await (await import('@/lib/db')).getDb()
  const orders = await db.collection('orders').find({}).toArray()
  const users = await db.collection('users').find({}).toArray()
  const wishlists = await db.collection('wishlists').find({}).toArray()

  const revenue = orders.reduce((sum, order) => sum + Number(order.total || 0), 0)
  const discountTotal = orders.reduce((sum, order) => sum + Number(order.discountTotal || 0), 0)
  const ordersCount = orders.length
  const avgOrderValue = ordersCount ? Math.round(revenue / ordersCount) : 0
  const couponOrders = orders.filter((order) => order.couponCode).length
  const usersCount = users.length
  const adminsCount = users.filter((user) => user.role === 'admin').length
  const newUsers = users.filter((user) => {
    const created = user.createdAt ? new Date(user.createdAt) : null
    if (!created) return false
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - 7)
    return created >= cutoff
  }).length
  const wishlistItems = wishlists.reduce(
    (sum, list) => sum + (Array.isArray(list.items) ? list.items.length : 0),
    0
  )

  const today = startOfDay(new Date())
  const days = Array.from({ length: 7 }).map((_, index) => {
    const date = new Date(today)
    date.setDate(today.getDate() - (6 - index))
    return date
  })
  const totalsByDay = new Map<string, { revenue: number; orders: number }>()
  days.forEach((day) => totalsByDay.set(day.toDateString(), { revenue: 0, orders: 0 }))

  orders.forEach((order) => {
    if (!order.createdAt) return
    const date = startOfDay(new Date(order.createdAt))
    const key = date.toDateString()
    const entry = totalsByDay.get(key)
    if (!entry) return
    entry.revenue += Number(order.total || 0)
    entry.orders += 1
  })

  const series = days.map((day) => {
    const entry = totalsByDay.get(day.toDateString()) || { revenue: 0, orders: 0 }
    return {
      name: formatDay(day),
      revenue: Math.round(entry.revenue),
      orders: entry.orders,
    }
  })

  const productMap = new Map<string, { name: string; count: number; revenue: number }>()
  orders.forEach((order) => {
    const items = Array.isArray(order.items) ? order.items : []
    items.forEach((item: any) => {
      const id = item.productId ? String(item.productId) : ''
      const name = item.name || id || 'Product'
      if (!id) return
      const entry = productMap.get(id) || { name, count: 0, revenue: 0 }
      entry.count += Number(item.quantity || 0)
      entry.revenue += Number(item.price || 0) * Number(item.quantity || 0)
      productMap.set(id, entry)
    })
  })

  const topProducts = Array.from(productMap.entries())
    .sort((a, b) => b[1].revenue - a[1].revenue)
    .slice(0, 6)
    .map(([id, entry]) => ({ id, ...entry }))

  return Response.json({
    summary: {
      totals: {
        revenue,
        orders: ordersCount,
        avgOrderValue,
        discountTotal,
        couponOrders,
        users: usersCount,
        newUsers,
        admins: adminsCount,
        wishlistItems,
      },
      series,
      topProducts,
    },
  })
}
