'use client'

import { useState } from 'react'
import Link from 'next/link'
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
        <form onSubmit={handleSubmit} className="space-y-5 rounded-3xl border border-[#E6D9C8] bg-[#F4EEE4] p-6">
          <div className="flex items-center gap-4">
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="h-12 w-12 rounded-full object-cover" />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E9E1D4] text-sm font-semibold text-[#2B2119]">
                {firstName.slice(0, 1).toUpperCase() || 'A'}
              </div>
            )}
            <label className="inline-flex cursor-pointer items-center rounded-full border border-[#7C4E2F] px-4 py-2 text-[10px] uppercase tracking-[0.3em] text-[#7C4E2F]">
              {uploading ? 'Uploading...' : 'Upload photo'}
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
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <input
              placeholder="First name"
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              className="rounded-2xl border border-[#E6D9C8] bg-white px-4 py-3 text-sm"
            />
            <input
              placeholder="Last name"
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
              className="rounded-2xl border border-[#E6D9C8] bg-white px-4 py-3 text-sm"
            />
          </div>
          <input
            type="email"
            required
            placeholder="Email address"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-2xl border border-[#E6D9C8] bg-white px-4 py-3 text-sm"
          />
          <input
            placeholder="Password"
            type="password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-2xl border border-[#E6D9C8] bg-white px-4 py-3 text-sm"
          />
          <button
            type="submit"
            className="w-full rounded-full bg-[#7C4E2F] px-5 py-3 text-sm font-semibold text-white"
          >
            Create account
          </button>
          {status ? <p className="text-sm text-[#6B594A]">{status}</p> : null}
          <p className="text-xs text-[#8C7A6B]">
            Already have an account?{' '}
            <Link href="/login" className="text-[#2B2119] underline">
              Sign in
            </Link>
          </p>
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
