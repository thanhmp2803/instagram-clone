'use client'

import { useState, useCallback } from 'react'
import { Heart } from 'lucide-react'
import { VideoPlayer } from './VideoPlayer'
import { ReelSidebar } from './ReelSidebar'
import { ReelInfo } from './ReelInfo'
import type { IReelItemProps } from '@types'

export function ReelItem({ reel, isActive, isGlobalMuted, onToggleGlobalMute }: IReelItemProps) {
  const [isLiked, setIsLiked] = useState<boolean>(reel.isLiked ?? false)
  const [likesCount, setLikesCount] = useState<number>(reel.likesCount)
  const [isSaved, setIsSaved] = useState<boolean>(reel.isSaved ?? false)
  const [showHeartBurst, setShowHeartBurst] = useState<boolean>(false)

  // Toggle like action
  const handleToggleLike = useCallback(() => {
    setIsLiked((prev) => {
      const nextState = !prev
      setLikesCount((count) => (nextState ? count + 1 : count - 1))
      return nextState
    })
  }, [])

  // Double tap triggers like with burst animation
  const handleDoubleTap = useCallback(() => {
    if (!isLiked) {
      setIsLiked(true)
      setLikesCount((count) => count + 1)
    }
    setShowHeartBurst(true)
    setTimeout(() => setShowHeartBurst(false), 900)
  }, [isLiked])

  // Toggle save action
  const handleToggleSave = useCallback(() => {
    setIsSaved((prev) => !prev)
  }, [])

  return (
    <section className="snap-start snap-always w-full h-full flex items-center justify-center relative py-2 sm:py-4 px-2 select-none">
      {/* 9:16 Aspect Ratio Reels Video Container */}
      <div className="relative w-full max-w-[420px] sm:max-w-[440px] h-[calc(100vh-2rem)] sm:h-[calc(100vh-3.5rem)] max-h-[840px] rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-800 shadow-2xl flex items-center justify-center">
        {/* Isolated Video Player */}
        <VideoPlayer
          src={reel.videoUrl}
          poster={reel.thumbnailUrl}
          isMuted={isGlobalMuted}
          onToggleMute={onToggleGlobalMute}
          isActive={isActive}
          reelId={reel.id}
          onDoubleTap={handleDoubleTap}
        />

        {/* Double-tap Heart Burst Animation */}
        {showHeartBurst && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
            <Heart className="w-24 h-24 fill-red-500 text-red-500 drop-shadow-2xl animate-heart-burst" />
          </div>
        )}

        {/* Dark Gradient Overlay for text readability */}
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none z-10" />

        {/* Top subtle gradient for sound icon contrast */}
        <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/60 to-transparent pointer-events-none z-10" />

        {/* Bottom-left: Author, Caption & Audio details */}
        <ReelInfo
          author={reel.author}
          caption={reel.caption}
          audio={reel.audio}
          isFollowing={reel.author.isFollowing}
        />

        {/* Bottom-right: Interactive Action Sidebar */}
        <ReelSidebar
          reel={reel}
          isLiked={isLiked}
          likesCount={likesCount}
          isSaved={isSaved}
          onToggleLike={handleToggleLike}
          onToggleSave={handleToggleSave}
        />
      </div>
    </section>
  )
}
