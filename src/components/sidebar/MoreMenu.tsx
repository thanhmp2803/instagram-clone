'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Settings, Bookmark, Moon, ChevronLeft, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@hooks'

interface MoreMenuProps {
  isOpen: boolean
  onClose: () => void
}

export function MoreMenu({ isOpen, onClose }: MoreMenuProps) {
  const router = useRouter()
  const { logout } = useAuth()
  const menuRef = useRef<HTMLDivElement>(null)

  const [currentView, setCurrentView] = useState<'main' | 'appearance'>('main')
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('instagram_theme')
      return stored !== 'light'
    }
    return true
  })

  // Apply theme to document
  const applyTheme = useCallback((isDark: boolean) => {
    if (typeof document === 'undefined') return
    if (isDark) {
      document.documentElement.classList.remove('light')
      document.documentElement.classList.add('dark')
      document.body.style.backgroundColor = '#000000'
      document.body.style.color = '#ffffff'
      localStorage.setItem('instagram_theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      document.documentElement.classList.add('light')
      document.body.style.backgroundColor = '#ffffff'
      document.body.style.color = '#000000'
      localStorage.setItem('instagram_theme', 'light')
    }
  }, [])

  // Toggle theme
  const toggleTheme = () => {
    const nextState = !isDarkMode
    setIsDarkMode(nextState)
    applyTheme(nextState)
  }

  // Close when clicked outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
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

  // Reset to main view whenever opened
  useEffect(() => {
    if (isOpen) {
      setCurrentView('main')
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      ref={menuRef}
      className="absolute bottom-full left-0 mb-3 w-[266px] h-[215px] bg-[#262626] border border-neutral-700/60 rounded-2xl shadow-2xl p-2 z-50 text-white select-none animate-in fade-in zoom-in-95 duration-150 flex flex-col justify-between overflow-hidden"
    >
      {currentView === 'main' ? (
        /* MAIN MENU VIEW: Settings, Saved, Switch appearance, Log out */
        <div className="flex flex-col h-full justify-between">
          <div className="space-y-0.5">
            {/* Settings -> redirects to edit profile */}
            <button
              onClick={() => {
                onClose()
                router.push('/profile?edit=true')
              }}
              className="w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl hover:bg-neutral-700/50 transition cursor-pointer text-left text-sm font-medium text-white"
            >
              <Settings size={20} className="text-white" />
              <span>Settings</span>
            </button>

            {/* Saved -> redirects to saved tab */}
            <button
              onClick={() => {
                onClose()
                router.push('/profile?tab=saved')
              }}
              className="w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl hover:bg-neutral-700/50 transition cursor-pointer text-left text-sm font-medium text-white"
            >
              <Bookmark size={20} className="text-white" />
              <span>Saved</span>
            </button>

            {/* Switch appearance -> opens sub-view */}
            <button
              onClick={() => setCurrentView('appearance')}
              className="w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl hover:bg-neutral-700/50 transition cursor-pointer text-left text-sm font-medium text-white"
            >
              <Moon size={20} className="text-white" />
              <span>Switch appearance</span>
            </button>
          </div>

          {/* Footer divider and Log out */}
          <div className="space-y-0.5 pt-1">
            <div className="border-t border-neutral-700/60 -mx-2 my-1" />

            <button
              onClick={() => {
                logout()
                router.push('/login')
                onClose()
              }}
              className="w-full flex items-center gap-3.5 px-3 py-2 rounded-xl hover:bg-neutral-700/50 transition cursor-pointer text-left text-sm font-medium text-white"
            >
              <LogOut size={18} className="text-white" />
              <span>Log out</span>
            </button>
          </div>
        </div>
      ) : (
        /* SWITCH APPEARANCE SUB-VIEW: Identical size (266px x 215px) */
        <div className="flex flex-col h-full justify-between">
          <div>
            {/* Top row: < Switch appearance (left) and Moon icon (right) */}
            <div className="flex items-center justify-between px-1 py-2 border-b border-neutral-700/60 -mx-2 mb-3">
              <button
                onClick={() => setCurrentView('main')}
                className="flex items-center gap-2 text-white hover:text-zinc-300 transition cursor-pointer font-semibold text-sm pl-2"
              >
                <ChevronLeft size={20} />
                <span>Switch appearance</span>
              </button>
              <Moon size={20} className="text-white mr-2.5" />
            </div>

            {/* Dark mode row with toggle switch */}
            <div
              onClick={toggleTheme}
              className="flex items-center justify-between px-3 py-3 rounded-xl hover:bg-neutral-700/40 transition cursor-pointer"
            >
              <span className="text-sm font-medium text-white">Dark mode</span>

              {/* iOS / Instagram style toggle switch (Image 3) */}
              <div
                className={`w-11 h-6 flex items-center rounded-full p-0.5 transition-colors duration-200 cursor-pointer ${
                  isDarkMode ? 'bg-white justify-end' : 'bg-neutral-600 justify-start'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full transition-transform duration-200 shadow-md ${
                    isDarkMode ? 'bg-black' : 'bg-white'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Placeholder for layout balance */}
          <div />
        </div>
      )}
    </div>
  )
}
