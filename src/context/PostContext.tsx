'use client'
import { createContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react'
import type { Post } from '@types'
import { useTranslation } from 'react-i18next'
import { createClient, isSupabaseConfigured } from '@/utils/supabase/client'
import { formatRelativeTime } from '@/utils/formatTime'
import { resolveAvatar } from '@/utils/avatar'

const STORAGE_POSTS_KEY = 'instagram_posts'

interface AddPostInput {
  id?: number | string
  userId?: string
  username: string
  avatar: string
  image: string
  caption: string
  likes?: number
  comments?: number
  time?: string
  created_at?: string
}

interface PostContextType {
  posts: Post[]
  loading: boolean
  addPost: (newPost: AddPostInput) => void
  fetchPosts: () => Promise<void>
}

export const PostContext = createContext<PostContextType | undefined>(undefined)

interface PostProviderProps {
  children: ReactNode
}

export function PostProvider({ children }: PostProviderProps) {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(false)
  const { t } = useTranslation()

  // Load from localStorage cache on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem(STORAGE_POSTS_KEY)
        if (cached) {
          const parsed = JSON.parse(cached)
          if (Array.isArray(parsed) && parsed.length > 0) {
            setPosts(parsed)
          }
        }
      } catch {}
    }
  }, [])

  const fetchPosts = useCallback(async () => {
    if (!isSupabaseConfigured()) return

    try {
      setLoading(true)
      const supabase = createClient()

      // 1. Fetch posts directly to avoid PostgREST relationship/foreign key errors
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select('id, user_id, image_url, caption, created_at')
        .order('created_at', { ascending: false })
        .limit(50)

      if (postsError) {
        console.error('Error fetching posts:', postsError.message)
        return
      }

      if (postsData && postsData.length > 0) {
        const postIds = postsData.map((p) => p.id)
        const userIds = Array.from(new Set(postsData.map((p) => p.user_id).filter(Boolean)))

        // 2. Fetch profiles for these users
        const profilesMap = new Map<string, { username: string; avatar_url: string }>()
        if (userIds.length > 0) {
          const { data: profilesData } = await supabase
            .from('profiles')
            .select('id, username, avatar_url')
            .in('id', userIds)

          if (profilesData) {
            profilesData.forEach((prof) => {
              profilesMap.set(prof.id, prof)
            })
          }
        }

        // 3. Fetch likes counts
        const likesMap = new Map<string, number>()
        if (postIds.length > 0) {
          const { data: likesData } = await supabase
            .from('post_likes')
            .select('post_id')
            .in('post_id', postIds)

          if (likesData) {
            likesData.forEach((row) => {
              likesMap.set(row.post_id, (likesMap.get(row.post_id) || 0) + 1)
            })
          }
        }

        // 4. Fetch comments counts
        const commentsMap = new Map<string, number>()
        if (postIds.length > 0) {
          const { data: commentsData } = await supabase
            .from('post_comments')
            .select('post_id')
            .in('post_id', postIds)

          if (commentsData) {
            commentsData.forEach((row) => {
              commentsMap.set(row.post_id, (commentsMap.get(row.post_id) || 0) + 1)
            })
          }
        }

        // 5. Map to Post type
        const formattedPosts: Post[] = postsData.map((item) => {
          const profile = profilesMap.get(item.user_id)
          const username = profile?.username || 'user'
          const avatar = resolveAvatar(username, null, profile?.avatar_url)

          const likesCount = likesMap.get(item.id) ?? 0
          const commentsCount = commentsMap.get(item.id) ?? 0

          return {
            id: item.id,
            userId: item.user_id,
            username,
            avatar,
            image: item.image_url,
            caption: item.caption || '',
            likes: likesCount,
            comments: commentsCount,
            created_at: item.created_at,
            time: formatRelativeTime(item.created_at, t('feed.time.just_now')),
          }
        })

        setPosts((prevPosts) => {
          // Merge Supabase posts with any locally created posts
          const map = new Map<string | number, Post>()
          // Put Supabase posts
          formattedPosts.forEach((p) => map.set(p.id, p))
          // Keep local posts that might not be in DB yet
          prevPosts.forEach((p) => {
            if (!map.has(p.id)) {
              map.set(p.id, p)
            }
          })
          const merged = Array.from(map.values())
          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem(STORAGE_POSTS_KEY, JSON.stringify(merged.slice(0, 50)))
            } catch {}
          }
          return merged
        })
      }
    } catch (err) {
      console.error('Failed to load posts from Supabase:', err)
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  const addPost = useCallback(
    (newPost: AddPostInput) => {
      const createdAt = newPost.created_at || new Date().toISOString()
      const post: Post = {
        id: newPost.id ?? `post_${Date.now()}`,
        userId: newPost.userId,
        username: newPost.username,
        avatar: newPost.avatar,
        image: newPost.image,
        caption: newPost.caption,
        likes: newPost.likes ?? 0,
        comments: newPost.comments ?? 0,
        created_at: createdAt,
        time: newPost.time ?? formatRelativeTime(createdAt, t('feed.time.just_now')),
      }

      setPosts((prevPosts) => {
        const updated = [post, ...prevPosts]
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(STORAGE_POSTS_KEY, JSON.stringify(updated.slice(0, 50)))
          } catch {}
        }
        return updated
      })
    },
    [t],
  )

  const value = useMemo(
    () => ({ posts, loading, addPost, fetchPosts }),
    [posts, loading, addPost, fetchPosts],
  )

  return <PostContext.Provider value={value}>{children}</PostContext.Provider>
}
