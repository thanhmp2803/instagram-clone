'use client'

import { Search, Heart } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useMounted, useSearch, useDebounce } from '@hooks'
import { useTranslation } from 'react-i18next'
import { usePathname } from 'next/navigation'

export const Header = () => {
  const [searchValue, setSearchValue] = useState('')
  const mounted = useMounted()
  const { setSearchTerm } = useSearch()
  const { t } = useTranslation()
  const pathname = usePathname()

  // Debounce search value to avoid too many updates
  const debouncedSearchValue = useDebounce(searchValue, 300)

  // Update search context when debounced value changes
  useEffect(() => {
    setSearchTerm(debouncedSearchValue)
  }, [debouncedSearchValue, setSearchTerm])

  // Hide header on profile page
  if (pathname === '/profile') {
    return null
  }

  // Skeleton Loader
  if (!mounted) {
    return (
      <header className="fixed top-0 left-0 right-0 bg-black border-b border-gray-800 z-40 lg:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex-shrink-0">
            <div className="w-32 h-8 bg-gray-700 rounded animate-pulse"></div>
          </div>
          <div className="flex-1 max-w-xs mx-3 sm:max-w-sm sm:mx-4">
            <div className="w-full h-10 bg-gray-700 rounded animate-pulse"></div>
          </div>
          <div className="flex-shrink-0">
            <div className="w-7 h-7 bg-gray-700 rounded animate-pulse"></div>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="fixed top-0 left-0 right-0 bg-black border-b border-gray-800 z-40 lg:hidden">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Instagram Logo */}
        <div className="flex-shrink-0">
          <h1 className="text-white text-4xl font-instagram cursor-pointer">Instagram</h1>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-xs mx-3 sm:max-w-sm sm:mx-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder={t('search.placeholder')}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 bg-neutral-700 border border-gray-700 rounded-lg text-white placeholder-whit-100 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
        </div>

        {/* Heart Icon */}
        <div className="flex-shrink-0">
          <button className="rounded-full transition-colors">
            <Heart className="h-7 w-7 text-white" />
          </button>
        </div>
      </div>
    </header>
  )
}
