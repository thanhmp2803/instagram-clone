import type { ReactNode } from 'react'
import { Sidebar, BottomNavigation } from '@components'

export default function MessagesLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex h-screen w-full bg-black overflow-hidden">
      {/* Fixed Sidebar navigation on the left */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Main Messages container */}
      <main className="flex-1 w-full lg:ml-[250px] h-screen overflow-hidden">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNavigation />
    </div>
  )
}

