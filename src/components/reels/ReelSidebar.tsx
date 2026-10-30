'use client'

import { useState } from 'react'
import type { MouseEvent } from 'react'
import Image from 'next/image'
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Music } from 'lucide-react'
import type { IReelSidebarProps } from '@types'

// Format counts nicely (e.g. 124.3K, 1.2M)
function formatCount(num: number): string {
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M'
  }
  if (num >= 10_000) {
    return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'K'
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'K'
  }
  return num.toString()
}

export function ReelSidebar({
  reel,
  isLiked,
  likesCount,
  isSaved,
  onToggleLike,
  onToggleSave,
  onOpenComments,
  onShare,
}: IReelSidebarProps) {
  const [copiedToast, setCopiedToast] = useState(false)

  const handleShareClick = (e: MouseEvent) => {
    e.stopPropagation()
    if (onShare) {
      onShare()
    } else {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        navigator.clipboard.writeText(window.location.href)
        setCopiedToast(true)
        setTimeout(() => setCopiedToast(false), 2000)
      }
    }
  }

  const handleCommentClick = (e: MouseEvent) => {
    e.stopPropagation()
    if (onOpenComments) {
      onOpenComments()
    }
  }

  return (
    <aside className="absolute right-2.5 sm:right-3.5 bottom-6 z-20 flex flex-col items-center gap-5 select-none pointer-events-auto">
      {/* Toast when link is copied */}
      {copiedToast && (
        <div className="absolute right-12 top-24 whitespace-nowrap bg-zinc-800 text-white text-xs px-3 py-1.5 rounded-md shadow-lg border border-zinc-700 animate-fade-in pointer-events-none">
          Link copied to clipboard!
        </div>
      )}

      {/* Like Button */}
      <div className="flex flex-col items-center">
        <button
          onClick={(e) => {
            e.stopPropagation()
            onToggleLike()
          }}
          aria-label={isLiked ? 'Unlike reel' : 'Like reel'}
          className="group p-1.5 transition-transform active:scale-75 focus:outline-none cursor-pointer"
        >
          <Heart
            className={`w-7 h-7 sm:w-8 sm:h-8 transition-colors duration-200 drop-shadow-md ${
              isLiked
                ? 'fill-red-500 text-red-500 scale-105'
                : 'text-white hover:text-gray-300 stroke-[2]'
            }`}
          />
        </button>
        <span className="text-white text-xs font-semibold drop-shadow mt-0.5">
          {formatCount(likesCount)}
        </span>
      </div>

      {/* Comment Button */}
      <div className="flex flex-col items-center">
        <button
          onClick={handleCommentClick}
          aria-label="View comments"
          className="p-1.5 transition-transform active:scale-75 hover:opacity-80 focus:outline-none cursor-pointer"
        >
          <MessageCircle className="w-7 h-7 sm:w-8 sm:h-8 text-white stroke-[2] drop-shadow-md -scale-x-100" />
        </button>
        <span className="text-white text-xs font-semibold drop-shadow mt-0.5">
          {formatCount(reel.commentsCount)}
        </span>
      </div>

      {/* Share / Direct Button */}
      <div className="flex flex-col items-center">
        <button
          onClick={handleShareClick}
          aria-label="Share reel"
          className="p-1.5 transition-transform active:scale-75 hover:opacity-80 focus:outline-none cursor-pointer"
        >
          <Send className="w-7 h-7 sm:w-8 sm:h-8 text-white stroke-[2] drop-shadow-md -rotate-12 -translate-y-0.5" />
        </button>
        <span className="text-white text-xs font-semibold drop-shadow mt-0.5">
          {formatCount(reel.sharesCount)}
        </span>
      </div>

      {/* Save / Bookmark Button */}
      <div className="flex flex-col items-center">
        <button
          onClick={(e) => {
            e.stopPropagation()
            onToggleSave()
          }}
          aria-label={isSaved ? 'Unsave reel' : 'Save reel'}
          className="p-1.5 transition-transform active:scale-75 focus:outline-none cursor-pointer"
        >
          <Bookmark
            className={`w-7 h-7 sm:w-8 sm:h-8 transition-colors duration-200 drop-shadow-md ${
              isSaved ? 'fill-white text-white' : 'text-white hover:text-gray-300 stroke-[2]'
            }`}
          />
        </button>
      </div>

      {/* More Options */}
      <div className="flex flex-col items-center">
        <button
          onClick={(e) => e.stopPropagation()}
          aria-label="More options"
          className="p-1.5 transition-transform active:scale-75 hover:opacity-80 focus:outline-none cursor-pointer"
        >
          <MoreHorizontal className="w-6 h-6 text-white stroke-[2.5] drop-shadow-md" />
        </button>
      </div>

      {/* Audio Cover Album Art (Spinning Vinyl) */}
      <div className="relative mt-2">
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-zinc-900 border-2 border-white/90 overflow-hidden flex items-center justify-center animate-spin-slow shadow-lg">
          {reel.audio.coverUrl ? (
            <Image
              src={reel.audio.coverUrl}
              alt={reel.audio.title}
              width={36}
              height={36}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center">
              <Music className="w-4 h-4 text-white" />
            </div>
          )}
        </div>
        {/* Tiny music note badge */}
        <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-black/80 flex items-center justify-center">
          <Music className="w-2.5 h-2.5 text-white animate-bounce" />
        </div>
      </div>
    </aside>
  )
}
