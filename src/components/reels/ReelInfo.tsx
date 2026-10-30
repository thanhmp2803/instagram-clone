'use client'

import { useState } from 'react'
import type { MouseEvent } from 'react'
import Image from 'next/image'
import { Music, CheckCircle } from 'lucide-react'
import type { IReelInfoProps } from '@types'

export function ReelInfo({
  author,
  caption,
  audio,
  isFollowing = false,
  onToggleFollow,
}: IReelInfoProps) {
  const [isExpanded, setIsExpanded] = useState<boolean>(false)
  const [followingState, setFollowingState] = useState<boolean>(isFollowing)

  const handleFollowClick = (e: MouseEvent) => {
    e.stopPropagation()
    setFollowingState((prev) => !prev)
    onToggleFollow?.()
  }

  // Parse caption to highlight tags and mentions with light blue / bold styling
  const renderFormattedCaption = (text: string) => {
    const parts = text.split(/(\s+)/)
    return parts.map((part, i) => {
      if (part.startsWith('#') || part.startsWith('@')) {
        return (
          <span key={i} className="text-blue-300 font-medium hover:underline cursor-pointer">
            {part}
          </span>
        )
      }
      return <span key={i}>{part}</span>
    })
  }

  return (
    <div className="absolute left-3.5 sm:left-4 bottom-5 sm:bottom-6 right-16 sm:right-20 z-20 text-white select-none pointer-events-auto">
      {/* Author Header */}
      <div className="flex items-center gap-2.5 mb-2.5">
        <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden border border-white/60 flex-shrink-0 cursor-pointer">
          <Image
            src={author.avatar}
            alt={author.username}
            width={36}
            height={36}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-semibold text-sm hover:underline cursor-pointer drop-shadow-md">
            {author.username}
          </span>
          {author.isVerified && (
            <CheckCircle className="w-3.5 h-3.5 fill-blue-500 text-black drop-shadow" />
          )}
        </div>

        <span className="text-white/60 text-xs">•</span>

        <button
          onClick={handleFollowClick}
          className={`text-xs font-semibold px-2.5 py-1 rounded-md border transition-all cursor-pointer backdrop-blur-sm ${
            followingState
              ? 'border-white/30 text-white/80 hover:bg-white/10'
              : 'border-white text-white hover:bg-white/20'
          }`}
        >
          {followingState ? 'Following' : 'Follow'}
        </button>
      </div>

      {/* Caption & Description */}
      <div className="mb-2.5 text-xs sm:text-sm drop-shadow-md max-w-full">
        <div
          onClick={(e) => {
            e.stopPropagation()
            setIsExpanded((prev) => !prev)
          }}
          className={`cursor-pointer leading-relaxed text-neutral-100 ${
            !isExpanded ? 'line-clamp-2' : ''
          }`}
        >
          {renderFormattedCaption(caption)}
        </div>
        {caption.length > 70 && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              setIsExpanded((prev) => !prev)
            }}
            className="text-neutral-400 font-semibold text-xs mt-0.5 hover:text-white cursor-pointer"
          >
            {isExpanded ? ' less' : ' ...more'}
          </button>
        )}
      </div>

      {/* Audio Info Row */}
      <div className="flex items-center gap-2 text-xs text-white/90 drop-shadow cursor-pointer hover:text-white">
        <Music className="w-3.5 h-3.5 flex-shrink-0" />
        <div className="overflow-hidden whitespace-nowrap max-w-[220px] sm:max-w-[280px]">
          <span className="inline-block truncate">
            {audio.title} {audio.artist && `• ${audio.artist}`}
          </span>
        </div>
      </div>
    </div>
  )
}
