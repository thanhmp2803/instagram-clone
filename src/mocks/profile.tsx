import { Grid3x3, Bookmark, UserSquare2, Camera } from 'lucide-react'

export const createProfileTabs = () => [
  { id: 'posts' as const, icon: Grid3x3 },
  { id: 'saved' as const, icon: Bookmark },
  { id: 'tagged' as const, icon: UserSquare2 },
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
