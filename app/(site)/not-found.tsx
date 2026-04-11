import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center gap-6 px-6 py-16 text-center">
      <div className="text-xs uppercase tracking-[0.3em] text-neutral-500">404</div>
      <h1 className="font-display text-4xl text-neutral-900">We could not find that page.</h1>
      <p className="text-sm text-neutral-600">
        The room you are looking for does not exist yet. Let us guide you back to the showroom.
      </p>
      <Link
        href="/"
        className="rounded-full bg-neutral-900 px-6 py-3 text-sm font-semibold text-white"
      >
        Back to home
      </Link>
    </div>
  )
}

