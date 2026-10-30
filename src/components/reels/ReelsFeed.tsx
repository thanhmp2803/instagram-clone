'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { ChevronUp, ChevronDown, Volume2, VolumeX } from 'lucide-react'
import { ReelItem } from './ReelItem'
import { mockReels } from '@mocks'
import type { IReel } from '@types'

export function ReelsFeed() {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [reels] = useState<IReel[]>(mockReels)
  const [activeIndex, setActiveIndex] = useState<number>(0)
  const [isGlobalMuted, setIsGlobalMuted] = useState<boolean>(true)

  // Toggle global mute
  const toggleGlobalMute = useCallback(() => {
    setIsGlobalMuted((prev) => !prev)
  }, [])

  // Scroll to a specific reel index
  const scrollToReel = useCallback(
    (index: number) => {
      const container = containerRef.current
      if (!container) return

      const clampedIndex = Math.max(0, Math.min(index, reels.length - 1))
      const targetChild = container.children[clampedIndex] as HTMLElement
      if (targetChild) {
        targetChild.scrollIntoView({ behavior: 'smooth', block: 'start' })
        setActiveIndex(clampedIndex)
      }
    },
    [reels.length],
  )

  // Track active reel index on scroll
  const handleScroll = useCallback(() => {
    const container = containerRef.current
    if (!container) return

    const scrollPosition = container.scrollTop
    const clientHeight = container.clientHeight
    const newIndex = Math.round(scrollPosition / clientHeight)

    if (newIndex !== activeIndex && newIndex >= 0 && newIndex < reels.length) {
      setActiveIndex(newIndex)
    }
  }, [activeIndex, reels.length])

  // Keyboard navigation: ArrowUp/Down to scroll, 'M' to mute/unmute
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        return
      }

      if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault()
        scrollToReel(activeIndex - 1)
      } else if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault()
        scrollToReel(activeIndex + 1)
      } else if (e.key.toLowerCase() === 'm') {
        e.preventDefault()
        toggleGlobalMute()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeIndex, scrollToReel, toggleGlobalMute])

  return (
    <div className="relative w-full h-full bg-black overflow-hidden flex items-center justify-center">
      {/* Scrollable Container with CSS Scroll Snapping */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="w-full h-full overflow-y-scroll snap-y snap-mandatory no-scrollbar scroll-smooth flex flex-col items-center"
      >
        {reels.map((reel, index) => (
          <div
            key={reel.id}
            className="w-full h-screen flex-shrink-0 flex items-center justify-center snap-start snap-always"
          >
            <ReelItem
              reel={reel}
              isActive={index === activeIndex}
              isGlobalMuted={isGlobalMuted}
              onToggleGlobalMute={toggleGlobalMute}
            />
          </div>
        ))}
      </div>

      {/* Desktop Quick Navigation Buttons (Floating Right of Feed) */}
      <div className="hidden md:flex flex-col gap-3 absolute right-6 top-1/2 -translate-y-1/2 z-30">
        <button
          onClick={() => scrollToReel(activeIndex - 1)}
          disabled={activeIndex === 0}
          aria-label="Previous reel"
          className={`w-11 h-11 rounded-full bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700/80 backdrop-blur-md text-white flex items-center justify-center transition-all shadow-xl active:scale-90 cursor-pointer ${
            activeIndex === 0 ? 'opacity-30 cursor-not-allowed hover:bg-zinc-900/80' : ''
          }`}
        >
          <ChevronUp className="w-6 h-6" />
        </button>

        <button
          onClick={() => scrollToReel(activeIndex + 1)}
          disabled={activeIndex === reels.length - 1}
          aria-label="Next reel"
          className={`w-11 h-11 rounded-full bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700/80 backdrop-blur-md text-white flex items-center justify-center transition-all shadow-xl active:scale-90 cursor-pointer ${
            activeIndex === reels.length - 1
              ? 'opacity-30 cursor-not-allowed hover:bg-zinc-900/80'
              : ''
          }`}
        >
          <ChevronDown className="w-6 h-6" />
        </button>
      </div>

      {/* Floating Global Audio Status Indicator in top-right */}
      <div className="hidden lg:flex items-center gap-2 absolute top-6 right-8 z-30 bg-zinc-900/80 border border-zinc-800 px-3.5 py-1.5 rounded-full text-xs text-zinc-300 backdrop-blur-md select-none">
        <button
          onClick={toggleGlobalMute}
          className="flex items-center gap-2 hover:text-white transition cursor-pointer"
        >
          {isGlobalMuted ? (
            <>
              <VolumeX className="w-4 h-4 text-red-400" />
              <span>Sound Off (Press M)</span>
            </>
          ) : (
            <>
              <Volume2 className="w-4 h-4 text-green-400" />
              <span>Sound On</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
