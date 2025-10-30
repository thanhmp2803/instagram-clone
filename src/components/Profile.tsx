'use client'
import { Plus } from 'lucide-react'
import Image from 'next/image'
import {
  mockUserProfile,
  mockUserPosts,
  mockUserReels,
  mockUserTagged,
  createProfileTabs,
  createProfileTabContents,
} from '@mocks'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMounted } from '@hooks'

export function Profile() {
  const { t } = useTranslation()
  const mounted = useMounted()
  const user = mockUserProfile
  const [activeTab, setActiveTab] = useState<'posts' | 'saved' | 'tagged'>('posts')

  if (!mounted) {
    return null
  }

  const getTabData = () => {
    switch (activeTab) {
      case 'posts':
        return mockUserPosts
      case 'saved':
        return mockUserReels
      case 'tagged':
        return mockUserTagged
      default:
        return []
    }
  }

  const getItemHeight = () => {
    switch (activeTab) {
      case 'posts':
        return 'h-[189.78px] lg:h-[309px]'
      case 'saved':
        return 'h-[221.56px] lg:h-[309px]'
      case 'tagged':
        return 'h-[189.78px] lg:h-[309px]'
      default:
        return 'h-[189.78px] lg:h-[309px]'
    }
  }

  const renderEmptyState = (Icon: typeof Plus, message: string) => (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-16 h-16 rounded-full border-2 border-white flex items-center justify-center mb-4">
        <Icon size={32} />
      </div>
      <p className="text-sm text-gray-400 text-center">{message}</p>
    </div>
  )

  const renderGrid = () => {
    const data = getTabData()
    const heightClass = getItemHeight()

    if (data.length === 0) {
      const content = createProfileTabContents(t).find((c) => c.id === activeTab)
      if (content) {
        return renderEmptyState(content.icon, content.message)
      }
      return null
    }

    return (
      <div className="grid grid-cols-3 gap-0.5 lg:gap-1 w-full">
        {data.map((item) => (
          <div
            key={item.id}
            className={`relative w-full ${heightClass} bg-gray-800 cursor-pointer hover:opacity-90 transition-opacity overflow-hidden`}
          >
            <Image
              src={item.imageUrl}
              alt={`${item.type} ${item.id}`}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 33vw, 309px"
            />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white pb-20 lg:pb-0 overflow-x-hidden">
      {/* Header - Mobile */}
      <div className="sticky top-0 z-10 bg-black border-b border-gray-800 px-4 py-3 lg:hidden">
        <div className="flex items-center justify-center">
          <h1 className="text-lg font-semibold">{user.username}</h1>
        </div>
      </div>

      {/* Profile Info */}
      <div className="px-2 pt-10 lg:px-12 lg:pt-12 lg:max-w-4xl lg:mx-auto w-full">
        <div className="flex gap-4 mb-6 lg:gap-24 lg:mb-11">
          {/* Left: Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 lg:w-40 lg:h-40 rounded-full bg-gradient-to-tr from-gray-700 to-gray-800 flex items-center justify-center cursor-pointer">
              {user.avatar ? (
                <Image
                  src={user.avatar}
                  alt={user.username}
                  width={160}
                  height={160}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <Plus size={32} className="text-white lg:size-16" />
                </div>
              )}
            </div>
            <button className="absolute bottom-0 right-0 w-6 h-6 lg:w-10 lg:h-10 bg-blue-500 rounded-full flex items-center justify-center border-2 border-black">
              <Plus size={14} className="text-white lg:size-6" />
            </button>
          </div>

          {/* Right: Username and Buttons */}
          <div className="flex-1 flex flex-col ml-1">
            {/* Desktop: Username and buttons in same row */}
            <div className="lg:flex lg:items-center lg:gap-8 lg:mb-5">
              <div className="mb-3 lg:mb-0">
                <span className="text-2xl lg:text-xl">{user.username}</span>
              </div>

              <div className="flex gap-2 lg:flex-1">
                <button className="bg-neutral-800 hover:bg-neutral-700 text-white font-semibold py-1.5 px-7 rounded-lg text-sm transition cursor-pointer lg:px-6">
                  {t('profile.edit_profile')}
                </button>
                <button className="bg-neutral-800 hover:bg-neutral-700 text-white font-semibold py-1.5 px-7 rounded-lg text-sm transition cursor-pointer lg:px-6">
                  {t('profile.view_archive')}
                </button>
              </div>
            </div>

            {/* Desktop: Stats */}
            <div className="hidden lg:flex lg:gap-10 lg:mb-5">
              <div>
                <span className="font-semibold">{user.posts}</span>
                <span className="text-gray-400 ml-1">{t('profile.posts')}</span>
              </div>
              <div className="cursor-pointer">
                <span className="font-semibold">{user.followers}</span>
                <span className="text-gray-400 ml-1">{t('profile.followers')}</span>
              </div>
              <div className="cursor-pointer">
                <span className="font-semibold">{user.following}</span>
                <span className="text-gray-400 ml-1">{t('profile.following')}</span>
              </div>
            </div>

            {/* Desktop: Name and Bio */}
            <div className="hidden lg:block">
              <div className="font-semibold text-sm mb-1">{user.fullName}</div>
              {user.bio && <div className="text-sm text-gray-300">{user.bio}</div>}
            </div>
          </div>
        </div>

        {/* Mobile: Name and Bio */}
        <div className="font-semibold text-base pt-1 pb-5 ml-1 lg:hidden">
          <div className="mb-1">{user.fullName}</div>
          {user.bio && <div className="text-base text-gray-300 font-normal">{user.bio}</div>}
        </div>

        {/* New Story Circle */}
        <div className="flex gap-6 mb-6 lg:mb-11">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-full border-2 border-gray-700 flex items-center justify-center cursor-pointer mb-1">
              <Plus size={24} className="text-white lg:size-8" />
            </div>
            <span className="text-xs text-gray-300">{t('profile.new_story')}</span>
          </div>
        </div>
      </div>
      {/* Stats - Mobile only */}
      <div className="flex text-center border-t border-gray-800 lg:hidden">
        <div className="flex-1 py-1.5">
          <div className="text-lg font-semibold">{user.posts}</div>
          <div className="text-sm text-gray-400">{t('profile.posts')}</div>
        </div>
        <div className="flex-1 py-1.5">
          <div className="text-lg font-semibold cursor-pointer">{user.followers}</div>
          <div className="text-sm text-gray-400">{t('profile.followers')}</div>
        </div>
        <div className="flex-1 py-1.5">
          <div className="text-lg font-semibold cursor-pointer">{user.following}</div>
          <div className="text-sm text-gray-400">{t('profile.following')}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-800 lg:max-w-4xl lg:mx-auto w-full">
        <div className="flex justify-around">
          {createProfileTabs().map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <div key={tab.id} className="flex-1 flex flex-col items-center">
                <button
                  onClick={() => setActiveTab(tab.id)}
                  className="py-2 transition-colors cursor-pointer"
                >
                  <Icon size={24} className={isActive ? 'text-white' : 'text-gray-400'} />
                </button>
                <div
                  className={`w-1/2 h-0.5 transition-colors ${
                    isActive ? 'bg-white' : 'bg-transparent'
                  }`}
                />
              </div>
            )
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="lg:max-w-4xl lg:mx-auto w-full">{renderGrid()}</div>
    </div>
  )
}
