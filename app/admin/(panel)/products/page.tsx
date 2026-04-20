'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { formatMoney } from '@/lib/utils/format'
import { getOptimizedImageUrl } from '@/lib/utils/image'

type ProductImage = {
  url: string
  publicId: string
}

type Variant = {
  id: string
  name: string
  sku?: string
  price?: string
  discountType?: string
  discountValue?: string
  stockCount?: string
  stockStatus?: 'in_stock' | 'low_stock' | 'out_of_stock' | 'preorder'
  color?: string
  image?: ProductImage | null
  materials?: string[]
  finishes?: string[]
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
  badge?: string
  materials?: string[]
  finishes?: string[]
  palette?: string[]
  leadTime?: string
  dimensions?: string
  finalPrice?: number
}

type QuickUpdateState = {
  id: string
  name: string
  price: string
  inventoryCount: string
  discountType: string
  discountValue: string
  variants: VariantQuickUpdateState[]
}

type VariantQuickUpdateState = {
  productId: string
  variantId: string
  productName: string
  name: string
  sku: string
  color: string
  price: string
  discountType: string
  discountValue: string
  stockCount: string
  stockStatus: NonNullable<Variant['stockStatus']>
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
  badge: string
  materials: string
  finishes: string
  leadTime: string
  dimensions: string
}

type ProductPayload = {
  name: string
  slug: string
  price: number
  category: string
  description: string
  inventoryCount: number | null
  stockStatus: string
  discountType: string | null
  discountValue: number | null
  badge: string | null
  materials: string[]
  finishes: string[]
  leadTime: string | null
  dimensions: string | null
  palette: string[]
  images: ProductImage[]
  variants: Array<{
    id: string
    name: string
    sku?: string
    price?: number
    discountType?: string
    discountValue?: number
    stockCount?: number
    stockStatus?: Variant['stockStatus']
    color?: string
    image?: ProductImage | null
    materials?: string[]
    finishes?: string[]
    specifications?: string[]
  }>
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
  badge: '',
  materials: '',
  finishes: '',
  leadTime: '',
  dimensions: '',
}

const defaultPalette = ['#f4e7d2', '#eab38b', '#c59a6b']

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function normalizeTextList(value: string) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function deepEqual(left: unknown, right: unknown) {
  return JSON.stringify(left) === JSON.stringify(right)
}

