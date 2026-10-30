'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import Image from 'next/image'
import {
  X,
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  Smile,
  MoreHorizontal,
  CheckCircle,
} from 'lucide-react'
import { useAuth, useSave } from '@hooks'
import { createClient, isSupabaseConfigured } from '@/utils/supabase/client'
import { formatRelativeTime } from '@/utils/formatTime'
import { resolveAvatar } from '@/utils/avatar'
import Link from 'next/link'

export interface PostModalData {
  id: string | number
  imageUrl: string
  caption?: string
  username?: string
  avatar?: string
  likes?: number
  comments?: number
  time?: string
  created_at?: string
  isVerified?: boolean
}

interface PostCommentItem {
  id: string | number
  username: string
  avatar: string
  text: string
  created_at: string
}

interface PostModalProps {
  isOpen: boolean
  onClose: () => void
  post: PostModalData | null
  onPostUpdated?: (updatedPost: PostModalData) => void
}

const isValidUUID = (str?: string | null): boolean =>
  Boolean(str && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str))

export function PostModal({ isOpen, onClose, post }: PostModalProps) {
  const { user } = useAuth()
  const { saveButtonProps } = useSave(post?.id)
  const [commentText, setCommentText] = useState('')
  const [comments, setComments] = useState<PostCommentItem[]>([])
  const [isLiked, setIsLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const postId = post?.id ? String(post.id) : ''
  const postAuthor = post?.username || 'user'
  const postAvatar = resolveAvatar(postAuthor, null, post?.avatar)

  const storageCommentKey = useMemo(() => `post_comments_${postId}`, [postId])
  const storageLikeKey = useMemo(
    () => `post_like_${postId}_${user?.username || 'anon'}`,
    [postId, user?.username],
  )

  // Reset and load comments & like state when post changes
  useEffect(() => {
    if (!isOpen || !post) return

    setLikesCount(post.likes || 0)

    // 1. Check local like state
    if (typeof window !== 'undefined') {
      const likedState = localStorage.getItem(storageLikeKey)
      setIsLiked(likedState === 'true')

      // Load cached comments
      const cachedComments = localStorage.getItem(storageCommentKey)
      if (cachedComments) {
        try {
          setComments(JSON.parse(cachedComments))
        } catch {
          setComments([])
        }
      } else {
        setComments([])
      }
    }

    // 2. Fetch comments from Supabase if valid UUID
    if (isSupabaseConfigured() && isValidUUID(postId)) {
      const supabase = createClient()

      // Fetch comments directly without join to avoid PostgREST relationship schema cache error
      supabase
        .from('post_comments')
        .select('id, user_id, text, created_at')
        .eq('post_id', postId)
        .order('created_at', { ascending: true })
        .then(async ({ data, error }) => {
          if (!error && data && data.length > 0) {
            const userIds = Array.from(new Set(data.map((c) => c.user_id).filter(Boolean)))
            const profilesMap = new Map<string, { username: string; avatar_url: string }>()
            if (userIds.length > 0) {
              const { data: profs } = await supabase
                .from('profiles')
                .select('id, username, avatar_url')
                .in('id', userIds)
              profs?.forEach((p) => profilesMap.set(p.id, p))
            }
            const mapped: PostCommentItem[] = data.map((c) => {
              const prof = profilesMap.get(c.user_id)
              const u = prof?.username || 'user'
              let av = prof?.avatar_url || '/images/nonuser.png'
              if (u === 'pthanh2803' && (!av || av === '/images/nonuser.png')) {
                av = '/images/conmeo.jpg'
              }
              return {
                id: c.id,
                text: c.text,
                created_at: c.created_at,
                username: u,
                avatar: av,
              }
            })
            setComments(mapped)
          }
        })

      // Fetch like status if logged in
      if (user?.id && isValidUUID(user.id)) {
        supabase
          .from('post_likes')
          .select('user_id')
          .eq('post_id', postId)
          .eq('user_id', user.id)
          .maybeSingle()
          .then(({ data }) => {
            if (data) {
              setIsLiked(true)
            }
          })

        // Count total likes
        supabase
          .from('post_likes')
          .select('*', { count: 'exact', head: true })
          .eq('post_id', postId)
          .then(({ count }) => {
            if (count !== null && count !== undefined) {
              setLikesCount(count)
            }
          })
      }
    }
  }, [isOpen, post, postId, storageCommentKey, storageLikeKey, user?.id, user?.username])

  // Handle Like Toggle
  const handleToggleLike = useCallback(async () => {
    const nextLiked = !isLiked
    const nextCount = nextLiked ? likesCount + 1 : Math.max(0, likesCount - 1)

    setIsLiked(nextLiked)
    setLikesCount(nextCount)

    const currentUsername = user?.username || user?.name || 'someone'

    if (typeof window !== 'undefined' && postId) {
      localStorage.setItem(storageLikeKey, String(nextLiked))
      localStorage.setItem(`post_likes_count_${postId}`, String(nextCount))

      // Update in global PostContext cache
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

    // Trigger notification when liked (if not own post)
    if (nextLiked && postAuthor && postAuthor.toLowerCase() !== currentUsername.toLowerCase()) {
      if (isSupabaseConfigured() && user?.id && isValidUUID(user.id)) {
        try {
          const supabase = createClient()
          const { data: authorProf } = await supabase
            .from('profiles')
            .select('id')
            .eq('username', postAuthor)
            .maybeSingle()

          if (authorProf && isValidUUID(authorProf.id)) {
            await supabase.from('notifications').insert({
              recipient_id: authorProf.id,
              actor_id: user.id,
              type: 'like',
              post_id: isValidUUID(postId) ? postId : null,
            })
          }
        } catch (e) {
          console.warn('Supabase post modal like notification notice:', e)
        }
      } else if (typeof window !== 'undefined') {
        try {
          const notifKey = `instagram_notifications_${postAuthor}`
          const notifsRaw = localStorage.getItem(notifKey)
          const notifsList = notifsRaw ? JSON.parse(notifsRaw) : []
          notifsList.unshift({
            id: `notif_${Date.now()}`,
            actorId: user?.id || 'anon',
            actorUsername: currentUsername,
            actorAvatar: user?.avatar || '/images/nonuser.png',
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

    if (isSupabaseConfigured() && user?.id && isValidUUID(user.id) && isValidUUID(postId)) {
      const supabase = createClient()
      if (nextLiked) {
        await supabase.from('post_likes').insert({ post_id: postId, user_id: user.id })
      } else {
        await supabase.from('post_likes').delete().eq('post_id', postId).eq('user_id', user.id)
      }
    }
  }, [isLiked, likesCount, postId, storageLikeKey, user, postAuthor])

  // Handle Add Comment
  const handleAddComment = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      const trimmed = commentText.trim()
      if (!trimmed || isSubmitting) return

      setIsSubmitting(true)
      const currentUsername = user?.username || user?.name || 'you'
      const currentAvatar = resolveAvatar(currentUsername, user?.email, user?.avatar)

      const newComment: PostCommentItem = {
        id: `comment_${Date.now()}`,
        username: currentUsername,
        avatar: currentAvatar,
        text: trimmed,
        created_at: new Date().toISOString(),
      }

      const updatedComments = [...comments, newComment]
      setComments(updatedComments)
      setCommentText('')

      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem(storageCommentKey, JSON.stringify(updatedComments))

        // Update post comments count in global posts cache
        try {
          const postsRaw = localStorage.getItem('instagram_posts')
          if (postsRaw) {
            const list = JSON.parse(postsRaw)
            if (Array.isArray(list)) {
              const updated = list.map((p) =>
                String(p.id) === postId ? { ...p, comments: updatedComments.length } : p,
              )
              localStorage.setItem('instagram_posts', JSON.stringify(updated))
            }
          }
        } catch {}
      }

      // Trigger notification when commented (if not own post)
      if (postAuthor && postAuthor.toLowerCase() !== currentUsername.toLowerCase()) {
        if (isSupabaseConfigured() && user?.id && isValidUUID(user.id)) {
          try {
            const supabase = createClient()
            const { data: authorProf } = await supabase
              .from('profiles')
              .select('id')
              .eq('username', postAuthor)
              .maybeSingle()

            if (authorProf && isValidUUID(authorProf.id)) {
              await supabase.from('notifications').insert({
                recipient_id: authorProf.id,
                actor_id: user.id,
                type: 'comment',
                post_id: isValidUUID(postId) ? postId : null,
                comment_text: trimmed,
              })
            }
          } catch (e) {
            console.warn('Supabase post modal comment notification notice:', e)
          }
        } else if (typeof window !== 'undefined') {
          try {
            const notifKey = `instagram_notifications_${postAuthor}`
            const notifsRaw = localStorage.getItem(notifKey)
            const notifsList = notifsRaw ? JSON.parse(notifsRaw) : []
            notifsList.unshift({
              id: `notif_${Date.now()}`,
              actorId: user?.id || 'anon',
              actorUsername: currentUsername,
              actorAvatar: currentAvatar,
              actorFullName: user?.name || currentUsername,
              type: 'comment',
              read: false,
              createdAt: new Date().toISOString(),
              postId: postId,
              commentText: trimmed,
            })
            localStorage.setItem(notifKey, JSON.stringify(notifsList.slice(0, 50)))
          } catch {}
        }
      }

      // Save to Supabase if configured
      if (isSupabaseConfigured() && user?.id && isValidUUID(user.id) && isValidUUID(postId)) {
        try {
          const supabase = createClient()
          await supabase.from('post_comments').insert({
            post_id: postId,
            user_id: user.id,
            text: trimmed,
          })
        } catch (err) {
          console.error('Failed to post comment to Supabase:', err)
        }
      }

      setIsSubmitting(false)
    },
    [commentText, isSubmitting, user, comments, storageCommentKey, postId, postAuthor],
  )

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen || !post) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="post-modal-author"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-2 sm:p-6 md:p-10"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        aria-label="Close modal"
        className="absolute top-4 right-4 z-50 text-white hover:text-gray-300 transition cursor-pointer p-1"
      >
        <X size={28} />
      </button>

      {/* Modal Container */}
      <div
        className="bg-black border border-zinc-800 rounded-lg overflow-hidden max-w-5xl w-full max-h-[92vh] flex flex-col md:flex-row shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left: Media Container (Video or Image) */}
        <div className="relative flex-1 bg-zinc-950 flex items-center justify-center min-h-[300px] md:min-h-[500px] max-h-[55vh] md:max-h-[85vh]">
          {post.imageUrl &&
          (/\.(mp4|webm|mov|m4v)(\?.*)?$/i.test(post.imageUrl) ||
            post.imageUrl.startsWith('data:video/')) ? (
            <video
              src={post.imageUrl}
              autoPlay
              loop
              controls
              playsInline
              className="w-full h-full object-contain max-h-[85vh]"
            />
          ) : (
            <Image
              src={post.imageUrl}
              alt={post.caption || 'Post image'}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 60vw"
              priority
            />
          )}
        </div>

        {/* Right: Comments & Details */}
        <div className="w-full md:w-[420px] flex flex-col bg-black border-t md:border-t-0 md:border-l border-zinc-800 max-h-[50vh] md:max-h-[85vh]">
          {/* Post Header */}
          <div className="flex items-center justify-between p-3.5 border-b border-zinc-800">
            <Link
              href={`/profile/${postAuthor}`}
              onClick={onClose}
              className="flex items-center gap-3 hover:opacity-80 transition"
            >
              <div className="relative w-8 h-8 rounded-full overflow-hidden border border-zinc-800 bg-zinc-800">
                <Image
                  src={postAvatar}
                  alt={postAuthor}
                  width={32}
                  height={32}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex items-center gap-1">
                <span id="post-modal-author" className="text-sm font-semibold text-white">
                  {postAuthor}
                </span>
                {post.isVerified && (
                  <CheckCircle className="w-3.5 h-3.5 fill-blue-500 text-black flex-shrink-0" />
                )}
              </div>
            </Link>
            <button
              className="text-zinc-400 hover:text-white transition cursor-pointer p-1"
              aria-label="Post options"
            >
              <MoreHorizontal size={18} />
            </button>
          </div>

          {/* Caption & Comments List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Author Caption */}
            {post.caption && (
              <div className="flex items-start gap-3">
                <Link
                  href={`/profile/${postAuthor}`}
                  onClick={onClose}
                  className="relative w-8 h-8 rounded-full overflow-hidden border border-zinc-800 bg-zinc-800 flex-shrink-0"
                >
                  <Image
                    src={postAvatar}
                    alt={postAuthor}
                    width={32}
                    height={32}
                    className="w-full h-full object-cover"
                  />
                </Link>
                <div className="flex-1 text-sm">
                  <div className="text-white">
                    <Link
                      href={`/profile/${postAuthor}`}
                      onClick={onClose}
                      className="font-semibold mr-1.5 hover:underline"
                    >
                      {postAuthor}
                    </Link>
                    <span className="text-zinc-200">{post.caption}</span>
                  </div>
                  <div className="text-[11px] text-zinc-500 mt-1">
                    {formatRelativeTime(post.created_at || post.time, post.time || 'Vừa xong')}
                  </div>
                </div>
              </div>
            )}

            {/* Comments */}
            {comments.length > 0 ? (
              comments.map((comment) => (
                <div key={comment.id} className="flex items-start gap-3">
                  <Link
                    href={`/profile/${comment.username}`}
                    onClick={onClose}
                    className="relative w-8 h-8 rounded-full overflow-hidden border border-zinc-800 bg-zinc-800 flex-shrink-0"
                  >
                    <Image
                      src={resolveAvatar(comment.username, null, comment.avatar)}
                      alt={comment.username}
                      width={32}
                      height={32}
                      className="w-full h-full object-cover"
                    />
                  </Link>
                  <div className="flex-1 text-sm">
                    <div className="text-white">
                      <Link
                        href={`/profile/${comment.username}`}
                        onClick={onClose}
                        className="font-semibold mr-1.5 hover:underline"
                      >
                        {comment.username}
                      </Link>
                      <span className="text-zinc-200">{comment.text}</span>
                    </div>
                    <div className="text-[11px] text-zinc-500 mt-1">
                      {formatRelativeTime(comment.created_at)}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center">
                <p className="text-white font-semibold text-sm">No comments yet.</p>
                <p className="text-zinc-500 text-xs mt-1">Start the conversation.</p>
              </div>
            )}
          </div>

          {/* Action Bar (Likes, Comment, Share, Save) */}
          <div className="p-3.5 border-t border-zinc-800">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleToggleLike}
                  className="hover:opacity-70 transition cursor-pointer"
                  aria-label={isLiked ? 'Unlike post' : 'Like post'}
                >
                  <Heart
                    size={24}
                    className={
                      isLiked
                        ? 'fill-red-500 text-red-500 animate-pulse'
                        : 'text-white hover:text-zinc-400'
                    }
                  />
                </button>
                <button className="hover:opacity-70 transition cursor-pointer" aria-label="Comment">
                  <MessageCircle size={24} className="text-white" />
                </button>
                <button
                  className="hover:opacity-70 transition cursor-pointer"
                  aria-label="Share post"
                >
                  <Send size={24} className="text-white" />
                </button>
              </div>
              <button {...saveButtonProps} aria-label="Save post">
                <Bookmark size={24} className="text-white" fill={saveButtonProps.fill} />
              </button>
            </div>

            <div className="text-sm font-semibold text-white">
              {likesCount.toLocaleString()} {likesCount === 1 ? 'like' : 'likes'}
            </div>
            <div className="text-[10px] text-zinc-500 uppercase mt-1 tracking-wider">
              {post.time || 'Recently'}
            </div>
          </div>

          {/* Add Comment Input */}
          <form
            onSubmit={handleAddComment}
            className="flex items-center gap-2 px-3.5 py-3 border-t border-zinc-800 bg-black"
          >
            <button
              type="button"
              className="text-zinc-400 hover:text-white transition cursor-pointer p-1"
              aria-label="Add emoji"
            >
              <Smile size={22} />
            </button>
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 bg-transparent text-sm text-white placeholder-zinc-500 outline-none"
            />
            <button
              type="submit"
              disabled={!commentText.trim() || isSubmitting}
              className="text-sm font-semibold text-blue-500 hover:text-blue-400 disabled:opacity-40 transition cursor-pointer disabled:cursor-not-allowed"
            >
              Post
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
