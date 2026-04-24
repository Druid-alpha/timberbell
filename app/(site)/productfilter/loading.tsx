import LuxuryLoader from '@/app/_components/LuxuryLoader'

export default function ProductFilterLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
      <LuxuryLoader compact label="Composing your shortlist" caption="Grouping finishes, tones, and silhouettes into a sharper collection view." />
    </div>
  )
}
