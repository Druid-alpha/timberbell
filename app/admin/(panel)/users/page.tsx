'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

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
    const json = await res.json().catch(() => ({}))
    setUsers(json?.users ?? [])
  }

  useEffect(() => {
    let active = true
    async function load() {
      try {
        await loadUsers()
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [])

  async function updateRole(id: string, role: 'admin' | 'user') {
    await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, role }),
    })
    await loadUsers()
  }

  async function updatePhone(id: string, phone: string) {
    await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, phone }),
    })
    await loadUsers()
  }

  async function uploadAvatar(userId: string, file: File) {
    const signatureRes = await fetch('/api/admin/cloudinary/signature', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ folder: 'timberbell/avatars' }),
    })
    const signatureData = await signatureRes.json()
    if (!signatureRes.ok) return

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
    if (!uploadRes.ok) return

    await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: userId, avatarUrl: uploadJson.secure_url }),
    })
    await loadUsers()
  }

  async function handleDelete(id: string) {
    const confirmed = confirm('Delete this user?')
    if (!confirmed) return
    await fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
    await loadUsers()
  }

  return (
    <div className="rounded-[2rem] border border-[#E6D9C8] bg-white/70 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[#8C7A6B]">Users</p>
          <h2 className="mt-3 font-display text-2xl text-[#2B2119]">Customer list</h2>
        </div>
        <span className="text-xs uppercase tracking-[0.3em] text-[#8C7A6B]">
          {users.length} users
        </span>
      </div>
      <div className="mt-6 space-y-3">
        {loading ? (
          <div className="rounded-2xl border border-[#E6D9C8] bg-[#F4EEE4] p-4 text-sm text-[#6B665A]">
            Loading users...
          </div>
        ) : users.length ? (
          users.map((user) => (
            <div
              key={user.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#E6D9C8] bg-[#F4EEE4] p-4"
            >
              <div className="flex items-center gap-4">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt=""
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E9E1D4] text-sm font-semibold text-[#2B2119]">
                    {(user.name || 'U').slice(0, 1).toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="text-sm font-semibold text-[#2B2119]">
                    {user.name || 'Unnamed user'}
                  </div>
                  <div className="text-[10px] uppercase tracking-[0.3em] text-[#8C7A6B]">
                    {user.email?.toLowerCase() || 'no-email'}
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      defaultValue={user.phone || ''}
                      placeholder="Phone"
                      className="h-9 w-44 rounded-full border border-[#E6D9C8] bg-white px-3 text-xs"
                      onBlur={(event) => updatePhone(user.id, event.target.value)}
                    />
                    <span className="text-[10px] uppercase tracking-[0.3em] text-[#8C7A6B]">
                      {user.role || 'user'}
                    </span>
                  </div>
                  <label className="mt-2 inline-flex cursor-pointer items-center rounded-full border border-[#7C4E2F] px-3 py-2 text-[10px] uppercase tracking-[0.3em] text-[#2B2119]">
                    Upload avatar
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(event) => {
                        const file = event.target.files?.[0]
                        if (!file) return
                        uploadAvatar(user.id, file)
                        event.target.value = ''
                      }}
                    />
                  </label>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.3em] text-[#8C7A6B]">
                <span>
                  Joined:{' '}
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}
                </span>
                <span>
                  Last login:{' '}
                  {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : '-'}
                </span>
                <span>Orders: {user.ordersCount ?? 0}</span>
                <span>
                  Last order:{' '}
                  {user.lastOrderAt ? new Date(user.lastOrderAt).toLocaleDateString() : '-'}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.3em]">
                <select
                  value={user.role ?? 'user'}
                  onChange={(event) => updateRole(user.id, event.target.value as 'admin' | 'user')}
                  className="h-9 rounded-full border border-[#E6D9C8] bg-white px-3 text-[10px] uppercase tracking-[0.3em] text-[#2B2119]"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
                <Button
                  type="button"
                  onClick={() => handleDelete(user.id)}
                  variant="destructive"
                  size="sm"
                >
                  Delete
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-[#E6D9C8] bg-[#F4EEE4] p-4 text-sm text-[#6B665A]">
            No users yet.
          </div>
        )}
      </div>
    </div>
  )
}


