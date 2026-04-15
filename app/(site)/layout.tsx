import SiteFooter from '@/app/_components/SiteFooter'
import SiteHeader from '@/app/_components/SiteHeader'

export default function SiteLayout({
  children,
  modal,
}: {
  children: React.ReactNode
  modal: React.ReactNode
}) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-32 top-20 h-96 w-96 rounded-full bg-[#E9E1D4] blur-3xl" />
        <div className="absolute right-0 top-6 h-80 w-80 rounded-full bg-[#D9E1CF] blur-3xl" />
        <div className="absolute bottom-10 left-1/3 h-72 w-72 rounded-full bg-[#EFE7D8] blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.9),transparent_55%)]" />
      </div>
      <SiteHeader />
      <main className="flex-1">
        {children}
        {modal}
      </main>
      <SiteFooter />
    </div>
  )
}

