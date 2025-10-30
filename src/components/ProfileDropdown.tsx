'use client'
import { User, LogOut } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@hooks'

interface ProfileDropdownProps {
  isOpen: boolean
  onClose: () => void
  username: string
  position?: 'sidebar' | 'bottom'
}

export function ProfileDropdown({
  isOpen,
  onClose,
  username,
  position = 'sidebar',
}: ProfileDropdownProps) {
  const { t } = useTranslation()
  const router = useRouter()
  const { logout } = useAuth()
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  // Position
  const positionStyles =
    position === 'sidebar' ? 'top-full left-0 mt-2' : 'bottom-full left-1/2 -translate-x-1/2 mb-2'

  return (
    <div
      ref={dropdownRef}
      className={`absolute ${positionStyles} ${position === 'sidebar' ? 'w-full' : 'w-64'} bg-neutral-800 rounded-lg shadow-2xl border border-neutral-700 overflow-hidden z-50`}
    >
      {/* Profile Option */}
      <button
        onClick={() => {
          router.push('/profile')
          onClose()
        }}
        className="w-full px-4 py-1 text-left hover:bg-neutral-700 transition-colors flex items-center space-x-3 border-b border-neutral-700 cursor-pointer"
      >
        <User size={18} className="text-white" />
        <div className="flex-1">
          <p className="text-white font-semibold text-sm">{username}</p>
          <p className="text-gray-400 text-xs">{t('profile.view_profile')}</p>
        </div>
      </button>

      {/* Logout Option */}
      <button
        onClick={() => {
          logout()
          router.push('/login')
          onClose()
        }}
        className="w-full px-4 py-3 text-left hover:bg-neutral-700 transition-colors flex items-center space-x-3 cursor-pointer"
      >
        <LogOut size={18} className="text-white" />
        <span className="text-white font-medium text-sm">{t('profile.logout')}</span>
      </button>
    </div>
  )
}
