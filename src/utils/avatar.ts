/**
 * Centralized Avatar Resolver for Instagram Clone
 * Ensures correct avatar pictures for all demo accounts and custom users
 */

export const DEFAULT_AVATAR = '/images/nonuser.png'
export const THANH_AVATAR = '/images/conmeo.jpg'
export const SARAH_AVATAR =
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
export const ELENA_AVATAR =
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'

/**
 * Returns the resolved avatar image URL based on username, email, or existing avatarUrl
 */
export function resolveAvatar(
  username?: string | null,
  email?: string | null,
  avatarUrl?: string | null,
): string {
  // If an explicit, non-default avatar URL is provided, respect it
  if (
    avatarUrl &&
    avatarUrl !== DEFAULT_AVATAR &&
    avatarUrl.trim() !== '' &&
    !avatarUrl.includes('nonuser')
  ) {
    return avatarUrl
  }

  const u = (username || '').toLowerCase().trim()
  const e = (email || '').toLowerCase().trim()

  // 1. Sarah Connor (@creative_coder / sarah@gmail.com)
  if (
    u === 'creative_coder' ||
    u === 'sarah' ||
    u.includes('sarah') ||
    u.includes('creative_coder') ||
    e === 'sarah@gmail.com' ||
    e.includes('sarah')
  ) {
    return SARAH_AVATAR
  }

  // 2. Elena Rostova (@chef_artisan / elena@gmail.com)
  if (
    u === 'chef_artisan' ||
    u === 'elena' ||
    u.includes('elena') ||
    u.includes('chef_artisan') ||
    e === 'elena@gmail.com' ||
    e.includes('elena')
  ) {
    return ELENA_AVATAR
  }

  // 3. Mai Phước Thành (@pthanh2803 / admin@gmail.com)
  if (
    u === 'pthanh2803' ||
    u === 'admin' ||
    u.includes('pthanh') ||
    e === 'admin@gmail.com' ||
    e.includes('pthanh')
  ) {
    return THANH_AVATAR
  }

  return avatarUrl || DEFAULT_AVATAR
}

/**
 * Helper to determine whether a message sender ID belongs to the current user,
 * taking into account Supabase Auth UUIDs, demo IDs, and usernames.
 */
export function isSenderCurrentUser(
  messageSenderId?: string | null,
  currentUserId?: string | null,
  currentUsername?: string | null,
): boolean {
  if (!messageSenderId) return false
  if (currentUserId && messageSenderId === currentUserId) return true

  const u = (currentUsername || '').toLowerCase().trim()
  const s = messageSenderId.toLowerCase().trim()

  if (s === u) return true

  // Thanh / Admin
  if (u === 'pthanh2803' || u === 'admin' || u.includes('thanh')) {
    if (
      s === 'user-thanh' ||
      s === 'current-user-1' ||
      s === 'pthanh2803' ||
      s === 'admin@gmail.com' ||
      s === 'a0000000-0000-0000-0000-000000000005'
    ) {
      return true
    }
  }

  // Sarah Connor
  if (u === 'creative_coder' || u === 'sarah' || u.includes('sarah')) {
    if (
      s === 'user-sarah' ||
      s === 'author-1' ||
      s === 'creative_coder' ||
      s === 'sarah@gmail.com' ||
      s === 'a0000000-0000-0000-0000-000000000001'
    ) {
      return true
    }
  }

  // Elena Rostova
  if (u === 'chef_artisan' || u === 'elena' || u.includes('elena')) {
    if (
      s === 'user-elena' ||
      s === 'author-5' ||
      s === 'chef_artisan' ||
      s === 'elena@gmail.com' ||
      s === 'a0000000-0000-0000-0000-000000000003'
    ) {
      return true
    }
  }

  return false
}
