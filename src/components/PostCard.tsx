'use client'

import Image from 'next/image'
import { Heart, MessageCircle, Send, MoreHorizontal, Bookmark, Smile } from 'lucide-react'
import { useLike, useSave } from '@hooks'
import { createMoreMenuItems } from '@mocks'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import dynamic from 'next/dynamic'
import type { Post } from '@types'

interface Props {
  post: Post
}

function PostCardContent({ post }: Props) {
  const { t } = useTranslation()
  const { likesCount, likeButtonProps } = useLike(post.likes)
  const { saveButtonProps } = useSave()
  const [comment, setComment] = useState('')
  const [commentsCount, setCommentsCount] = useState(post.comments)
  const [showMoreMenu, setShowMoreMenu] = useState(false)

  const iconClassName = 'cursor-pointer hover:text-gray-400 transition-colors'
  const otherActions = [MessageCircle, Send]
  const moreMenuItems = createMoreMenuItems(t)

  const handleCommentSubmit = () => {
    if (comment.trim()) {
      // Handle comment submission
      console.log('Submitting comment:', comment)
      setCommentsCount((prev) => prev + 1)
      setComment('')
    }
  }

  const handleMoreClick = () => {
    setShowMoreMenu(true)
  }

  const handleCloseMenu = () => {
    setShowMoreMenu(false)
  }

  return (
    <div className="bg-black text-white border border-gray-800 rounded-lg w-full max-w-[468px] mx-auto px-2 sm:px-0">
      {/* Header */}
      <div className="flex items-center justify-between p-2 sm:p-3">
        <div className="flex items-center">
          <Image
            src={post.avatar}
            alt={post.username}
            width={32}
            height={32}
            className="w-8 h-8 rounded-full cursor-pointer object-cover aspect-square"
          />
          <div className="ml-3">
            <span className="font-semibold cursor-pointer">{post.username}</span>
            <span className="text-gray-400 ml-1">•</span>
            <span className="text-gray-400 ml-1 text-sm cursor-pointer">{post.time}</span>
          </div>
        </div>
        <button className="p-1 rounded-full" onClick={handleMoreClick}>
          <MoreHorizontal size={16} className="cursor-pointer" />
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

      {/* Post Image */}
      <div className="relative w-full">
        <Image
          src={post.image}
          alt="Post"
          width={468}
          height={585}
          className="object-cover w-full h-auto sm:min-h-[400px] md:min-h-[585px]"
          loading="lazy"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between px-2 sm:px-3 py-2">
        <div className="flex space-x-2 sm:space-x-3">
          <Heart {...likeButtonProps} />
          {otherActions.map((Icon, index) => (
            <Icon key={index} className={iconClassName} />
          ))}
        </div>
        <Bookmark {...saveButtonProps} />
      </div>

      {/* Likes + Caption */}
      <div className="px-2 sm:px-3 pb-2 sm:pb-3">
        <p className="font-semibold">
          {likesCount} {t('feed.post.likes')}
        </p>
        <p>
          <span className="font-semibold mr-2">{post.username}</span>
          {post.caption}
        </p>
        <p className="text-gray-400 text-sm cursor-pointer mt-1">
          {t('feed.post.view', { count: commentsCount })}
        </p>

        {/* Add Comment Input */}
        <div className="">
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
                className="text-white hover:underline text-sm font-semibold transition-colors"
              >
                {t('feed.post.post_button')}
              </button>
            )}
            <button className="text-gray-400 hover:text-gray-300 transition-colors">
              <Smile size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Export dynamic component để tránh hydration mismatch
export const PostCard = dynamic(() => Promise.resolve(PostCardContent), {
  ssr: false,
})
