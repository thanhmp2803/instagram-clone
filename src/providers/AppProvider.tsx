'use client'
import { ReactNode } from 'react'
import { I18nProvider } from './I18nProvider'
import { SearchProvider } from './SearchProvider'
import { PostProvider } from '@/context/PostContext'

interface AppProviderProps {
  children: ReactNode
}

export function AppProvider({ children }: AppProviderProps) {
  return (
    <I18nProvider>
      <SearchProvider>
        <PostProvider>{children}</PostProvider>
      </SearchProvider>
    </I18nProvider>
  )
}
