'use client'
import { useState } from 'react'
import { Home, Compass, Film, PlusSquare, MessageCircle } from 'lucide-react'
import { useMounted } from '@hooks'
import Image from 'next/image'
import { CreatePost, ProfileDropdown } from '@components'
import { useRouter } from 'next/navigation'

const createNavItems = [
  { icon: Home, label: 'Home' },
  { icon: Compass, label: 'Explore' },
  { icon: Film, label: 'Reels' },
  { icon: PlusSquare, label: 'Create' },
  { icon: MessageCircle, label: 'Messages' },
]

export function BottomNavigation() {
  const mounted = useMounted()
  const router = useRouter()
  const [activeIndex, setActiveIndex] = useState(0)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)

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

  const handleItemClick = (index: number) => {
    setActiveIndex(index)
    if (index === 3) {
      setShowCreateModal(true)
    } else if (index === 0) {
      router.push('/')
    }
  }

  const handleProfileClick = () => {
    setActiveIndex(5)
    setShowProfileMenu(!showProfileMenu)
  }

  const handleCloseModal = () => {
    setShowCreateModal(false)
    setActiveIndex(0) // Reset to Home
  }

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800 z-40 lg:hidden">
        <div className="flex items-center justify-around">
          {createNavItems.map((item, index) => {
            const Icon = item.icon
            const isActive = activeIndex === index
            return (
              <button
                key={index}
                onClick={() => handleItemClick(index)}
                className="flex flex-col items-center py-2 px-3 hover:bg-gray-800 rounded-lg transition-colors min-w-[48px] cursor-pointer"
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
          <div className="relative">
            <button
              onClick={handleProfileClick}
              className="flex flex-col items-center hover:bg-gray-800 rounded-lg transition-colors min-w-[48px]"
            >
              <div
                className={`rounded-full transition-all ${
                  activeIndex === 5 ? 'ring-2 ring-white p-0.5' : ''
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

            <ProfileDropdown
              isOpen={showProfileMenu}
              onClose={() => {
                setShowProfileMenu(false)
                setActiveIndex(0)
              }}
              username="pthanh2803"
              position="bottom"
            />
          </div>
        </div>
      </div>

      {/* Create Post */}
      <CreatePost isOpen={showCreateModal} onClose={handleCloseModal} />
    </>
  )
}
