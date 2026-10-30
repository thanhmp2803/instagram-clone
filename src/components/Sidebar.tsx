'use client'
import Image from 'next/image'
import { createSidebarItems } from '@mocks'
import { useTranslation } from 'react-i18next'
import { useMounted, useAuth } from '@hooks'
import { useMemo, useState, useEffect } from 'react'
import { CreatePost, MoreMenu, SearchDrawer, NotificationsDrawer } from '@components'
import { useRouter, usePathname } from 'next/navigation'
import { resolveAvatar } from '@/utils/avatar'

export function Sidebar() {
  const mounted = useMounted()
  const { t, ready } = useTranslation()
  const router = useRouter()
  const pathname = usePathname()
  const { user } = useAuth()
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false)
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [unreadNotifs, setUnreadNotifs] = useState(0)

  // Resolve user avatar
  const userAvatar = useMemo(() => {
    return resolveAvatar(user?.username, user?.email, user?.avatar)
  }, [user?.avatar, user?.username, user?.email])

  // Check unread notifications on load & storage changes
  useEffect(() => {
    const checkUnread = () => {
      if (typeof window !== 'undefined' && user?.username) {
        try {
          const raw = localStorage.getItem(`instagram_notifications_${user.username}`)
          if (raw) {
            const list = JSON.parse(raw)
            if (Array.isArray(list)) {
              setUnreadNotifs(list.filter((n) => !n.read).length)
            }
          }
        } catch {}
      }
    }

    checkUnread()
    window.addEventListener('storage', checkUnread)
    return () => window.removeEventListener('storage', checkUnread)
  }, [user?.username])

  // Memoize sidebar items
  const allItems = useMemo(() => {
    return ready ? createSidebarItems(t) : []
  }, [t, ready])

  const mainItems = useMemo(() => {
    if (!ready) return []
    const excludeLabels = [t('sidebar.more'), t('sidebar.also_from_meta')]
    return allItems.filter((item) => !excludeLabels.includes(item.label))
  }, [allItems, t, ready])

  const bottomItems = useMemo(() => {
    if (!ready) return []
    const includeLabels = [t('sidebar.more'), t('sidebar.also_from_meta')]
    return allItems.filter((item) => includeLabels.includes(item.label))
  }, [allItems, t, ready])

  // If not mounted or i18n not ready, render skeleton
  if (!mounted || !ready) {
    return (
      <div className="fixed left-0 top-0 h-screen w-[250px] bg-black text-white flex flex-col justify-between p-4 border-r border-e-zinc-700 z-10">
        <div className="flex-1">
          <h1 className="text-3xl font-instagram mt-5 mb-8 ms-2 cursor-pointer">Instagram</h1>
          <nav className="flex flex-col space-y-4">
            {Array(7)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="flex items-center space-x-4 p-2">
                  <div className="w-6 h-6 bg-gray-700 rounded animate-pulse"></div>
                  <div className="w-20 h-4 bg-gray-700 rounded animate-pulse"></div>
                </div>
              ))}
          </nav>
        </div>
        <div className="flex flex-col space-y-4">
          {Array(2)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="flex items-center space-x-4 p-2">
                <div className="w-6 h-6 bg-gray-700 rounded animate-pulse"></div>
                <div className="w-16 h-4 bg-gray-700 rounded animate-pulse"></div>
              </div>
            ))}
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="fixed left-0 top-0 h-screen w-[250px] bg-black text-white flex flex-col justify-between p-4 border-r border-e-zinc-700 z-10">
        {/* Logo and Main Menu */}
        <div className="flex-1">
          <h1
            onClick={() => router.push('/')}
            className="text-3xl font-instagram mt-5 mb-8 ms-2 cursor-pointer hover:opacity-80 transition-opacity"
          >
            Instagram
          </h1>

          <nav className="flex flex-col space-y-4">
            {mainItems.map((item, index) => {
              const Icon = item.icon

              const isCreateButton = item.label === t('sidebar.create')
              const isSearchButton = item.label === t('sidebar.search')
              const isNotificationsButton = item.label === t('sidebar.notifications')
              const isHomeButton = item.label === t('sidebar.home')
              const isReelsButton = item.label === t('sidebar.reels') || item.path === '/reels'
              const isMessagesButton =
                item.label === t('sidebar.messages') || item.path === '/messages'

              const isActive =
                (isHomeButton && pathname === '/') ||
                (isReelsButton && pathname === '/reels') ||
                (isMessagesButton && pathname === '/messages') ||
                (item.path && item.path !== '/' && pathname === item.path) ||
                (isSearchButton && isSearchOpen) ||
                (isNotificationsButton && isNotificationsOpen)

              return (
                <button
                  key={index}
                  onClick={() => {
                    if (isCreateButton) {
                      setIsCreatePostOpen(true)
                    } else if (isSearchButton) {
                      setIsNotificationsOpen(false)
                      setIsSearchOpen(!isSearchOpen)
                    } else if (isNotificationsButton) {
                      setIsSearchOpen(false)
                      setIsNotificationsOpen(!isNotificationsOpen)
                    } else if (isHomeButton) {
                      router.push('/')
                    } else if (isReelsButton) {
                      router.push('/reels')
                    } else if (isMessagesButton) {
                      router.push('/messages')
                    } else if (item.path) {
                      router.push(item.path)
                    }
                  }}
                  className={`flex items-center space-x-4 p-2 rounded-lg transition cursor-pointer ${
                    isActive
                      ? 'bg-zinc-800/90 text-white font-bold'
                      : 'text-zinc-300 hover:bg-zinc-800/60 hover:text-white'
                  }`}
                >
                  <div className="relative flex items-center justify-center">
                    <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                    {isNotificationsButton && unreadNotifs > 0 && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-black" />
                    )}
                  </div>
                  <span className={isActive ? 'font-bold' : 'font-medium'}>{item.label}</span>
                </button>
              )
            })}

            {/* Profile -> Direct navigation to /profile */}
            <div className="relative">
              <button
                onClick={() => {
                  if (!user) {
                    router.push('/login')
                  } else {
                    router.push('/profile')
                  }
                }}
                className={`flex items-center space-x-4 p-2 rounded-lg transition cursor-pointer w-full ${
                  pathname === '/profile'
                    ? 'bg-zinc-800/90 text-white font-bold'
                    : 'text-zinc-300 hover:bg-zinc-800/60 hover:text-white'
                }`}
              >
                <Image
                  src={userAvatar}
                  alt="Profile"
                  width={24}
                  height={24}
                  className={`w-6 h-6 rounded-full object-cover aspect-square ${
                    pathname === '/profile' ? 'ring-2 ring-white' : ''
                  }`}
                />
                <span className={pathname === '/profile' ? 'font-bold' : 'font-medium'}>
                  {t('sidebar.profile')}
                </span>
              </button>
            </div>
          </nav>
        </div>

        {/* Bottom Menu - More and Also from Meta */}
        <div className="relative flex flex-col space-y-4 mt-4 mb-2">
          {/* Instagram More Popup Menu */}
          <MoreMenu isOpen={isMoreMenuOpen} onClose={() => setIsMoreMenuOpen(false)} />
          {bottomItems.map((item, index) => {
            const Icon = item.icon

            return (
              <button
                key={index}
                onClick={() => {
                  if (item.label === t('sidebar.more') || index === 0) {
                    setIsMoreMenuOpen((prev) => !prev)
                  }
                }}
                className={`flex items-center space-x-4 hover:bg-zinc-800 p-2 rounded-lg transition cursor-pointer ${
                  (item.label === t('sidebar.more') || index === 0) && isMoreMenuOpen
                    ? 'bg-zinc-800 text-white font-bold'
                    : 'text-zinc-300 hover:text-white'
                }`}
              >
                <Icon size={24} />
                <span className="font-medium">{item.label}</span>
              </button>
            )
          })}
        </div>

        {/* CreatePost Modal */}
        <CreatePost isOpen={isCreatePostOpen} onClose={() => setIsCreatePostOpen(false)} />
      </div>

      {/* Instagram Search Drawer */}
      <SearchDrawer isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Instagram Notifications Drawer */}
      <NotificationsDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onUnreadChange={setUnreadNotifs}
      />
    </>
  )
}
