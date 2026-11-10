'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { Search, X, CheckCircle, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { mockUsers } from '@/app/login/page'
import { createClient, isSupabaseConfigured } from '@/utils/supabase/client'
import { useDebounce } from '@hooks'

export interface SearchResultUser {
  id: string
  username: string
  fullName: string
  avatar: string
  isVerified?: boolean
}

interface SearchDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export function SearchDrawer({ isOpen, onClose }: SearchDrawerProps) {
  const { t } = useTranslation()
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const drawerRef = useRef<HTMLDivElement>(null)

  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<SearchResultUser[]>([])
  const debouncedQuery = useDebounce(query.trim(), 250)

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    } else {
      setQuery('')
      setResults([])
    }
  }, [isOpen])

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Suggested demo accounts when query is empty
  const suggestedUsers: SearchResultUser[] = useMemo(() => {
    return mockUsers.map((u) => ({
      id: u.id,
      username: u.username,
      fullName: u.name,
      avatar: u.avatar || '/images/nonuser.png',
      isVerified: u.username === 'creative_coder',
    }))
  }, [])

  // Search logic across Supabase and LocalStorage / Demo accounts
  const performSearch = useCallback(async (keyword: string) => {
    if (!keyword) {
      setResults([])
      setLoading(false)
      return
    }

    setLoading(true)
    const lower = keyword.toLowerCase()
    const foundMap = new Map<string, SearchResultUser>()

    // 1. Search in local demo mock users
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

    // 2. Search in registered users from localStorage
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

    // 3. Search in Supabase profiles table
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient()
        const { data } = await supabase
          .from('profiles')
          .select('id, username, full_name, avatar_url, is_verified')
          .or(`username.ilike.%${keyword}%,full_name.ilike.%${keyword}%`)
          .limit(15)

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
        }
      } catch (err) {
        console.error('Failed to search users in Supabase:', err)
      }
    }

    setResults(Array.from(foundMap.values()))
    setLoading(false)
  }, [])

  useEffect(() => {
    performSearch(debouncedQuery)
  }, [debouncedQuery, performSearch])

  const handleSelectUser = (user: SearchResultUser) => {
    onClose()
    router.push(`/profile/${encodeURIComponent(user.username)}`)
  }

  if (!isOpen) return null

  const displayList = query.trim().length > 0 ? results : suggestedUsers

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop overlay */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
      />

      {/* Sliding Drawer Panel */}
      <div
        ref={drawerRef}
        className="relative z-10 w-full max-w-[397px] h-screen bg-black border-r border-zinc-800 shadow-2xl flex flex-col py-6 px-4 animate-in slide-in-from-left duration-250"
      >
        {/* Header Title */}
        <div className="flex items-center justify-between px-2 mb-6">
          <h2 className="text-2xl font-bold text-white tracking-tight">
            {t('sidebar.search') || 'Search'}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close search"
            className="p-1.5 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input Box */}
        <div className="relative mb-6">
          <div className="flex items-center gap-2.5 bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-zinc-400 focus-within:border-zinc-600 transition">
            <Search className="w-4 h-4 text-zinc-400 flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              placeholder={t('search.placeholder') || 'Search...'}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-transparent text-sm text-white placeholder-zinc-500 outline-none"
            />
            {query.length > 0 && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="text-zinc-500 hover:text-zinc-300 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Divider & Sub-header */}
        <div className="border-t border-zinc-900 pt-3 pb-2 px-2 flex items-center justify-between text-xs font-semibold text-zinc-400">
          <span>{query.trim().length > 0 ? 'Search results' : 'Suggested accounts'}</span>
          {loading && <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-500" />}
        </div>

        {/* Results / Suggestions List */}
        <div className="flex-1 overflow-y-auto space-y-1 pr-1 -mr-1">
          {displayList.length > 0 ? (
            displayList.map((user) => (
              <button
                key={user.id}
                onClick={() => handleSelectUser(user)}
                className="w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl hover:bg-zinc-900/80 transition text-left cursor-pointer group"
              >
                {/* Avatar */}
                <div className="relative w-11 h-11 rounded-full overflow-hidden border border-zinc-800 flex-shrink-0 bg-zinc-800">
                  <Image
                    src={user.avatar || '/images/nonuser.png'}
                    alt={user.username}
                    width={44}
                    height={44}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-semibold text-white truncate">
                      {user.username}
                    </span>
                    {user.isVerified && (
                      <CheckCircle className="w-3.5 h-3.5 fill-blue-500 text-black flex-shrink-0" />
                    )}
                  </div>
                  <div className="text-xs text-zinc-400 truncate">
                    {user.fullName || user.username}
                  </div>
                </div>
              </button>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center text-zinc-500">
              <Search className="w-10 h-10 mb-3 stroke-[1.5] text-zinc-600" />
              <p className="text-sm font-medium">No results found.</p>
              <p className="text-xs text-zinc-600 mt-1">Try searching by username or full name.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
