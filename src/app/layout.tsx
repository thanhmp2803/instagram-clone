import type { Metadata } from 'next'
import './globals.css'
import { Sidebar, Header, BottomNavigation } from '@components'
import { I18nProvider, SearchProvider } from '@providers'

export const metadata: Metadata = {
  title: 'Instagram Clone',
  description: 'Instagram clone built with Next.js',
  icons: {
    icon: '/images/Instagram_icon.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-black text-white">
        <I18nProvider>
          <SearchProvider>
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
          </SearchProvider>
        </I18nProvider>
      </body>
    </html>
  )
}
