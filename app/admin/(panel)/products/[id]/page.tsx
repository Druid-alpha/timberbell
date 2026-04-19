import { redirect } from 'next/navigation'

export default async function AdminProductEditRedirectPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  redirect(`/admin/products?edit=${encodeURIComponent(id)}&view=editor`)
}
