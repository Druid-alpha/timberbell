'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type User = {
  id: string
  name?: string
  email?: string
  phone?: string
  avatarUrl?: string
  role?: 'admin' | 'user'
  createdAt?: string
  lastLoginAt?: string
  ordersCount?: number
  lastOrderAt?: string
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  async function loadUsers() {
    const res = await fetch('/api/admin/users', { cache: 'no-store' })
    const json = await res.json()
    setUsers(json?.users || [])
    setLoading(false)
  }

  useEffect(() => { loadUsers() }, [])

  async function updateRole(id: string, role: string) {
    await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, role }),
    })
    loadUsers()
  }

  async function handleDelete(id: string) {
    if (!confirm('Permanently remove this curator from the vault?')) return
    await fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
    setUsers(prev => prev.filter(u => u.id !== id))
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between px-2">
         <div>
            <h1 className="font-display text-4xl text-[#2B2119]">Curator Vault</h1>
            <p className="mt-1 text-sm text-[#8C7A6B]">Manage atelier members and verify executive access.</p>
         </div>
         <div className="flex items-center gap-3">
            <span className="rounded-full bg-[#FCFAF6] border border-[#E6D9C8] px-4 py-2 text-[10px] uppercase tracking-widest font-bold text-[#7C4E2F]">
               {users.length} Active Members
            </span>
         </div>
      </div>

      <div className="overflow-hidden rounded-[40px] border border-[#E6D9C8] bg-white shadow-xl shadow-[#C5A070]/5">
         <table className="w-full text-left">
            <thead className="bg-[#FCFAF6] border-b border-[#E6D9C8]">
               <tr>
                  <th className="px-8 py-5 text-[10px] uppercase tracking-widest text-[#8C7A6B]">Curator</th>
                  <th className="px-8 py-5 text-[10px] uppercase tracking-widest text-[#8C7A6B]">Access Level</th>
                  <th className="px-8 py-5 text-[10px] uppercase tracking-widest text-[#8C7A6B]">Engagement</th>
                  <th className="px-8 py-5 text-[10px] uppercase tracking-widest text-[#8C7A6B]">Established</th>
                  <th className="px-8 py-5 text-[10px] uppercase tracking-widest text-[#8C7A6B] text-right">Control</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-[#F4EEE4]">
               <AnimatePresence mode="popLayout">
                  {users.map((u) => (
                     <motion.tr 
                        layout
                        key={u.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="group transition-colors hover:bg-[#FCFAF6]/50"
                     >
                        <td className="px-8 py-6">
                           <div className="flex items-center gap-4">
                              <div className="h-10 w-10 flex items-center justify-center rounded-full bg-[#2B2119] p-0.5 shadow-md">
                                 {u.avatarUrl ? (
                                    <img src={u.avatarUrl} className="h-full w-full rounded-full object-cover" />
                                 ) : (
                                    <div className="h-full w-full rounded-full bg-white flex items-center justify-center text-[10px] font-bold text-[#7C4E2F]">
                                       {(u.name || 'U').slice(0, 1).toUpperCase()}
                                    </div>
                                 )}
                              </div>
                              <div>
                                 <p className="text-xs font-bold text-[#2B2119]">{u.name || 'Anonymous Client'}</p>
                                 <p className="text-[10px] text-[#8C7A6B]">{u.email}</p>
                              </div>
                           </div>
                        </td>
                        <td className="px-8 py-6">
                           <select 
                              value={u.role || 'user'}
                              onChange={(e) => updateRole(u.id, e.target.value)}
                              className={`rounded-full border border-[#E6D9C8] bg-white px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest outline-none transition-all ${u.role === 'admin' ? 'text-[#C5A070] border-[#C5A070]/30' : 'text-[#8C7A6B]'}`}
                           >
                              <option value="user">Member</option>
                              <option value="admin">Executive</option>
                           </select>
                        </td>
                        <td className="px-8 py-6">
                           <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold text-[#2B2119]">{u.ordersCount || 0} Bundles</span>
                              <div className="h-1 w-8 rounded-full bg-[#F4EEE4]">
                                 <div className="h-full rounded-full bg-[#C5A070]" style={{ width: `${Math.min((u.ordersCount || 0) * 20, 100)}%` }} />
                              </div>
                           </div>
                        </td>
                        <td className="px-8 py-6">
                           <p className="text-[10px] font-bold text-[#8C7A6B]">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}</p>
                        </td>
                        <td className="px-8 py-6 text-right">
                           <button 
                              onClick={() => handleDelete(u.id)}
                              className="rounded-full border border-red-50 px-4 py-2 text-[9px] font-bold uppercase tracking-widest text-red-400 transition hover:bg-red-50 hover:text-red-600"
                           >
                              Purge
                           </button>
                        </td>
                     </motion.tr>
                  ))}
               </AnimatePresence>
            </tbody>
         </table>
      </div>
    </div>
  )
}
