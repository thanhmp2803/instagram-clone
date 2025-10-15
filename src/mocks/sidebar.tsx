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

export const createSidebarItems = (): ISidebarItem[] => [
  { icon: Home, label: 'Home' },
  { icon: Search, label: 'Search' },
  { icon: Compass, label: 'Explore' },
  { icon: Film, label: 'Reels' },
  { icon: MessageCircle, label: 'Messages' },
  { icon: Heart, label: 'Notifications' },
  { icon: PlusSquare, label: 'Create' },
  { icon: Menu, label: 'More' },
  { icon: LayoutGrid, label: 'Also from Meta' },
]
