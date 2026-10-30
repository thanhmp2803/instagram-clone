'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { Heart, X, CheckCircle, MessageCircle, Loader } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useAuth } from '@hooks'
import { createClient, isSupabaseConfigured } from '@/utils/supabase/client'
import { formatRelativeTime } from '@/utils/formatTime'
import { resolveAvatar } from '@/utils/avatar'
import { PostModal, type PostModalData } from '../post/PostModal'

export interface NotificationItem {
  id: string
  actorId: string
  actorUsername: string
  actorAvatar: string
  actorFullName?: string
  actorVerified?: boolean
  type: 'follow' | 'like' | 'comment'
  read: boolean
  createdAt: string
  isFollowingBack?: boolean
  postId?: string | number
  commentText?: string
}

interface NotificationsDrawerProps {
  isOpen: boolean
  onClose: () => void
  onUnreadChange?: (unreadCount: number) => void
}

const isValidUUID = (str?: string | null): boolean =>
  Boolean(str && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str))

export function deduplicateNotifications(items: NotificationItem[]): NotificationItem[] {
  const seenSignatures = new Set<string>()
  const result: NotificationItem[] = []

  for (const item of items) {
    if (!item) continue

    const actor = (item.actorUsername || item.actorId || '').toLowerCase().trim()
    const type = item.type
    const postId = String(item.postId || '').trim()
    const commentText = (item.commentText || '').toLowerCase().trim()

    // Semantic deduplication:
    // - 1 like per user per post
    // - 1 follow per user
    // - 1 comment notification per user + post + commentText
    let signature = ''
    if (type === 'like') {
      signature = `${actor}::like::${postId}`
    } else if (type === 'follow') {
      signature = `${actor}::follow`
    } else if (type === 'comment') {
      signature = `${actor}::comment::${postId}::${commentText}`
    } else {
      signature = `${actor}::${type}::${postId}::${item.id || ''}`
    }

    if (seenSignatures.has(signature)) continue
    seenSignatures.add(signature)
    result.push(item)
  }

  return result
}

