import { Sidebar, BottomNavigation } from '@components'

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Sidebar - hide on mobile */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Main content with responsive margin */}
      <main className="lg:ml-[250px] overflow-y-auto min-h-screen">{children}</main>

      {/* Bottom Navigation - only on mobile */}
      <BottomNavigation />
    </>
  )
}
