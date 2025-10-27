'use client'
import Image from 'next/image'
import { createSidebarItems } from '@mocks'
import { useTranslation } from 'react-i18next'
import { useMounted } from '@hooks'
import { useMemo, useState } from 'react'
import { CreatePost } from './CreatePost'

export function Sidebar() {
  const mounted = useMounted()
  const { t, ready } = useTranslation()
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false)

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
    <div className="fixed left-0 top-0 h-screen w-[250px] bg-black text-white flex flex-col justify-between p-4 border-r border-e-zinc-700 z-10">
      {/* Logo and Main Menu */}
      <div className="flex-1">
        <h1 className="text-3xl font-instagram mt-5 mb-8 ms-2 cursor-pointer">Instagram</h1>

        <nav className="flex flex-col space-y-4">
          {mainItems.map((item, index) => {
            const Icon = item.icon
            const isCreateButton = item.label === t('sidebar.create')

            return (
              <button
                key={index}
                onClick={isCreateButton ? () => setIsCreatePostOpen(true) : undefined}
                className="flex items-center space-x-4 hover:bg-zinc-800 p-2 rounded-lg transition cursor-pointer"
              >
                <Icon size={24} />
                <span className="font-medium">{item.label}</span>
              </button>
            )
          })}

          {/* Profile */}
          <button className="flex items-center space-x-4 hover:bg-zinc-800 p-2 rounded-lg transition cursor-pointer">
            <Image
              src="/images/conmeo.jpg"
              alt="Profile"
              width={24}
              height={24}
              className="w-6 h-6 rounded-full object-cover aspect-square"
            />
            <span className="font-medium">{t('sidebar.profile')}</span>
          </button>
        </nav>
      </div>

      {/* Bottom Menu - More and Also from Meta */}
      <div className="flex flex-col space-y-4 mt-4 mb-2">
        {bottomItems.map((item, index) => {
          const Icon = item.icon
          return (
            <button
              key={index}
              className="flex items-center space-x-4 hover:bg-zinc-800 p-2 rounded-lg transition cursor-pointer"
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
  )
}
