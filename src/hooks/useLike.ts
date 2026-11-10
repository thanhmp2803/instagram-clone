'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useAuth } from './useAuth'
import { createClient, isSupabaseConfigured } from '@/utils/supabase/client'
import { resolveAvatar } from '@/utils/avatar'

const isValidUUID = (str?: string | null): boolean =>
  Boolean(str && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str))

export interface UseLikeOptions {
  postId?: string | number
  initialLikes?: number
  authorUsername?: string
  authorId?: string
}

export function useLike(initialLikesOrOptions: number | UseLikeOptions) {
  const { user } = useAuth()

  const options: UseLikeOptions = useMemo(() => {
    if (typeof initialLikesOrOptions === 'number') {
      return { initialLikes: initialLikesOrOptions }
    }
    return initialLikesOrOptions || {}
  }, [initialLikesOrOptions])

  const postId = options.postId ? String(options.postId) : ''
  const baseLikes = options.initialLikes ?? 0

  const likeStorageKey = useMemo(
    () => `post_like_${postId}_${user?.username || user?.id || 'anon'}`,
    [postId, user?.username, user?.id],
  )
  const countStorageKey = useMemo(() => `post_likes_count_${postId}`, [postId])

  const [isLiked, setIsLiked] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && postId) {
      const storedLike = localStorage.getItem(likeStorageKey)
      if (storedLike !== null) return storedLike === 'true'
    }
    return false
  })

  const [likesCount, setLikesCount] = useState<number>(() => {
    if (typeof window !== 'undefined' && postId) {
      const storedCount = localStorage.getItem(countStorageKey)
      if (storedCount !== null) {
        const parsed = parseInt(storedCount, 10)
        if (!isNaN(parsed)) return parsed
      }
    }
    return baseLikes
  })

  // Synchronize with Supabase asynchronously without cascading synchronous renders
  useEffect(() => {
    if (!postId || !isSupabaseConfigured() || !isValidUUID(postId)) return

    let isMounted = true
    const supabase = createClient()

    // 1. Count exact likes from Supabase
    supabase
      .from('post_likes')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId)
      .then(({ count }) => {
        if (!isMounted) return
        if (count !== null && count !== undefined) {
          setLikesCount(count)
          if (typeof window !== 'undefined') {
            localStorage.setItem(countStorageKey, String(count))
          }
        }
      })

    // 2. Check if current authenticated user liked this post
    if (user?.id && isValidUUID(user.id)) {
      supabase
        .from('post_likes')
        .select('user_id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .maybeSingle()
        .then(({ data }) => {
          if (!isMounted) return
          if (data) {
            setIsLiked(true)
            if (typeof window !== 'undefined') {
              localStorage.setItem(likeStorageKey, 'true')
            }
          }
        })
    }

    return () => {
      isMounted = false
    }
  }, [postId, likeStorageKey, countStorageKey, user?.id])

  // Toggle Like Action
  const toggleLike = useCallback(async () => {
    const nextLiked = !isLiked
    const nextCount = nextLiked ? likesCount + 1 : Math.max(0, likesCount - 1)

    setIsLiked(nextLiked)
    setLikesCount(nextCount)

    // Save to localStorage
    if (typeof window !== 'undefined' && postId) {
      localStorage.setItem(likeStorageKey, String(nextLiked))
      localStorage.setItem(countStorageKey, String(nextCount))

      // Also update post in global PostContext storage cache if present
      try {
        const postsRaw = localStorage.getItem('instagram_posts')
        if (postsRaw) {
          const list = JSON.parse(postsRaw)
          if (Array.isArray(list)) {
            const updated = list.map((p) =>
              String(p.id) === postId ? { ...p, likes: nextCount } : p,
            )
            localStorage.setItem('instagram_posts', JSON.stringify(updated))
          }
        }
      } catch {}
    }

    const currentUsername = user?.username || user?.name || 'someone'
    const targetAuthor = options.authorUsername || ''

    // If newly liked and not own post, send notification to the author
    if (nextLiked && targetAuthor && targetAuthor.toLowerCase() !== currentUsername.toLowerCase()) {
      if (isSupabaseConfigured() && user?.id && isValidUUID(user.id)) {
        try {
          const supabase = createClient()

          // If authorId not provided, look up by username
          let recipientId = options.authorId
          if (!recipientId || !isValidUUID(recipientId)) {
            const { data: authorProf } = await supabase
              .from('profiles')
              .select('id')
              .eq('username', targetAuthor)
              .maybeSingle()
            if (authorProf) {
              recipientId = authorProf.id
            }
          }

          if (recipientId && isValidUUID(recipientId)) {
            await supabase.from('notifications').insert({
              recipient_id: recipientId,
              actor_id: user.id,
              type: 'like',
              post_id: isValidUUID(postId) ? postId : null,
            })
          }
        } catch (notifErr) {
          console.warn('Supabase like notification notice:', notifErr)
        }
      } else if (typeof window !== 'undefined') {
        try {
          const notifKey = `instagram_notifications_${targetAuthor}`
          const notifsRaw = localStorage.getItem(notifKey)
          const notifsList = notifsRaw ? JSON.parse(notifsRaw) : []
          notifsList.unshift({
            id: `notif_${Date.now()}`,
            actorId: user?.id || 'anon',
            actorUsername: currentUsername,
            actorAvatar: resolveAvatar(currentUsername, user?.email, user?.avatar),
            actorFullName: user?.name || currentUsername,
            type: 'like',
            read: false,
            createdAt: new Date().toISOString(),
            postId: postId,
          })
          localStorage.setItem(notifKey, JSON.stringify(notifsList.slice(0, 50)))
        } catch {}
      }
    }

    // Sync like record to Supabase
    if (isSupabaseConfigured() && user?.id && isValidUUID(user.id) && isValidUUID(postId)) {
      try {
        const supabase = createClient()
        if (nextLiked) {
          await supabase.from('post_likes').insert({
            post_id: postId,
            user_id: user.id,
          })
        } else {
          await supabase.from('post_likes').delete().eq('post_id', postId).eq('user_id', user.id)
        }
      } catch (err) {
        console.error('Failed to sync like with Supabase:', err)
      }
    }
  }, [
    isLiked,
    likesCount,
    postId,
    likeStorageKey,
    countStorageKey,
    user,
    options.authorUsername,
    options.authorId,
  ])

  const likeButtonProps = {
    className: `cursor-pointer transition-colors ${
      isLiked ? 'text-red-500 hover:text-red-600 fill-current' : 'hover:text-gray-400'
    }`,
    onClick: toggleLike,
    fill: isLiked ? 'currentColor' : 'none',
  }

  return {
    isLiked,
    likesCount,
    toggleLike,
    likeButtonProps,
  }
}
