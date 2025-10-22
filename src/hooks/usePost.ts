import { useContext } from 'react'
import { PostContext } from '@context'

export function usePost() {
  const context = useContext(PostContext)

  if (!context) {
    throw new Error('usePost must be used within PostProvider')
  }

  return context
}
