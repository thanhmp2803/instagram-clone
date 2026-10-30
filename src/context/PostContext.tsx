'use client'
import { createContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react'
import type { Post } from '@types'
import { useTranslation } from 'react-i18next'
import { createClient, isSupabaseConfigured } from '@/utils/supabase/client'

interface AddPostInput {
  id?: number | string
  username: string
  avatar: string
  image: string
  caption: string
  likes?: number
  comments?: number
  time?: string
}

interface SupabasePostRow {
  id: string
  image_url: string
  caption: string | null
  created_at: string
  profiles?:
    | { username?: string; avatar_url?: string }
    | { username?: string; avatar_url?: string }[]
    | null
  post_likes?: { count: number }[]
  post_comments?: { count: number }[]
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

  const fetchPosts = useCallback(async () => {
    if (!isSupabaseConfigured()) return

    try {
      setLoading(true)
      const supabase = createClient()
      const { data, error } = await supabase
        .from('posts')
        .select(
          `
          id,
          image_url,
          caption,
          created_at,
          profiles:user_id (
            username,
            avatar_url
          ),
          post_likes(count),
          post_comments(count)
        `,
        )
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching posts:', error.message)
        return
      }

      if (data && data.length > 0) {
        const rows = data as unknown as SupabasePostRow[]
        const formattedPosts: Post[] = rows.map((item) => {
          const profile = Array.isArray(item.profiles) ? item.profiles[0] : item.profiles
          const likesCount = item.post_likes?.[0]?.count ?? 0
          const commentsCount = item.post_comments?.[0]?.count ?? 0

          // Calculate friendly time
          const createdDate = new Date(item.created_at)
          const diffMinutes = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60))
          let timeStr = t('feed.time.just_now')
          if (diffMinutes >= 60 * 24) {
            timeStr = `${Math.floor(diffMinutes / (60 * 24))}d`
          } else if (diffMinutes >= 60) {
            timeStr = `${Math.floor(diffMinutes / 60)}h`
          } else if (diffMinutes > 0) {
            timeStr = `${diffMinutes}m`
          }

          return {
            id: item.id,
            username: profile?.username || 'user',
            avatar: profile?.avatar_url || '/images/nonuser.png',
            image: item.image_url,
            caption: item.caption || '',
            likes: likesCount,
            comments: commentsCount,
            time: timeStr,
          }
        })
        setPosts(formattedPosts)
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
      const post: Post = {
        id: newPost.id ?? Date.now(),
        username: newPost.username,
        avatar: newPost.avatar,
        image: newPost.image,
        caption: newPost.caption,
        likes: newPost.likes ?? 0,
        comments: newPost.comments ?? 0,
        time: newPost.time ?? t('feed.time.just_now'),
      }

      setPosts((prevPosts) => [post, ...prevPosts])
    },
    [t],
  )

  const value = useMemo(
    () => ({ posts, loading, addPost, fetchPosts }),
    [posts, loading, addPost, fetchPosts],
  )

  return <PostContext.Provider value={value}>{children}</PostContext.Provider>
}
