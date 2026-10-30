'use client'

import Image from 'next/image'
import { Heart, MessageCircle, Send, MoreHorizontal, Bookmark, Smile } from 'lucide-react'
import { useLike, useSave, useAuth } from '@hooks'
import { createMoreMenuItems } from '@mocks'
import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import type { Post } from '@types'
import { createClient, isSupabaseConfigured } from '@/utils/supabase/client'
import { formatRelativeTime } from '@/utils/formatTime'
import { resolveAvatar } from '@/utils/avatar'
import { PostModal, type PostModalData } from './post/PostModal'

interface Props {
  post: Post
}

const isValidUUID = (str?: string | null): boolean =>
  Boolean(str && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str))

function PostCardContent({ post }: Props) {
  const { t } = useTranslation()
  const router = useRouter()
  const { user } = useAuth()

  const { likesCount, likeButtonProps } = useLike({
    postId: post.id,
    initialLikes: post.likes,
    authorUsername: post.username,
    authorId: post.userId,
  })
  const { saveButtonProps } = useSave()

  const [comment, setComment] = useState('')
  const [commentsCount, setCommentsCount] = useState(post.comments)
  const [showMoreMenu, setShowMoreMenu] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const iconClassName = 'cursor-pointer hover:text-gray-400 transition-colors'
  const moreMenuItems = createMoreMenuItems(t)

  const handleCommentSubmit = useCallback(async () => {
    const trimmed = comment.trim()
    if (!trimmed) return

    const currentUsername = user?.username || user?.name || 'you'
    const currentAvatar = resolveAvatar(currentUsername, user?.email, user?.avatar)
    const newCount = commentsCount + 1

    setCommentsCount(newCount)
    setComment('')

    // 1. Store comment in localStorage
    if (typeof window !== 'undefined') {
      try {
        const commentKey = `post_comments_${post.id}`
        const existing = localStorage.getItem(commentKey)
        const commentsList = existing ? JSON.parse(existing) : []
        commentsList.push({
          id: `comment_${Date.now()}`,
          username: currentUsername,
          avatar: currentAvatar,
          text: trimmed,
          created_at: new Date().toISOString(),
        })
        localStorage.setItem(commentKey, JSON.stringify(commentsList))

        // Update posts cache in localStorage
        const postsRaw = localStorage.getItem('instagram_posts')
        if (postsRaw) {
          const list = JSON.parse(postsRaw)
          if (Array.isArray(list)) {
            const updated = list.map((p) =>
              String(p.id) === String(post.id) ? { ...p, comments: newCount } : p,
            )
            localStorage.setItem('instagram_posts', JSON.stringify(updated))
          }
        }
      } catch {}
    }

    // 2. Dispatch notification to post author if not commenting on own post
    const targetAuthor = post.username
    if (targetAuthor && targetAuthor.toLowerCase() !== currentUsername.toLowerCase()) {
      if (isSupabaseConfigured() && user?.id && isValidUUID(user.id)) {
        try {
          const supabase = createClient()
          let recipientId = post.userId
          if (!recipientId || !isValidUUID(recipientId)) {
            const { data: authorProf } = await supabase
              .from('profiles')
              .select('id')
              .eq('username', targetAuthor)
              .maybeSingle()
            if (authorProf) recipientId = authorProf.id
          }

          if (recipientId && isValidUUID(recipientId)) {
            await supabase.from('notifications').insert({
              recipient_id: recipientId,
              actor_id: user.id,
              type: 'comment',
              post_id: isValidUUID(String(post.id)) ? String(post.id) : null,
              comment_text: trimmed,
            })
          }
        } catch (e) {
          console.warn('Supabase post comment notification notice:', e)
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
            actorAvatar: currentAvatar,
            actorFullName: user?.name || currentUsername,
            type: 'comment',
            read: false,
            createdAt: new Date().toISOString(),
            postId: post.id,
            commentText: trimmed,
          })
          localStorage.setItem(notifKey, JSON.stringify(notifsList.slice(0, 50)))
        } catch {}
      }
    }

    // 3. Supabase insert into post_comments
    if (
      isSupabaseConfigured() &&
      user?.id &&
      isValidUUID(user.id) &&
      isValidUUID(String(post.id))
    ) {
      try {
        const supabase = createClient()
        await supabase.from('post_comments').insert({
          post_id: String(post.id),
          user_id: user.id,
          text: trimmed,
        })
      } catch (err) {
        console.warn('Failed to insert post comment to Supabase:', err)
      }
    }
  }, [comment, commentsCount, user, post.id, post.username, post.userId])

  const handleMoreClick = () => {
    setShowMoreMenu(true)
  }

  const handleCloseMenu = () => {
    setShowMoreMenu(false)
  }

  const displayTime = formatRelativeTime(post.created_at || post.time, post.time)

  const modalPostData: PostModalData = {
    id: post.id,
    imageUrl: post.image,
    caption: post.caption,
    username: post.username,
    avatar: post.avatar,
    likes: likesCount,
    comments: commentsCount,
    time: displayTime,
  }

  return (
    <>
      <div className="bg-black text-white border border-gray-800 rounded-lg w-full max-w-[468px] mx-auto px-2 sm:px-0">
        {/* Header */}
        <div className="flex items-center justify-between p-2 sm:p-3">
          <div
            className="flex items-center cursor-pointer hover:opacity-80 transition"
            onClick={() => router.push(`/profile/${post.username}`)}
          >
            <Image
              src={resolveAvatar(post.username, null, post.avatar)}
              alt={post.username}
              width={32}
              height={32}
              className="w-8 h-8 rounded-full object-cover aspect-square"
            />
            <div className="ml-3">
              <span className="font-semibold">{post.username}</span>
              <span className="text-gray-400 ml-1">•</span>
              <span className="text-gray-400 ml-1 text-sm">{displayTime}</span>
            </div>
          </div>
          <button
            className="p-1 rounded-full cursor-pointer"
            onClick={handleMoreClick}
            aria-label="More options"
          >
            <MoreHorizontal size={16} />
          </button>
        </div>

        {/* More Menu Modal */}
        {showMoreMenu && (
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-[2px] flex items-center justify-center z-50"
            onClick={handleCloseMenu}
          >
            <div
              className="bg-neutral-800 rounded-lg w-80 max-w-sm"
              onClick={(e) => e.stopPropagation()}
            >
              {moreMenuItems.map((item, index) => (
                <div key={index}>
                  <button
                    className={`w-full px-4 py-3 text-center ${item.color} cursor-pointer text-sm font-normal border-none bg-transparent`}
                    onClick={item.text === 'Cancel' ? handleCloseMenu : undefined}
                  >
                    {item.text}
                  </button>
                  {index < moreMenuItems.length - 1 && (
                    <div className="border-b border-neutral-600"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Post Media (Video or Image) */}
        <div
          className="relative w-full cursor-pointer bg-black flex items-center justify-center overflow-hidden"
          onClick={() => setIsModalOpen(true)}
        >
          {post.image &&
          (/\.(mp4|webm|mov|m4v)(\?.*)?$/i.test(post.image) ||
            post.image.startsWith('data:video/')) ? (
            <video
              src={post.image}
              autoPlay
              loop
              muted
              playsInline
              className="object-cover w-full h-auto sm:min-h-[400px] md:min-h-[585px]"
            />
          ) : (
            <Image
              src={post.image}
              alt="Post"
              width={468}
              height={585}
              className="object-cover w-full h-auto sm:min-h-[400px] md:min-h-[585px]"
              loading="lazy"
            />
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between px-2 sm:px-3 py-2">
          <div className="flex space-x-2 sm:space-x-3 items-center">
            <Heart {...likeButtonProps} />
            <button
              onClick={() => setIsModalOpen(true)}
              className={iconClassName}
              aria-label="View comments"
            >
              <MessageCircle size={24} />
            </button>
            <button
              onClick={() => router.push('/messages')}
              className={iconClassName}
              aria-label="Send message"
            >
              <Send size={24} />
            </button>
          </div>
          <Bookmark {...saveButtonProps} />
        </div>

        {/* Likes + Caption */}
        <div className="px-2 sm:px-3 pb-2 sm:pb-3">
          <p className="font-semibold">
            {likesCount} {t('feed.post.likes')}
          </p>
          <p>
            <span
              className="font-semibold mr-2 cursor-pointer hover:underline"
              onClick={() => router.push(`/profile/${post.username}`)}
            >
              {post.username}
            </span>
            {post.caption}
          </p>
          <p
            className="text-gray-400 text-sm cursor-pointer mt-1 hover:underline"
            onClick={() => setIsModalOpen(true)}
          >
            {t('feed.post.view', { count: commentsCount })}
          </p>

          {/* Add Comment Input */}
          <div className="mt-2">
            <div className="flex items-center space-x-3">
              <div className="flex-1 relative">
                <input
                  id={`comment-${post.id}`}
                  type="text"
                  placeholder={t('feed.post.add_comment')}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleCommentSubmit()}
                  className="w-full bg-transparent text-sm text-white placeholder-gray-400 border-none outline-none"
                />
              </div>
              {comment.trim() && (
                <button
                  onClick={handleCommentSubmit}
                  className="text-white hover:underline text-sm font-semibold transition-colors cursor-pointer"
                >
                  {t('feed.post.post_button')}
                </button>
              )}
              <button
                className="text-gray-400 hover:text-gray-300 transition-colors cursor-pointer"
                aria-label="Add emoji"
              >
                <Smile size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Post Modal for viewing comments and details */}
      <PostModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} post={modalPostData} />
    </>
  )
}

// Export dynamic component to avoid hydration mismatch
export const PostCard = dynamic(() => Promise.resolve(PostCardContent), {
  ssr: false,
})
