import {
  Home,
  Search,
  Compass,
  Film,
  MessageCircle,
  Heart,
  PlusSquare,
  Menu,
  LayoutGrid,
} from 'lucide-react'
import type { ISidebarItem } from '@/types'
import type { TFunction } from 'i18next'

export const createSidebarItems = (t: TFunction<'translation', undefined>): ISidebarItem[] => [
  { icon: Home, label: t('sidebar.home'), path: '/' },
  { icon: Search, label: t('sidebar.search') },
  { icon: Compass, label: t('sidebar.explore'), path: '/explore' },
  { icon: Film, label: t('sidebar.reels'), path: '/reels' },
  { icon: MessageCircle, label: t('sidebar.messages'), path: '/messages' },
  { icon: Heart, label: t('sidebar.notifications') },
  { icon: PlusSquare, label: t('sidebar.create') },
  { icon: Menu, label: t('sidebar.more') },
  { icon: LayoutGrid, label: t('sidebar.also_from_meta') },
]
