import LuxuryLoader from '@/app/_components/LuxuryLoader'

export default function ProductDetailLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <LuxuryLoader compact label="Unveiling the piece" caption="Rendering the material story, finishes, and buying details with a steadier reveal." />
    </div>
  )
}
