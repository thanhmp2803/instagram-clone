'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { Plus } from 'lucide-react'
import { useAuth } from '@hooks'
import { createClient, isSupabaseConfigured } from '@/utils/supabase/client'
import { resolveAvatar } from '@/utils/avatar'
import type { IUserStories, IStoryItem } from '@/types'
import { StoryViewer } from './StoryViewer'

// Rich, diverse high-quality stories for multiple creators
const DEFAULT_STORIES: IUserStories[] = [
  {
    userId: 'sarah_uuid',
    username: 'creative_coder',
    fullName: 'Sarah Connor',
    avatarUrl:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    isVerified: true,
    stories: [
      {
        id: 'sarah_story_1',
        userId: 'sarah_uuid',
        mediaUrl:
          'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1080&auto=format&fit=crop&q=80',
        mediaType: 'image',
        caption: 'Late night debugging with hot matcha 🍵💻 Building Next.js 15 apps!',
        createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
      },
      {
        id: 'sarah_story_2',
        userId: 'sarah_uuid',
        mediaUrl:
          'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=1080&auto=format&fit=crop&q=80',
        mediaType: 'image',
        caption: 'Tokyo night walk ✨🌆 The city that never sleeps #vibes',
        createdAt: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
      },
    ],
  },
  {
    userId: 'elena_uuid',
    username: 'chef_artisan',
    fullName: 'Elena Rostova',
    avatarUrl:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    isVerified: false,
    stories: [
      {
        id: 'elena_story_1',
        userId: 'elena_uuid',
        mediaUrl:
          'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1080&auto=format&fit=crop&q=80',
        mediaType: 'image',
        caption: 'Golden sourdough crust straight from the oven 🥖🌾 100% natural yeast.',
        createdAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
      },
      {
        id: 'elena_story_2',
        userId: 'elena_uuid',
        mediaUrl:
          'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1080&auto=format&fit=crop&q=80',
        mediaType: 'image',
        caption: 'Morning croissant & espresso 🥐☕ Wishing everyone a sweet day!',
        createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
      },
    ],
  },
  {
    userId: 'travel_uuid',
    username: 'travel_lover',
    fullName: 'Alex Rivera',
    avatarUrl:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    isVerified: true,
    stories: [
      {
        id: 'travel_story_1',
        userId: 'travel_uuid',
        mediaUrl:
          'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1080&auto=format&fit=crop&q=80',
        mediaType: 'image',
        caption: 'Turquoise crystal ocean in Bali 🏖️🌊 Sunset vibes.',
        createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
      },
      {
        id: 'travel_story_2',
        userId: 'travel_uuid',
        mediaUrl:
          'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1080&auto=format&fit=crop&q=80',
        mediaType: 'image',
        caption: 'Pacific highway coastal road trip 🌲🛣️ Keep exploring!',
        createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
      },
    ],
  },
  {
    userId: 'coffee_uuid',
    username: 'coffee_addict',
    fullName: 'Liam Chen',
    avatarUrl:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    isVerified: false,
    stories: [
      {
        id: 'coffee_story_1',
        userId: 'coffee_uuid',
        mediaUrl:
          'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1080&auto=format&fit=crop&q=80',
        mediaType: 'image',
        caption: 'Latte art practice: Swan pour ☕🦢 Barista daily routine.',
        createdAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
      },
      {
        id: 'coffee_story_2',
        userId: 'coffee_uuid',
        mediaUrl:
          'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=1080&auto=format&fit=crop&q=80',
        mediaType: 'image',
        caption: 'Aromatic specialty coffee beans freshly roasted 🍒🔥',
        createdAt: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
      },
    ],
  },
  {
    userId: 'artist_uuid',
    username: 'artist_soul',
    fullName: 'Chloe Bennett',
    avatarUrl:
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    isVerified: true,
    stories: [
      {
        id: 'artist_story_1',
        userId: 'artist_uuid',
        mediaUrl:
          'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1080&auto=format&fit=crop&q=80',
        mediaType: 'image',
        caption: 'Oil on canvas in progress 🎨 Working on the color harmony.',
        createdAt: new Date(Date.now() - 7 * 3600 * 1000).toISOString(),
      },
    ],
  },
  {
    userId: 'gym_uuid',
    username: 'gym_warrior',
    fullName: 'Marcus Vance',
    avatarUrl:
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    isVerified: false,
    stories: [
      {
        id: 'gym_story_1',
        userId: 'gym_uuid',
        mediaUrl:
          'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=1080&auto=format&fit=crop&q=80',
        mediaType: 'image',
        caption: '5 AM morning grind session 💪 Never skip a Monday! #fitness',
        createdAt: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
      },
    ],
  },
]