export function NotificationsDrawer({ isOpen, onClose, onUnreadChange }: NotificationsDrawerProps) {
  const { user } = useAuth()
  const router = useRouter()
  const drawerRef = useRef<HTMLDivElement>(null)

  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedPost, setSelectedPost] = useState<PostModalData | null>(null)

  const currentUsername = user?.username || user?.name || ''
  const storageKey = useMemo(() => `instagram_notifications_${currentUsername}`, [currentUsername])

  // Load notifications from local storage and Supabase
  const loadNotifications = useCallback(async () => {
    if (!currentUsername) return

    let list: NotificationItem[] = []

    // 1. Load from localStorage
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(storageKey)
        if (stored) {
          list = JSON.parse(stored)
        }
      } catch {}
    }

    // 2. Fetch from Supabase if configured and logged in
    if (isSupabaseConfigured() && user?.id && isValidUUID(user.id)) {
      try {
        setLoading(true)
        const supabase = createClient()

        // Fetch notifications without join to avoid PostgREST foreign key relationship errors
        const { data: notifRows, error: notifError } = await supabase
          .from('notifications')
          .select('id, actor_id, type, read, created_at, post_id, comment_text')
          .eq('recipient_id', user.id)
          .order('created_at', { ascending: false })
          .limit(30)

        if (!notifError && notifRows && notifRows.length > 0) {
          const actorIds = Array.from(new Set(notifRows.map((r) => r.actor_id).filter(Boolean)))
          const profilesMap = new Map<
            string,
            { username: string; full_name?: string; avatar_url: string; is_verified?: boolean }
          >()

          if (actorIds.length > 0) {
            const { data: profs } = await supabase
              .from('profiles')
              .select('id, username, full_name, avatar_url, is_verified')
              .in('id', actorIds)

            if (profs) {
              profs.forEach((p) => profilesMap.set(p.id, p))
            }
          }

          const mapped: NotificationItem[] = notifRows.map((r) => {
            const prof = profilesMap.get(r.actor_id)
            const actorUsername = prof?.username || 'user'
            const actorAvatar = resolveAvatar(actorUsername, null, prof?.avatar_url)

            return {
              id: r.id,
              actorId: r.actor_id,
              actorUsername,
              actorAvatar,
              actorFullName: prof?.full_name || '',
              actorVerified: prof?.is_verified || false,
              type: r.type,
              read: r.read,
              createdAt: r.created_at,
              isFollowingBack: false,
              postId: r.post_id || undefined,
              commentText: r.comment_text || undefined,
            }
          })

          // Supabase is our single source of truth when records exist
          list = deduplicateNotifications(mapped)

          // Clean localStorage of any old duplicates
          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem(storageKey, JSON.stringify(list))
            } catch {}
          }
        } else {
          // If Supabase returned 0 rows, deduplicate whatever was in localStorage
          list = deduplicateNotifications(list)
        }
      } catch (err) {
        console.error('Failed to load notifications from Supabase:', err)
        list = deduplicateNotifications(list)
      } finally {
        setLoading(false)
      }
    } else {
      list = deduplicateNotifications(list)
    }

    setNotifications(list)
    const unread = list.filter((n) => !n.read).length
    onUnreadChange?.(unread)
  }, [currentUsername, storageKey, user?.id, onUnreadChange])

  useEffect(() => {
    loadNotifications()
  }, [loadNotifications])

  // Mark all as read when opening drawer
  useEffect(() => {
    if (!isOpen) return

    setNotifications((prev) => {
      if (!prev.some((n) => !n.read)) return prev
      const updated = prev.map((n) => ({ ...n, read: true }))
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(storageKey, JSON.stringify(updated))
        } catch {}
      }
      return updated
    })

    onUnreadChange?.(0)

    if (isSupabaseConfigured() && user?.id && isValidUUID(user.id)) {
      const supabase = createClient()
      supabase.from('notifications').update({ read: true }).eq('recipient_id', user.id).then()
    }
  }, [isOpen, storageKey, user?.id, onUnreadChange])

  // Handle clicking notification row: Open PostModal if post exists, or go to profile for follow
  const handleNotificationClick = async (notif: NotificationItem) => {
    if (notif.type === 'follow') {
      router.push(`/profile/${notif.actorUsername}`)
      onClose()
      return
    }

    // If notification has a postId, look it up and open in PostModal
    if (notif.postId) {
      let targetPost: PostModalData | null = null

      // Check localStorage cached posts
      if (typeof window !== 'undefined') {
        try {
          const raw = localStorage.getItem('instagram_posts')
          if (raw) {
            const list = JSON.parse(raw)
            if (Array.isArray(list)) {
              const found = list.find((p) => String(p.id) === String(notif.postId))
              if (found) {
                targetPost = {
                  id: found.id,
                  imageUrl: found.image || found.imageUrl,
                  caption: found.caption,
                  username: found.username,
                  avatar: found.avatar,
                  likes: found.likes,
                  comments: found.comments,
                  time: found.time,
                  created_at: found.created_at,
                }
              }
            }
          }
        } catch {}
      }

      // Check Supabase if not found in localStorage
      if (!targetPost && isSupabaseConfigured()) {
        try {
          const supabase = createClient()
          const { data: postRow } = await supabase
            .from('posts')
            .select('id, user_id, image_url, caption, created_at')
            .eq('id', notif.postId)
            .maybeSingle()

          if (postRow) {
            const { data: profRow } = await supabase
              .from('profiles')
              .select('username, avatar_url')
              .eq('id', postRow.user_id)
              .maybeSingle()

            const postUsername = profRow?.username || 'user'
            let postAvatar = profRow?.avatar_url || '/images/nonuser.png'
            if (
              (postUsername.toLowerCase() === 'pthanh2803' ||
                postUsername.toLowerCase() === 'admin') &&
              (!postAvatar || postAvatar === '/images/nonuser.png')
            ) {
              postAvatar = '/images/conmeo.jpg'
            }

            targetPost = {
              id: postRow.id,
              imageUrl: postRow.image_url,
              caption: postRow.caption || '',
              username: postUsername,
              avatar: postAvatar,
              created_at: postRow.created_at,
              time: formatRelativeTime(postRow.created_at),
            }
          }
        } catch (err) {
          console.warn('Error fetching target post for notification:', err)
        }
      }

      if (targetPost) {
        setSelectedPost(targetPost)
        return
      }
    }

    // Fallback if no post is found: navigate to actor profile
    router.push(`/profile/${notif.actorUsername}`)
    onClose()
  }

  // Toggle follow back
  const handleToggleFollowBack = async (
    e: React.MouseEvent,
    targetUsername: string,
    targetActorId: string,
  ) => {
    e.stopPropagation()
    const updated = notifications.map((n) => {
      if (n.actorUsername === targetUsername) {
        return { ...n, isFollowingBack: !n.isFollowingBack }
      }
      return n
    })
    setNotifications(updated)

    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, JSON.stringify(updated))

      // Also update follow records store
      const FOLLOWS_STORAGE_KEY = 'instagram_follows_store'
      const raw = localStorage.getItem(FOLLOWS_STORAGE_KEY)
      const currentList: { follower: string; following: string }[] = raw ? JSON.parse(raw) : []
      const curId = user?.username || user?.id || ''
      const exists = currentList.some(
        (f) =>
          f.follower.toLowerCase() === curId.toLowerCase() &&
          f.following.toLowerCase() === targetUsername.toLowerCase(),
      )

      if (exists) {
        const filtered = currentList.filter(
          (f) =>
            !(
              f.follower.toLowerCase() === curId.toLowerCase() &&
              f.following.toLowerCase() === targetUsername.toLowerCase()
            ),
        )
        localStorage.setItem(FOLLOWS_STORAGE_KEY, JSON.stringify(filtered))
      } else {
        currentList.push({ follower: curId, following: targetUsername })
        localStorage.setItem(FOLLOWS_STORAGE_KEY, JSON.stringify(currentList))
        window.dispatchEvent(new CustomEvent('instagram:follow_updated'))
      }
    }

    if (isSupabaseConfigured() && user?.id && isValidUUID(user.id) && isValidUUID(targetActorId)) {
      const supabase = createClient()
      const isNowFollowing = updated.find(
        (n) => n.actorUsername === targetUsername,
      )?.isFollowingBack
      if (isNowFollowing) {
        await supabase.from('follows').insert({ follower_id: user.id, following_id: targetActorId })
      } else {
        await supabase
          .from('follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', targetActorId)
      }
    }
  }

  // Close on Escape or click outside
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !selectedPost) onClose()
    }
    const handleClickOutside = (e: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node) && !selectedPost) {
        onClose()
      }
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown)
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose, selectedPost])

  if (!isOpen) return null

  return (
    <>
      <div
        ref={drawerRef}
        className="fixed top-0 left-0 lg:left-[250px] w-full lg:w-[397px] h-screen bg-black border-r border-zinc-800 z-30 flex flex-col shadow-2xl transition-transform animate-in slide-in-from-left duration-200"
      >
        {/* Header */}
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl font-bold text-white">Thông báo</h2>
            {loading && <Loader className="w-4 h-4 text-zinc-400 animate-spin" />}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
            aria-label="Close notifications"
          >
            <X size={22} />
          </button>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto px-4 py-2 divide-y divide-zinc-900">
          {notifications.length > 0 ? (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className="flex items-center justify-between gap-3 py-3 px-2 hover:bg-zinc-900/60 rounded-xl transition cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {/* Avatar: ONLY navigates to user profile */}
                  <div
                    onClick={(e) => {
                      e.stopPropagation()
                      router.push(`/profile/${notif.actorUsername}`)
                      onClose()
                    }}
                    className="relative w-11 h-11 rounded-full overflow-hidden border border-zinc-800 bg-zinc-800 flex-shrink-0 cursor-pointer hover:opacity-80 transition"
                    title={`Xem trang cá nhân của ${notif.actorUsername}`}
                  >
                    <Image
                      src={resolveAvatar(notif.actorUsername, null, notif.actorAvatar)}
                      alt={notif.actorUsername}
                      width={44}
                      height={44}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0 text-xs">
                    <div className="text-white leading-snug">
                      {/* Username: ONLY navigates to user profile */}
                      <span
                        onClick={(e) => {
                          e.stopPropagation()
                          router.push(`/profile/${notif.actorUsername}`)
                          onClose()
                        }}
                        className="font-semibold mr-1 hover:underline cursor-pointer"
                        title={`Xem trang cá nhân của ${notif.actorUsername}`}
                      >
                        {notif.actorUsername}
                      </span>
                      {notif.actorVerified && (
                        <CheckCircle className="w-3 h-3 inline-block fill-blue-500 text-black mr-1" />
                      )}
                      <span className="text-zinc-300">
                        {notif.type === 'follow' && 'đã bắt đầu theo dõi bạn.'}
                        {notif.type === 'like' && 'đã thích bài viết của bạn.'}
                        {notif.type === 'comment' && (
                          <>
                            đã bình luận: &quot;
                            <span className="text-white italic font-normal">
                              {notif.commentText || 'bài viết của bạn'}
                            </span>
                            &quot;
                          </>
                        )}
                      </span>
                      <span className="text-zinc-500 ml-1.5 font-normal">
                        {formatRelativeTime(notif.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Button: Follow Back / Following */}
                {notif.type === 'follow' && (
                  <button
                    onClick={(e) => handleToggleFollowBack(e, notif.actorUsername, notif.actorId)}
                    className={`text-xs font-semibold py-1.5 px-4 rounded-lg transition cursor-pointer flex-shrink-0 ${
                      notif.isFollowingBack
                        ? 'bg-neutral-800 hover:bg-neutral-700 text-white'
                        : 'bg-blue-600 hover:bg-blue-500 text-white'
                    }`}
                  >
                    {notif.isFollowingBack ? 'Đang theo dõi' : 'Theo dõi lại'}
                  </button>
                )}

                {/* Heart indicator for like notification */}
                {notif.type === 'like' && (
                  <div className="flex items-center justify-center w-8 h-8 flex-shrink-0 text-red-500">
                    <Heart size={18} className="fill-red-500 text-red-500" />
                  </div>
                )}

                {/* MessageCircle indicator for comment notification */}
                {notif.type === 'comment' && (
                  <div className="flex items-center justify-center w-8 h-8 flex-shrink-0 text-blue-400">
                    <MessageCircle size={18} className="text-blue-400" />
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center px-4">
              <div className="w-16 h-16 rounded-full border-2 border-zinc-700 flex items-center justify-center mb-4">
                <Heart size={32} className="text-zinc-500" />
              </div>
              <h3 className="text-white font-semibold text-sm mb-1">
                Hoạt động trên bài viết của bạn
              </h3>
              <p className="text-zinc-500 text-xs max-w-xs">
                Khi ai đó thích hoặc bình luận bài viết của bạn, hoặc bắt đầu theo dõi bạn, bạn sẽ
                thấy ở đây.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Post Modal popup when clicking like/comment notification */}
      {selectedPost && (
        <PostModal
          isOpen={!!selectedPost}
          onClose={() => setSelectedPost(null)}
          post={selectedPost}
        />
      )}
    </>
  )
}
