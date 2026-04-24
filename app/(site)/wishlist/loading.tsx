import LuxuryLoader from '@/app/_components/LuxuryLoader'

export default function WishlistLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
      <LuxuryLoader compact label="Curating saved favorites" caption="Laying out the pieces you marked for a second look." />
    </div>
  )
}