function dedupeImages(items: ProductImage[]) {
  const seen = new Set<string>()
  return items.filter((item) => {
    const key = item.publicId || item.url
    if (!key || seen.has(key)) return false
    seen.add(key)
    return true
  })
}
function createVariant(): Variant {
  return {
    id: `variant-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: '',
    sku: '',
    price: '',
    discountType: '',
    discountValue: '',
    stockCount: '',
    stockStatus: 'in_stock',
    color: '#c59a6b',
    image: null,
    materials: [],
    finishes: [],
    specifications: [],
  }
}

export default function AdminProductsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editParam = searchParams.get('edit') || ''
  const editorMode = searchParams.get('view') === 'editor'
  const [products, setProducts] = useState<Product[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [categories, setCategories] = useState<{id:string, slug:string, name:string}[]>([])
  const [optionSets, setOptionSets] = useState<{ badges: string[]; materials: string[]; finishes: string[]; leadTimes: string[]; colors: string[] }>({
    badges: [],
    materials: [],
    finishes: [],
    leadTimes: [],
    colors: [],
  })
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState<ProductForm>(emptyForm)
  const [images, setImages] = useState<ProductImage[]>([])
  const [palette, setPalette] = useState<string[]>(defaultPalette)
  const [variants, setVariants] = useState<Variant[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [baselinePayload, setBaselinePayload] = useState<ProductPayload | null>(null)
  const [loadingEditor, setLoadingEditor] = useState(false)
  const [quickUpdate, setQuickUpdate] = useState<QuickUpdateState | null>(null)
  const [variantQuickUpdate, setVariantQuickUpdate] = useState<VariantQuickUpdateState | null>(null)
  const [quickSaving, setQuickSaving] = useState(false)
  const materialOptions = useMemo(() => optionSets.materials, [optionSets.materials])
  const finishOptions = useMemo(() => optionSets.finishes, [optionSets.finishes])
  const badgeOptions = useMemo(() => optionSets.badges, [optionSets.badges])
  const leadTimeOptions = useMemo(() => optionSets.leadTimes, [optionSets.leadTimes])
  const colorOptions = useMemo(() => optionSets.colors, [optionSets.colors])
  const finalPreviewPrice = useMemo(() => {
    const basePrice = Number(form.price) || 0
    const discountValue = Number(form.discountValue) || 0
    if (form.discountType === 'percentage' && discountValue > 0) {
      return Math.max(basePrice - (basePrice * discountValue) / 100, 0)
    }
    if (form.discountType === 'fixed' && discountValue > 0) {
      return Math.max(basePrice - discountValue, 0)
    }
    return basePrice || 0
  }, [form.discountType, form.discountValue, form.price])
  const isSlugSuggested = slugify(form.name) === form.slug
  const totalPages = Math.max(1, Math.ceil(total / 12))
  const isStandaloneEdit = editorMode && Boolean(editParam)

  async function loadProducts(next?: { page?: number; search?: string; category?: string }) {
    const targetPage = next?.page ?? page
    const targetSearch = next?.search ?? search
    const targetCategory = next?.category ?? categoryFilter
    const params = new URLSearchParams({ limit: '12', page: String(targetPage) })
    if (targetSearch.trim()) params.set('q', targetSearch.trim())
    if (targetCategory) params.set('category', targetCategory)
    const prodRes = await fetch(`/api/admin/products?${params.toString()}`, { cache: 'no-store' })
    const prodData = await prodRes.json().catch(() => ({}))
    setProducts(prodData?.products || [])
    setTotal(prodData?.total || 0)
    setPage(prodData?.page || targetPage)
  }

  // Load Initial Data
  useEffect(() => {
    async function init() {
      try {
        const [catRes, optionRes] = await Promise.all([
          fetch('/api/categories', { cache: 'no-store' }),
          fetch('/api/admin/product-options', { cache: 'no-store' }),
        ])
        const catData = await catRes.json()
        const optionData = await optionRes.json().catch(() => ({}))
        setCategories(catData?.categories || [])
        setOptionSets(optionData?.options || { badges: [], materials: [], finishes: [], leadTimes: [], colors: [] })
        await loadProducts({ page: 1, search: '', category: '' })
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  useEffect(() => {
    if (!editParam) {
      if (editingId) {
        setEditingId(null)
        setBaselinePayload(null)
        setForm(emptyForm)
        setImages([])
        setPalette(defaultPalette)
        setVariants([])
        setError('')
      }
      return
    }

    let active = true

    async function loadEditorProduct() {
      setLoadingEditor(true)
      setError('')

      const res = await fetch(`/api/admin/products/${editParam}`, { cache: 'no-store' })
      const data = await res.json().catch(() => ({}))

      if (!active) return

      if (!res.ok) {
        setError(data?.message || 'Unable to load this product for editing.')
        setLoadingEditor(false)
        return
      }

      hydrateEditor(data as Product)
      setLoadingEditor(false)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    loadEditorProduct()

    return () => {
      active = false
    }
  }, [editParam])

  // Image Upload Logic
  async function uploadImage(file: File, onDone: (image: ProductImage) => void) {
    setUploading(true)
    setError('')
    try {
      const signatureRes = await fetch('/api/admin/cloudinary/signature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folder: 'timberbell/products' }),
      })
      const signatureData = await signatureRes.json()
      
      const formData = new FormData()
      formData.append('file', file)
      formData.append('api_key', signatureData.apiKey)
      formData.append('timestamp', String(signatureData.timestamp))
      formData.append('signature', signatureData.signature)
      formData.append('folder', signatureData.folder)

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${signatureData.cloudName}/auto/upload`,
        { method: 'POST', body: formData }
      )
      const uploadJson = await uploadRes.json()
      onDone({ url: uploadJson.secure_url, publicId: uploadJson.public_id })
    } catch (err: any) {
      setError('Image upload failed. Please verify credentials.')
    } finally {
      setUploading(false)
    }
  }

  function buildPayload(): ProductPayload {
    return {
      ...form,
      slug: form.slug || slugify(form.name),
      price: Number(form.price),
      inventoryCount: form.inventoryCount ? Number(form.inventoryCount) : null,
      discountType: form.discountType || null,
      discountValue: form.discountValue ? Number(form.discountValue) : null,
      badge: form.badge.trim() || null,
      materials: normalizeTextList(form.materials),
      finishes: normalizeTextList(form.finishes),
      leadTime: form.leadTime.trim() || null,
      dimensions: form.dimensions.trim() || null,
      palette: palette.filter(Boolean),
      images: dedupeImages(images),
      variants: variants.map((v) => ({
        ...v,
        sku: v.sku?.trim() || undefined,
        price: v.price ? Number(v.price) : undefined,
        discountType: v.discountType || undefined,
        discountValue: v.discountValue ? Number(v.discountValue) : undefined,
        stockCount: v.stockCount ? Number(v.stockCount) : undefined,
        color: v.color?.trim() || undefined,
        image: v.image || null,
        materials: (v.materials || []).filter(Boolean),
        finishes: (v.finishes || []).filter(Boolean),
        specifications: (v.specifications || []).filter(Boolean),
      })),
    }
  }

  // Submit Logic
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')

    const nextPayload = buildPayload()
    const payload =
      editingId && baselinePayload
        ? Object.fromEntries(
            Object.entries(nextPayload).filter(([key, value]) => !deepEqual(value, baselinePayload[key as keyof ProductPayload]))
          )
        : nextPayload

    if (editingId && Object.keys(payload).length === 0) {
      setError('No changes to save yet.')
      setSaving(false)
      return
    }

    const url = editingId ? `/api/admin/products/${editingId}` : '/api/admin/products'
    const method = editingId ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    const data = await res.json().catch(() => ({}))

    if (res.ok) {
      setForm(emptyForm)
      setImages([])
      setPalette(defaultPalette)
      setVariants([])
      setEditingId(null)
      setBaselinePayload(null)
      // Reload products
      await loadProducts({ page, search, category: categoryFilter })
      const optionRes = await fetch('/api/admin/product-options', { cache: 'no-store' })
      const optionData = await optionRes.json().catch(() => ({}))
      setOptionSets(optionData?.options || { badges: [], materials: [], finishes: [], leadTimes: [], colors: [] })
      if (editorMode) {
        router.push('/admin/products')
      }
    } else {
      setError(data?.message || 'Failed to save product. Verify all fields.')
    }
    setSaving(false)
  }

  function hydrateEditor(p: Product) {
    setEditingId(p.id)
    setForm({
      name: p.name,
      slug: p.slug || '',
      price: String(p.price),
      category: p.category,
      description: p.description || '',
      inventoryCount: p.inventoryCount ? String(p.inventoryCount) : '',
      stockStatus: p.stockStatus || 'in_stock',
      discountType: p.discountType || '',
      discountValue: p.discountValue ? String(p.discountValue) : '',
      badge: p.badge || '',
      materials: p.materials?.join(', ') || '',
      finishes: p.finishes?.join(', ') || '',
      leadTime: p.leadTime || '',
      dimensions: p.dimensions || '',
    })
    const nextImages = dedupeImages(p.images || [])
    const nextPalette = p.palette?.length ? p.palette.slice(0, 3) : defaultPalette
    const nextVariants = (p.variants || []).map((variant) => ({
        ...variant,
        price: variant.price ? String(variant.price) : '',
        discountType: variant.discountType || '',
        discountValue: variant.discountValue ? String(variant.discountValue) : '',
        stockCount: variant.stockCount ? String(variant.stockCount) : '',
        materials: variant.materials || [],
        finishes: variant.finishes || [],
        specifications: variant.specifications || [],
      }))
    setImages(nextImages)
    setPalette(nextPalette)
    setVariants(nextVariants)
    setBaselinePayload({
      name: p.name,
      slug: p.slug || '',
      price: Number(p.price),
      category: p.category,
      description: p.description || '',
      inventoryCount: p.inventoryCount ?? null,
      stockStatus: p.stockStatus || 'in_stock',
      discountType: p.discountType || null,
      discountValue: p.discountValue ?? null,
      badge: p.badge || null,
      materials: p.materials || [],
      finishes: p.finishes || [],
      leadTime: p.leadTime || null,
      dimensions: p.dimensions || null,
      palette: nextPalette.filter(Boolean),
      images: nextImages,
      variants: nextVariants.map((variant) => ({
        ...variant,
        sku: variant.sku || undefined,
        price: variant.price ? Number(variant.price) : undefined,
        discountType: variant.discountType || undefined,
        discountValue: variant.discountValue ? Number(variant.discountValue) : undefined,
        stockCount: variant.stockCount ? Number(variant.stockCount) : undefined,
        color: variant.color || undefined,
        materials: variant.materials || [],
        finishes: variant.finishes || [],
        specifications: variant.specifications || [],
      })),
    })
  }

  function beginEdit(p: Product) {
    router.push(`/admin/products/${p.id}`)
  }

  function resetEditor() {
    if (editorMode) {
      router.push('/admin/products')
      return
    }

    setEditingId(null)
    setForm(emptyForm)
    setImages([])
    setPalette(defaultPalette)
    setVariants([])
    setBaselinePayload(null)
    setError('')
  }

  function toggleTextValue(current: string, nextValue: string) {
    const values = normalizeTextList(current)
    return values.includes(nextValue)
      ? values.filter((value) => value !== nextValue).join(', ')
      : [...values, nextValue].join(', ')
  }

  function updateVariant(id: string, updates: Partial<Variant>) {
    setVariants((current) =>
      current.map((variant) =>
        variant.id === id
          ? {
              ...variant,
              ...updates,
              image:
                updates.image && variant.image && updates.image.publicId === variant.image.publicId
                  ? variant.image
                  : updates.image !== undefined
                    ? updates.image
                    : variant.image,
            }
          : variant
      )
    )
  }

  function replacePrimaryImage(image: ProductImage) {
    setImages((current) => dedupeImages(current.length ? [image, ...current.slice(1)] : [image]))
  }

  function addGalleryImage(image: ProductImage) {
    setImages((current) => dedupeImages([...current, image]))
  }

  function updateVariantSpec(id: string, value: string) {
    const specifications = value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
    updateVariant(id, { specifications })
  }

  function updateVariantTextList(id: string, key: 'materials' | 'finishes', value: string) {
    updateVariant(
      id,
      {
        [key]: value
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
      } as Partial<Variant>
    )
  }

  async function handleDelete(id: string) {
    if (!confirm('Permanently remove this piece from the catalog?')) return
    await fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
    setProducts(prev => prev.filter(p => p.id !== id))
  }

  function openVariantQuickUpdate(product: Product, variant: Variant) {
    setVariantQuickUpdate({
      productId: product.id,
      variantId: variant.id,
      productName: product.name,
      name: variant.name,
      sku: variant.sku || '',
      color: variant.color || '',
      price: variant.price || '',
      discountType: variant.discountType || '',
      discountValue: variant.discountValue || '',
      stockCount: variant.stockCount || '',
      stockStatus: variant.stockStatus || 'in_stock',
    })
  }

  async function saveVariantQuickUpdate() {
    if (!variantQuickUpdate) return
    setQuickSaving(true)
    setError('')
    const product = products.find((entry) => entry.id === variantQuickUpdate.productId)
    if (!product) {
      setError('Parent product not found for this variant.')
      setQuickSaving(false)
      return
    }

    const nextVariants = (product.variants || []).map((variant) =>
      variant.id === variantQuickUpdate.variantId
        ? {
            ...variant,
            price: variantQuickUpdate.price ? Number(variantQuickUpdate.price) : undefined,
            discountType: variantQuickUpdate.discountType || undefined,
            discountValue: variantQuickUpdate.discountValue ? Number(variantQuickUpdate.discountValue) : undefined,
            stockCount: variantQuickUpdate.stockCount ? Number(variantQuickUpdate.stockCount) : undefined,
            stockStatus: variantQuickUpdate.stockStatus,
            sku: variantQuickUpdate.sku || undefined,
            color: variantQuickUpdate.color || undefined,
          }
        : variant
    )

    const res = await fetch(`/api/admin/products/${variantQuickUpdate.productId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ variants: nextVariants }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      setError(data?.message || 'Unable to update this variant quickly.')
      setQuickSaving(false)
      return
    }

    setProducts((current) =>
      current.map((entry) =>
        entry.id === variantQuickUpdate.productId
          ? { ...entry, variants: nextVariants as Variant[] }
          : entry
      )
    )
    setVariants((current) =>
      current.map((variant) =>
        variant.id === variantQuickUpdate.variantId
          ? {
              ...variant,
              price: variantQuickUpdate.price,
              discountType: variantQuickUpdate.discountType,
              discountValue: variantQuickUpdate.discountValue,
              stockCount: variantQuickUpdate.stockCount,
              stockStatus: variantQuickUpdate.stockStatus,
              sku: variantQuickUpdate.sku,
              color: variantQuickUpdate.color,
            }
          : variant
      )
    )
    setVariantQuickUpdate(null)
    setQuickSaving(false)
  }

  function openQuickUpdate(product: Product) {
    setQuickUpdate({
      id: product.id,
      name: product.name,
      price: String(product.price ?? ''),
      inventoryCount: String(product.inventoryCount ?? ''),
      discountType: product.discountType || '',
      discountValue: product.discountValue ? String(product.discountValue) : '',
      variants: (product.variants || []).map((variant) => ({
        productId: product.id,
        variantId: variant.id,
        productName: product.name,
        name: variant.name,
        sku: variant.sku || '',
        color: variant.color || '',
        price: variant.price ? String(variant.price) : '',
        discountType: variant.discountType || '',
        discountValue: variant.discountValue ? String(variant.discountValue) : '',
        stockCount: variant.stockCount ? String(variant.stockCount) : '',
        stockStatus: variant.stockStatus || 'in_stock',
      })),
    })
  }

  async function saveQuickUpdate() {
    if (!quickUpdate) return
    setQuickSaving(true)
    setError('')
    const payload = {
      price: Number(quickUpdate.price) || 0,
      inventoryCount: quickUpdate.inventoryCount ? Number(quickUpdate.inventoryCount) : null,
      discountType: quickUpdate.discountType || null,
      discountValue: quickUpdate.discountValue ? Number(quickUpdate.discountValue) : null,
    }
    const res = await fetch(`/api/admin/products/${quickUpdate.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      setError(data?.message || 'Unable to update this product quickly.')
      setQuickSaving(false)
      return
    }
    setQuickUpdate(null)
    await loadProducts({ page, search, category: categoryFilter })
    setQuickSaving(false)
  }

  if (loading) {
    return <div className="text-[10px] uppercase tracking-widest text-[#8C7A6B]">Loading catalog controls...</div>
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-4 px-2 sm:flex-row sm:items-center sm:justify-between">
         <div>
            <h1 className="font-display text-4xl text-[#2B2119]">{isStandaloneEdit ? 'Edit Catalog Piece' : 'Design Catalog'}</h1>
            <p className="mt-1 text-sm text-[#8C7A6B]">
              {isStandaloneEdit
                ? 'Update one product in its own editing space, then return to the catalog when you are done.'
                : 'Manage your studio&apos;s curated pieces, discounts, colors, and variants.'}
            </p>
         </div>
         <div className="flex items-center gap-3">
            {isStandaloneEdit ? (
              <Link
                href="/admin/products"
                className="rounded-full border border-[#E6D9C8] px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-[#7C4E2F] transition hover:bg-white"
              >
                Back To Catalog
              </Link>
            ) : (
              <span className="rounded-full bg-[#FCFAF6] border border-[#E6D9C8] px-4 py-2 text-[10px] uppercase tracking-widest font-bold text-[#7C4E2F]">
                 {products.length} Total Pieces
              </span>
            )}
         </div>
      </div>

      <div className={`grid gap-10 ${isStandaloneEdit ? 'xl:grid-cols-1' : 'min-[1700px]:grid-cols-[minmax(0,1.15fr)_minmax(320px,420px)]'}`}>
         {/* Catalog Feed */}
         {!isStandaloneEdit ? (
         <div className="space-y-6">
            <div className="flex flex-col gap-4 border-b border-[#E6D9C8] pb-4">
               <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <h2 className="font-display text-xl text-[#2B2119]">Active Portfolio</h2>
                  <p className="max-w-xl text-xs text-[#8C7A6B]">Long names, descriptions, discount states, and variant counts now stay readable instead of crushing the card layout.</p>
               </div>
               <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                  <div className="flex flex-1 items-center gap-2 rounded-full border border-[#E6D9C8] bg-white px-4 py-3">
                     <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            loadProducts({ page: 1, search: e.currentTarget.value, category: categoryFilter })
                          }
                        }}
                        placeholder="Search by product name or slug"
                        className="w-full bg-transparent text-sm outline-none"
                     />
                     <button type="button" onClick={() => loadProducts({ page: 1, search, category: categoryFilter })} className="rounded-full bg-[#7C4E2F] px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-white">Search</button>
                  </div>
                  <div className="flex gap-2">
                     <select value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); loadProducts({ page: 1, search, category: e.target.value }) }} className="h-11 rounded-full border border-[#E6D9C8] bg-white px-4 text-sm outline-none">
                        <option value="">All categories</option>
                        {categories.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
                     </select>
                     <button type="button" onClick={() => { setSearch(''); setCategoryFilter(''); loadProducts({ page: 1, search: '', category: '' }) }} className="rounded-full border border-[#E6D9C8] px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-[#7C4E2F]">Reset</button>
                  </div>
               </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 2xl:grid-cols-2">
               <AnimatePresence mode="popLayout">
                  {products.map((p) => (
                     <motion.div 
                        layout
                        key={p.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="group relative mx-auto w-full max-w-full overflow-hidden rounded-[32px] border border-[#E6D9C8] bg-white p-5 transition-all hover:shadow-xl hover:shadow-[#C5A070]/5"
                     >
                        <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
                           <div className="flex items-start gap-4 lg:w-full">
                           <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-[#FCFAF6] border border-[#F4EEE4]">
                              {p.images?.[0] || p.variants?.find((variant) => variant.image?.url)?.image ? (
                                 <img src={getOptimizedImageUrl(p.images?.[0]?.url || p.variants?.find((variant) => variant.image?.url)?.image?.url)} className="h-full w-full object-cover transition-transform group-hover:scale-110" />
                              ) : (
                                 <div className="flex h-full w-full items-center justify-center text-[10px] tracking-widest opacity-20 uppercase font-bold text-[#8C7A6B]">No Image</div>
                              )}
                           </div>
                           <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-start justify-between gap-3">
                                 <div className="min-w-0 flex-1">
                                    <p className="text-[9px] font-bold uppercase tracking-widest text-[#C5A070]">{p.category}</p>
                                    <h3 className="mt-1 break-words text-base font-bold leading-snug text-[#2B2119]">{p.name}</h3>
                                 </div>
                                 <div className="text-left sm:text-right">
                                    <p className="text-sm font-bold text-[#7C4E2F]">{formatMoney(p.price)}</p>
                                    {p.discountType && p.discountValue ? (
                                      <p className="text-xs text-[#8C7A6B]">Selling at {formatMoney(p.discountType === 'percentage' ? Math.max(p.price - (p.price * p.discountValue) / 100, 0) : Math.max(p.price - p.discountValue, 0))}</p>
                                    ) : null}
                                 </div>
                              </div>

                              <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-[#6B594A]">
                                {p.description || 'No description added yet.'}
                              </p>

                              <div className="mt-4 flex flex-wrap gap-2">
                                 <span className="rounded-full bg-[#F4EEE4] px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-[#8C7A6B]">
                                    {p.inventoryCount ?? 0} In Stock
                                 </span>
                                 <span className="rounded-full bg-[#F4EEE4] px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-[#8C7A6B]">
                                    {p.variants?.length ?? 0} Variants
                                 </span>
                                 {p.discountType && p.discountValue ? (
                                   <span className="rounded-full bg-[#F7E6D4] px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-[#7C4E2F]">
                                     {p.discountType === 'percentage' ? `${p.discountValue}% off` : `${formatMoney(p.discountValue)} off`}
                                   </span>
                                 ) : null}
                                 {p.badge ? (
                                   <span className="rounded-full bg-[#2B2119] px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-white">
                                     {p.badge}
                                   </span>
                                 ) : null}
                              </div>
                           </div>
                           </div>
                           <div className="space-y-4 lg:w-[210px] lg:shrink-0">
                              <div className="rounded-2xl border border-[#F4EEE4] bg-[#FCFAF6] p-3">
                                 <p className="text-[9px] font-bold uppercase tracking-widest text-[#8C7A6B]">Palette</p>
                                 <div className="mt-3 flex gap-2">
                                    {(p.palette?.length ? p.palette : defaultPalette).slice(0, 3).map((color, index) => (
                                      <span key={`${p.id}-${index}`} className="h-7 w-7 rounded-full border border-black/10" style={{ backgroundColor: color }} />
                                    ))}
                                 </div>
                              </div>
                              <div className="flex gap-2">
                                 <button 
                                    onClick={() => openQuickUpdate(p)}
                                    className="rounded-full border border-[#C5A070] px-3 py-2 text-[9px] font-bold uppercase tracking-widest text-[#7C4E2F] transition hover:bg-[#F8F1E8]"
                                 >
                                    Quick Update
                                 </button>
                                 <button 
                                    onClick={() => beginEdit(p)}
                                    className="flex-1 rounded-full border border-[#E6D9C8] py-2 text-[9px] font-bold uppercase tracking-widest text-[#2B2119] transition hover:bg-[#F4EEE4]"
                                 >
                                    Edit
                                 </button>
                                 <button 
                                    onClick={() => handleDelete(p.id)}
                                    className="rounded-full border border-red-50 text-red-500 px-3 py-2 text-[9px] font-bold uppercase tracking-widest transition hover:bg-red-50"
                                 >
                                    Delete
                                 </button>
                              </div>
                           </div>
                        </div>
                     </motion.div>
                  ))}
               </AnimatePresence>
            </div>
            <div className="flex items-center justify-between rounded-3xl border border-[#E6D9C8] bg-white px-4 py-3 text-[10px] uppercase tracking-widest text-[#8C7A6B]">
               <button type="button" onClick={() => loadProducts({ page: Math.max(1, page - 1), search, category: categoryFilter })} disabled={page <= 1} className="rounded-full border border-[#E6D9C8] px-4 py-2 disabled:opacity-40">Prev</button>
               <span>Page {page} / {totalPages}</span>
               <button type="button" onClick={() => loadProducts({ page: Math.min(totalPages, page + 1), search, category: categoryFilter })} disabled={page >= totalPages} className="rounded-full border border-[#E6D9C8] px-4 py-2 disabled:opacity-40">Next</button>
            </div>
         </div>
         ) : null}

         {/* Command Sidebar Form */}
         <div className="min-w-0 space-y-6 min-[1700px]:sticky min-[1700px]:top-10 min-[1700px]:self-start">
            <div className="rounded-[40px] border border-[#E6D9C8] bg-white p-6 shadow-2xl shadow-[#C5A070]/5 sm:p-8">
               <div className="mb-8 flex items-center justify-between gap-4">
                  <h2 className="font-display text-2xl text-[#2B2119]">{editingId ? 'Edit Piece' : 'New Entry'}</h2>
                  {editingId ? (
                     <button onClick={resetEditor} className="text-[10px] font-bold uppercase tracking-widest text-[#8C7A6B]">Cancel</button>
                  ) : null}
               </div>
               {editingId ? (
                  <div className="mb-6 rounded-3xl border border-[#E6D9C8] bg-[#FCFAF6] p-4 text-xs text-[#6B594A]">
                     Only fields you change are saved, so you can update one detail without rewriting the whole product.
                  </div>
               ) : null}
               {loadingEditor ? (
                  <div className="mb-6 rounded-3xl border border-[#E6D9C8] bg-[#FCFAF6] p-4 text-xs text-[#6B594A]">
                     Loading product editor...
                  </div>
               ) : null}

               <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                     <div>
                        <label className="text-[9px] font-bold uppercase tracking-widest text-[#8C7A6B]">Design Name</label>
                        <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-2 h-12 w-full rounded-2xl border border-[#E6D9C8] bg-[#FCFAF6] px-4 text-sm outline-none transition focus:border-[#C5A070]" />
                     </div>
                     <div>
                        <div className="flex items-center justify-between gap-3">
                           <label className="text-[9px] font-bold uppercase tracking-widest text-[#8C7A6B]">Slug</label>
                           <button type="button" onClick={() => setForm({ ...form, slug: slugify(form.name) })} className="text-[9px] font-bold uppercase tracking-widest text-[#7C4E2F]">
                              {isSlugSuggested ? 'Slug Ready' : 'Use Suggested Slug'}
                           </button>
                        </div>
                        <input value={form.slug} onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })} placeholder="hand-finished-oak-console" className="mt-2 h-12 w-full rounded-2xl border border-[#E6D9C8] bg-[#FCFAF6] px-4 text-sm outline-none transition focus:border-[#C5A070]" />
                     </div>
                     <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                           <label className="text-[9px] font-bold uppercase tracking-widest text-[#8C7A6B]">Category</label>
                           <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="mt-2 h-12 w-full rounded-2xl border border-[#E6D9C8] bg-[#FCFAF6] px-4 text-sm outline-none">
                              <option value="">Select...</option>
                              {categories.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
                           </select>
                        </div>
                        <div>
                           <label className="text-[9px] font-bold uppercase tracking-widest text-[#8C7A6B]">Base Price</label>
                           <input type="number" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="mt-2 h-12 w-full rounded-2xl border border-[#E6D9C8] bg-[#FCFAF6] px-4 text-sm outline-none" />
                        </div>
                     </div>
                     <div>
                        <label className="text-[9px] font-bold uppercase tracking-widest text-[#8C7A6B]">Description</label>
                        <textarea className="mt-2 h-32 w-full rounded-3xl border border-[#E6D9C8] bg-[#FCFAF6] px-4 py-3 text-sm outline-none" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                     </div>
                     <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                           <label className="text-[9px] font-bold uppercase tracking-widest text-[#8C7A6B]">Inventory</label>
                           <input type="number" value={form.inventoryCount} onChange={(e) => setForm({ ...form, inventoryCount: e.target.value })} className="mt-2 h-12 w-full rounded-2xl border border-[#E6D9C8] bg-[#FCFAF6] px-4 text-sm outline-none" />
                        </div>
                        <div>
                           <label className="text-[9px] font-bold uppercase tracking-widest text-[#8C7A6B]">Stock Status</label>
                           <select value={form.stockStatus} onChange={(e) => setForm({ ...form, stockStatus: e.target.value })} className="mt-2 h-12 w-full rounded-2xl border border-[#E6D9C8] bg-[#FCFAF6] px-4 text-sm outline-none">
                              <option value="in_stock">In stock</option>
                              <option value="low_stock">Low stock</option>
                              <option value="out_of_stock">Out of stock</option>
                              <option value="preorder">Preorder</option>
                           </select>
                        </div>
                     </div>
                  </div>

                  <div className="rounded-3xl bg-[#F4EEE4]/50 p-5 sm:p-6">
                     <div className="flex items-center justify-between gap-3">
                        <p className="text-[9px] font-bold uppercase tracking-widest text-[#8C7A6B]">Discount & Pricing</p>
                        {editingId ? <button type="submit" className="rounded-full border border-[#C5A070] px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest text-[#7C4E2F]">Save Pricing</button> : null}
                     </div>
                     <div className="mt-4 grid gap-4 sm:grid-cols-2">
                        <div>
                           <label className="text-[9px] font-bold uppercase tracking-widest text-[#8C7A6B]">Discount Type</label>
                           <select value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value })} className="mt-2 h-12 w-full rounded-2xl border border-[#E6D9C8] bg-white px-4 text-sm outline-none"><option value="">None</option><option value="percentage">Percentage</option><option value="fixed">Fixed amount</option></select>
                        </div>
                        <div>
                           <label className="text-[9px] font-bold uppercase tracking-widest text-[#8C7A6B]">Discount Value</label>
                           <input type="number" value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: e.target.value })} placeholder={form.discountType === 'percentage' ? '10' : '5000'} className="mt-2 h-12 w-full rounded-2xl border border-[#E6D9C8] bg-white px-4 text-sm outline-none" />
                        </div>
                     </div>
                     <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl border border-[#E6D9C8] bg-white px-4 py-3 text-sm">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#8C7A6B]">Live Selling Price</span>
                        <span className="font-bold text-[#7C4E2F]">{formatMoney(finalPreviewPrice)}</span>
                     </div>
                  </div>

                  <div className="rounded-3xl bg-[#F4EEE4]/50 p-5 sm:p-6">
                     <div className="flex items-center justify-between gap-4"><p className="text-[9px] font-bold uppercase tracking-widest text-[#8C7A6B]">Palette Colors</p><div className="flex items-center gap-3"><span className="text-[9px] text-[#8C7A6B]">Use 1 to 3 colors</span>{editingId ? <button type="submit" className="rounded-full border border-[#C5A070] px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest text-[#7C4E2F]">Save Palette</button> : null}</div></div>
                     <div className="mt-4 grid gap-4 sm:grid-cols-3">
                        {palette.map((color, index) => (
                           <div key={`palette-${index}`} className="rounded-2xl border border-[#E6D9C8] bg-white p-3">
                              <label className="text-[9px] font-bold uppercase tracking-widest text-[#8C7A6B]">Color {index + 1}</label>
                              <div className="mt-3 flex items-center gap-3">
                                 <input type="color" value={color} onChange={(e) => setPalette((current) => current.map((entry, i) => (i === index ? e.target.value : entry)))} className="h-11 w-12 rounded-xl border border-[#E6D9C8] bg-transparent p-1" />
                                 <input value={color} onChange={(e) => setPalette((current) => current.map((entry, i) => (i === index ? e.target.value : entry)))} className="h-11 flex-1 rounded-xl border border-[#E6D9C8] px-3 text-sm outline-none" />
                              </div>
                              {palette.length > 1 ? (
                                <button type="button" onClick={() => setPalette((current) => current.filter((_, i) => i !== index))} className="mt-3 text-[10px] font-bold uppercase tracking-widest text-red-500">Remove</button>
                              ) : null}
                           </div>
                        ))}
                     </div>
                     {palette.length < 3 ? (
                       <button type="button" onClick={() => setPalette((current) => [...current, '#c59a6b'])} className="mt-4 rounded-full border border-[#C5A070] px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-[#7C4E2F] transition hover:bg-white">Add Color</button>
                     ) : null}
                     {colorOptions.length > 0 ? (
                       <div className="mt-4 flex flex-wrap gap-2">
                          {colorOptions.slice(0, 12).map((color) => (
                            <button
                              key={color}
                              type="button"
                              title={color}
                              onClick={() =>
                                setPalette((current) => {
                                  if (current.includes(color)) return current
                                  if (current.length >= 3) return [current[0], current[1], color].filter(Boolean)
                                  return [...current, color]
                                })
                              }
                              className="flex items-center gap-2 rounded-full border border-[#E6D9C8] bg-white px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-[#6B594A]"
                            >
                              <span className="h-4 w-4 rounded-full border border-black/10" style={{ backgroundColor: color }} />
                              Add
                            </button>
                          ))}
                       </div>
                     ) : null}
                  </div>

                  <div className="rounded-3xl bg-[#F4EEE4]/50 p-5 sm:p-6">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-[#8C7A6B]">Visual Assets</p>
                      <p className="text-[10px] text-[#8C7A6B]">Replacing the cover image removes the former one automatically.</p>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-3">
                      {images.map((img, i) => (
                        <div key={img.publicId || img.url} className="relative h-16 w-16 overflow-hidden rounded-xl border border-[#E6D9C8]">
                          <img src={getOptimizedImageUrl(img.url)} className="h-full w-full object-cover" />
                          {i === 0 ? <span className="absolute left-1 top-1 rounded-full bg-white/90 px-1.5 py-0.5 text-[7px] font-bold uppercase tracking-widest text-[#7C4E2F]">Cover</span> : null}
                          <button type="button" onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))} className="absolute right-1 top-1 rounded-full bg-black/50 p-1 text-[8px] text-white">x</button>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <label className="flex cursor-pointer items-center justify-center rounded-full border border-[#C5A070] bg-white px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-[#7C4E2F] transition hover:bg-[#C5A070]/5">
                        {uploading ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#C5A070] border-t-transparent" /> : <span>{images.length ? 'Replace Cover' : 'Upload Cover'}</span>}
                        <input accept="image/*" type="file" className="hidden" onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0], replacePrimaryImage)} />
                      </label>
                      {images.length < 5 ? (
                        <label className="flex cursor-pointer items-center justify-center rounded-full border border-dashed border-[#C5A070] bg-white px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-[#7C4E2F] transition hover:bg-[#C5A070]/5">
                          {uploading ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#C5A070] border-t-transparent" /> : <span>Add Gallery Image</span>}
                          <input accept="image/*" type="file" className="hidden" onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0], addGalleryImage)} />
                        </label>
                      ) : null}
                    </div>
                  </div>

                  <div className="rounded-3xl bg-[#F4EEE4]/50 p-5 sm:p-6">
                     <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-[9px] font-bold uppercase tracking-widest text-[#8C7A6B]">Variants</p><p className="mt-1 text-xs text-[#8C7A6B]">Use variants when a product has selectable options like colorways, finishes, or special pricing.</p></div><div className="flex flex-wrap items-center gap-2"><button type="button" onClick={() => setVariants((current) => [...current, createVariant()])} className="rounded-full border border-[#C5A070] px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-[#7C4E2F] transition hover:bg-white">Add Variant</button>{editingId ? <button type="submit" className="rounded-full border border-[#C5A070] px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-[#7C4E2F]">Save Variants</button> : null}</div></div>
                     <div className="mt-4 space-y-4">
                        {variants.length === 0 ? <div className="rounded-2xl border border-dashed border-[#DCCBB7] bg-white/70 p-4 text-sm text-[#8C7A6B]">No variants yet. If this product has one standard option only, leave variants empty and manage the main product details below.</div> : null}
                        {variants.map((variant, index) => (
                          <div key={variant.id} className="rounded-[28px] border border-[#E6D9C8] bg-white p-4 sm:p-5">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                              <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-[#7C4E2F]">Variant {index + 1}</p>
                                <p className="mt-1 text-xs text-[#8C7A6B]">Use a variant only when this option changes price, stock, image, color, or finish from the base product.</p>
                              </div>
                              <div className="flex flex-wrap items-center gap-3">
                                {editingId ? (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      openVariantQuickUpdate(
                                        {
                                          id: editingId,
                                          name: form.name,
                                          price: Number(form.price) || 0,
                                          category: form.category,
                                          variants,
                                        } as Product,
                                        variant
                                      )
                                    }
                                    className="text-[10px] font-bold uppercase tracking-widest text-[#7C4E2F]"
                                  >
                                    Quick Update
                                  </button>
                                ) : null}
                                <button type="button" onClick={() => setVariants((current) => current.filter((entry) => entry.id !== variant.id))} className="text-[10px] font-bold uppercase tracking-widest text-red-500">Remove</button>
                              </div>
                            </div>

                            <div className="mt-4 rounded-2xl border border-[#E6D9C8] bg-[#FCFAF6] p-4">
                              <div className="flex items-center justify-between gap-3">
                                <p className="text-[9px] font-bold uppercase tracking-widest text-[#8C7A6B]">Offer Details</p>
                                <span className="text-[10px] text-[#8C7A6B]">Required for selectable options</span>
                              </div>
                              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                                <input value={variant.name} onChange={(e) => updateVariant(variant.id, { name: e.target.value })} placeholder="Variant name e.g. Walnut / Queen" className="h-12 rounded-2xl border border-[#E6D9C8] bg-white px-4 text-sm outline-none" />
                                <input value={variant.sku || ''} onChange={(e) => updateVariant(variant.id, { sku: e.target.value })} placeholder="SKU" className="h-12 rounded-2xl border border-[#E6D9C8] bg-white px-4 text-sm outline-none" />
                                <input type="number" value={variant.price || ''} onChange={(e) => updateVariant(variant.id, { price: e.target.value })} placeholder="Price override" className="h-12 rounded-2xl border border-[#E6D9C8] bg-white px-4 text-sm outline-none" />
                                <select value={variant.discountType || ''} onChange={(e) => updateVariant(variant.id, { discountType: e.target.value })} className="h-12 rounded-2xl border border-[#E6D9C8] bg-white px-4 text-sm outline-none">
                                  <option value="">No variant discount</option>
                                  <option value="percentage">Percentage</option>
                                  <option value="fixed">Fixed amount</option>
                                </select>
                                <input type="number" value={variant.discountValue || ''} onChange={(e) => updateVariant(variant.id, { discountValue: e.target.value })} placeholder={variant.discountType === 'percentage' ? '10' : '5000'} className="h-12 rounded-2xl border border-[#E6D9C8] bg-white px-4 text-sm outline-none" />
                                <input type="number" value={variant.stockCount || ''} onChange={(e) => updateVariant(variant.id, { stockCount: e.target.value })} placeholder="Stock quantity" className="h-12 rounded-2xl border border-[#E6D9C8] bg-white px-4 text-sm outline-none" />
                                <select value={variant.stockStatus || 'in_stock'} onChange={(e) => updateVariant(variant.id, { stockStatus: e.target.value as Variant['stockStatus'] })} className="h-12 rounded-2xl border border-[#E6D9C8] bg-white px-4 text-sm outline-none">
                                  <option value="in_stock">In stock</option>
                                  <option value="low_stock">Low stock</option>
                                  <option value="out_of_stock">Out of stock</option>
                                  <option value="preorder">Preorder</option>
                                </select>
                              </div>
                            </div>

                            <div className="mt-4 rounded-2xl border border-[#E6D9C8] p-4">
                              <div className="flex items-center justify-between gap-3">
                                <p className="text-[9px] font-bold uppercase tracking-widest text-[#8C7A6B]">Option Details</p>
                                <span className="text-[10px] text-[#8C7A6B]">Optional display overrides</span>
                              </div>
                              <div className="mt-3 grid gap-4 sm:grid-cols-[auto_1fr]">
                                <div className="flex items-center gap-3 rounded-2xl border border-[#E6D9C8] px-3 py-2">
                                  <input type="color" value={variant.color || '#c59a6b'} onChange={(e) => updateVariant(variant.id, { color: e.target.value })} className="h-9 w-10 rounded-xl border border-[#E6D9C8] bg-transparent p-1" />
                                  <input value={variant.color || ''} onChange={(e) => updateVariant(variant.id, { color: e.target.value })} placeholder="#c59a6b" className="h-9 w-28 text-sm outline-none" />
                                </div>
                                <div className="rounded-2xl border border-[#E6D9C8] p-3">
                                  <p className="text-[9px] font-bold uppercase tracking-widest text-[#8C7A6B]">Variant Image</p>
                                  <div className="mt-3 flex flex-wrap items-center gap-3">
                                    {variant.image?.url ? <div className="relative h-16 w-16 overflow-hidden rounded-xl border border-[#E6D9C8]"><img src={getOptimizedImageUrl(variant.image.url)} className="h-full w-full object-cover" /><button type="button" onClick={() => updateVariant(variant.id, { image: null })} className="absolute right-1 top-1 rounded-full bg-black/50 px-1.5 py-0.5 text-[8px] text-white">x</button></div> : null}
                                    <label className="flex h-16 min-w-16 cursor-pointer items-center justify-center rounded-xl border border-dashed border-[#C5A070] bg-white px-3 text-[9px] font-bold uppercase tracking-widest text-[#C5A070]">{uploading ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#C5A070] border-t-transparent" /> : <span>{variant.image ? 'Replace' : 'Add'}</span>}<input accept="image/*" type="file" className="hidden" onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0], (img) => updateVariant(variant.id, { image: img }))} /></label>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="mt-4 rounded-2xl border border-[#E6D9C8] bg-[#FCFAF6] p-4">
                              <div className="flex items-center justify-between gap-3">
                                <p className="text-[9px] font-bold uppercase tracking-widest text-[#8C7A6B]">Variant Detail Overrides</p>
                                <span className="text-[10px] text-[#8C7A6B]">Leave empty to inherit product details</span>
                              </div>
                              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                                <div>
                                  <label className="text-[9px] font-bold uppercase tracking-widest text-[#8C7A6B]">Materials</label>
                                  <input value={(variant.materials || []).join(', ')} onChange={(e) => updateVariantTextList(variant.id, 'materials', e.target.value)} placeholder="Oak, boucle, linen" className="mt-2 h-12 w-full rounded-2xl border border-[#E6D9C8] bg-white px-4 text-sm outline-none" />
                                </div>
                                <div>
                                  <label className="text-[9px] font-bold uppercase tracking-widest text-[#8C7A6B]">Finishes</label>
                                  <input value={(variant.finishes || []).join(', ')} onChange={(e) => updateVariantTextList(variant.id, 'finishes', e.target.value)} placeholder="Oiled, matte, brushed" className="mt-2 h-12 w-full rounded-2xl border border-[#E6D9C8] bg-white px-4 text-sm outline-none" />
                                </div>
                              </div>

                              <div className="mt-4">
                                <label className="text-[9px] font-bold uppercase tracking-widest text-[#8C7A6B]">Variant Specifications</label>
                                <input value={(variant.specifications || []).join(', ')} onChange={(e) => updateVariantSpec(variant.id, e.target.value)} placeholder="Deep seat, brass feet, soft-close drawers" className="mt-2 h-12 w-full rounded-2xl border border-[#E6D9C8] bg-white px-4 text-sm outline-none" />
                              </div>
                            </div>
                          </div>
                        ))}
                     </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-widest text-[#8C7A6B]">Product Details</p>
                        <p className="mt-1 text-xs text-[#8C7A6B]">These are the base details every customer sees unless a variant overrides them.</p>
                      </div>
                      {editingId ? <button type="submit" className="rounded-full border border-[#C5A070] px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest text-[#7C4E2F]">Save Details</button> : null}
                    </div>
                    <div>
                      <label className="text-[9px] font-bold uppercase tracking-widest text-[#8C7A6B]">Badge</label>
                      <input list="badge-options" value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })} placeholder="New, Best Seller, Limited" className="mt-2 h-12 w-full rounded-2xl border border-[#E6D9C8] bg-[#FCFAF6] px-4 text-sm outline-none" />
                      {badgeOptions.length > 0 ? (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {badgeOptions.map((badge) => (
                            <button key={badge} type="button" onClick={() => setForm({ ...form, badge })} className={`rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest ${form.badge === badge ? 'border-[#7C4E2F] bg-[#7C4E2F] text-white' : 'border-[#E6D9C8] bg-white text-[#6B594A]'}`}>
                              {badge}
                            </button>
                          ))}
                        </div>
                      ) : null}
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="text-[9px] font-bold uppercase tracking-widest text-[#8C7A6B]">Materials</label>
                        <input list="material-options" value={form.materials} onChange={(e) => setForm({ ...form, materials: e.target.value })} placeholder="Oak, boucle, linen" className="mt-2 h-12 w-full rounded-2xl border border-[#E6D9C8] bg-[#FCFAF6] px-4 text-sm outline-none" />
                        {materialOptions.length > 0 ? (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {materialOptions.map((material) => (
                              <button key={material} type="button" onClick={() => setForm({ ...form, materials: toggleTextValue(form.materials, material) })} className={`rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest ${normalizeTextList(form.materials).includes(material) ? 'border-[#7C4E2F] bg-[#7C4E2F] text-white' : 'border-[#E6D9C8] bg-white text-[#6B594A]'}`}>
                                {material}
                              </button>
                            ))}
                          </div>
                        ) : null}
                      </div>
                      <div>
                        <label className="text-[9px] font-bold uppercase tracking-widest text-[#8C7A6B]">Finishes</label>
                        <input list="finish-options" value={form.finishes} onChange={(e) => setForm({ ...form, finishes: e.target.value })} placeholder="Matte, polished, brushed" className="mt-2 h-12 w-full rounded-2xl border border-[#E6D9C8] bg-[#FCFAF6] px-4 text-sm outline-none" />
                        {finishOptions.length > 0 ? (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {finishOptions.map((finish) => (
                              <button key={finish} type="button" onClick={() => setForm({ ...form, finishes: toggleTextValue(form.finishes, finish) })} className={`rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest ${normalizeTextList(form.finishes).includes(finish) ? 'border-[#7C4E2F] bg-[#7C4E2F] text-white' : 'border-[#E6D9C8] bg-white text-[#6B594A]'}`}>
                                {finish}
                              </button>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    </div>
                    <div>
                      <label className="text-[9px] font-bold uppercase tracking-widest text-[#8C7A6B]">Lead Time</label>
                      <input list="leadtime-options" value={form.leadTime} onChange={(e) => setForm({ ...form, leadTime: e.target.value })} placeholder="2-4 weeks" className="mt-2 h-12 w-full rounded-2xl border border-[#E6D9C8] bg-[#FCFAF6] px-4 text-sm outline-none" />
                      {leadTimeOptions.length > 0 ? (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {leadTimeOptions.map((leadTime) => (
                            <button key={leadTime} type="button" onClick={() => setForm({ ...form, leadTime })} className={`rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest ${form.leadTime === leadTime ? 'border-[#7C4E2F] bg-[#7C4E2F] text-white' : 'border-[#E6D9C8] bg-white text-[#6B594A]'}`}>
                              {leadTime}
                            </button>
                          ))}
                        </div>
                      ) : null}
                    </div>
                    <div>
                      <label className="text-[9px] font-bold uppercase tracking-widest text-[#8C7A6B]">Dimensions</label>
                      <input value={form.dimensions} onChange={(e) => setForm({ ...form, dimensions: e.target.value })} placeholder="78W x 34D x 30H in" className="mt-2 h-12 w-full rounded-2xl border border-[#E6D9C8] bg-[#FCFAF6] px-4 text-sm outline-none" />
                      <p className="mt-2 text-[10px] text-[#8C7A6B]">Use one clear marketplace-style size string so shoppers can compare options quickly.</p>
                    </div>
                  </div>

                  <datalist id="badge-options">{badgeOptions.map((badge) => <option key={badge} value={badge} />)}</datalist>
                  <datalist id="material-options">{materialOptions.map((material) => <option key={material} value={material} />)}</datalist>
                  <datalist id="finish-options">{finishOptions.map((finish) => <option key={finish} value={finish} />)}</datalist>
                  <datalist id="leadtime-options">{leadTimeOptions.map((leadTime) => <option key={leadTime} value={leadTime} />)}</datalist>

                  {error ? <p className="text-center text-[10px] font-bold text-red-500">{error}</p> : null}
                  <button disabled={saving} className="h-14 w-full rounded-full bg-[#2B2119] text-[11px] font-bold uppercase tracking-[0.3em] text-[#FDFCFB] shadow-xl shadow-[#2B2119]/20 transition-all hover:scale-[1.02] disabled:opacity-50">{saving ? 'Synchronizing...' : (editingId ? 'Save Piece' : 'Register Piece')}</button>
               </form>
            </div>
         </div>
      </div>

      <AnimatePresence>
         {quickUpdate ? (
            <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-6">
               <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-[#2B2119]/55 backdrop-blur-sm"
                  onClick={() => !quickSaving && setQuickUpdate(null)}
               />
               <motion.div
                  initial={{ opacity: 0, scale: 0.96, y: 16 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: 16 }}
                  className="relative w-full max-w-xl rounded-[36px] border border-[#E6D9C8] bg-white p-6 shadow-2xl sm:p-8"
               >
                  <div className="flex items-start justify-between gap-4">
                     <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#8C7A6B]">Quick Update</p>
                        <h3 className="mt-1 font-display text-2xl text-[#2B2119]">{quickUpdate.name}</h3>
                        <p className="mt-2 text-xs text-[#6B594A]">Update stock and discount without opening the full edit page.</p>
                     </div>
                     <button type="button" onClick={() => setQuickUpdate(null)} className="text-[10px] font-bold uppercase tracking-widest text-[#8C7A6B]">Close</button>
                  </div>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                     <div>
                        <label className="text-[9px] font-bold uppercase tracking-widest text-[#8C7A6B]">Base Price</label>
                        <input type="number" value={quickUpdate.price} onChange={(e) => setQuickUpdate({ ...quickUpdate, price: e.target.value })} className="mt-2 h-12 w-full rounded-2xl border border-[#E6D9C8] px-4 text-sm outline-none" />
                     </div>
                     <div>
                        <label className="text-[9px] font-bold uppercase tracking-widest text-[#8C7A6B]">Inventory</label>
                        <input type="number" value={quickUpdate.inventoryCount} onChange={(e) => setQuickUpdate({ ...quickUpdate, inventoryCount: e.target.value })} className="mt-2 h-12 w-full rounded-2xl border border-[#E6D9C8] px-4 text-sm outline-none" />
                     </div>
                     <div>
                        <label className="text-[9px] font-bold uppercase tracking-widest text-[#8C7A6B]">Discount Type</label>
                        <select value={quickUpdate.discountType} onChange={(e) => setQuickUpdate({ ...quickUpdate, discountType: e.target.value })} className="mt-2 h-12 w-full rounded-2xl border border-[#E6D9C8] px-4 text-sm outline-none">
                           <option value="">None</option>
                           <option value="percentage">Percentage</option>
                           <option value="fixed">Fixed amount</option>
                        </select>
                     </div>
                     <div>
                        <label className="text-[9px] font-bold uppercase tracking-widest text-[#8C7A6B]">Discount Value</label>
                        <input type="number" value={quickUpdate.discountValue} onChange={(e) => setQuickUpdate({ ...quickUpdate, discountValue: e.target.value })} className="mt-2 h-12 w-full rounded-2xl border border-[#E6D9C8] px-4 text-sm outline-none" />
                     </div>
                  </div>

                  <div className="mt-6 rounded-2xl border border-[#E6D9C8] bg-[#FCFAF6] px-4 py-3 text-sm">
                     <span className="text-[10px] font-bold uppercase tracking-widest text-[#8C7A6B]">Selling Price</span>
                     <p className="mt-2 text-lg font-bold text-[#7C4E2F]">
                        {formatMoney(
                          quickUpdate.discountType === 'percentage'
                            ? Math.max((Number(quickUpdate.price) || 0) - ((Number(quickUpdate.price) || 0) * (Number(quickUpdate.discountValue) || 0)) / 100, 0)
                            : quickUpdate.discountType === 'fixed'
                              ? Math.max((Number(quickUpdate.price) || 0) - (Number(quickUpdate.discountValue) || 0), 0)
                              : Number(quickUpdate.price) || 0
                        )}
                     </p>
                  </div>

                  {quickUpdate.variants.length ? (
                    <div className="mt-6">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-[#8C7A6B]">Variant Stock & Discount</p>
                          <p className="mt-1 text-xs text-[#6B594A]">Edit each variant directly from this quick update flow.</p>
                        </div>
                      </div>

                      <div className="mt-4 space-y-3">
                        {quickUpdate.variants.map((variant) => {
                          const variantSellingPrice =
                            variant.discountType === 'percentage'
                              ? Math.max((Number(variant.price) || 0) - ((Number(variant.price) || 0) * (Number(variant.discountValue) || 0)) / 100, 0)
                              : variant.discountType === 'fixed'
                                ? Math.max((Number(variant.price) || 0) - (Number(variant.discountValue) || 0), 0)
                                : Number(variant.price) || 0

                          return (
                            <button
                              key={variant.variantId}
                              type="button"
                              onClick={() => {
                                setQuickUpdate(null)
                                setVariantQuickUpdate(variant)
                              }}
                              className="w-full rounded-3xl border border-[#E6D9C8] bg-[#FCFAF6] px-4 py-3 text-left transition hover:border-[#C5A070] hover:bg-white"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-bold text-[#2B2119]">{variant.name || 'Untitled variant'}</p>
                                  <p className="mt-1 text-[10px] uppercase tracking-widest text-[#8C7A6B]">
                                    {variant.stockCount || '0'} in stock
                                    {variant.discountType && variant.discountValue
                                      ? ` • ${variant.discountType === 'percentage' ? `${variant.discountValue}% off` : `${formatMoney(Number(variant.discountValue) || 0)} off`}`
                                      : ' • no discount'}
                                  </p>
                                </div>
                                <div className="shrink-0 text-right">
                                  <p className="text-[10px] uppercase tracking-widest text-[#8C7A6B]">Selling</p>
                                  <p className="mt-1 text-sm font-bold text-[#7C4E2F]">{formatMoney(variantSellingPrice)}</p>
                                </div>
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  ) : null}

                  <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                     <button type="button" onClick={() => setQuickUpdate(null)} className="rounded-full border border-[#E6D9C8] px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-[#7C4E2F]">Cancel</button>
                     <button type="button" disabled={quickSaving} onClick={saveQuickUpdate} className="rounded-full bg-[#2B2119] px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-white disabled:opacity-50">
                        {quickSaving ? 'Saving...' : 'Save Update'}
                     </button>
                  </div>
               </motion.div>
            </div>
         ) : null}
      </AnimatePresence>

      <AnimatePresence>
         {variantQuickUpdate ? (
            <div className="fixed inset-0 z-[75] flex items-center justify-center p-4 sm:p-6">
               <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-[#2B2119]/55 backdrop-blur-sm"
                  onClick={() => !quickSaving && setVariantQuickUpdate(null)}
               />
               <motion.div
                  initial={{ opacity: 0, scale: 0.96, y: 16 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: 16 }}
                  className="relative w-full max-w-lg rounded-[36px] border border-[#E6D9C8] bg-white p-6 shadow-2xl sm:p-8"
               >
                  <div className="flex items-start justify-between gap-4">
                     <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#8C7A6B]">Variant Quick Update</p>
                        <h3 className="mt-1 font-display text-2xl text-[#2B2119]">{variantQuickUpdate.name}</h3>
                        <p className="mt-2 text-xs text-[#6B594A]">{variantQuickUpdate.productName}</p>
                     </div>
                     <button type="button" onClick={() => setVariantQuickUpdate(null)} className="text-[10px] font-bold uppercase tracking-widest text-[#8C7A6B]">Close</button>
                  </div>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                     <div>
                        <label className="text-[9px] font-bold uppercase tracking-widest text-[#8C7A6B]">Variant Price</label>
                        <input type="number" value={variantQuickUpdate.price} onChange={(e) => setVariantQuickUpdate({ ...variantQuickUpdate, price: e.target.value })} className="mt-2 h-12 w-full rounded-2xl border border-[#E6D9C8] px-4 text-sm outline-none" />
                     </div>
                     <div>
                        <label className="text-[9px] font-bold uppercase tracking-widest text-[#8C7A6B]">SKU</label>
                        <input type="text" value={variantQuickUpdate.sku} onChange={(e) => setVariantQuickUpdate({ ...variantQuickUpdate, sku: e.target.value })} className="mt-2 h-12 w-full rounded-2xl border border-[#E6D9C8] px-4 text-sm outline-none" />
                     </div>
                     <div>
                        <label className="text-[9px] font-bold uppercase tracking-widest text-[#8C7A6B]">Stock Count</label>
                        <input type="number" value={variantQuickUpdate.stockCount} onChange={(e) => setVariantQuickUpdate({ ...variantQuickUpdate, stockCount: e.target.value })} className="mt-2 h-12 w-full rounded-2xl border border-[#E6D9C8] px-4 text-sm outline-none" />
                     </div>
                     <div>
                        <label className="text-[9px] font-bold uppercase tracking-widest text-[#8C7A6B]">Color</label>
                        <input type="text" value={variantQuickUpdate.color} onChange={(e) => setVariantQuickUpdate({ ...variantQuickUpdate, color: e.target.value })} placeholder="#c59a6b" className="mt-2 h-12 w-full rounded-2xl border border-[#E6D9C8] px-4 text-sm outline-none" />
                     </div>
                     <div>
                        <label className="text-[9px] font-bold uppercase tracking-widest text-[#8C7A6B]">Discount Type</label>
                        <select value={variantQuickUpdate.discountType} onChange={(e) => setVariantQuickUpdate({ ...variantQuickUpdate, discountType: e.target.value })} className="mt-2 h-12 w-full rounded-2xl border border-[#E6D9C8] px-4 text-sm outline-none">
                           <option value="">None</option>
                           <option value="percentage">Percentage</option>
                           <option value="fixed">Fixed amount</option>
                        </select>
                     </div>
                     <div>
                        <label className="text-[9px] font-bold uppercase tracking-widest text-[#8C7A6B]">Discount Value</label>
                        <input type="number" value={variantQuickUpdate.discountValue} onChange={(e) => setVariantQuickUpdate({ ...variantQuickUpdate, discountValue: e.target.value })} className="mt-2 h-12 w-full rounded-2xl border border-[#E6D9C8] px-4 text-sm outline-none" />
                     </div>
                  </div>

                  <div className="mt-4">
                     <label className="text-[9px] font-bold uppercase tracking-widest text-[#8C7A6B]">Stock Status</label>
                     <select value={variantQuickUpdate.stockStatus} onChange={(e) => setVariantQuickUpdate({ ...variantQuickUpdate, stockStatus: e.target.value as VariantQuickUpdateState['stockStatus'] })} className="mt-2 h-12 w-full rounded-2xl border border-[#E6D9C8] px-4 text-sm outline-none">
                        <option value="in_stock">In stock</option>
                        <option value="low_stock">Low stock</option>
                        <option value="out_of_stock">Out of stock</option>
                        <option value="preorder">Preorder</option>
                     </select>
                  </div>

                  <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                     <button type="button" onClick={() => setVariantQuickUpdate(null)} className="rounded-full border border-[#E6D9C8] px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-[#7C4E2F]">Cancel</button>
                     <button type="button" disabled={quickSaving} onClick={saveVariantQuickUpdate} className="rounded-full bg-[#2B2119] px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-white disabled:opacity-50">
                        {quickSaving ? 'Saving...' : 'Save Variant'}
                     </button>
                  </div>
               </motion.div>
            </div>
         ) : null}
      </AnimatePresence>
    </div>
  )
}

