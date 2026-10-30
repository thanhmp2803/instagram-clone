'use client'
import { useState } from 'react'
import { Home, Compass, Film, PlusSquare, MessageCircle } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useMounted, useAuth } from '@hooks'
import Image from 'next/image'
import { CreatePost, ProfileDropdown } from '@components'
import { useRouter, usePathname } from 'next/navigation'

interface NavItem {
  icon: LucideIcon
  label: string
  path?: string
}

const createNavItems: NavItem[] = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: Compass, label: 'Explore', path: '/explore' },
  { icon: Film, label: 'Reels', path: '/reels' },
  { icon: PlusSquare, label: 'Create' },
  { icon: MessageCircle, label: 'Messages', path: '/messages' },
]

export function BottomNavigation() {
  const mounted = useMounted()
  const router = useRouter()
  const pathname = usePathname()
  const { user } = useAuth()
  const [activeIndex, setActiveIndex] = useState(0)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)

  // Determine active item based on current route
  const currentActiveIndex = (() => {
    if (pathname === '/reels') return 2
    if (pathname === '/profile') return 5
    if (pathname === '/') return 0
    return activeIndex
  })()

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
    } else if (index === 2) {
      router.push('/reels')
    }
  }

  const handleProfileClick = () => {
    if (!user) {
      router.push('/login')
    } else {
      setActiveIndex(5)
      setShowProfileMenu(!showProfileMenu)
    }
  }

  const handleCloseModal = () => {
    setShowCreateModal(false)
    setActiveIndex(pathname === '/reels' ? 2 : pathname === '/profile' ? 5 : 0)
  }

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800 z-40 lg:hidden">
        <div className="flex items-center justify-around">
          {createNavItems.map((item, index) => {
            const Icon = item.icon
            const isActive = currentActiveIndex === index
            return (
              <button
                key={index}
                onClick={() => handleItemClick(index)}
                aria-label={item.label}
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
              aria-label="Profile"
              className="flex flex-col items-center hover:bg-gray-800 rounded-lg transition-colors min-w-[48px] cursor-pointer"
            >
              <div
                className={`rounded-full transition-all ${
                  currentActiveIndex === 5 ? 'ring-2 ring-white p-0.5' : ''
                }`}
              >
                <Image
                  src={user ? '/images/conmeo.jpg' : '/images/nonuser.png'}
                  alt="Profile"
                  width={24}
                  height={24}
                  className="w-6 h-6 rounded-full object-cover aspect-square"
                />
              </div>
            </button>

            {user && (
              <ProfileDropdown
                isOpen={showProfileMenu}
                onClose={() => {
                  setShowProfileMenu(false)
                  setActiveIndex(pathname === '/reels' ? 2 : 0)
                }}
                username={user.name}
                position="bottom"
              />
            )}
          </div>
        </div>
      </div>

      {/* Create Post */}
      <CreatePost isOpen={showCreateModal} onClose={handleCloseModal} />
    </>
  )
}
