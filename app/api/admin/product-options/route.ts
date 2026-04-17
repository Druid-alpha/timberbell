import { NextRequest } from 'next/server'
import { isAdminRequest } from '@/lib/admin'

function uniqueStrings(values: unknown[]) {
  return Array.from(
    new Set(
      values
        .flatMap((value) => (Array.isArray(value) ? value : [value]))
        .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
        .map((value) => value.trim())
    )
  ).sort()
}

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return Response.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const db = await (await import('@/lib/db')).getDb()
  const products = await db
    .collection('products')
    .find({}, { projection: { badge: 1, materials: 1, finishes: 1, leadTime: 1, palette: 1, variants: 1 } })
    .toArray()

  const colors = uniqueStrings(
    products.flatMap((product) => [
      ...(Array.isArray(product.palette) ? product.palette : []),
      ...(Array.isArray(product.variants)
        ? product.variants.map((variant: any) => variant?.color).filter(Boolean)
        : []),
    ])
  )

  return Response.json({
    options: {
      badges: uniqueStrings(products.map((product) => product.badge)),
      materials: uniqueStrings([
        ...products.map((product) => product.materials),
        ...products.flatMap((product) =>
          Array.isArray(product.variants) ? product.variants.map((variant: any) => variant?.materials) : []
        ),
      ]),
      finishes: uniqueStrings([
        ...products.map((product) => product.finishes),
        ...products.flatMap((product) =>
          Array.isArray(product.variants) ? product.variants.map((variant: any) => variant?.finishes) : []
        ),
      ]),
      leadTimes: uniqueStrings(products.map((product) => product.leadTime)),
      colors,
    },
  })
}
