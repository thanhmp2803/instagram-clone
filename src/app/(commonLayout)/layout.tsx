import { Sidebar, Header, BottomNavigation } from '@components'

export default function CommonLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Header - only on mobile */}
      <Header />

      {/* Sidebar - hide on mobile */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Main content with responsive margin */}
      <main className="pt-16 pb-16 lg:pt-0 lg:pb-0 lg:ml-[250px] overflow-y-auto min-h-screen">
        {children}
      </main>

      {/* Bottom Navigation - only on mobile */}
      <BottomNavigation />
    </>
  )
}
