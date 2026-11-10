import { Grid3x3, Bookmark, UserSquare2, Camera } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface IProfileTab {
  id: 'posts' | 'saved' | 'tagged'
  icon: LucideIcon
  label: string
  size?: number
}

export const createProfileTabs = (t?: (key: string) => string): IProfileTab[] => [
  {
    id: 'posts',
    icon: Grid3x3,
    label: t ? (t('profile.posts') || 'POSTS').toUpperCase() : 'POSTS',
    size: 14,
  },
  {
    id: 'saved',
    icon: Bookmark,
    label:
      t && t('profile.saved') !== 'profile.saved'
        ? (t('profile.saved') || 'SAVED').toUpperCase()
        : 'SAVED',
    size: 14,
  },
  {
    id: 'tagged',
    icon: UserSquare2,
    label:
      t && t('profile.tagged') !== 'profile.tagged'
        ? (t('profile.tagged') || 'TAGGED').toUpperCase()
        : 'TAGGED',
    size: 14,
  },
]

export const createProfileTabContents = (t: (key: string) => string) => [
  {
    id: 'posts' as const,
    icon: Camera,
    message: t('profile.empty_posts'),
  },
  {
    id: 'saved' as const,
    icon: Bookmark,
    message: t('profile.empty_saved'),
  },
  {
    id: 'tagged' as const,
    icon: UserSquare2,
    message: t('profile.empty_tagged'),
  },
]
