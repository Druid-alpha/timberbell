'use client'

import { useEffect, useState, Dispatch, SetStateAction } from 'react'
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

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<{id:string, slug:string, name:string}[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState<ProductForm>(emptyForm)
  const [images, setImages] = useState<ProductImage[]>([])
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
      materials: form.materials.split(',').map(m => m.trim()).filter(Boolean),
      finishes: form.finishes.split(',').map(f => f.trim()).filter(Boolean),
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
    setVariants(p.variants || [])
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleDelete(id: string) {
    if (!confirm('Permanently remove this piece from the catalog?')) return
    await fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
    setProducts(prev => prev.filter(p => p.id !== id))
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-4 px-2 sm:flex-row sm:items-center sm:justify-between">
         <div>
            <h1 className="font-display text-4xl text-[#2B2119]">Design Catalog</h1>
            <p className="mt-1 text-sm text-[#8C7A6B]">Manage your studio's curated pieces and material variants.</p>
         </div>
         <div className="flex items-center gap-3">
            <span className="rounded-full bg-[#FCFAF6] border border-[#E6D9C8] px-4 py-2 text-[10px] uppercase tracking-widest font-bold text-[#7C4E2F]">
               {products.length} Total Pieces
            </span>
         </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-[1fr_minmax(320px,450px)]">
         {/* Catalog Feed */}
         <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-[#E6D9C8] pb-4">
               <h2 className="font-display text-xl text-[#2B2119]">Active Portfolio</h2>
               <div className="flex gap-2">
                  <button className="h-8 w-8 flex items-center justify-center rounded-lg border border-[#E6D9C8] bg-white text-[#8C7A6B]">
                     <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
                  </button>
               </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
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
                        <div className="flex gap-5">
                           <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-[#FCFAF6] border border-[#F4EEE4]">
                              {p.images?.[0] ? (
                                 <img src={p.images[0].url} className="h-full w-full object-cover transition-transform group-hover:scale-110" />
                              ) : (
                                 <div className="flex h-full w-full items-center justify-center text-[10px] tracking-widest opacity-20 uppercase font-bold text-[#8C7A6B]">No Image</div>
                              )}
                           </div>
                           <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                 <div>
                                    <p className="text-[9px] font-bold uppercase tracking-widest text-[#C5A070]">{p.category}</p>
                                    <h3 className="mt-0.5 truncate text-sm font-bold text-[#2B2119]">{p.name}</h3>
                                 </div>
                                 <div className="text-right">
                                    <p className="text-sm font-bold text-[#7C4E2F]">{formatMoney(p.price)}</p>
                                 </div>
                              </div>
                              <div className="mt-3 flex items-center gap-2">
                                 <span className={`h-1.5 w-1.5 rounded-full ${p.inventoryCount && p.inventoryCount > 10 ? 'bg-green-500' : 'bg-orange-500'}`} />
                                 <span className="text-[10px] font-bold uppercase tracking-widest text-[#8C7A6B]">
                                    {p.inventoryCount ?? 0} In Stock
                                 </span>
                              </div>
                              <div className="mt-4 flex gap-2">
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
         <div className="space-y-6 lg:sticky lg:top-10">
            <div className="rounded-[40px] border border-[#E6D9C8] bg-white p-8 shadow-2xl shadow-[#C5A070]/5">
               <div className="mb-8 flex items-center justify-between">
                  <h2 className="font-display text-2xl text-[#2B2119]">{editingId ? 'Refine Piece' : 'New Entry'}</h2>
                  {editingId && (
                     <button onClick={() => {setEditingId(null); setForm(emptyForm); setImages([]); setVariants([])}} className="text-[10px] font-bold uppercase tracking-widest text-[#8C7A6B]">Cancel</button>
                  )}
               </div>

               <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                     <div>
                        <label className="text-[9px] font-bold uppercase tracking-widest text-[#8C7A6B]">Design Name</label>
                        <input 
                           required
                           value={form.name}
                           onChange={e => setForm({...form, name: e.target.value})}
                           className="mt-2 h-12 w-full rounded-2xl border border-[#E6D9C8] bg-[#FCFAF6] px-4 text-sm focus:border-[#C5A070] outline-none transition" 
                        />
                     </div>
                     <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                           <label className="text-[9px] font-bold uppercase tracking-widest text-[#8C7A6B]">Category</label>
                           <select 
                              value={form.category}
                              onChange={e => setForm({...form, category: e.target.value})}
                              className="mt-2 h-12 w-full rounded-2xl border border-[#E6D9C8] bg-[#FCFAF6] px-4 text-sm outline-none"
                           >
                              <option value="">Select...</option>
                              {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                           </select>
                        </div>
                        <div>
                           <label className="text-[9px] font-bold uppercase tracking-widest text-[#8C7A6B]">Price</label>
                           <input 
                              type="number"
                              required
                              value={form.price}
                              onChange={e => setForm({...form, price: e.target.value})}
                              className="mt-2 h-12 w-full rounded-2xl border border-[#E6D9C8] bg-[#FCFAF6] px-4 text-sm outline-none" 
                           />
                        </div>
                     </div>
                     <div>
                        <label className="text-[9px] font-bold uppercase tracking-widest text-[#8C7A6B]">Description</label>
                        <textarea 
                           className="mt-2 h-32 w-full rounded-3xl border border-[#E6D9C8] bg-[#FCFAF6] px-4 py-3 text-sm outline-none" 
                           value={form.description}
                           onChange={e => setForm({...form, description: e.target.value})}
                        />
                     </div>
                  </div>

                  <div className="rounded-3xl bg-[#F4EEE4]/50 p-6">
                     <p className="text-[9px] font-bold uppercase tracking-widest text-[#8C7A6B]">Visual Assets</p>
                     <div className="mt-4 flex flex-wrap gap-2">
                        {images.map((img, i) => (
                           <div key={i} className="relative h-16 w-16 overflow-hidden rounded-xl border border-[#E6D9C8]">
                              <img src={img.url} className="h-full w-full object-cover" />
                              <button type="button" onClick={() => setImages(prev => prev.filter((_, idx) => idx !== i))} className="absolute right-1 top-1 rounded-full bg-black/50 p-1 text-[8px] text-white">✕</button>
                           </div>
                        ))}
                        {images.length < 3 && (
                           <label className="flex h-16 w-16 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[#C5A070] bg-white text-[#C5A070] transition hover:bg-[#C5A070]/5">
                              {uploading ? <div className="h-4 w-4 border-2 border-[#C5A070] border-t-transparent rounded-full animate-spin" /> : <span>+</span>}
                              <input type="file" className="hidden" onChange={e => e.target.files?.[0] && uploadImage(e.target.files[0], img => setImages([...images, img]))} />
                           </label>
                        )}
                     </div>
                  </div>

                  {error && <p className="text-[10px] font-bold text-red-500 text-center">{error}</p>}

                  <button 
                     disabled={saving}
                     className="h-14 w-full rounded-full bg-[#2B2119] text-[11px] font-bold uppercase tracking-[0.3em] text-[#FDFCFB] shadow-xl shadow-[#2B2119]/20 transition-all hover:scale-[1.02] disabled:opacity-50"
                  >
                     {saving ? 'Synchronizing...' : (editingId ? 'Save Piece' : 'Register Piece')}
                  </button>
               </form>
            </div>
         </div>
      </div>
    </div>
  )
}
