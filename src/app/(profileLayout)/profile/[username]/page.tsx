'use client'

import { use } from 'react'
import { Profile } from '@components'

interface PageProps {
  params: Promise<{ username: string }>
}

export default function UserProfilePage({ params }: PageProps) {
  const resolvedParams = use(params)
  const username = decodeURIComponent(resolvedParams.username)

  return <Profile username={username} />
}
