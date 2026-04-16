'use client'

import { useEffect, useState } from 'react'
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
}

const defaultPalette = ['#f4e7d2', '#eab38b', '#c59a6b']

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
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState<ProductForm>(emptyForm)
  const [images, setImages] = useState<ProductImage[]>([])
  const [palette, setPalette] = useState<string[]>(defaultPalette)
  const [variants, setVariants] = useState<Variant[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  // Load Initial Data
  useEffect(() => {
    async function init() {
      try {
        const [prodRes, catRes] = await Promise.all([
          fetch('/api/admin/products', { cache: 'no-store' }),
          fetch('/api/categories', { cache: 'no-store' })
        ])
        const prodData = await prodRes.json()
        const catData = await catRes.json()
        setProducts(prodData?.products || [])
        setCategories(catData?.categories || [])
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

  // Submit Logic
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    
    const payload = {
      ...form,
      price: Number(form.price),
      inventoryCount: form.inventoryCount ? Number(form.inventoryCount) : null,
      discountValue: form.discountValue ? Number(form.discountValue) : null,
      compareAt: form.compareAt ? Number(form.compareAt) : null,
      materials: form.materials.split(',').map(m => m.trim()).filter(Boolean),
      finishes: form.finishes.split(',').map(f => f.trim()).filter(Boolean),
      palette: palette.filter(Boolean),
      images,
      variants: variants.map(v => ({
        ...v,
        price: v.price ? Number(v.price) : undefined,
        stockCount: v.stockCount ? Number(v.stockCount) : undefined,
      }))
    }

    const url = editingId ? `/api/admin/products/${editingId}` : '/api/admin/products'
    const method = editingId ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    if (res.ok) {
      setForm(emptyForm)
      setImages([])
      setPalette(defaultPalette)
      setVariants([])
      setEditingId(null)
      // Reload products
      const prodRes = await fetch('/api/admin/products', { cache: 'no-store' })
      const prodData = await prodRes.json()
      setProducts(prodData?.products || [])
    } else {
      setError('Failed to save product. Verify all fields.')
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
    })
    setImages(p.images || [])
    setPalette(p.palette?.length ? p.palette.slice(0, 3) : defaultPalette)
    setVariants(
      (p.variants || []).map((variant) => ({
        ...variant,
        price: variant.price ? String(variant.price) : '',
        stockCount: variant.stockCount ? String(variant.stockCount) : '',
        specifications: variant.specifications || [],
      }))
    )
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function resetEditor() {
    setEditingId(null)
    setForm(emptyForm)
    setImages([])
    setPalette(defaultPalette)
    setVariants([])
    setError('')
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

            <div className="grid gap-5 2xl:grid-cols-2">
               <AnimatePresence mode="popLayout">
                  {products.map((p) => (
                     <motion.div 
                        layout
                        key={p.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="group relative overflow-hidden rounded-[32px] border border-[#E6D9C8] bg-white p-5 transition-all hover:shadow-xl hover:shadow-[#C5A070]/5"
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

               <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                     <div>
                        <label className="text-[9px] font-bold uppercase tracking-widest text-[#8C7A6B]">Design Name</label>
                        <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-2 h-12 w-full rounded-2xl border border-[#E6D9C8] bg-[#FCFAF6] px-4 text-sm outline-none transition focus:border-[#C5A070]" />
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
                           <label className="text-[9px] font-bold uppercase tracking-widest text-[#8C7A6B]">Badge</label>
                           <input value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })} placeholder="New, Best Seller, Limited" className="mt-2 h-12 w-full rounded-2xl border border-[#E6D9C8] bg-[#FCFAF6] px-4 text-sm outline-none" />
                        </div>
                     </div>
                  </div>

                  <div className="rounded-3xl bg-[#F4EEE4]/50 p-5 sm:p-6">
                     <p className="text-[9px] font-bold uppercase tracking-widest text-[#8C7A6B]">Discount & Pricing</p>
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
                  </div>

                  <div className="rounded-3xl bg-[#F4EEE4]/50 p-5 sm:p-6">
                     <div className="flex items-center justify-between gap-4"><p className="text-[9px] font-bold uppercase tracking-widest text-[#8C7A6B]">Palette Colors</p><span className="text-[9px] text-[#8C7A6B]">Used in cards and fallback visuals</span></div>
                     <div className="mt-4 grid gap-4 sm:grid-cols-3">
                        {palette.map((color, index) => (
                           <div key={`palette-${index}`} className="rounded-2xl border border-[#E6D9C8] bg-white p-3">
                              <label className="text-[9px] font-bold uppercase tracking-widest text-[#8C7A6B]">Color {index + 1}</label>
                              <div className="mt-3 flex items-center gap-3">
                                 <input type="color" value={color} onChange={(e) => setPalette((current) => current.map((entry, i) => (i === index ? e.target.value : entry)))} className="h-11 w-12 rounded-xl border border-[#E6D9C8] bg-transparent p-1" />
                                 <input value={color} onChange={(e) => setPalette((current) => current.map((entry, i) => (i === index ? e.target.value : entry)))} className="h-11 flex-1 rounded-xl border border-[#E6D9C8] px-3 text-sm outline-none" />
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>

                  <div className="rounded-3xl bg-[#F4EEE4]/50 p-5 sm:p-6"><p className="text-[9px] font-bold uppercase tracking-widest text-[#8C7A6B]">Visual Assets</p><div className="mt-4 flex flex-wrap gap-2">{images.map((img, i) => (<div key={i} className="relative h-16 w-16 overflow-hidden rounded-xl border border-[#E6D9C8]"><img src={img.url} className="h-full w-full object-cover" /><button type="button" onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))} className="absolute right-1 top-1 rounded-full bg-black/50 p-1 text-[8px] text-white">x</button></div>))}{images.length < 5 ? (<label className="flex h-16 w-16 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[#C5A070] bg-white text-[#C5A070] transition hover:bg-[#C5A070]/5">{uploading ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#C5A070] border-t-transparent" /> : <span>+</span>}<input type="file" className="hidden" onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0], (img) => setImages([...images, img]))} /></label>) : null}</div></div>

                  <div className="rounded-3xl bg-[#F4EEE4]/50 p-5 sm:p-6">
                     <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-[9px] font-bold uppercase tracking-widest text-[#8C7A6B]">Variants</p><p className="mt-1 text-xs text-[#8C7A6B]">Use variants when a product has selectable options like colorways, finishes, or special pricing.</p></div><button type="button" onClick={() => setVariants((current) => [...current, createVariant()])} className="rounded-full border border-[#C5A070] px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-[#7C4E2F] transition hover:bg-white">Add Variant</button></div>
                     <div className="mt-4 space-y-4">
                        {variants.length === 0 ? <div className="rounded-2xl border border-dashed border-[#DCCBB7] bg-white/70 p-4 text-sm text-[#8C7A6B]">No variants yet. If the piece has only one standard option, variants are not required.</div> : null}
                        {variants.map((variant, index) => (<div key={variant.id} className="rounded-[28px] border border-[#E6D9C8] bg-white p-4 sm:p-5"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><p className="text-[10px] font-bold uppercase tracking-widest text-[#7C4E2F]">Variant {index + 1}</p><button type="button" onClick={() => setVariants((current) => current.filter((entry) => entry.id !== variant.id))} className="text-[10px] font-bold uppercase tracking-widest text-red-500">Remove</button></div><div className="mt-4 grid gap-4 sm:grid-cols-2"><input value={variant.name} onChange={(e) => updateVariant(variant.id, { name: e.target.value })} placeholder="Variant name" className="h-12 rounded-2xl border border-[#E6D9C8] px-4 text-sm outline-none" /><input value={variant.sku || ''} onChange={(e) => updateVariant(variant.id, { sku: e.target.value })} placeholder="SKU" className="h-12 rounded-2xl border border-[#E6D9C8] px-4 text-sm outline-none" /><input type="number" value={variant.price || ''} onChange={(e) => updateVariant(variant.id, { price: e.target.value })} placeholder="Variant price" className="h-12 rounded-2xl border border-[#E6D9C8] px-4 text-sm outline-none" /><input type="number" value={variant.stockCount || ''} onChange={(e) => updateVariant(variant.id, { stockCount: e.target.value })} placeholder="Variant stock" className="h-12 rounded-2xl border border-[#E6D9C8] px-4 text-sm outline-none" /></div><div className="mt-4 grid gap-4 sm:grid-cols-[1fr_auto]"><select value={variant.stockStatus || 'in_stock'} onChange={(e) => updateVariant(variant.id, { stockStatus: e.target.value as Variant['stockStatus'] })} className="h-12 rounded-2xl border border-[#E6D9C8] px-4 text-sm outline-none"><option value="in_stock">In stock</option><option value="low_stock">Low stock</option><option value="out_of_stock">Out of stock</option><option value="preorder">Preorder</option></select><div className="flex items-center gap-3 rounded-2xl border border-[#E6D9C8] px-3 py-2"><input type="color" value={variant.color || '#c59a6b'} onChange={(e) => updateVariant(variant.id, { color: e.target.value })} className="h-9 w-10 rounded-xl border border-[#E6D9C8] bg-transparent p-1" /><input value={variant.color || ''} onChange={(e) => updateVariant(variant.id, { color: e.target.value })} placeholder="#c59a6b" className="h-9 w-28 text-sm outline-none" /></div></div><div className="mt-4"><label className="text-[9px] font-bold uppercase tracking-widest text-[#8C7A6B]">Specifications</label><input value={(variant.specifications || []).join(', ')} onChange={(e) => updateVariantSpec(variant.id, e.target.value)} placeholder="Walnut finish, boucle upholstery" className="mt-2 h-12 w-full rounded-2xl border border-[#E6D9C8] px-4 text-sm outline-none" /></div></div>))}
                     </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2"><div><label className="text-[9px] font-bold uppercase tracking-widest text-[#8C7A6B]">Materials</label><input value={form.materials} onChange={(e) => setForm({ ...form, materials: e.target.value })} placeholder="Oak, boucle, linen" className="mt-2 h-12 w-full rounded-2xl border border-[#E6D9C8] bg-[#FCFAF6] px-4 text-sm outline-none" /></div><div><label className="text-[9px] font-bold uppercase tracking-widest text-[#8C7A6B]">Finishes</label><input value={form.finishes} onChange={(e) => setForm({ ...form, finishes: e.target.value })} placeholder="Matte, polished, brushed" className="mt-2 h-12 w-full rounded-2xl border border-[#E6D9C8] bg-[#FCFAF6] px-4 text-sm outline-none" /></div></div>

                  {error ? <p className="text-center text-[10px] font-bold text-red-500">{error}</p> : null}
                  <button disabled={saving} className="h-14 w-full rounded-full bg-[#2B2119] text-[11px] font-bold uppercase tracking-[0.3em] text-[#FDFCFB] shadow-xl shadow-[#2B2119]/20 transition-all hover:scale-[1.02] disabled:opacity-50">{saving ? 'Synchronizing...' : (editingId ? 'Save Piece' : 'Register Piece')}</button>
               </form>
            </div>
         </div>
      </div>
    </div>
  )
}

