'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatMoney } from '@/lib/utils/format'

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
  materials?: string[]
  finishes?: string[]
  palette?: string[]
  leadTime?: string
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
  materials: string
  finishes: string
  leadTime: string
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
  compareAt: number | null
  badge: string | null
  materials: string[]
  finishes: string[]
  leadTime: string | null
  palette: string[]
  images: ProductImage[]
  variants: Array<{
    id: string
    name: string
    sku?: string
    price?: number
    stockCount?: number
    stockStatus?: Variant['stockStatus']
    color?: string
    image?: ProductImage | null
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
  compareAt: '',
  badge: '',
  materials: '',
  finishes: '',
  leadTime: '',
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

function createVariant(): Variant {
  return {
    id: `variant-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: '',
    sku: '',
    price: '',
    stockCount: '',
    stockStatus: 'in_stock',
    color: '#c59a6b',
    image: null,
    specifications: [],
  }
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
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
  const materialOptions = useMemo(() => optionSets.materials, [optionSets.materials])
  const finishOptions = useMemo(() => optionSets.finishes, [optionSets.finishes])
  const badgeOptions = useMemo(() => optionSets.badges, [optionSets.badges])
  const leadTimeOptions = useMemo(() => optionSets.leadTimes, [optionSets.leadTimes])
  const colorOptions = useMemo(() => optionSets.colors, [optionSets.colors])
  const finalPreviewPrice = useMemo(() => {
    const basePrice = Number(form.price) || 0
    const compareAt = Number(form.compareAt) || 0
    const discountValue = Number(form.discountValue) || 0
    if (form.discountType === 'percentage' && discountValue > 0) {
      return Math.max(basePrice - (basePrice * discountValue) / 100, 0)
    }
    if (form.discountType === 'fixed' && discountValue > 0) {
      return Math.max(basePrice - discountValue, 0)
    }
    return basePrice || compareAt || 0
  }, [form.compareAt, form.discountType, form.discountValue, form.price])
  const isSlugSuggested = slugify(form.name) === form.slug

  // Load Initial Data
  useEffect(() => {
    async function init() {
      try {
        const [prodRes, catRes, optionRes] = await Promise.all([
          fetch('/api/admin/products', { cache: 'no-store' }),
          fetch('/api/categories', { cache: 'no-store' }),
          fetch('/api/admin/product-options', { cache: 'no-store' }),
        ])
        const prodData = await prodRes.json()
        const catData = await catRes.json()
        const optionData = await optionRes.json().catch(() => ({}))
        setProducts(prodData?.products || [])
        setCategories(catData?.categories || [])
        setOptionSets(optionData?.options || { badges: [], materials: [], finishes: [], leadTimes: [], colors: [] })
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

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
        `https://api.cloudinary.com/v1_1/${signatureData.cloudName}/image/upload`,
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
      compareAt: form.compareAt ? Number(form.compareAt) : null,
      badge: form.badge.trim() || null,
      materials: normalizeTextList(form.materials),
      finishes: normalizeTextList(form.finishes),
      leadTime: form.leadTime.trim() || null,
      palette: palette.filter(Boolean),
      images,
      variants: variants.map((v) => ({
        ...v,
        sku: v.sku?.trim() || undefined,
        price: v.price ? Number(v.price) : undefined,
        stockCount: v.stockCount ? Number(v.stockCount) : undefined,
        color: v.color?.trim() || undefined,
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
      const prodRes = await fetch('/api/admin/products', { cache: 'no-store' })
      const prodData = await prodRes.json()
      setProducts(prodData?.products || [])
      const optionRes = await fetch('/api/admin/product-options', { cache: 'no-store' })
      const optionData = await optionRes.json().catch(() => ({}))
      setOptionSets(optionData?.options || { badges: [], materials: [], finishes: [], leadTimes: [], colors: [] })
    } else {
      setError(data?.message || 'Failed to save product. Verify all fields.')
    }
    setSaving(false)
  }

  function beginEdit(p: Product) {
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
      compareAt: p.compareAt ? String(p.compareAt) : '',
      badge: p.badge || '',
      materials: p.materials?.join(', ') || '',
      finishes: p.finishes?.join(', ') || '',
      leadTime: p.leadTime || '',
    })
    const nextImages = p.images || []
    const nextPalette = p.palette?.length ? p.palette.slice(0, 3) : defaultPalette
    const nextVariants = (p.variants || []).map((variant) => ({
        ...variant,
        price: variant.price ? String(variant.price) : '',
        stockCount: variant.stockCount ? String(variant.stockCount) : '',
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
      compareAt: p.compareAt ?? null,
      badge: p.badge || null,
      materials: p.materials || [],
      finishes: p.finishes || [],
      leadTime: p.leadTime || null,
      palette: nextPalette.filter(Boolean),
      images: nextImages,
      variants: nextVariants.map((variant) => ({
        ...variant,
        sku: variant.sku || undefined,
        price: variant.price ? Number(variant.price) : undefined,
        stockCount: variant.stockCount ? Number(variant.stockCount) : undefined,
        color: variant.color || undefined,
        specifications: variant.specifications || [],
      })),
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function resetEditor() {
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
    setVariants((current) => current.map((variant) => (variant.id === id ? { ...variant, ...updates } : variant)))
  }

  function updateVariantSpec(id: string, value: string) {
    const specifications = value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
    updateVariant(id, { specifications })
  }

  async function handleDelete(id: string) {
    if (!confirm('Permanently remove this piece from the catalog?')) return
    await fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
    setProducts(prev => prev.filter(p => p.id !== id))
  }

  if (loading) {
    return <div className="text-[10px] uppercase tracking-widest text-[#8C7A6B]">Loading catalog controls...</div>
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-4 px-2 sm:flex-row sm:items-center sm:justify-between">
         <div>
            <h1 className="font-display text-4xl text-[#2B2119]">Design Catalog</h1>
            <p className="mt-1 text-sm text-[#8C7A6B]">Manage your studio&apos;s curated pieces, discounts, colors, and variants.</p>
         </div>
         <div className="flex items-center gap-3">
            <span className="rounded-full bg-[#FCFAF6] border border-[#E6D9C8] px-4 py-2 text-[10px] uppercase tracking-widest font-bold text-[#7C4E2F]">
               {products.length} Total Pieces
            </span>
         </div>
      </div>

      <div className="grid gap-10 xl:grid-cols-[minmax(0,1.25fr)_minmax(360px,460px)]">
         {/* Catalog Feed */}
         <div className="space-y-6">
            <div className="flex flex-col gap-3 border-b border-[#E6D9C8] pb-4 sm:flex-row sm:items-center sm:justify-between">
               <h2 className="font-display text-xl text-[#2B2119]">Active Portfolio</h2>
               <p className="max-w-xl text-xs text-[#8C7A6B]">Long names, descriptions, discount states, and variant counts now stay readable instead of crushing the card layout.</p>
            </div>

            <div className="grid gap-5 pr-1 sm:pr-0 2xl:grid-cols-2">
               <AnimatePresence mode="popLayout">
                  {products.map((p) => (
                     <motion.div 
                        layout
                        key={p.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="group relative overflow-hidden rounded-[32px] border border-[#E6D9C8] bg-white p-5 pr-6 transition-all hover:shadow-xl hover:shadow-[#C5A070]/5"
                     >
                        <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
                           <div className="flex items-start gap-4 lg:w-full">
                           <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-[#FCFAF6] border border-[#F4EEE4]">
                              {p.images?.[0] ? (
                                 <img src={p.images[0].url} className="h-full w-full object-cover transition-transform group-hover:scale-110" />
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
                                    {p.compareAt && p.compareAt > p.price ? (
                                      <p className="text-xs text-[#8C7A6B] line-through">{formatMoney(p.compareAt)}</p>
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
                                    onClick={() => beginEdit(p)}
                                    className="flex-1 rounded-full border border-[#E6D9C8] py-2 text-[9px] font-bold uppercase tracking-widest text-[#2B2119] transition hover:bg-[#F4EEE4]"
                                 >
                                    Refine
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
         </div>

         {/* Command Sidebar Form */}
         <div className="space-y-6 xl:sticky xl:top-10 xl:self-start">
            <div className="rounded-[40px] border border-[#E6D9C8] bg-white p-6 shadow-2xl shadow-[#C5A070]/5 sm:p-8">
               <div className="mb-8 flex items-center justify-between gap-4">
                  <h2 className="font-display text-2xl text-[#2B2119]">{editingId ? 'Refine Piece' : 'New Entry'}</h2>
                  {editingId ? (
                     <button onClick={resetEditor} className="text-[10px] font-bold uppercase tracking-widest text-[#8C7A6B]">Cancel</button>
                  ) : null}
               </div>
               {editingId ? (
                  <div className="mb-6 rounded-3xl border border-[#E6D9C8] bg-[#FCFAF6] p-4 text-xs text-[#6B594A]">
                     Only fields you change are saved, so you can refine one detail without rewriting the whole product.
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
                     <div className="mt-4 grid gap-4 sm:grid-cols-3">
                        <div>
                           <label className="text-[9px] font-bold uppercase tracking-widest text-[#8C7A6B]">Discount Type</label>
                           <select value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value })} className="mt-2 h-12 w-full rounded-2xl border border-[#E6D9C8] bg-white px-4 text-sm outline-none"><option value="">None</option><option value="percentage">Percentage</option><option value="fixed">Fixed amount</option></select>
                        </div>
                        <div>
                           <label className="text-[9px] font-bold uppercase tracking-widest text-[#8C7A6B]">Discount Value</label>
                           <input type="number" value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: e.target.value })} placeholder={form.discountType === 'percentage' ? '10' : '5000'} className="mt-2 h-12 w-full rounded-2xl border border-[#E6D9C8] bg-white px-4 text-sm outline-none" />
                        </div>
                        <div>
                           <label className="text-[9px] font-bold uppercase tracking-widest text-[#8C7A6B]">Compare At</label>
                           <input type="number" value={form.compareAt} onChange={(e) => setForm({ ...form, compareAt: e.target.value })} placeholder="Original price" className="mt-2 h-12 w-full rounded-2xl border border-[#E6D9C8] bg-white px-4 text-sm outline-none" />
                        </div>
                     </div>
                     <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl border border-[#E6D9C8] bg-white px-4 py-3 text-sm">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#8C7A6B]">Live Selling Price</span>
                        <span className="font-bold text-[#7C4E2F]">{formatMoney(finalPreviewPrice)}</span>
                        {Number(form.compareAt) > finalPreviewPrice ? (
                          <span className="text-xs text-[#8C7A6B] line-through">{formatMoney(Number(form.compareAt))}</span>
                        ) : null}
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

                  <div className="rounded-3xl bg-[#F4EEE4]/50 p-5 sm:p-6"><p className="text-[9px] font-bold uppercase tracking-widest text-[#8C7A6B]">Visual Assets</p><div className="mt-4 flex flex-wrap gap-2">{images.map((img, i) => (<div key={i} className="relative h-16 w-16 overflow-hidden rounded-xl border border-[#E6D9C8]"><img src={img.url} className="h-full w-full object-cover" /><button type="button" onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))} className="absolute right-1 top-1 rounded-full bg-black/50 p-1 text-[8px] text-white">x</button></div>))}{images.length < 5 ? (<label className="flex h-16 w-16 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[#C5A070] bg-white text-[#C5A070] transition hover:bg-[#C5A070]/5">{uploading ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#C5A070] border-t-transparent" /> : <span>+</span>}<input type="file" className="hidden" onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0], (img) => setImages([...images, img]))} /></label>) : null}</div></div>

                  <div className="rounded-3xl bg-[#F4EEE4]/50 p-5 sm:p-6">
                     <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-[9px] font-bold uppercase tracking-widest text-[#8C7A6B]">Variants</p><p className="mt-1 text-xs text-[#8C7A6B]">Use variants when a product has selectable options like colorways, finishes, or special pricing.</p></div><div className="flex flex-wrap items-center gap-2"><button type="button" onClick={() => setVariants((current) => [...current, createVariant()])} className="rounded-full border border-[#C5A070] px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-[#7C4E2F] transition hover:bg-white">Add Variant</button>{editingId ? <button type="submit" className="rounded-full border border-[#C5A070] px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-[#7C4E2F]">Save Variants</button> : null}</div></div>
                     <div className="mt-4 space-y-4">
                        {variants.length === 0 ? <div className="rounded-2xl border border-dashed border-[#DCCBB7] bg-white/70 p-4 text-sm text-[#8C7A6B]">No variants yet. If the piece has only one standard option, variants are not required.</div> : null}
                        {variants.map((variant, index) => (<div key={variant.id} className="rounded-[28px] border border-[#E6D9C8] bg-white p-4 sm:p-5"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><p className="text-[10px] font-bold uppercase tracking-widest text-[#7C4E2F]">Variant {index + 1}</p><button type="button" onClick={() => setVariants((current) => current.filter((entry) => entry.id !== variant.id))} className="text-[10px] font-bold uppercase tracking-widest text-red-500">Remove</button></div><div className="mt-4 grid gap-4 sm:grid-cols-2"><input value={variant.name} onChange={(e) => updateVariant(variant.id, { name: e.target.value })} placeholder="Variant name" className="h-12 rounded-2xl border border-[#E6D9C8] px-4 text-sm outline-none" /><input value={variant.sku || ''} onChange={(e) => updateVariant(variant.id, { sku: e.target.value })} placeholder="SKU" className="h-12 rounded-2xl border border-[#E6D9C8] px-4 text-sm outline-none" /><input type="number" value={variant.price || ''} onChange={(e) => updateVariant(variant.id, { price: e.target.value })} placeholder="Variant price" className="h-12 rounded-2xl border border-[#E6D9C8] px-4 text-sm outline-none" /><input type="number" value={variant.stockCount || ''} onChange={(e) => updateVariant(variant.id, { stockCount: e.target.value })} placeholder="Variant stock" className="h-12 rounded-2xl border border-[#E6D9C8] px-4 text-sm outline-none" /></div><div className="mt-4 grid gap-4 sm:grid-cols-[1fr_auto]"><select value={variant.stockStatus || 'in_stock'} onChange={(e) => updateVariant(variant.id, { stockStatus: e.target.value as Variant['stockStatus'] })} className="h-12 rounded-2xl border border-[#E6D9C8] px-4 text-sm outline-none"><option value="in_stock">In stock</option><option value="low_stock">Low stock</option><option value="out_of_stock">Out of stock</option><option value="preorder">Preorder</option></select><div className="flex items-center gap-3 rounded-2xl border border-[#E6D9C8] px-3 py-2"><input type="color" value={variant.color || '#c59a6b'} onChange={(e) => updateVariant(variant.id, { color: e.target.value })} className="h-9 w-10 rounded-xl border border-[#E6D9C8] bg-transparent p-1" /><input value={variant.color || ''} onChange={(e) => updateVariant(variant.id, { color: e.target.value })} placeholder="#c59a6b" className="h-9 w-28 text-sm outline-none" /></div></div><div className="mt-4"><label className="text-[9px] font-bold uppercase tracking-widest text-[#8C7A6B]">Specifications</label><input value={(variant.specifications || []).join(', ')} onChange={(e) => updateVariantSpec(variant.id, e.target.value)} placeholder="Walnut finish, boucle upholstery" className="mt-2 h-12 w-full rounded-2xl border border-[#E6D9C8] px-4 text-sm outline-none" /></div></div>))}
                     </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-[#8C7A6B]">Product Attributes</p>
                      {editingId ? <button type="submit" className="rounded-full border border-[#C5A070] px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest text-[#7C4E2F]">Save Attributes</button> : null}
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
    </div>
  )
}

