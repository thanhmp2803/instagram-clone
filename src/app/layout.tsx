import type { Metadata } from 'next'
import './globals.css'
import { Sidebar } from '@components'

export const metadata: Metadata = {
  title: 'Instagram Clone',
  description: 'Instagram clone built with Next.js',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-black text-white flex">
        <Sidebar />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  )
}
