'use client'

import { useEffect, useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'

type ProductImage = {
  url: string
  publicId: string
}

type Variant = {
  id: string
  name: string
  sku?: string
  price?: string
  stockCount?: string
  stockStatus?: 'in_stock' | 'low_stock' | 'out_of_stock' | 'preorder'
  color?: string
  image?: ProductImage | null
  specifications?: string[]
}

type Product = {
  id: string
  name: string
  slug?: string
  price: number
  category: string
  description?: string
  images?: ProductImage[]
  inventoryCount?: number | null
  stockStatus?: 'in_stock' | 'low_stock' | 'out_of_stock' | 'preorder'
  variants?: Variant[]
  createdAt?: string
  discountType?: string
  discountValue?: number
  compareAt?: number
  badge?: string
}

type ProductForm = {
  name: string
  slug: string
  price: string
  category: string
  description: string
  inventoryCount: string
  stockStatus: string
  discountType: string
  discountValue: string
  compareAt: string
  badge: string
}

const emptyForm: ProductForm = {
  name: '',
  slug: '',
  price: '',
  category: '',
  description: '',
  inventoryCount: '',
  stockStatus: 'in_stock',
  discountType: '',
  discountValue: '',
  compareAt: '',
  badge: '',
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<{id:string, slug:string, name:string}[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState<ProductForm>(emptyForm)
  const [images, setImages] = useState<ProductImage[]>([])
  const [variants, setVariants] = useState<Variant[]>([])
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<ProductForm>(emptyForm)
  const [editImages, setEditImages] = useState<ProductImage[]>([])
  const [editVariants, setEditVariants] = useState<Variant[]>([])
  const [editDragIndex, setEditDragIndex] = useState<number | null>(null)
  const [editSaving, setEditSaving] = useState(false)

  async function loadCategories() {
    const res = await fetch('/api/categories', { cache: 'no-store' })
    const json = await res.json().catch(() => ({}))
    setCategories(json?.categories ?? [])
  }

  async function loadProducts() {
    const res = await fetch('/api/admin/products', { cache: 'no-store' })
    const json = await res.json().catch(() => ({}))
    setProducts(json?.products ?? [])
  }

  useEffect(() => {
    let active = true
    async function load() {
      try {
        await loadProducts()
        await loadCategories()
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [])

  async function uploadImage(file: File, onDone: (image: ProductImage) => void) {
    setUploading(true)
    try {
      const signatureRes = await fetch('/api/admin/cloudinary/signature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folder: 'timberbell/products' }),
      })
      const signatureData = await signatureRes.json()
      if (!signatureRes.ok) {
        throw new Error(signatureData?.message || 'Failed to sign upload')
      }

      const formData = new FormData()
      formData.append('file', file)
      formData.append('api_key', signatureData.apiKey)
      formData.append('timestamp', String(signatureData.timestamp))
      formData.append('signature', signatureData.signature)
      formData.append('folder', signatureData.folder)

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${signatureData.cloudName}/image/upload`,
        { method: 'POST', body: formData }
      )
      const uploadJson = await uploadRes.json()
      if (!uploadRes.ok) {
        throw new Error(uploadJson?.error?.message || 'Upload failed')
      }

      onDone({ url: uploadJson.secure_url, publicId: uploadJson.public_id })
    } catch (err: any) {
      setError(err?.message || 'Image upload failed')
    } finally {
      setUploading(false)
    }
  }

  async function handleCreateSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setSaving(true)
    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim() || undefined,
      price: Number(form.price),
      category: form.category.trim(),
      description: form.description.trim(),
      inventoryCount: form.inventoryCount ? Number(form.inventoryCount) : null,
      stockStatus: form.stockStatus || 'in_stock',
      discountType: form.discountType || undefined,
      discountValue: form.discountValue ? Number(form.discountValue) : undefined,
      compareAt: form.compareAt ? Number(form.compareAt) : undefined,
      badge: form.badge || undefined,
      materials: form.materials.split(',').map((x) => x.trim()).filter(Boolean),
      finishes: form.finishes.split(',').map((x) => x.trim()).filter(Boolean),
      palette: variants.map(v => v.color).filter(Boolean),
      images,
      variants: variants.map((variant) => ({
        ...variant,
        price: variant.price ? Number(variant.price) : undefined,
        stockCount: variant.stockCount ? Number(variant.stockCount) : undefined,
      })),
    }
    const res = await fetch('/api/admin/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    setSaving(false)
    if (!res.ok) {
      const json = await res.json().catch(() => ({}))
      setError(json?.message || 'Failed to add product')
      return
    }
    setForm(emptyForm)
    setImages([])
    setVariants([])
    await loadProducts()
  }

  function beginEdit(product: Product) {
    setEditingId(product.id)
    setEditForm({
      name: product.name ?? '',
      slug: product.slug ?? '',
      price: String(product.price ?? ''),
      category: product.category ?? '',
      description: product.description ?? '',
      inventoryCount: product.inventoryCount ? String(product.inventoryCount) : '',
      stockStatus: product.stockStatus ?? 'in_stock',
      discountType: product.discountType ?? '',
      discountValue: product.discountValue ? String(product.discountValue) : '',
      compareAt: product.compareAt ? String(product.compareAt) : '',
      badge: product.badge ?? '',
      materials: product.materials?.join(', ') ?? '',
      finishes: product.finishes?.join(', ') ?? '',
    })
    setEditImages(product.images ?? [])
    setEditVariants(product.variants ?? [])
  }

  async function handleEditSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!editingId) return
    setEditSaving(true)
    const payload = {
      name: editForm.name.trim(),
      slug: editForm.slug.trim() || undefined,
      price: Number(editForm.price),
      category: editForm.category.trim(),
      description: editForm.description.trim(),
      inventoryCount: editForm.inventoryCount ? Number(editForm.inventoryCount) : null,
      stockStatus: editForm.stockStatus || 'in_stock',
      discountType: editForm.discountType || undefined,
      discountValue: editForm.discountValue ? Number(editForm.discountValue) : undefined,
      compareAt: editForm.compareAt ? Number(editForm.compareAt) : undefined,
      badge: editForm.badge || undefined,
      materials: editForm.materials.split(',').map((x) => x.trim()).filter(Boolean),
      finishes: editForm.finishes.split(',').map((x) => x.trim()).filter(Boolean),
      palette: editVariants.map(v => v.color).filter(Boolean),
      images: editImages,
      variants: editVariants.map((variant) => ({
        ...variant,
        price: variant.price ? Number(variant.price) : undefined,
        stockCount: variant.stockCount ? Number(variant.stockCount) : undefined,
      })),
    }
    const res = await fetch(`/api/admin/products/${editingId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    setEditSaving(false)
    if (!res.ok) {
      const json = await res.json().catch(() => ({}))
      setError(json?.message || 'Failed to update product')
      return
    }
    setEditingId(null)
    await loadProducts()
  }

  async function handleDelete(id: string) {
    const confirmed = confirm('Delete this product? This will remove its images too.')
    if (!confirmed) return
    await fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
    await loadProducts()
  }

  function reorder<T>(list: T[], from: number, to: number) {
    const next = [...list]
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)
    return next
  }

  function addVariant(setter: Dispatch<SetStateAction<Variant[]>>) {
    setter((prev) => [
      ...prev,
      {
        id: `var-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name: '',
        sku: '',
        price: '',
        stockCount: '',
        stockStatus: 'in_stock',
        color: '',
        image: null,
        specifications: [],
      },
    ])
  }

  function updateVariant(
    setter: Dispatch<SetStateAction<Variant[]>>,
    id: string,
    updates: Partial<Variant>
  ) {
    setter((prev) => prev.map((variant) => (variant.id === id ? { ...variant, ...updates } : variant)))
  }

  function removeVariant(setter: Dispatch<SetStateAction<Variant[]>>, id: string) {
    setter((prev) => prev.filter((variant) => variant.id !== id))
  }

  async function uploadVariantImage(
    file: File,
    setter: Dispatch<SetStateAction<Variant[]>>,
    id: string
  ) {
    await uploadImage(file, (image) => {
      updateVariant(setter, id, { image })
    })
  }

  return (
    <div className="space-y-8">
      <div className="rounded-[32px] border border-[#E6D9C8] bg-[#F4EEE4] p-6 shadow-[0_24px_60px_-45px_rgba(55,32,15,0.45)]">
        <p className="text-[10px] uppercase tracking-[0.35em] text-[#8C7A6B]">Timberbell Studio</p>
        <h1 className="mt-3 font-display text-3xl text-[#2B2119]">Product Command Center</h1>
        <p className="mt-2 text-sm text-[#6B594A]">
          Build premium listings with rich imagery, variants, and stock-ready details for a world‑class catalog.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[32px] border border-[#E6D9C8] bg-white/80 p-6 shadow-[0_18px_40px_-30px_rgba(55,32,15,0.35)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-[#8C7A6B]">Add product</p>
              <h2 className="mt-2 font-display text-2xl text-[#2B2119]">Create a new piece</h2>
            </div>
            <span className="rounded-full border border-[#E6D9C8] bg-white px-3 py-2 text-[10px] uppercase tracking-[0.3em] text-[#8C7A6B]">
              Form v2
            </span>
          </div>
          <form onSubmit={handleCreateSubmit} className="mt-6 space-y-6">
            <div className="grid gap-4">
              <div>
                <label className="text-[10px] uppercase tracking-[0.3em] text-[#8C7A6B]">Name</label>
                <input
                  value={form.name}
                  onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                  placeholder="Product name"
                  className="mt-2 h-11 w-full rounded-full border border-[#E6D9C8] bg-white px-4 text-sm"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-[10px] uppercase tracking-[0.3em] text-[#8C7A6B]">Slug</label>
                  <input
                    value={form.slug}
                    onChange={(event) => setForm((prev) => ({ ...prev, slug: event.target.value }))}
                    placeholder="Slug (optional)"
                    className="mt-2 h-11 w-full rounded-full border border-[#E6D9C8] bg-white px-4 text-sm"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-[0.3em] text-[#8C7A6B]">Category</label>
                  <input
                    value={form.category}
                    onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))}
                    placeholder="Category"
                    className="mt-2 h-11 w-full rounded-full border border-[#E6D9C8] bg-white px-4 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-[0.3em] text-[#8C7A6B]">Story</label>
                <textarea
                  value={form.description}
                  onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                  placeholder="Short description"
                  className="mt-2 min-h-[110px] w-full rounded-3xl border border-[#E6D9C8] bg-white px-4 py-3 text-sm"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="text-[10px] uppercase tracking-[0.3em] text-[#8C7A6B]">Price</label>
                <input
                  value={form.price}
                  onChange={(event) => setForm((prev) => ({ ...prev, price: event.target.value }))}
                  placeholder="Price"
                  type="number"
                  className="mt-2 h-11 w-full rounded-full border border-[#E6D9C8] bg-white px-4 text-sm"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-[0.3em] text-[#8C7A6B]">Inventory</label>
                <input
                  value={form.inventoryCount}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, inventoryCount: event.target.value }))
                  }
                  placeholder="Inventory count"
                  type="number"
                  className="mt-2 h-11 w-full rounded-full border border-[#E6D9C8] bg-white px-4 text-sm"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-[0.3em] text-[#8C7A6B]">Stock</label>
                <select
                  value={form.stockStatus}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, stockStatus: event.target.value }))
                  }
                  className="mt-2 h-11 w-full rounded-full border border-[#E6D9C8] bg-white px-4 text-sm"
                >
                  <option value="in_stock">In stock</option>
                  <option value="low_stock">Low stock</option>
                  <option value="out_of_stock">Out of stock</option>
                  <option value="preorder">Preorder</option>
                </select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-4">
              <div>
                <label className="text-[10px] uppercase tracking-[0.3em] text-[#8C7A6B]">Discount Type</label>
                <select
                  value={form.discountType}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, discountType: event.target.value }))
                  }
                  className="mt-2 h-11 w-full rounded-full border border-[#E6D9C8] bg-white px-4 text-sm"
                >
                  <option value="">None</option>
                  <option value="percentage">Percentage</option>
                  <option value="flat">Flat amount</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-[0.3em] text-[#8C7A6B]">Discount Val</label>
                <input
                  value={form.discountValue}
                  onChange={(event) => setForm((prev) => ({ ...prev, discountValue: event.target.value }))}
                  placeholder="e.g. 15"
                  type="number"
                  className="mt-2 h-11 w-full rounded-full border border-[#E6D9C8] bg-white px-4 text-sm"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-[0.3em] text-[#8C7A6B]">Compare At</label>
                <input
                  value={form.compareAt}
                  onChange={(event) => setForm((prev) => ({ ...prev, compareAt: event.target.value }))}
                  placeholder="Original price"
                  type="number"
                  className="mt-2 h-11 w-full rounded-full border border-[#E6D9C8] bg-white px-4 text-sm"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-[0.3em] text-[#8C7A6B]">Badge</label>
                <input
                  value={form.badge}
                  onChange={(event) => setForm((prev) => ({ ...prev, badge: event.target.value }))}
                  placeholder="e.g. New, Sale"
                  className="mt-2 h-11 w-full rounded-full border border-[#E6D9C8] bg-white px-4 text-sm"
                />
              </div>
            </div>

            <div className="rounded-3xl border border-dashed border-[#E6D9C8] bg-[#F4EEE4] p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-[#8C7A6B]">Images</p>
                  <p className="text-sm text-[#6B665A]">Upload product imagery to Cloudinary (Max 3).</p>
                </div>
                <label className={`inline-flex items-center rounded-full border px-4 py-2 text-[10px] font-bold uppercase tracking-[0.3em] ${images.length >= 3 || uploading ? 'border-[#E6D9C8] text-[#8C7A6B] opacity-50 cursor-not-allowed' : 'border-[#7C4E2F] text-[#2B2119] cursor-pointer'}`}>
                  {uploading ? 'Uploading...' : images.length >= 3 ? 'Limit reached' : 'Upload'}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploading || images.length >= 3}
                    onChange={(event) => {
                      const file = event.target.files?.[0]
                      if (!file) return
                      uploadImage(file, (image) => setImages((prev) => [...prev, image]))
                      event.target.value = ''
                    }}
                  />
                </label>
              </div>
              {images.length ? (
                <div className="mt-4 flex flex-wrap gap-3">
                  {images.map((img, index) => (
                    <div
                      key={img.publicId}
                      className="relative cursor-grab"
                      draggable
                      onDragStart={() => setDragIndex(index)}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={() => {
                        if (dragIndex === null || dragIndex === index) return
                        setImages((prev) => reorder(prev, dragIndex, index))
                        setDragIndex(null)
                      }}
                      onDragEnd={() => setDragIndex(null)}
                    >
                      <img src={img.url} alt="Upload" className="h-20 w-20 rounded-2xl object-cover" />
                      <button
                        type="button"
                        onClick={() =>
                          setImages((prev) => prev.filter((item) => item.publicId !== img.publicId))
                        }
                        className="absolute -right-2 -top-2 rounded-full bg-white px-2 py-1 text-[10px] text-[#2B2119]"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="rounded-3xl border border-dashed border-[#E6D9C8] bg-[#F4EEE4] p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-[#8C7A6B]">Variants</p>
                  <p className="text-sm text-[#6B665A]">
                    Add color, image, and specifications for each variant.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => addVariant(setVariants)}
                  className="rounded-full border border-[#7C4E2F] px-4 py-2 text-[10px] font-bold uppercase tracking-[0.3em] text-[#2B2119]"
                >
                  Add variant
                </button>
              </div>

              {variants.length ? (
                <div className="mt-4 space-y-4">
                  {variants.map((variant) => (
                    <div
                      key={variant.id}
                      className="rounded-2xl border border-[#E6D9C8] bg-white/80 p-4"
                    >
                      <div className="grid gap-4 sm:grid-cols-2 lg:flex lg:items-center lg:gap-3">
                        <input
                          value={variant.name}
                          onChange={(event) =>
                            updateVariant(setVariants, variant.id, { name: event.target.value })
                          }
                          placeholder="Variant name"
                          className="h-10 w-full rounded-full border border-[#E6D9C8] bg-white px-4 text-sm lg:flex-1"
                        />
                        <input
                          value={variant.sku ?? ''}
                          onChange={(event) =>
                            updateVariant(setVariants, variant.id, { sku: event.target.value })
                          }
                          placeholder="SKU"
                          className="h-10 w-full rounded-full border border-[#E6D9C8] bg-white px-4 text-sm lg:w-36"
                        />
                        <input
                          value={variant.price ?? ''}
                          onChange={(event) =>
                            updateVariant(setVariants, variant.id, { price: event.target.value })
                          }
                          placeholder="Price"
                          type="number"
                          className="h-10 w-full rounded-full border border-[#E6D9C8] bg-white px-4 text-sm lg:w-32"
                        />
                        <input
                          value={variant.stockCount ?? ''}
                          onChange={(event) =>
                            updateVariant(setVariants, variant.id, { stockCount: event.target.value })
                          }
                          placeholder="Stock"
                          type="number"
                          className="h-10 w-full rounded-full border border-[#E6D9C8] bg-white px-4 text-sm lg:w-28"
                        />
                        <select
                          value={variant.stockStatus ?? 'in_stock'}
                          onChange={(event) =>
                            updateVariant(setVariants, variant.id, {
                              stockStatus: event.target.value as Variant['stockStatus'],
                            })
                          }
                          className="h-10 w-full rounded-full border border-[#E6D9C8] bg-white px-4 text-sm lg:w-36"
                        >
                          <option value="in_stock">In stock</option>
                          <option value="low_stock">Low stock</option>
                          <option value="out_of_stock">Out of stock</option>
                          <option value="preorder">Preorder</option>
                        </select>
                        <input
                          value={variant.color ?? ''}
                          onChange={(event) =>
                            updateVariant(setVariants, variant.id, { color: event.target.value })
                          }
                          placeholder="Color"
                          className="h-10 w-full rounded-full border border-[#E6D9C8] bg-white px-4 text-sm lg:w-40"
                        />
                        <button
                          type="button"
                          onClick={() => removeVariant(setVariants, variant.id)}
                          className="w-full rounded-full border border-red-300 px-3 py-2 text-[10px] uppercase tracking-[0.3em] text-red-600 lg:w-auto"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-3">
                        <label className="inline-flex cursor-pointer items-center rounded-full border border-[#7C4E2F] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.3em] text-[#2B2119]">
                          {uploading ? 'Uploading...' : 'Upload image'}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            disabled={uploading}
                            onChange={(event) => {
                              const file = event.target.files?.[0]
                              if (!file) return
                              uploadVariantImage(file, setVariants, variant.id)
                              event.target.value = ''
                            }}
                          />
                        </label>
                        {variant.image?.url ? (
                          <img
                            src={variant.image.url}
                            alt=""
                            className="h-14 w-14 rounded-2xl object-cover"
                          />
                        ) : null}
                      </div>

                      <textarea
                        value={(variant.specifications ?? []).join('\n')}
                        onChange={(event) =>
                          updateVariant(setVariants, variant.id, {
                            specifications: event.target.value
                              .split('\n')
                              .map((line) => line.trim())
                              .filter(Boolean),
                          })
                        }
                        placeholder="Specifications (one per line)"
                        className="mt-3 min-h-[80px] w-full rounded-3xl border border-[#E6D9C8] bg-white px-4 py-3 text-sm"
                      />
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <button
              type="submit"
              disabled={saving}
              className="h-11 w-full rounded-full bg-[#7C4E2F] text-xs font-bold uppercase tracking-[0.3em] text-white transition hover:bg-[#6A3F24] disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Add product'}
            </button>
          </form>
        </div>

        <div className="space-y-6">
          <div className="rounded-[32px] border border-[#E6D9C8] bg-[#F4EEE4] p-6 shadow-[0_18px_40px_-30px_rgba(55,32,15,0.35)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-[#8C7A6B]">Live preview</p>
                <h2 className="mt-2 font-display text-2xl text-[#2B2119]">How it will look</h2>
              </div>
              <span className="text-[10px] uppercase tracking-[0.3em] text-[#8C7A6B]">Timberbell</span>
            </div>
            <div className="mt-6 overflow-hidden rounded-[24px] border border-[#E6D9C8] bg-white">
              <div className="h-44 w-full bg-[#EFE6DA]">
                {images[0]?.url ? (
                  <img src={images[0].url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs uppercase tracking-[0.3em] text-[#8C7A6B]">
                    Add image
                  </div>
                )}
              </div>
              <div className="space-y-2 p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-[#2B2119]">
                    {form.name.trim() || 'New Timberbell Piece'}
                  </div>
                  <div className="text-sm font-semibold text-[#2B2119]">
                    {form.price ? `$${Number(form.price).toLocaleString()}` : '$0'}
                  </div>
                </div>
                <div className="text-[10px] uppercase tracking-[0.3em] text-[#8C7A6B]">
                  {form.category.trim() || 'Category'}
                </div>
                <p className="text-sm text-[#6B665A] line-clamp-2">
                  {form.description.trim() ||
                    'A clean, refined Timberbell description will appear here once you add it.'}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[32px] border border-[#E6D9C8] bg-white/80 p-6 shadow-[0_18px_40px_-30px_rgba(55,32,15,0.35)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-[#8C7A6B]">Catalog</p>
                <h2 className="mt-2 font-display text-2xl text-[#2B2119]">Latest products</h2>
              </div>
              <span className="text-[10px] uppercase tracking-[0.3em] text-[#8C7A6B]">
                {products.length} items
              </span>
            </div>
          <div className="mt-6 space-y-4">
            {loading ? (
              <div className="rounded-2xl border border-[#E6D9C8] bg-[#F4EEE4] p-4 text-sm text-[#6B665A]">
                Loading products...
              </div>
            ) : products.length ? (
              products.map((product) => (
                <div
                  key={product.id}
                  className="rounded-3xl border border-[#E6D9C8] bg-[#F4EEE4] p-5 shadow-sm"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="text-sm font-semibold text-[#2B2119]">
                        {product.name}
                      </div>
                      <div className="text-[10px] uppercase tracking-[0.3em] text-[#8C7A6B]">
                        {product.category}
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-[#2B2119]">
                      ${product.price}
                    </div>
                  </div>
                  {product.description ? (
                    <p className="mt-3 text-sm text-[#6B665A] line-clamp-2">
                      {product.description}
                    </p>
                  ) : null}
                  <div className="mt-3 flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.3em] text-[#8C7A6B]">
                    <span>Stock: {product.inventoryCount ?? '-'}</span>
                    <span>Status: {product.stockStatus ?? 'in_stock'}</span>
                  </div>
                  {product.images?.length ? (
                    <div className="mt-3 flex gap-2">
                      {product.images.slice(0, 3).map((img) => (
                        <img key={img.publicId} src={img.url} alt="" className="h-12 w-12 rounded-xl object-cover" />
                      ))}
                    </div>
                  ) : null}
                  <div className="mt-4 flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.3em]">
                    <button
                      type="button"
                      onClick={() => beginEdit(product)}
                      className="rounded-full border border-[#7C4E2F] px-3 py-2 text-[#2B2119]"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(product.id)}
                      className="rounded-full border border-red-300 px-3 py-2 text-red-600"
                    >
                      Delete
                    </button>
                  </div>

                  {editingId === product.id ? (
                    <form onSubmit={handleEditSubmit} className="mt-4 space-y-3">
                      <input
                        value={editForm.name}
                        onChange={(event) =>
                          setEditForm((prev) => ({ ...prev, name: event.target.value }))
                        }
                        placeholder="Product name"
                        className="h-10 w-full rounded-full border border-[#E6D9C8] bg-white px-4 text-sm"
                      />
                      <input
                        value={editForm.slug}
                        onChange={(event) =>
                          setEditForm((prev) => ({ ...prev, slug: event.target.value }))
                        }
                        placeholder="Slug"
                        className="h-10 w-full rounded-full border border-[#E6D9C8] bg-white px-4 text-sm"
                      />
                      <div className="grid gap-3 sm:grid-cols-2">
                        <input
                          value={editForm.price}
                          onChange={(event) =>
                            setEditForm((prev) => ({ ...prev, price: event.target.value }))
                          }
                          placeholder="Price"
                          type="number"
                          className="h-10 w-full rounded-full border border-[#E6D9C8] bg-white px-4 text-sm"
                        />
                        <input
                          value={editForm.category}
                          onChange={(event) =>
                            setEditForm((prev) => ({ ...prev, category: event.target.value }))
                          }
                          placeholder="Category"
                          className="h-10 w-full rounded-full border border-[#E6D9C8] bg-white px-4 text-sm"
                        />
                      </div>
                      <textarea
                        value={editForm.description}
                        onChange={(event) =>
                          setEditForm((prev) => ({ ...prev, description: event.target.value }))
                        }
                        placeholder="Description"
                        className="min-h-[88px] w-full rounded-3xl border border-[#E6D9C8] bg-white px-4 py-3 text-sm"
                      />
                      <div className="grid gap-3 sm:grid-cols-2">
                        <input
                          value={editForm.inventoryCount}
                          onChange={(event) =>
                            setEditForm((prev) => ({ ...prev, inventoryCount: event.target.value }))
                          }
                          placeholder="Inventory count"
                          type="number"
                          className="h-10 w-full rounded-full border border-[#E6D9C8] bg-white px-4 text-sm"
                        />
                        <select
                          value={editForm.stockStatus}
                          onChange={(event) =>
                            setEditForm((prev) => ({ ...prev, stockStatus: event.target.value }))
                          }
                          className="h-10 w-full rounded-full border border-[#E6D9C8] bg-white px-4 text-sm"
                        >
                          <option value="in_stock">In stock</option>
                          <option value="low_stock">Low stock</option>
                          <option value="out_of_stock">Out of stock</option>
                          <option value="preorder">Preorder</option>
                        </select>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-4">
                        <select
                          value={editForm.discountType}
                          onChange={(event) =>
                            setEditForm((prev) => ({ ...prev, discountType: event.target.value }))
                          }
                          className="h-10 w-full rounded-full border border-[#E6D9C8] bg-white px-4 text-sm"
                        >
                          <option value="">No discount</option>
                          <option value="percentage">Percentage</option>
                          <option value="flat">Flat</option>
                        </select>
                        <input
                          value={editForm.discountValue}
                          onChange={(event) =>
                            setEditForm((prev) => ({ ...prev, discountValue: event.target.value }))
                          }
                          placeholder="Discount value"
                          type="number"
                          className="h-10 w-full rounded-full border border-[#E6D9C8] bg-white px-4 text-sm"
                        />
                        <input
                          value={editForm.compareAt}
                          onChange={(event) =>
                            setEditForm((prev) => ({ ...prev, compareAt: event.target.value }))
                          }
                          placeholder="Compare-At"
                          type="number"
                          className="h-10 w-full rounded-full border border-[#E6D9C8] bg-white px-4 text-sm"
                        />
                        <input
                          value={editForm.badge}
                          onChange={(event) =>
                            setEditForm((prev) => ({ ...prev, badge: event.target.value }))
                          }
                          placeholder="Badge"
                          className="h-10 w-full rounded-full border border-[#E6D9C8] bg-white px-4 text-sm"
                        />
                      </div>
                      <div className="rounded-3xl border border-dashed border-[#E6D9C8] bg-white/70 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="text-xs uppercase tracking-[0.3em] text-[#8C7A6B]">
                            Images (Max 3)
                          </div>
                          <label className={`inline-flex items-center rounded-full border px-3 py-2 text-[10px] font-bold uppercase tracking-[0.3em] ${editImages.length >= 3 || uploading ? 'border-[#E6D9C8] text-[#8C7A6B] opacity-50 cursor-not-allowed' : 'border-[#7C4E2F] text-[#2B2119] cursor-pointer'}`}>
                            {uploading ? 'Uploading...' : editImages.length >= 3 ? 'Limit reached' : 'Upload'}
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              disabled={uploading || editImages.length >= 3}
                              onChange={(event) => {
                                const file = event.target.files?.[0]
                                if (!file) return
                                uploadImage(file, (image) =>
                                  setEditImages((prev) => [...prev, image])
                                )
                                event.target.value = ''
                              }}
                            />
                          </label>
                        </div>
                        {editImages.length ? (
                          <div className="mt-4 flex flex-wrap gap-3">
                            {editImages.map((img, index) => (
                              <div
                                key={img.publicId}
                                className="relative cursor-grab"
                                draggable
                                onDragStart={() => setEditDragIndex(index)}
                                onDragOver={(event) => event.preventDefault()}
                                onDrop={() => {
                                  if (editDragIndex === null || editDragIndex === index) return
                                  setEditImages((prev) => reorder(prev, editDragIndex, index))
                                  setEditDragIndex(null)
                                }}
                                onDragEnd={() => setEditDragIndex(null)}
                              >
                                <img src={img.url} alt="Upload" className="h-16 w-16 rounded-2xl object-cover" />
                                <button
                                  type="button"
                                  onClick={() =>
                                    setEditImages((prev) =>
                                      prev.filter((item) => item.publicId !== img.publicId)
                                    )
                                  }
                                  className="absolute -right-2 -top-2 rounded-full bg-white px-2 py-1 text-[10px] text-[#2B2119]"
                                >
                                  Remove
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : null}
                      </div>

                      <div className="rounded-3xl border border-dashed border-[#E6D9C8] bg-white/70 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="text-xs uppercase tracking-[0.3em] text-[#8C7A6B]">
                            Variants
                          </div>
                          <button
                            type="button"
                            onClick={() => addVariant(setEditVariants)}
                            className="rounded-full border border-[#7C4E2F] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.3em] text-[#2B2119]"
                          >
                            Add variant
                          </button>
                        </div>
                        {editVariants.length ? (
                          <div className="mt-4 space-y-4">
                            {editVariants.map((variant) => (
                              <div
                                key={variant.id}
                                className="rounded-2xl border border-[#E6D9C8] bg-white p-4"
                              >
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <input
                                    value={variant.name}
                                    onChange={(event) =>
                                      updateVariant(setEditVariants, variant.id, {
                                        name: event.target.value,
                                      })
                                    }
                                    placeholder="Variant name"
                                    className="h-10 flex-1 rounded-full border border-[#E6D9C8] bg-white px-4 text-sm"
                                  />
                                  <input
                                    value={variant.sku ?? ''}
                                    onChange={(event) =>
                                      updateVariant(setEditVariants, variant.id, {
                                        sku: event.target.value,
                                      })
                                    }
                                    placeholder="SKU"
                                    className="h-10 w-36 rounded-full border border-[#E6D9C8] bg-white px-4 text-sm"
                                  />
                                  <input
                                    value={variant.price ?? ''}
                                    onChange={(event) =>
                                      updateVariant(setEditVariants, variant.id, {
                                        price: event.target.value,
                                      })
                                    }
                                    placeholder="Variant price"
                                    type="number"
                                    className="h-10 w-32 rounded-full border border-[#E6D9C8] bg-white px-4 text-sm"
                                  />
                                  <input
                                    value={variant.stockCount ?? ''}
                                    onChange={(event) =>
                                      updateVariant(setEditVariants, variant.id, {
                                        stockCount: event.target.value,
                                      })
                                    }
                                    placeholder="Stock count"
                                    type="number"
                                    className="h-10 w-28 rounded-full border border-[#E6D9C8] bg-white px-4 text-sm"
                                  />
                                  <select
                                    value={variant.stockStatus ?? 'in_stock'}
                                    onChange={(event) =>
                                      updateVariant(setEditVariants, variant.id, {
                                        stockStatus: event.target.value as Variant['stockStatus'],
                                      })
                                    }
                                    className="h-10 w-36 rounded-full border border-[#E6D9C8] bg-white px-4 text-sm"
                                  >
                                    <option value="in_stock">In stock</option>
                                    <option value="low_stock">Low stock</option>
                                    <option value="out_of_stock">Out of stock</option>
                                    <option value="preorder">Preorder</option>
                                  </select>
                                  <input
                                    value={variant.color ?? ''}
                                    onChange={(event) =>
                                      updateVariant(setEditVariants, variant.id, {
                                        color: event.target.value,
                                      })
                                    }
                                    placeholder="Color"
                                    className="h-10 w-40 rounded-full border border-[#E6D9C8] bg-white px-4 text-sm"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => removeVariant(setEditVariants, variant.id)}
                                    className="rounded-full border border-red-300 px-3 py-2 text-[10px] uppercase tracking-[0.3em] text-red-600"
                                  >
                                    Remove
                                  </button>
                                </div>

                                <div className="mt-3 flex flex-wrap items-center gap-3">
                                  <label className="inline-flex cursor-pointer items-center rounded-full border border-[#7C4E2F] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.3em] text-[#2B2119]">
                                    {uploading ? 'Uploading...' : 'Upload image'}
                                    <input
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      disabled={uploading}
                                      onChange={(event) => {
                                        const file = event.target.files?.[0]
                                        if (!file) return
                                        uploadVariantImage(file, setEditVariants, variant.id)
                                        event.target.value = ''
                                      }}
                                    />
                                  </label>
                                  {variant.image?.url ? (
                                    <img
                                      src={variant.image.url}
                                      alt=""
                                      className="h-12 w-12 rounded-2xl object-cover"
                                    />
                                  ) : null}
                                </div>

                                <textarea
                                  value={(variant.specifications ?? []).join('\n')}
                                  onChange={(event) =>
                                    updateVariant(setEditVariants, variant.id, {
                                      specifications: event.target.value
                                        .split('\n')
                                        .map((line) => line.trim())
                                        .filter(Boolean),
                                    })
                                  }
                                  placeholder="Specifications (one per line)"
                                  className="mt-3 min-h-[80px] w-full rounded-3xl border border-[#E6D9C8] bg-white px-4 py-3 text-sm"
                                />
                              </div>
                            ))}
                          </div>
                        ) : null}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="submit"
                          disabled={editSaving}
                          className="rounded-full bg-[#7C4E2F] px-4 py-2 text-[10px] font-bold uppercase tracking-[0.3em] text-white"
                        >
                          {editSaving ? 'Saving...' : 'Save changes'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="rounded-full border border-[#E6D9C8] px-4 py-2 text-[10px] uppercase tracking-[0.3em] text-[#8C7A6B]"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : null}
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-[#E6D9C8] bg-[#F4EEE4] p-4 text-sm text-[#6B665A]">
                No products yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
)
}



