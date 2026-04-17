'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import SectionHeading from '@/app/_components/SectionHeading'

export default function RegisterPage() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  const uploadAvatar = async (file: File) => {
    setUploading(true)
    try {
      const signatureRes = await fetch('/api/cloudinary/public-signature', { method: 'POST' })
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
      setAvatarUrl(uploadJson.secure_url)
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setStatus('Creating your account...')

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: `${firstName} ${lastName}`.trim(),
        email,
        password,
        avatarUrl,
      }),
    })

    const data = await res.json().catch(() => ({}))

    if (res.ok) {
      setStatus(data.message || 'Check your inbox to verify your email.')
      return
    }

    setStatus(data.message || 'Registration failed. Try again.')
  }

  return (
    <div className="mx-auto max-w-4xl space-y-10 px-6 py-16">
      <SectionHeading
        eyebrow="Register"
        title="Create your Timberbell profile"
        description="Save favorites, track orders, and access concierge styling support."
      />
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <form onSubmit={handleSubmit} className="space-y-8 rounded-[40px] border border-[#E6D9C8] bg-[#F4EEE4] p-8 shadow-sm">
          <div className="flex flex-col items-center gap-6 pb-4 border-b border-[#E6D9C8]/50">
            <div className="relative group">
              <AnimatePresence mode="wait">
                <motion.div
                  key={avatarUrl || 'empty'}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="h-24 w-24 overflow-hidden rounded-full border-2 border-white bg-[#E9E1D4] shadow-md transition-transform group-hover:scale-105"
                >
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-3xl font-display text-[#7C4E2F]">
                      {(firstName || 'A')[0].toUpperCase()}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
              {uploading && (
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-[#2B2119]/40 backdrop-blur-[2px]">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                </div>
              )}
            </div>
            
            <div className="flex gap-3">
              <label className="inline-flex cursor-pointer items-center rounded-full bg-[#7C4E2F] px-6 py-2.5 text-[10px] uppercase tracking-[0.2em] font-bold text-white shadow-sm transition hover:bg-[#5C3A24] active:scale-95">
                {avatarUrl ? 'Change photo' : 'Upload photo'}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0]
                    if (!file) return
                    uploadAvatar(file)
                    event.target.value = ''
                  }}
                />
              </label>
              {avatarUrl && (
                <button
                  type="button"
                  onClick={() => setAvatarUrl(null)}
                  className="inline-flex items-center rounded-full border border-[#E6D9C8] bg-white px-6 py-2.5 text-[10px] uppercase tracking-[0.2em] font-bold text-[#8C7A6B] transition hover:border-[#7C4E2F] hover:text-[#7C4E2F]"
                >
                  Remove
                </button>
              )}
            </div>
            <p className="text-[9px] uppercase tracking-[0.25em] text-[#8C7A6B]">Optional: Add a face to your atelier profile</p>
          </div>

          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="ml-2 text-[10px] uppercase tracking-[0.3em] text-[#8C7A6B] font-bold">First Name</label>
                <input
                  required
                  placeholder="e.g. Julian"
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  className="w-full rounded-2xl border border-[#E6D9C8] bg-white px-5 py-3 text-sm focus:border-[#7C4E2F] focus:outline-none transition-all placeholder:text-[#D8C7B3]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="ml-2 text-[10px] uppercase tracking-[0.3em] text-[#8C7A6B] font-bold">Last Name</label>
                <input
                  required
                  placeholder="e.g. Voss"
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  className="w-full rounded-2xl border border-[#E6D9C8] bg-white px-5 py-3 text-sm focus:border-[#7C4E2F] focus:outline-none transition-all placeholder:text-[#D8C7B3]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="ml-2 text-[10px] uppercase tracking-[0.3em] text-[#8C7A6B] font-bold">Email Address</label>
              <input
                type="email"
                required
                placeholder="julian@atelier.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-2xl border border-[#E6D9C8] bg-white px-5 py-3 text-sm focus:border-[#7C4E2F] focus:outline-none transition-all placeholder:text-[#D8C7B3]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="ml-2 text-[10px] uppercase tracking-[0.3em] text-[#8C7A6B] font-bold">Studio Password</label>
              <input
                placeholder="••••••••"
                type="password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-2xl border border-[#E6D9C8] bg-white px-5 py-3 text-sm focus:border-[#7C4E2F] focus:outline-none transition-all placeholder:text-[#D8C7B3]"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="group relative w-full overflow-hidden rounded-full bg-[#7C4E2F] px-8 py-4 text-[10px] font-bold uppercase tracking-[0.4em] text-white shadow-lg transition-all hover:bg-[#5C3A24] hover:shadow-xl active:scale-[0.98]"
            >
              <span className="relative z-10">Initialize Membership</span>
            </button>
            {status && <p className="mt-4 text-center text-xs font-medium text-[#7C4E2F] animate-pulse">{status}</p>}
          </div>

          <p className="text-center text-[10px] uppercase tracking-[0.2em] text-[#8C7A6B]">
            By joining, you agree to our{' '}
            <Link href="/terms" className="text-[#2B2119] underline font-bold">Terms</Link>
          </p>

          <div className="border-t border-[#E6D9C8]/50 pt-6 text-center">
            <p className="text-xs text-[#6B594A]">
              Already curated an account?{' '}
              <Link href="/login" className="font-bold text-[#7C4E2F] hover:underline">
                Sign in &rarr;
              </Link>
            </p>
          </div>
        </form>
        <div className="rounded-3xl border border-[#E6D9C8] bg-[#F4EEE4] p-6 text-sm text-[#6B594A]">
          <div className="text-xs uppercase tracking-[0.3em] text-[#8C7A6B]">Member benefits</div>
          <ul className="mt-4 space-y-3">
            <li>Private studio sessions and early access to limited drops.</li>
            <li>Personalized finish and upholstery recommendations.</li>
            <li>Streamlined delivery scheduling and order tracking.</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
