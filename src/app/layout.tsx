import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Instagram Clone',
  description: 'Instagram clone built with Next.js',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}
