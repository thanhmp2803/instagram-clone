'use client'
import { useState, useMemo } from 'react'
import { Home, Compass, Film, PlusSquare, MessageCircle } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useMounted, useAuth } from '@hooks'
import Image from 'next/image'
import { CreatePost, ProfileDropdown } from '@components'
import { useRouter, usePathname } from 'next/navigation'
import { resolveAvatar } from '@/utils/avatar'

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

  const userAvatar = useMemo(() => {
    return resolveAvatar(user?.username, user?.email, user?.avatar)
  }, [user?.avatar, user?.username, user?.email])

  // Determine active item based on current route
  const currentActiveIndex = (() => {
    if (pathname === '/explore') return 1
    if (pathname === '/reels') return 2
    if (pathname === '/messages') return 4
    if (pathname === '/profile' || pathname.startsWith('/profile/')) return 5
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
    const item = createNavItems[index]

    if (item.label === 'Create') {
      setShowCreateModal(true)
    } else if (item.path) {
      router.push(item.path)
    }
  }

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800 z-40 lg:hidden">
        <div className="flex items-center justify-around px-2 py-2">
          {createNavItems.map((item, index) => {
            const Icon = item.icon
            const isActive = currentActiveIndex === index

            return (
              <button
                key={item.label}
                onClick={() => handleItemClick(index)}
                className="flex flex-col items-center justify-center p-2 text-white hover:opacity-70 transition-opacity cursor-pointer"
                aria-label={item.label}
              >
                <Icon
                  size={24}
                  strokeWidth={isActive ? 2.5 : 2}
                  className={`transition-transform duration-200 ${
                    isActive ? 'scale-110 text-white' : 'text-gray-400'
                  }`}
                />
              </button>
            )
          })}

          {/* Profile Button with Menu */}
          <div className="relative">
            <button
              onClick={() => {
                if (!user) {
                  router.push('/login')
                } else {
                  setShowProfileMenu(!showProfileMenu)
                  setActiveIndex(5)
                }
              }}
              className="flex flex-col items-center justify-center p-2 hover:opacity-70 transition-opacity cursor-pointer"
              aria-label="Profile"
            >
              <div
                className={`rounded-full transition-all ${
                  currentActiveIndex === 5 ? 'ring-2 ring-white p-0.5' : ''
                }`}
              >
                <Image
                  src={userAvatar}
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
                  setActiveIndex(pathname === '/reels' ? 2 : pathname === '/messages' ? 4 : 0)
                }}
                username={user.name}
                position="bottom"
              />
            )}
          </div>
        </div>
      </nav>

      {/* Create Post Modal */}
      <CreatePost isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} />
    </>
  )
}
