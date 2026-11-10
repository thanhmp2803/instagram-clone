'use client'

import { MoreMenu } from './sidebar/MoreMenu'

export { MoreMenu }

interface ProfileDropdownProps {
  isOpen: boolean
  onClose: () => void
  username?: string
  position?: 'sidebar' | 'bottom'
}

export function ProfileDropdown({ isOpen, onClose }: ProfileDropdownProps) {
  return <MoreMenu isOpen={isOpen} onClose={onClose} />
}
