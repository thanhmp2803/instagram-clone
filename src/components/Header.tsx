'use client'

import { Search, Heart, X, CheckCircle } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { useMounted, useSearch, useDebounce, useAuth } from '@hooks'
import { useTranslation } from 'react-i18next'
import { usePathname, useRouter } from 'next/navigation'
import Image from 'next/image'
import { mockUsers } from '@/app/login/page'
import { createClient, isSupabaseConfigured } from '@/utils/supabase/client'
import type { SearchResultUser } from './search/SearchDrawer'
import { NotificationsDrawer } from './notifications/NotificationsDrawer'

export const Header = () => {
  const [searchValue, setSearchValue] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResultUser[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [unreadNotifs, setUnreadNotifs] = useState(0)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const mounted = useMounted()
  const { user } = useAuth()
  const { setSearchTerm } = useSearch()
  const { t } = useTranslation()
  const pathname = usePathname()
  const router = useRouter()

  // Debounce search value
  const debouncedSearchValue = useDebounce(searchValue.trim(), 250)

  // Update post search context
  useEffect(() => {
    setSearchTerm(debouncedSearchValue)
  }, [debouncedSearchValue, setSearchTerm])

  // Check unread notifications count & listen for updates
  useEffect(() => {
    const checkUnread = () => {
      if (typeof window !== 'undefined' && user?.username) {
        try {
          const raw = localStorage.getItem(`instagram_notifications_${user.username}`)
          if (raw) {
            const list = JSON.parse(raw)
            if (Array.isArray(list)) {
              setUnreadNotifs(list.filter((n) => !n.read).length)
            }
          }
        } catch {}
      }
    }

    checkUnread()
    window.addEventListener('storage', checkUnread)
    return () => window.removeEventListener('storage', checkUnread)
  }, [user?.username])

  // Search users for dropdown
  useEffect(() => {
    if (!debouncedSearchValue) {
      setSearchResults([])
      return
    }

    const lower = debouncedSearchValue.toLowerCase()
    const foundMap = new Map<string, SearchResultUser>()

    // Local mock users
    mockUsers.forEach((u) => {
      if (
        u.username.toLowerCase().includes(lower) ||
        u.name.toLowerCase().includes(lower) ||
        u.email.toLowerCase().includes(lower)
      ) {
        foundMap.set(u.username.toLowerCase(), {
          id: u.id,
          username: u.username,
          fullName: u.name,
          avatar: u.avatar || '/images/nonuser.png',
          isVerified: u.username === 'creative_coder',
        })
      }
    })

    // Local registered users
    if (typeof window !== 'undefined') {
      try {
        const registered = JSON.parse(localStorage.getItem('users') || '[]') as Array<{
          id?: string
          username?: string
          name?: string
          avatar?: string
          fullName?: string
        }>
        registered.forEach((u) => {
          const uname = u.username || ''
          const fname = u.fullName || u.name || ''
          if (uname.toLowerCase().includes(lower) || fname.toLowerCase().includes(lower)) {
            foundMap.set(uname.toLowerCase(), {
              id: u.id || uname,
              username: uname,
              fullName: fname,
              avatar: u.avatar || '/images/nonuser.png',
            })
          }
        })
      } catch {}
    }

    // Supabase profiles
    if (isSupabaseConfigured()) {
      const supabase = createClient()
      supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url, is_verified')
        .or(`username.ilike.%${debouncedSearchValue}%,full_name.ilike.%${debouncedSearchValue}%`)
        .limit(8)
        .then(({ data }) => {
          if (data && data.length > 0) {
            data.forEach((p) => {
              foundMap.set(p.username.toLowerCase(), {
                id: p.id,
                username: p.username,
                fullName: p.full_name || p.username,
                avatar: p.avatar_url || '/images/nonuser.png',
                isVerified: p.is_verified || false,
              })
            })
            setSearchResults(Array.from(foundMap.values()))
          }
        })
    }

    setSearchResults(Array.from(foundMap.values()))
  }, [debouncedSearchValue])

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleClear = () => {
    setSearchValue('')
    setSearchTerm('')
    setSearchResults([])
    setShowDropdown(false)
  }

  const handleSelectUser = (targetUsername: string) => {
    handleClear()
    router.push(`/profile/${encodeURIComponent(targetUsername)}`)
  }

  if (!mounted) {
    return (
      <header className="sticky top-0 z-30 bg-black/80 backdrop-blur-sm border-b border-zinc-800 lg:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="w-28 h-6 bg-zinc-800 rounded animate-pulse" />
          <div className="w-8 h-8 bg-zinc-800 rounded-full animate-pulse" />
        </div>
      </header>
    )
  }

  if (pathname !== '/') {
    return null
  }

  return (
    <>
      <header className="sticky top-0 z-20 bg-black/80 backdrop-blur-sm border-b border-zinc-800 lg:hidden">
        <div className="flex items-center justify-between px-4 py-3 gap-4">
          {/* Logo */}
          <div className="flex-shrink-0">
            <h1
              onClick={() => router.push('/')}
              className="text-2xl font-instagram text-white cursor-pointer hover:opacity-80 transition"
            >
              Instagram
            </h1>
          </div>

          {/* Search Bar with live user search dropdown */}
          <div ref={dropdownRef} className="relative flex-1 max-w-xs">
            <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 focus-within:border-zinc-600 transition">
              <Search className="h-4 w-4 text-zinc-400 flex-shrink-0 mr-2" />
              <input
                type="text"
                placeholder={t('header.search')}
                value={searchValue}
                onChange={(e) => {
                  setSearchValue(e.target.value)
                  setShowDropdown(true)
                }}
                onFocus={() => setShowDropdown(true)}
                className="w-full bg-transparent text-sm text-white placeholder-zinc-500 focus:outline-none"
              />
              {searchValue && (
                <button
                  onClick={handleClear}
                  className="flex-shrink-0 text-zinc-400 hover:text-white transition p-0.5 cursor-pointer"
                  aria-label="Clear search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Dropdown Results */}
            {showDropdown && searchValue.trim() && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-black border border-zinc-800 rounded-xl shadow-2xl py-2 max-h-80 overflow-y-auto z-50">
                <div className="px-3 py-1.5 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                  Accounts
                </div>
                {searchResults.length > 0 ? (
                  searchResults.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => handleSelectUser(user.username)}
                      className="w-full flex items-center gap-3 px-3 py-2 hover:bg-zinc-900 transition text-left cursor-pointer"
                    >
                      <div className="relative w-9 h-9 rounded-full overflow-hidden border border-zinc-800 flex-shrink-0 bg-zinc-800">
                        <Image
                          src={user.avatar || '/images/nonuser.png'}
                          alt={user.username}
                          width={36}
                          height={36}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-semibold text-white truncate">
                            {user.username}
                          </span>
                          {user.isVerified && (
                            <CheckCircle className="w-3 h-3 fill-blue-500 text-black flex-shrink-0" />
                          )}
                        </div>
                        <div className="text-[11px] text-zinc-400 truncate">
                          {user.fullName || user.username}
                        </div>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-6 text-center text-xs text-zinc-500">
                    No accounts found.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Heart Icon with notification badge */}
          <div className="flex-shrink-0">
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              aria-label="Notifications"
              className="relative p-1 rounded-full transition-colors cursor-pointer hover:opacity-80"
            >
              <Heart className="h-7 w-7 text-white" />
              {unreadNotifs > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-black" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Notifications Drawer */}
      <NotificationsDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onUnreadChange={setUnreadNotifs}
      />
    </>
  )
}
