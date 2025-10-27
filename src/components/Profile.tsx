'use client'
import { Plus, Grid3x3, Film, UserSquare2 } from 'lucide-react'
import Image from 'next/image'
import { mockUserProfile } from '@mocks'

export function Profile() {
  const user = mockUserProfile

  return (
    <div className="min-h-screen bg-black text-white pb-20 lg:pb-0">
      {/* Header - Mobile */}
      <div className="sticky top-0 z-10 bg-black border-b border-gray-800 px-4 py-3 lg:hidden">
        <div className="flex items-center justify-center">
          <h1 className="text-lg font-semibold">{user.username}</h1>
        </div>
      </div>

      {/* Profile Info */}
      <div className="px-4 py-6">
        {/* Avatar and Stats */}
        <div className="flex items-center gap-4 mb-6">
          {/* Avatar */}
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-gray-700 to-gray-800 flex items-center justify-center">
              {user.avatar ? (
                <Image
                  src={user.avatar}
                  alt={user.username}
                  width={80}
                  height={80}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <Plus size={32} className="text-white" />
                </div>
              )}
            </div>
            <button className="absolute bottom-0 right-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center border-2 border-black">
              <Plus size={14} className="text-white" />
            </button>
          </div>

          {/* Stats */}
          <div className="flex-1 flex justify-around text-center">
            <div>
              <div className="text-lg font-semibold">{user.posts}</div>
              <div className="text-sm text-gray-400">bài viết</div>
            </div>
            <div>
              <div className="text-lg font-semibold">{user.followers}</div>
              <div className="text-sm text-gray-400">người theo dõi</div>
            </div>
            <div>
              <div className="text-lg font-semibold">{user.following}</div>
              <div className="text-sm text-gray-400">đang theo dõi</div>
            </div>
          </div>
        </div>

        {/* Name and Bio */}
        <div className="mb-4">
          <div className="font-semibold text-sm mb-1">{user.fullName}</div>
          {user.bio && <div className="text-sm text-gray-300">{user.bio}</div>}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mb-4">
          <button className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-white font-semibold py-1.5 px-4 rounded-lg text-sm transition">
            Chỉnh sửa
          </button>
          <button className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-white font-semibold py-1.5 px-4 rounded-lg text-sm transition">
            Chia sẻ trang cá nhân
          </button>
          <button className="bg-neutral-800 hover:bg-neutral-700 text-white font-semibold py-1.5 px-4 rounded-lg text-sm transition">
            <Plus size={16} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-t border-gray-800">
        <div className="flex justify-around">
          <button className="flex-1 py-3 border-t-2 border-white">
            <Grid3x3 size={20} className="mx-auto" />
          </button>
          <button className="flex-1 py-3 border-t-2 border-transparent text-gray-400">
            <Film size={20} className="mx-auto" />
          </button>
          <button className="flex-1 py-3 border-t-2 border-transparent text-gray-400">
            <UserSquare2 size={20} className="mx-auto" />
          </button>
        </div>
      </div>

      {/* Empty State */}
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-16 h-16 rounded-full border-2 border-white flex items-center justify-center mb-4">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
        </div>
        <p className="text-sm text-gray-400 text-center">
          Chia sẻ ảnh và video để mọi người có thể nhìn thấy
        </p>
      </div>
    </div>
  )
}
