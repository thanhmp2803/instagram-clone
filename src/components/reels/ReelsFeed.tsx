'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { ChevronUp, ChevronDown, Volume2, VolumeX, Loader, Film } from 'lucide-react'
import { ReelItem } from './ReelItem'
import { mockReels } from '@mocks'
import type { IReel } from '@types'
import { createClient, isSupabaseConfigured } from '@/utils/supabase/client'
import { resolveAvatar } from '@/utils/avatar'
import { useAuth } from '@hooks'

// In-memory cache across navigation so switching between tabs doesn't reload or jump
let cachedReels: IReel[] | null = null

export function invalidateReelsCache() {
  cachedReels = null
}

export function ReelsFeed() {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const { user } = useAuth()

  // Initialize from cache if available; when Supabase is configured, start empty to avoid flashing old mocks!
  const [reels, setReels] = useState<IReel[]>(() => {
    if (cachedReels && cachedReels.length > 0) return cachedReels
    return isSupabaseConfigured() ? [] : mockReels
  })
  const [activeIndex, setActiveIndex] = useState<number>(0)
  const [isGlobalMuted, setIsGlobalMuted] = useState<boolean>(true)
  const [loading, setLoading] = useState<boolean>(() => {
    if (cachedReels && cachedReels.length > 0) return false
    return isSupabaseConfigured()
  })

  // Fetch from Supabase
  const fetchReels = useCallback(
    async (isSilent = false) => {
      if (!isSupabaseConfigured()) return

      try {
        if (!isSilent && (!cachedReels || cachedReels.length === 0)) {
          setLoading(true)
        }
        const supabase = createClient()

        // 1. Fetch reels directly without join to avoid schema cache foreign key errors
        const { data: reelsData, error } = await supabase
          .from('reels')
          .select(
            'id, user_id, video_url, thumbnail_url, caption, audio_title, audio_artist, created_at',
          )
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Failed to fetch reels:', error.message)
          // Fallback to mock only if Supabase fails and we have no reels at all
          if (!cachedReels || cachedReels.length === 0) {
            setReels(mockReels)
          }
          return
        }

        if (reelsData && reelsData.length > 0) {
          const reelIds = reelsData.map((r) => r.id)
          const userIds = Array.from(new Set(reelsData.map((r) => r.user_id).filter(Boolean)))

          // 2. Fetch profiles
          const profilesMap = new Map<
            string,
            {
              id: string
              username: string
              full_name?: string
              avatar_url?: string
              is_verified?: boolean
            }
          >()
          if (userIds.length > 0) {
            const { data: profs } = await supabase
              .from('profiles')
              .select('id, username, full_name, avatar_url, is_verified')
              .in('id', userIds)
            profs?.forEach((p) => profilesMap.set(p.id, p))
          }

          // 3. Fetch likes counts
          const likesMap = new Map<string, number>()
          const userLikedSet = new Set<string>()

          if (reelIds.length > 0) {
            const { data: likes } = await supabase
              .from('reel_likes')
              .select('reel_id, user_id')
              .in('reel_id', reelIds)

            likes?.forEach((l) => {
              likesMap.set(l.reel_id, (likesMap.get(l.reel_id) || 0) + 1)
              if (user?.id && l.user_id === user.id) {
                userLikedSet.add(l.reel_id)
              }
            })
          }

          const formatted: IReel[] = reelsData.map((item) => {
            const profile = profilesMap.get(item.user_id)
            const authorUsername = profile?.username || 'user'
            const authorAvatar = resolveAvatar(authorUsername, null, profile?.avatar_url)
            const likesCount = likesMap.get(item.id) ?? 0

            return {
              id: item.id,
              videoUrl: item.video_url,
              thumbnailUrl: item.thumbnail_url || undefined,
              caption: item.caption || '',
              audio: {
                id: item.id,
                title: item.audio_title || 'Original audio',
                artist: item.audio_artist || authorUsername,
              },
              author: {
                id: profile?.id || item.user_id || item.id,
                username: authorUsername,
                name: profile?.full_name || authorUsername,
                avatar: authorAvatar,
                isVerified: profile?.is_verified ?? false,
              },
              likesCount,
              commentsCount: 0,
              sharesCount: 0,
              isLiked: userLikedSet.has(item.id),
              createdAt: item.created_at,
            }
          })

          cachedReels = formatted
          setReels(formatted)
        } else {
          // Empty database fallback only if no cached reels
          if (!cachedReels || cachedReels.length === 0) {
            setReels(mockReels)
          }
        }
      } catch (err) {
        console.error('Error fetching reels from Supabase:', err)
        if (!cachedReels || cachedReels.length === 0) {
          setReels(mockReels)
        }
      } finally {
        setLoading(false)
      }
    },
    [user?.id],
  )

  useEffect(() => {
    // If we already have cached reels, fetch silently in background to update
    const isSilent = Boolean(cachedReels && cachedReels.length > 0)
    fetchReels(isSilent)
  }, [fetchReels])

  // Listen for new reel uploads from CreatePost
  useEffect(() => {
    const handleNewReel = () => {
      invalidateReelsCache()
      fetchReels(false)
    }

    window.addEventListener('instagram:new_reel', handleNewReel)
    return () => window.removeEventListener('instagram:new_reel', handleNewReel)
  }, [fetchReels])

  // Toggle global mute
  const toggleGlobalMute = useCallback(() => {
    setIsGlobalMuted((prev) => !prev)
  }, [])

  // Scroll to a specific reel index
  const scrollToReel = useCallback(
    (index: number) => {
      const container = containerRef.current
      if (!container || reels.length === 0) return

      const clampedIndex = Math.max(0, Math.min(index, reels.length - 1))
      const targetChild = container.children[clampedIndex] as HTMLElement
      if (targetChild) {
        targetChild.scrollIntoView({ behavior: 'smooth', block: 'start' })
        setActiveIndex(clampedIndex)
      }
    },
    [reels.length],
  )

  // Track active reel index on scroll
  const handleScroll = useCallback(() => {
    const container = containerRef.current
    if (!container || reels.length === 0) return

    const scrollPosition = container.scrollTop
    const clientHeight = container.clientHeight
    const newIndex = Math.round(scrollPosition / clientHeight)

    if (newIndex !== activeIndex && newIndex >= 0 && newIndex < reels.length) {
      setActiveIndex(newIndex)
    }
  }, [activeIndex, reels.length])

  // Keyboard navigation: ArrowUp/Down to scroll, 'M' to mute/unmute
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        return
      }

      if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault()
        scrollToReel(activeIndex - 1)
      } else if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault()
        scrollToReel(activeIndex + 1)
      } else if (e.key.toLowerCase() === 'm') {
        e.preventDefault()
        toggleGlobalMute()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeIndex, scrollToReel, toggleGlobalMute])

  return (
    <div className="relative w-full h-full bg-black overflow-hidden flex items-center justify-center">
      {/* 1. Loading Skeleton when initial fetch is running and no reels are loaded yet */}
      {loading && reels.length === 0 && (
        <div className="w-full h-full flex items-center justify-center py-2 sm:py-4 px-2 select-none">
          <div className="relative w-full max-w-[420px] sm:max-w-[440px] h-[calc(100vh-2rem)] sm:h-[calc(100vh-3.5rem)] max-h-[840px] rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-800 shadow-2xl flex flex-col justify-between p-6 animate-pulse">
            {/* Top header skeleton */}
            <div className="flex justify-between items-center w-full">
              <div className="w-20 h-4 bg-zinc-800/80 rounded-full" />
              <div className="w-8 h-8 bg-zinc-800/80 rounded-full" />
            </div>

            {/* Center Loading Spinner */}
            <div className="flex flex-col items-center justify-center gap-3">
              <Loader className="w-8 h-8 text-zinc-400 animate-spin" />
              <span className="text-xs text-zinc-400 font-medium">Đang tải Reels...</span>
            </div>

            {/* Bottom info & right actions skeleton */}
            <div className="flex items-end justify-between w-full">
              <div className="space-y-3 w-2/3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-zinc-800/80" />
                  <div className="w-28 h-4 bg-zinc-800/80 rounded-md" />
                </div>
                <div className="w-full h-3 bg-zinc-800/80 rounded-md" />
                <div className="w-3/4 h-3 bg-zinc-800/80 rounded-md" />
              </div>

              <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-zinc-800/80" />
                <div className="w-10 h-10 rounded-full bg-zinc-800/80" />
                <div className="w-10 h-10 rounded-full bg-zinc-800/80" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Empty state if no reels exist */}
      {!loading && reels.length === 0 && (
        <div className="flex flex-col items-center justify-center text-center p-6 text-zinc-400 max-w-sm">
          <div className="w-16 h-16 rounded-full border border-zinc-700 flex items-center justify-center mb-4">
            <Film className="w-8 h-8 text-zinc-500" />
          </div>
          <h3 className="text-base font-semibold text-white mb-1">Chưa có Reels nào</h3>
          <p className="text-xs text-zinc-400">
            Hãy tải lên video đầu tiên bằng nút Tạo bài viết để bắt đầu chia sẻ Reels!
          </p>
        </div>
      )}

      {/* 3. Scrollable Container with CSS Scroll Snapping */}
      {reels.length > 0 && (
        <div
          ref={containerRef}
          onScroll={handleScroll}
          className="w-full h-full overflow-y-scroll snap-y snap-mandatory no-scrollbar scroll-smooth flex flex-col items-center"
        >
          {reels.map((reel, index) => (
            <div
              key={reel.id}
              className="w-full h-screen flex-shrink-0 flex items-center justify-center snap-start snap-always"
            >
              <ReelItem
                reel={reel}
                isActive={index === activeIndex}
                isGlobalMuted={isGlobalMuted}
                onToggleGlobalMute={toggleGlobalMute}
              />
            </div>
          ))}
        </div>
      )}

      {/* Background fetching indicator (silent) */}
      {loading && reels.length > 0 && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 bg-zinc-900/80 border border-zinc-800 px-3 py-1.5 rounded-full flex items-center gap-2 text-xs text-zinc-300">
          <Loader className="w-3.5 h-3.5 animate-spin" />
          <span>Đang cập nhật...</span>
        </div>
      )}

      {/* Desktop Quick Navigation Buttons (Floating Right of Feed) */}
      {reels.length > 0 && (
        <div className="hidden md:flex flex-col gap-3 absolute right-6 top-1/2 -translate-y-1/2 z-30">
          <button
            onClick={() => scrollToReel(activeIndex - 1)}
            disabled={activeIndex === 0}
            aria-label="Previous reel"
            className={`w-11 h-11 rounded-full bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700/80 backdrop-blur-md text-white flex items-center justify-center transition-all shadow-xl active:scale-90 cursor-pointer ${
              activeIndex === 0 ? 'opacity-30 cursor-not-allowed hover:bg-zinc-900/80' : ''
            }`}
          >
            <ChevronUp className="w-6 h-6" />
          </button>

          <button
            onClick={() => scrollToReel(activeIndex + 1)}
            disabled={activeIndex === reels.length - 1}
            aria-label="Next reel"
            className={`w-11 h-11 rounded-full bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700/80 backdrop-blur-md text-white flex items-center justify-center transition-all shadow-xl active:scale-90 cursor-pointer ${
              activeIndex === reels.length - 1
                ? 'opacity-30 cursor-not-allowed hover:bg-zinc-900/80'
                : ''
            }`}
          >
            <ChevronDown className="w-6 h-6" />
          </button>
        </div>
      )}

      {/* Floating Global Audio Status Indicator in top-right */}
      {reels.length > 0 && (
        <div className="hidden lg:flex items-center gap-2 absolute top-6 right-8 z-30 bg-zinc-900/80 border border-zinc-800 px-3.5 py-1.5 rounded-full text-xs text-zinc-300 backdrop-blur-md select-none">
          <button
            onClick={toggleGlobalMute}
            className="flex items-center gap-2 hover:text-white transition cursor-pointer"
          >
            {isGlobalMuted ? (
              <>
                <VolumeX className="w-4 h-4 text-red-400" />
                <span>Sound Off (Press M)</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 text-green-400" />
                <span>Sound On</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}
