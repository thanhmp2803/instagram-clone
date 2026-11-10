// Follows helper utility: Centralized store and helpers for follow relationships

export const FOLLOWS_STORAGE_KEY = 'instagram_follows_store'

export interface FollowRecord {
  follower: string
  following: string
}

// Initial seed follow records if localStorage is uninitialized:
// - Sarah Connor (@creative_coder) follows Mai Phước Thành (@pthanh2803)
// - Elena Rostova (@chef_artisan) follows Mai Phước Thành (@pthanh2803)
// - Mai Phước Thành (@pthanh2803) follows Sarah Connor (@creative_coder)
export const DEFAULT_FOLLOW_RECORDS: FollowRecord[] = [
  { follower: 'creative_coder', following: 'pthanh2803' },
  { follower: 'chef_artisan', following: 'pthanh2803' },
  { follower: 'pthanh2803', following: 'creative_coder' },
  { follower: 'admin@gmail.com', following: 'creative_coder' },
  {
    follower: 'a0000000-0000-0000-0000-000000000001',
    following: 'a0000000-0000-0000-0000-000000000005',
  },
  {
    follower: 'a0000000-0000-0000-0000-000000000003',
    following: 'a0000000-0000-0000-0000-000000000005',
  },
  {
    follower: 'a0000000-0000-0000-0000-000000000005',
    following: 'a0000000-0000-0000-0000-000000000001',
  },
]

export function getLocalFollowRecords(): FollowRecord[] {
  if (typeof window === 'undefined') return DEFAULT_FOLLOW_RECORDS
  try {
    const raw = localStorage.getItem(FOLLOWS_STORAGE_KEY)
    if (!raw) {
      localStorage.setItem(FOLLOWS_STORAGE_KEY, JSON.stringify(DEFAULT_FOLLOW_RECORDS))
      return DEFAULT_FOLLOW_RECORDS
    }
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed) && parsed.length > 0) return parsed

    // Re-seed if empty
    localStorage.setItem(FOLLOWS_STORAGE_KEY, JSON.stringify(DEFAULT_FOLLOW_RECORDS))
    return DEFAULT_FOLLOW_RECORDS
  } catch {
    return DEFAULT_FOLLOW_RECORDS
  }
}

export function saveLocalFollowRecords(records: FollowRecord[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(FOLLOWS_STORAGE_KEY, JSON.stringify(records))
    window.dispatchEvent(new CustomEvent('instagram:follow_updated'))
  } catch {}
}

export function isUserFollowing(
  followerIdOrUsername?: string | null,
  targetIdOrUsername?: string | null,
): boolean {
  if (!followerIdOrUsername || !targetIdOrUsername) return false
  const records = getLocalFollowRecords()
  const follower = followerIdOrUsername.toLowerCase()
  const target = targetIdOrUsername.toLowerCase()

  return records.some(
    (r) =>
      (r.follower.toLowerCase() === follower ||
        (follower === 'pthanh2803' && r.follower.toLowerCase() === 'admin@gmail.com') ||
        (follower === 'admin@gmail.com' && r.follower.toLowerCase() === 'pthanh2803') ||
        (follower === 'pthanh2803' && r.follower === 'a0000000-0000-0000-0000-000000000005') ||
        (follower === 'creative_coder' && r.follower === 'a0000000-0000-0000-0000-000000000001') ||
        (follower === 'chef_artisan' && r.follower === 'a0000000-0000-0000-0000-000000000003')) &&
      (r.following.toLowerCase() === target ||
        (target === 'pthanh2803' && r.following.toLowerCase() === 'admin@gmail.com') ||
        (target === 'pthanh2803' && r.following === 'a0000000-0000-0000-0000-000000000005') ||
        (target === 'creative_coder' && r.following === 'a0000000-0000-0000-0000-000000000001') ||
        (target === 'chef_artisan' && r.following === 'a0000000-0000-0000-0000-000000000003')),
  )
}

export function getFollowersCount(username?: string | null): number {
  if (!username) return 0
  const records = getLocalFollowRecords()
  const u = username.toLowerCase()
  const set = new Set<string>()

  records.forEach((r) => {
    const following = r.following.toLowerCase()
    if (
      following === u ||
      (u === 'pthanh2803' &&
        (following === 'admin@gmail.com' ||
          following === 'a0000000-0000-0000-0000-000000000005')) ||
      (u === 'creative_coder' && following === 'a0000000-0000-0000-0000-000000000001') ||
      (u === 'chef_artisan' && following === 'a0000000-0000-0000-0000-000000000003')
    ) {
      set.add(r.follower.toLowerCase())
    }
  })

  return set.size
}

export function getFollowingCount(username?: string | null): number {
  if (!username) return 0
  const records = getLocalFollowRecords()
  const u = username.toLowerCase()
  const set = new Set<string>()

  records.forEach((r) => {
    const follower = r.follower.toLowerCase()
    if (
      follower === u ||
      (u === 'pthanh2803' &&
        (follower === 'admin@gmail.com' || follower === 'a0000000-0000-0000-0000-000000000005')) ||
      (u === 'creative_coder' && follower === 'a0000000-0000-0000-0000-000000000001') ||
      (u === 'chef_artisan' && follower === 'a0000000-0000-0000-0000-000000000003')
    ) {
      set.add(r.following.toLowerCase())
    }
  })

  return set.size
}
