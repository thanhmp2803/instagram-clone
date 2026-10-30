'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import type { MouseEvent } from 'react'
import { Play, Pause, Volume2, VolumeX, Loader2 } from 'lucide-react'
import type { IVideoPlayerProps } from '@types'

export function VideoPlayer({
  src,
  poster,
  isMuted,
  onToggleMute,
  isActive,
  onDoubleTap,
}: IVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const progressBarRef = useRef<HTMLDivElement | null>(null)
  const clickTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [hasError, setHasError] = useState<boolean>(false)
  const [progress, setProgress] = useState<number>(0)
  const [feedbackAction, setFeedbackAction] = useState<'play' | 'pause' | null>(null)
  const [showMuteBadge, setShowMuteBadge] = useState<boolean>(false)

  // Sync muted state directly to video DOM element
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted
    }
  }, [isMuted])

  // Primary playback control based on parent isActive prop (single source of truth)
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    if (isActive) {
      video.muted = isMuted
      const playPromise = video.play()
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true)
            setIsLoading(false)
            setHasError(false)
          })
          .catch(() => {
            // Browser autoplay policy requires user gesture or muted=true
            video.muted = true
            video
              .play()
              .then(() => {
                setIsPlaying(true)
                setIsLoading(false)
                setHasError(false)
              })
              .catch(() => {
                setIsPlaying(false)
                setIsLoading(false)
              })
          })
      }
    } else {
      video.pause()
      video.currentTime = 0
      setIsPlaying(false)
    }
  }, [isActive, isMuted, src])

  // Track playback time update for progress bar
  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current
    if (!video || !video.duration) return
    const currentProgress = (video.currentTime / video.duration) * 100
    setProgress(currentProgress)
  }, [])

  // Toggle play/pause manually
  const togglePlayPause = useCallback(() => {
    const video = videoRef.current
    if (!video) return

    if (video.paused) {
      video
        .play()
        .then(() => {
          setIsPlaying(true)
          setFeedbackAction('play')
          setTimeout(() => setFeedbackAction(null), 600)
        })
        .catch(() => {
          video.muted = true
          video
            .play()
            .then(() => {
              setIsPlaying(true)
              setFeedbackAction('play')
              setTimeout(() => setFeedbackAction(null), 600)
            })
            .catch(() => {})
        })
    } else {
      video.pause()
      setIsPlaying(false)
      setFeedbackAction('pause')
      setTimeout(() => setFeedbackAction(null), 600)
    }
  }, [])

  // Handle single tap (play/pause) vs double tap (like)
  const handleContainerClick = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()

    if (clickTimeoutRef.current) {
      // Double tap detected
      clearTimeout(clickTimeoutRef.current)
      clickTimeoutRef.current = null
      onDoubleTap?.()
    } else {
      clickTimeoutRef.current = setTimeout(() => {
        togglePlayPause()
        clickTimeoutRef.current = null
      }, 250)
    }
  }

  // Handle progress bar scrubbing
  const handleProgressClick = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()
    const video = videoRef.current
    const bar = progressBarRef.current
    if (!video || !bar || !video.duration) return

    const rect = bar.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const newProgress = Math.max(0, Math.min(1, clickX / rect.width))
    video.currentTime = newProgress * video.duration
    setProgress(newProgress * 100)
  }

  // Handle mute toggle with badge animation
  const handleMuteClick = (e: MouseEvent) => {
    e.stopPropagation()
    onToggleMute()
    setShowMuteBadge(true)
    setTimeout(() => setShowMuteBadge(false), 1200)
  }

  return (
    <div
      ref={containerRef}
      onClick={handleContainerClick}
      className="relative w-full h-full bg-black flex items-center justify-center cursor-pointer select-none overflow-hidden"
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        playsInline
        loop
        preload="auto"
        muted={isMuted}
        onPlay={() => {
          setIsPlaying(true)
          setIsLoading(false)
        }}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={handleTimeUpdate}
        onWaiting={() => setIsLoading(true)}
        onPlaying={() => {
          setIsLoading(false)
          setIsPlaying(true)
          setHasError(false)
        }}
        onLoadedData={() => {
          setIsLoading(false)
          setHasError(false)
        }}
        onCanPlay={() => {
          setIsLoading(false)
          setHasError(false)
        }}
        onError={(e) => {
          console.warn('Video load notice:', src, e)
          setIsLoading(false)
          setHasError(true)
        }}
        className="w-full h-full object-cover pointer-events-none"
      />

      {/* Loading Spinner */}
      {isLoading && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none z-10">
          <Loader2 className="w-12 h-12 text-white/80 animate-spin" />
        </div>
      )}

      {/* Error / Tap to retry fallback */}
      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 pointer-events-none z-10 p-4 text-center">
          <Play className="w-12 h-12 text-white/80 mb-2" />
          <p className="text-xs text-zinc-300 font-medium">Nhấn để phát video</p>
        </div>
      )}

      {/* Center Play/Pause feedback animation */}
      {feedbackAction && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <div className="w-20 h-20 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white scale-110 transition-all duration-300 animate-pulse">
            {feedbackAction === 'play' ? (
              <Play className="w-10 h-10 fill-white text-white ml-1" />
            ) : (
              <Pause className="w-10 h-10 fill-white text-white" />
            )}
          </div>
        </div>
      )}

      {/* Paused state overlay hint if video paused and idle */}
      {!isPlaying && !isLoading && !feedbackAction && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="w-16 h-16 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white shadow-lg">
            <Play className="w-8 h-8 fill-white text-white ml-1" />
          </div>
        </div>
      )}

      {/* Top Controls: Sound Toggle Pill */}
      <div className="absolute top-4 right-4 z-20">
        <button
          onClick={handleMuteClick}
          aria-label={isMuted ? 'Unmute video' : 'Mute video'}
          className="w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-md border border-white/10 flex items-center justify-center text-white transition-transform active:scale-95 shadow-md cursor-pointer"
        >
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>
      </div>

      {/* Temporary Mute Badge Notification */}
      {showMuteBadge && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none animate-fade-in">
          <div className="px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-white text-xs font-medium flex items-center gap-1.5 shadow-lg">
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            <span>{isMuted ? 'Đã tắt âm thanh' : 'Đã bật âm thanh'}</span>
          </div>
        </div>
      )}

      {/* Bottom Progress Bar */}
      <div
        ref={progressBarRef}
        onClick={handleProgressClick}
        className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 hover:h-1.5 cursor-pointer z-30 transition-all duration-150"
      >
        <div
          className="h-full bg-white transition-[width] duration-100 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