export function StoriesTray() {
  const { user } = useAuth()
  const [userStories, setUserStories] = useState<IUserStories[]>(DEFAULT_STORIES)
  const [seenStoryIds, setSeenStoryIds] = useState<Set<string>>(new Set())
  const [viewerState, setViewerState] = useState<{ isOpen: boolean; initialUserIndex: number }>({
    isOpen: false,
    initialUserIndex: 0,
  })

  // Load seen stories set from localStorage
  const refreshSeenStories = useCallback(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('instagram_seen_stories')
        if (raw) {
          setSeenStoryIds(new Set(JSON.parse(raw)))
        }
      } catch {}
    }
  }, [])

  useEffect(() => {
    refreshSeenStories()
    const handleSeenUpdate = () => refreshSeenStories()
    window.addEventListener('instagram:story_seen', handleSeenUpdate)
    return () => window.removeEventListener('instagram:story_seen', handleSeenUpdate)
  }, [refreshSeenStories])

  // Fetch stories from Supabase
  const loadStoriesFromSupabase = useCallback(async () => {
    if (!isSupabaseConfigured()) return

    try {
      const supabase = createClient()

      // Fetch active stories
      const { data: storyRows, error: storyErr } = await supabase
        .from('stories')
        .select('id, user_id, media_url, media_type, caption, created_at, expires_at')
        .order('created_at', { ascending: true })

      if (storyErr || !storyRows || storyRows.length === 0) return

      // Fetch profiles for users in stories
      const userIds = Array.from(new Set(storyRows.map((s) => s.user_id)))
      const { data: profRows } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url, is_verified')
        .in('id', userIds)

      if (!profRows || profRows.length === 0) return

      const profMap = new Map<string, (typeof profRows)[0]>()
      profRows.forEach((p) => profMap.set(p.id, p))

      // Group stories by user
      const grouped: IUserStories[] = []
      const userStoriesMap = new Map<string, IStoryItem[]>()

      storyRows.forEach((r) => {
        const item: IStoryItem = {
          id: r.id,
          userId: r.user_id,
          mediaUrl: r.media_url,
          mediaType: (r.media_type as 'image' | 'video') || 'image',
          caption: r.caption || '',
          createdAt: r.created_at,
          expiresAt: r.expires_at,
        }
        const existing = userStoriesMap.get(r.user_id) || []
        existing.push(item)
        userStoriesMap.set(r.user_id, existing)
      })

      // Construct user stories from Supabase
      profRows.forEach((prof) => {
        const stories = userStoriesMap.get(prof.id)
        if (stories && stories.length > 0) {
          grouped.push({
            userId: prof.id,
            username: prof.username,
            fullName: prof.full_name || prof.username,
            avatarUrl: resolveAvatar(prof.username, null, prof.avatar_url),
            isVerified: prof.is_verified || false,
            stories,
          })
        }
      })

      if (grouped.length > 0) {
        // Merge Supabase stories with default stories if some users don't exist yet in Supabase
        const seenUsernames = new Set(grouped.map((g) => g.username.toLowerCase()))
        const merged = [...grouped]
        DEFAULT_STORIES.forEach((ds) => {
          if (!seenUsernames.has(ds.username.toLowerCase())) {
            merged.push(ds)
          }
        })
        setUserStories(merged)
      }
    } catch (e) {
      console.warn('Notice loading stories from Supabase:', e)
    }
  }, [])

  useEffect(() => {
    loadStoriesFromSupabase()
  }, [loadStoriesFromSupabase])

  // Open Story Viewer at chosen user
  const handleOpenStory = (userIndex: number) => {
    setViewerState({
      isOpen: true,
      initialUserIndex: userIndex,
    })
  }

  // Check if a user's stories are all seen
  const isUserAllSeen = useCallback(
    (uStories: IUserStories) => {
      if (!uStories.stories || uStories.stories.length === 0) return true
      return uStories.stories.every((s) => seenStoryIds.has(s.id))
    },
    [seenStoryIds],
  )

  // Current logged in user info
  const curUsername = user?.username || user?.name || 'Bạn'
  const curAvatar = resolveAvatar(user?.username, user?.email, user?.avatar)

  return (
    <>
      {/* Seamless, borderless story container */}
      <div className="w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl mx-auto mb-3 sm:mb-4">
        <div className="py-2 sm:py-3 px-1 sm:px-0 overflow-x-auto no-scrollbar flex items-center gap-4 sm:gap-5 select-none">
          {/* 1. Your Story (Current User Item) */}
          <div className="flex flex-col items-center flex-shrink-0 cursor-pointer group">
            <div className="relative w-16 h-16 sm:w-[68px] sm:h-[68px]">
              <div className="w-full h-full rounded-full p-[2px] border border-zinc-700/80 overflow-hidden bg-black flex items-center justify-center">
                <Image
                  src={curAvatar}
                  alt={curUsername}
                  width={64}
                  height={64}
                  className="w-full h-full rounded-full object-cover group-hover:opacity-90 transition"
                />
              </div>

              {/* Blue Plus icon badge */}
              <div className="absolute bottom-0 right-0 w-5 h-5 bg-blue-500 rounded-full border-2 border-black flex items-center justify-center text-white">
                <Plus size={13} strokeWidth={3} />
              </div>
            </div>

            <span className="text-white text-xs mt-1.5 font-normal max-w-[70px] truncate text-center">
              Tin của bạn
            </span>
          </div>

          {/* 2. Diverse Stories for Creators */}
          {userStories.map((u, index) => {
            const allSeen = isUserAllSeen(u)

            return (
              <div
                key={u.userId || index}
                onClick={() => handleOpenStory(index)}
                className="flex flex-col items-center flex-shrink-0 cursor-pointer group"
              >
                {/* Rainbow gradient ring if unread, or subtle gray ring if already viewed */}
                <div
                  className={`w-16 h-16 sm:w-[68px] sm:h-[68px] rounded-full p-[2.5px] transition-transform duration-150 group-hover:scale-105 ${
                    allSeen
                      ? 'bg-zinc-700/70'
                      : 'bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888]'
                  }`}
                >
                  {/* Black spacer gap inside the ring */}
                  <div className="w-full h-full bg-black rounded-full p-[2px] flex items-center justify-center overflow-hidden">
                    <Image
                      src={u.avatarUrl}
                      alt={u.username}
                      width={62}
                      height={62}
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                </div>

                {/* Username label */}
                <span className="text-white text-xs mt-1.5 font-normal max-w-[72px] truncate text-center">
                  {u.username}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Fullscreen Interactive Story Viewer */}
      {viewerState.isOpen && (
        <StoryViewer
          isOpen={viewerState.isOpen}
          userStoriesList={userStories}
          initialUserIndex={viewerState.initialUserIndex}
          onClose={() => setViewerState((prev) => ({ ...prev, isOpen: false }))}
        />
      )}
    </>
  )
}
