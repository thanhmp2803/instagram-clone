'use client'

import { useMounted } from '@hooks'

interface ClientOnlyProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  const hasMounted = useMounted()

  if (!hasMounted) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
