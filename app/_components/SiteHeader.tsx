'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'
import { setUser, clearUser } from '@/lib/redux/userSlice'
import { syncCart } from '@/lib/redux/cartSlice'

const baseLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About us' },
  { href: '/collections', label: 'Collection' },
  { href: '/productfilter', label: 'Shop' },
  { href: '/contact', label: 'Contact' },
]

export default function SiteHeader() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const cartCount = useAppSelector((state) => state.cart.cartCount)
  const user = useAppSelector((state) => state.user)

  const [open, setOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchResults, setSearchResults] = useState<{ id: string; name: string; category: string }[]>([])

  // Load user profile once and save to Redux (so it persists across renders)
  useEffect(() => {
    let active = true
    async function loadProfile() {
      const res = await fetch('/api/users/me')
      if (!active || !res.ok) return
      const json = await res.json().catch(() => ({}))
      const u = json?.user
      if (!u || !active) return
      dispatch(
        setUser({
          id: u._id ?? u.id ?? null,
          name: u.name ?? null,
          email: u.email ?? null,
          avatarUrl: u.avatarUrl ?? null,
          role: u.role ?? null,
        })
      )
    }
    loadProfile()
    return () => { active = false }
  }, [dispatch])

  // Sync server cart count into Redux on mount (logged-in users)
  useEffect(() => {
    if (!user.isLoggedIn) return
    let active = true
    async function loadCart() {
      const res = await fetch('/api/cart')
      if (!active || !res.ok) return
      const data = await res.json().catch(() => ({}))
      if (!active) return
      const items = Array.isArray(data?.items)
        ? data.items.map((item: any) => ({
            productId: item.productId ?? item.product?._id ?? '',
            name: item.name ?? item.product?.name ?? '',
            price: item.price ?? item.product?.price ?? 0,
            quantity: item.quantity ?? 1,
            imageUrl: item.imageUrl ?? item.product?.images?.[0]?.url ?? undefined,
            variantId: item.variantId ?? undefined,
            variantName: item.variantName ?? undefined,
          }))
        : []
      dispatch(syncCart(items))
    }
    loadCart()
    return () => { active = false }
  }, [user.isLoggedIn, dispatch])

  // Search
  useEffect(() => {
    if (!searchOpen) {
      setSearchTerm('')
      setSearchResults([])
      return
    }
    if (searchTerm.trim().length < 2) {
      setSearchResults([])
      return
    }
    const handle = setTimeout(async () => {
      setSearchLoading(true)
      const res = await fetch(`/api/products?q=${encodeURIComponent(searchTerm)}&limit=6`)
      const json = await res.json().catch(() => ({}))
      setSearchResults(json?.products ?? [])
      setSearchLoading(false)
    }, 250)
    return () => clearTimeout(handle)
  }, [searchTerm, searchOpen])

  const isAdmin = user.role === 'admin'
  const isLoggedIn = user.isLoggedIn
  const avatarUrl = user.avatarUrl
  const initials = (() => {
    const seed = user.name || user.email || 'TB'
    return seed.slice(0, 2).toUpperCase()
  })()

  const navLinks = isAdmin ? [...baseLinks, { href: '/admin', label: 'Admin' }] : baseLinks

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' }).catch(() => {})
    await fetch('/api/auth/me', { method: 'DELETE' }).catch(() => {})
    dispatch(clearUser())
    router.push('/')
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-30 border-b border-[#E6D9C8] bg-[#F4EEE4]/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4 lg:gap-8">
        <Link href="/" className="flex items-center gap-3">
          <img src="/brand.svg" alt="Timberbell" className="h-10 w-auto" />
          <div className="leading-tight">
            <div className="text-lg font-semibold tracking-[0.2em] uppercase text-[#2A3320]">
              Timberbell
            </div>
            <div className="text-[10px] uppercase tracking-[0.45em] text-[#8B9A78]">
              Atelier
            </div>
          </div>
        </Link>

        <nav className="hidden flex-1 items-center justify-center gap-8 text-[11px] uppercase tracking-[0.35em] text-[#8C7A6B] lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`transition hover:text-[#2B2119] ${link.label === 'Admin' ? 'rounded-full border border-[#7C4E2F] px-4 py-1.5 text-[#7C4E2F] hover:bg-[#7C4E2F] hover:text-white' : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {/* Search */}
          <button
            type="button"
            aria-label="Search"
            onClick={() => setSearchOpen((prev) => !prev)}
            className="hidden h-10 w-10 items-center justify-center rounded-full border border-[#E6D9C8] text-[#2B2119] transition hover:bg-white/70 lg:inline-flex"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14Zm8 2-4.35-4.35" strokeLinecap="round" />
            </svg>
          </button>

          {/* Wishlist */}
          <Link
            href="/wishlist"
            className="hidden h-10 w-10 items-center justify-center rounded-full border border-[#E6D9C8] text-[#2B2119] transition hover:bg-white/70 lg:inline-flex"
            aria-label="Wishlist"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M12 19s-6-4.35-8-7.9C2.5 8 4 5.5 6.7 5.2 8.3 5 10 5.8 12 7.8c2-2 3.7-2.8 5.3-2.6C20 5.5 21.5 8 20 11.1 18 14.65 12 19 12 19Z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>

          {/* Cart */}
          <Link
            href="/cart"
            className="relative hidden h-10 w-10 items-center justify-center rounded-full border border-[#E6D9C8] text-[#2B2119] transition hover:bg-white/70 lg:inline-flex"
            aria-label="Cart"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M3 5h3l2.4 9.6a2 2 0 0 0 2 1.4h7.8a2 2 0 0 0 2-1.6L22 8H7" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M9 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm9 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" strokeLinecap="round" />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 rounded-full bg-[#7C4E2F] px-1.5 py-0.5 text-[9px] font-semibold text-white">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Auth: logged in → avatar/profile; logged out → Login + Sign Up */}
          {isLoggedIn ? (
            <div className="hidden items-center gap-3 lg:flex">
              <div className="flex items-center gap-2">
                <Link
                  href="/account"
                  className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#E6D9C8] bg-[#2B2119] text-[10px] font-semibold uppercase tracking-[0.2em] text-[#F4EEE4]"
                  aria-label="Profile"
                >
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    initials
                  )}
                </Link>
                <div className="hidden flex-col justify-center xl:flex">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#2B2119]">
                    {user.name || 'Atelier Member'}
                  </span>
                  <span className="text-[9px] uppercase tracking-[0.2em] text-[#8C7A6B]">
                    {isAdmin ? 'Admin' : 'Member'}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="text-[10px] uppercase tracking-[0.25em] text-[#8C7A6B] transition hover:text-[#7C4E2F]"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="hidden items-center gap-2 lg:flex">
              <Link
                href="/login"
                className="rounded-full border border-[#E6D9C8] px-4 py-2 text-[11px] uppercase tracking-[0.25em] text-[#8C7A6B] transition hover:border-[#7C4E2F] hover:text-[#7C4E2F]"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-[#7C4E2F] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-white transition hover:bg-[#6A3F24]"
              >
                Sign Up
              </Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            type="button"
            aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
            onClick={() => setOpen((prev) => !prev)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#E6D9C8] text-[#2B2119] transition hover:bg-white/70 lg:hidden"
          >
            <span className="sr-only">Toggle menu</span>
            <span className="relative block h-4 w-5">
              <span
                className={`absolute left-0 top-0 h-0.5 w-full bg-current transition ${open ? 'translate-y-1.5 rotate-45' : ''}`}
              />
              <span
                className={`absolute left-0 top-1.5 h-0.5 w-full bg-current transition ${open ? 'opacity-0' : ''}`}
              />
              <span
                className={`absolute left-0 top-3 h-0.5 w-full bg-current transition ${open ? '-translate-y-1.5 -rotate-45' : ''}`}
              />
            </span>
          </button>
        </div>
      </div>

      {/* Search bar */}
      {searchOpen ? (
        <div className="border-t border-[#E6D9C8] bg-[#F4EEE4]">
          <div className="mx-auto max-w-7xl px-6 py-4">
            <div className="flex flex-wrap items-center gap-3 rounded-full border border-[#E6D9C8] bg-white px-4 py-2">
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search Timberbell pieces"
                className="flex-1 bg-transparent text-sm text-[#2B2119] placeholder:text-[#8C7A6B] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="rounded-full border border-[#E6D9C8] px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-[#8C7A6B]"
              >
                Close
              </button>
            </div>
            {searchLoading ? (
              <div className="mt-3 text-sm text-[#6B594A]">Searching...</div>
            ) : searchResults.length ? (
              <div className="mt-3 grid gap-2 rounded-3xl border border-[#E6D9C8] bg-white p-3">
                {searchResults.map((item) => (
                  <Link
                    key={item.id}
                    href={`/products/${item.id}`}
                    onClick={() => setSearchOpen(false)}
                    className="flex items-center justify-between rounded-2xl px-3 py-2 text-sm text-[#2B2119] transition hover:bg-[#F4EEE4]"
                  >
                    <span className="line-clamp-1">{item.name}</span>
                    <span className="text-[10px] uppercase tracking-[0.3em] text-[#8C7A6B]">
                      {item.category}
                    </span>
                  </Link>
                ))}
              </div>
            ) : searchTerm.trim().length >= 2 ? (
              <div className="mt-3 text-sm text-[#6B594A]">No results found.</div>
            ) : null}
          </div>
        </div>
      ) : null}

      {/* Mobile menu */}
      <div className="lg:hidden">
        <div
          className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-screen' : 'max-h-0'}`}
        >
          <div className="flex flex-col gap-4 border-t border-[#E6D9C8] bg-[#F4EEE4] px-6 py-4 text-[11px] uppercase tracking-[0.3em] text-[#8C7A6B]">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={link.label === 'Admin' ? 'rounded-2xl bg-[#7C4E2F] px-4 py-3 text-center text-white' : ''}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                aria-label="Search"
                onClick={() => {
                  setSearchOpen(true)
                  setOpen(false)
                }}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#E6D9C8] text-[#2B2119]"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14Zm8 2-4.35-4.35" strokeLinecap="round" />
                </svg>
              </button>
              <Link
                href="/wishlist"
                onClick={() => setOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#E6D9C8] text-[#2B2119]"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M12 19s-6-4.35-8-7.9C2.5 8 4 5.5 6.7 5.2 8.3 5 10 5.8 12 7.8c2-2 3.7-2.8 5.3-2.6C20 5.5 21.5 8 20 11.1 18 14.65 12 19 12 19Z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <Link
                href="/cart"
                onClick={() => setOpen(false)}
                className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#E6D9C8] text-[#2B2119]"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M3 5h3l2.4 9.6a2 2 0 0 0 2 1.4h7.8a2 2 0 0 0 2-1.6L22 8H7" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M9 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm9 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" strokeLinecap="round" />
                </svg>
                {cartCount > 0 && (
                  <span className="absolute -right-1 -top-1 rounded-full bg-[#7C4E2F] px-1.5 py-0.5 text-[9px] font-semibold text-white">
                    {cartCount}
                  </span>
                )}
              </Link>
              {isLoggedIn ? (
                <>
                  <div className="flex items-center gap-2">
                    <Link
                      href="/account"
                      onClick={() => setOpen(false)}
                      className="inline-flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#2B2119] text-[10px] font-semibold uppercase tracking-[0.2em] text-[#F4EEE4]"
                    >
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
                      ) : (
                        initials
                      )}
                    </Link>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-semibold tracking-[0.2em] text-[#2B2119]">
                        {user.name || 'Atelier Member'}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="rounded-full border border-[#E6D9C8] px-4 py-2 text-[11px] uppercase tracking-[0.25em] text-[#8C7A6B]"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className="rounded-full border border-[#E6D9C8] px-4 py-2 text-[11px] uppercase tracking-[0.25em] text-[#8C7A6B]"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setOpen(false)}
                    className="rounded-full bg-[#7C4E2F] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-white"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
