'use client'
import { useState } from 'react'
import { Home, Compass, Film, PlusSquare, MessageCircle } from 'lucide-react'
import { useMounted } from '@hooks'
import Image from 'next/image'

const createNavItems = [
  { icon: Home, label: 'Home' },
  { icon: Compass, label: 'Explore' },
  { icon: Film, label: 'Reels' },
  { icon: PlusSquare, label: 'Create' },
  { icon: MessageCircle, label: 'Messages' },
]

export function BottomNavigation() {
  const mounted = useMounted()
  const [activeIndex, setActiveIndex] = useState(0)

  // Loading skeleton
  if (!mounted) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800 z-40 lg:hidden">
        <div className="flex items-center justify-around px-2 py-2">
          {Array(5)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="flex flex-col items-center py-2">
                <div className="w-6 h-6 bg-gray-700 rounded animate-pulse"></div>
              </div>
            ))}
        </div>
      </div>
    )
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800 z-40 lg:hidden">
      <div className="flex items-center justify-around">
        {createNavItems.map((item, index) => {
          const Icon = item.icon
          const isActive = activeIndex === index
          return (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className="flex flex-col items-center py-2 px-3 hover:bg-gray-800 rounded-lg transition-colors min-w-[48px]"
            >
              <Icon
                size={24}
                className={`transition-colors ${isActive ? 'text-white' : 'text-gray-400'}`}
                strokeWidth={isActive ? 2.5 : 2}
              />
            </button>
          )
        })}

        {/* Profile Icon */}
        <button
          onClick={() => setActiveIndex(4)}
          className="flex flex-col items-center hover:bg-gray-800 rounded-lg transition-colors min-w-[48px]"
        >
          <div
            className={`rounded-full transition-all ${
              activeIndex === 4 ? 'ring-2 ring-white p-0.5' : ''
            }`}
          >
            <Image
              src="/images/conmeo.jpg"
              alt="Profile"
              width={24}
              height={24}
              className="w-6 h-6 rounded-full object-cover aspect-square"
            />
          </div>
        </button>
      </div>
    </div>
  )
}
