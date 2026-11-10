import type { Metadata } from 'next'
import './globals.css'
import { AppProvider } from '@providers'

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
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  )
}
