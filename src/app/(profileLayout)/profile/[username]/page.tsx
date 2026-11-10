'use client'

import { use, Suspense } from 'react'
import { Profile } from '@components'
import { Loader } from 'lucide-react'

interface PageProps {
  params: Promise<{ username: string }>
}

export default function UserProfilePage({ params }: PageProps) {
  const resolvedParams = use(params)
  const username = decodeURIComponent(resolvedParams.username)

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center">
          <Loader className="w-6 h-6 animate-spin text-white" />
        </div>
      }
    >
      <Profile username={username} />
    </Suspense>
  )
}
