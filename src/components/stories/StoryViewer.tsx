'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight, Pause, Play, Heart, CheckCircle } from 'lucide-react'
import type { IUserStories } from '@/types'
import { formatRelativeTime } from '@/utils/formatTime'
import { resolveAvatar } from '@/utils/avatar'

interface StoryViewerProps {
  isOpen: boolean
  userStoriesList: IUserStories[]
  initialUserIndex?: number
  onClose: () => void
  onStorySeen?: (userId: string, storyId: string) => void
}

const STORY_DURATION_MS = 5000 // 5 seconds per slide
const PROGRESS_STEP_MS = 50 // timer tick interval

export function StoryViewer({
  isOpen,
  userStoriesList,
  initialUserIndex = 0,
  onClose,
  onStorySeen,
}: StoryViewerProps) {
  const [currentUserIndex, setCurrentUserIndex] = useState(initialUserIndex)
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [likedStories, setLikedStories] = useState<Record<string, boolean>>({})
  const [showHeartBurst, setShowHeartBurst] = useState(false)
  const [replySentNotice, setReplySentNotice] = useState(false)

  // Hold down to pause
  const isHoldingRef = useRef(false)
  const holdTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Sync initial user index when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentUserIndex(Math.min(initialUserIndex, Math.max(0, userStoriesList.length - 1)))
      setCurrentStoryIndex(0)
      setProgress(0)
      setIsPaused(false)
    }
  }, [isOpen, initialUserIndex, userStoriesList.length])

  const currentUser = userStoriesList[currentUserIndex]
  const currentStory = currentUser?.stories[currentStoryIndex]

  // Mark story as seen
  useEffect(() => {
    if (!isOpen || !currentUser || !currentStory) return
    onStorySeen?.(currentUser.userId, currentStory.id)

    // Save to local storage
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('instagram_seen_stories')
        const set = new Set<string>(raw ? JSON.parse(raw) : [])
        set.add(currentStory.id)
        localStorage.setItem('instagram_seen_stories', JSON.stringify(Array.from(set)))
        window.dispatchEvent(new CustomEvent('instagram:story_seen'))
      } catch {}
    }
  }, [isOpen, currentUser, currentStory, onStorySeen])

  // Move to next story slide or next user
  const handleNext = useCallback(() => {
    if (!currentUser) return

    if (currentStoryIndex < currentUser.stories.length - 1) {
      setCurrentStoryIndex((prev) => prev + 1)
      setProgress(0)
    } else if (currentUserIndex < userStoriesList.length - 1) {
      setCurrentUserIndex((prev) => prev + 1)
      setCurrentStoryIndex(0)
      setProgress(0)
    } else {
      onClose()
    }
  }, [currentUser, currentStoryIndex, currentUserIndex, userStoriesList.length, onClose])

  // Move to previous story slide or previous user
  const handlePrev = useCallback(() => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex((prev) => prev - 1)
      setProgress(0)
    } else if (currentUserIndex > 0) {
      const prevUser = userStoriesList[currentUserIndex - 1]
      setCurrentUserIndex((prev) => prev - 1)
      setCurrentStoryIndex(Math.max(0, prevUser.stories.length - 1))
      setProgress(0)
    }
  }, [currentStoryIndex, currentUserIndex, userStoriesList])

  // Progress Bar timer
  useEffect(() => {
    if (!isOpen || isPaused || !currentStory) return

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + (PROGRESS_STEP_MS / STORY_DURATION_MS) * 100
        if (next >= 100) {
          handleNext()
          return 0
        }
        return next
      })
    }, PROGRESS_STEP_MS)

    return () => clearInterval(timer)
  }, [isOpen, isPaused, currentStory, handleNext])

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'ArrowRight') {
        handleNext()
      } else if (e.key === 'ArrowLeft') {
        handlePrev()
      } else if (e.key === ' ' || e.code === 'Space') {
        // Toggle pause with Space
        e.preventDefault()
        setIsPaused((p) => !p)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose, handleNext, handlePrev])

  // Handle pointer down (press and hold to pause)
  const handlePointerDown = () => {
    holdTimeoutRef.current = setTimeout(() => {
      isHoldingRef.current = true
      setIsPaused(true)
    }, 200)
  }

  // Handle pointer up (release)
  const handlePointerUp = (e: React.MouseEvent<HTMLDivElement>) => {
    if (holdTimeoutRef.current) {
      clearTimeout(holdTimeoutRef.current)
    }

    if (isHoldingRef.current) {
      isHoldingRef.current = false
      setIsPaused(false)
      return
    }

    // Determine click position on left or right half of the media
    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const width = rect.width

    if (clickX < width * 0.35) {
      handlePrev()
    } else {
      handleNext()
    }
  }

  // Toggle like story
  const handleToggleLike = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!currentStory) return
    const nextState = !likedStories[currentStory.id]
    setLikedStories((prev) => ({ ...prev, [currentStory.id]: nextState }))

    if (nextState) {
      setShowHeartBurst(true)
      setTimeout(() => setShowHeartBurst(false), 900)
    }
  }

  // Handle sending reply
  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault()
    if (!replyText.trim() || !currentUser) return
    setReplyText('')
    setReplySentNotice(true)
    setTimeout(() => setReplySentNotice(false), 2000)
  }

  if (!isOpen || !currentUser || !currentStory) return null

  const isCurrentStoryLiked = Boolean(likedStories[currentStory.id])

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center select-none overflow-hidden animate-in fade-in duration-200">
      {/* Instagram Header Logo on Desktop */}
      <div className="hidden lg:block absolute top-6 left-8 text-white font-instagram text-3xl opacity-90 cursor-default">
        Instagram
      </div>

      {/* Close button on Top-Right */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 lg:top-6 lg:right-8 z-50 p-2 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition cursor-pointer"
        aria-label="Đóng story"
        title="Đóng (Esc)"
      >
        <X size={28} />
      </button>

      {/* Navigation Arrow Left (Desktop) */}
      {!(currentUserIndex === 0 && currentStoryIndex === 0) && (
        <button
          onClick={handlePrev}
          className="hidden md:flex absolute left-4 lg:left-12 z-40 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition backdrop-blur-sm cursor-pointer shadow-lg items-center justify-center"
          title="Tin trước đó (Mũi tên trái)"
        >
          <ChevronLeft size={28} />
        </button>
      )}

      {/* Main Story Container (9:16 Aspect Ratio) */}
      <div className="relative w-full h-full md:w-[420px] md:h-[92vh] md:max-h-[820px] md:rounded-2xl overflow-hidden bg-zinc-950 flex flex-col justify-between shadow-2xl border md:border-neutral-800">
        {/* TOP: Segmented Progress Bars & Author Header */}
        <div className="absolute top-0 left-0 right-0 z-30 p-3.5 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
          {/* Segmented Progress Bars */}
          <div className="flex items-center gap-1.5 w-full mb-3">
            {currentUser.stories.map((s, idx) => {
              let fillPercent = 0
              if (idx < currentStoryIndex) {
                fillPercent = 100
              } else if (idx === currentStoryIndex) {
                fillPercent = progress
              }

              return (
                <div
                  key={s.id || idx}
                  className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden"
                >
                  <div
                    className="h-full bg-white rounded-full transition-all duration-75"
                    style={{ width: `${fillPercent}%` }}
                  />
                </div>
              )
            })}
          </div>

          {/* User Info & Controls Row */}
          <div className="flex items-center justify-between">
            {/* Author info */}
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative w-9 h-9 rounded-full overflow-hidden ring-1.5 ring-white/70 flex-shrink-0">
                <Image
                  src={resolveAvatar(currentUser.username, null, currentUser.avatarUrl)}
                  alt={currentUser.username}
                  width={36}
                  height={36}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex items-center gap-1.5 truncate">
                <span className="text-white text-sm font-semibold truncate hover:underline cursor-pointer">
                  {currentUser.username}
                </span>
                {currentUser.isVerified && (
                  <CheckCircle className="w-3.5 h-3.5 fill-blue-500 text-black flex-shrink-0" />
                )}
                <span className="text-white/60 text-xs font-normal">
                  • {formatRelativeTime(currentStory.createdAt)}
                </span>
              </div>
            </div>

            {/* Play/Pause & Close */}
            <div className="flex items-center gap-1 text-white">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setIsPaused((p) => !p)
                }}
                className="p-1.5 rounded-full hover:bg-white/10 transition cursor-pointer text-white/90 hover:text-white"
                title={isPaused ? 'Tiếp tục phát' : 'Tạm dừng'}
              >
                {isPaused ? <Play size={20} /> : <Pause size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* MIDDLE: Media Area with Left/Right Click Zones */}
        <div
          onMouseDown={handlePointerDown}
          onMouseUp={handlePointerUp}
          onTouchStart={handlePointerDown}
          onTouchEnd={handlePointerUp as unknown as React.TouchEventHandler<HTMLDivElement>}
          className="relative flex-1 w-full h-full bg-black flex items-center justify-center cursor-pointer select-none"
        >
          {/* Story Image / Video */}
          {currentStory.mediaType === 'video' ? (
            <video
              src={currentStory.mediaUrl}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <Image
              src={currentStory.mediaUrl}
              alt={currentStory.caption || 'Story'}
              fill
              sizes="(max-width: 768px) 100vw, 420px"
              className="object-cover"
              priority
            />
          )}

          {/* Floating Heart Burst Animation */}
          {showHeartBurst && (
            <div className="absolute inset-0 flex items-center justify-center z-40 pointer-events-none">
              <Heart
                size={96}
                className="text-red-500 fill-red-500 animate-heart-burst drop-shadow-2xl"
              />
            </div>
          )}

          {/* Caption sticker on bottom of media */}
          {currentStory.caption && (
            <div className="absolute bottom-20 left-4 right-4 z-20 pointer-events-none">
              <div className="inline-block bg-black/60 backdrop-blur-md text-white text-sm font-medium px-4 py-2 rounded-2xl shadow-lg border border-white/10 max-w-full">
                {currentStory.caption}
              </div>
            </div>
          )}
        </div>

        {/* BOTTOM: Reply Input & Like Story Button */}
        <div className="absolute bottom-0 left-0 right-0 z-30 p-3.5 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-center gap-3">
          <form onSubmit={handleSendReply} className="flex-1 relative flex items-center">
            <input
              type="text"
              placeholder={`Gửi tin nhắn cho ${currentUser.username}...`}
              value={replyText}
              onFocus={() => setIsPaused(true)}
              onBlur={() => setIsPaused(false)}
              onChange={(e) => setReplyText(e.target.value)}
              className="w-full bg-transparent border border-white/40 focus:border-white rounded-full py-2.5 pl-4 pr-10 text-sm text-white placeholder-white/60 focus:outline-none transition"
            />
            {replyText.trim() && (
              <button
                type="submit"
                className="absolute right-3 text-blue-400 hover:text-blue-300 font-semibold text-xs transition cursor-pointer"
              >
                Gửi
              </button>
            )}
          </form>

          {/* Like story button */}
          <button
            onClick={handleToggleLike}
            className={`p-2.5 rounded-full transition-transform active:scale-125 cursor-pointer ${
              isCurrentStoryLiked ? 'text-red-500' : 'text-white hover:text-white/80'
            }`}
            title={isCurrentStoryLiked ? 'Bỏ thích tin' : 'Thích tin'}
          >
            <Heart
              size={26}
              className={`transition-colors ${
                isCurrentStoryLiked ? 'fill-red-500 text-red-500' : 'text-white'
              }`}
            />
          </button>
        </div>

        {/* Toast Notification when reply is sent */}
        {replySentNotice && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-black/80 backdrop-blur-md border border-white/20 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-2xl animate-in fade-in zoom-in duration-150">
            ✓ Đã gửi tin nhắn
          </div>
        )}
      </div>

      {/* Navigation Arrow Right (Desktop) */}
      {!(
        currentUserIndex === userStoriesList.length - 1 &&
        currentStoryIndex === currentUser.stories.length - 1
      ) && (
        <button
          onClick={handleNext}
          className="hidden md:flex absolute right-4 lg:right-12 z-40 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition backdrop-blur-sm cursor-pointer shadow-lg items-center justify-center"
          title="Tin tiếp theo (Mũi tên phải)"
        >
          <ChevronRight size={28} />
        </button>
      )}
    </div>
  )
}
