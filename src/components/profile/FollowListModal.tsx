'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import Image from 'next/image'
import { X, Search, Loader2, UserCheck, UserPlus } from 'lucide-react'
import { createClient, isSupabaseConfigured } from '@/utils/supabase/client'
import { resolveAvatar } from '@/utils/avatar'
import { useAuth } from '@hooks'
import { useRouter } from 'next/navigation'
import {
  getLocalFollowRecords,
  saveLocalFollowRecords,
  isUserFollowing,
  FollowRecord,
} from '@/utils/follows'

interface FollowUserItem {
  id: string
  username: string
  fullName: string
  avatar: string
  isVerified?: boolean
  isFollowing: boolean
}

interface FollowListModalProps {
  isOpen: boolean
  onClose: () => void
  type: 'followers' | 'following'
  profileId?: string
  profileUsername: string
}

const isValidUUID = (str?: string | null): boolean =>
  Boolean(str && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str))

const DEMO_ACCOUNTS_MAP: Record<
  string,
  { id: string; username: string; fullName: string; avatar: string; isVerified?: boolean }
> = {
  creative_coder: {
    id: 'a0000000-0000-0000-0000-000000000001',
    username: 'creative_coder',
    fullName: 'Sarah Connor',
    avatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    isVerified: true,
  },
  chef_artisan: {
    id: 'a0000000-0000-0000-0000-000000000003',
    username: 'chef_artisan',
    fullName: 'Elena Rostova',
    avatar:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    isVerified: false,
  },
  pthanh2803: {
    id: 'a0000000-0000-0000-0000-000000000005',
    username: 'pthanh2803',
    fullName: 'Mai Phước Thành',
    avatar: '/images/conmeo.jpg',
    isVerified: false,
  },
}

export function FollowListModal({
  isOpen,
  onClose,
  type,
  profileId,
  profileUsername,
}: FollowListModalProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<FollowUserItem[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [searchQuery, setSearchQuery] = useState<string>('')

  const currentUsername = (user?.username || user?.name || 'pthanh2803').toLowerCase()
  const targetUsername = (profileUsername || '').toLowerCase()
  const isOwnList = currentUsername === targetUsername

  const loadList = useCallback(async () => {
    if (!profileUsername) return
    setLoading(true)

    try {
      const result: FollowUserItem[] = []
      const localRecords = getLocalFollowRecords()

      // 1. Fetch from Supabase if configured
      if (isSupabaseConfigured()) {
        try {
          const supabase = createClient()
          let targetId = profileId
          if (!targetId || !isValidUUID(targetId)) {
            const { data: pData } = await supabase
              .from('profiles')
              .select('id')
              .eq('username', profileUsername)
              .maybeSingle()
            if (pData?.id) targetId = pData.id
          }

          if (targetId && isValidUUID(targetId)) {
            const isFollowers = type === 'followers'
            const query = supabase
              .from('follows')
              .select(isFollowers ? 'follower_id' : 'following_id')
              .eq(isFollowers ? 'following_id' : 'follower_id', targetId)

            const { data: followRows } = await query

            if (followRows && followRows.length > 0) {
              const userIds = followRows
                .map((r) =>
                  isFollowers
                    ? (r as { follower_id: string }).follower_id
                    : (r as { following_id: string }).following_id,
                )
                .filter(Boolean)

              if (userIds.length > 0) {
                const { data: profileRows } = await supabase
                  .from('profiles')
                  .select('id, username, full_name, avatar_url, is_verified')
                  .in('id', userIds)

                profileRows?.forEach((p) => {
                  const isFollowed =
                    (isOwnList && type === 'following') ||
                    isUserFollowing(currentUsername, p.username)

                  result.push({
                    id: p.id,
                    username: p.username,
                    fullName: p.full_name || p.username,
                    avatar: resolveAvatar(p.username, null, p.avatar_url),
                    isVerified: p.is_verified,
                    isFollowing: isFollowed,
                  })
                })
              }
            }
          }
        } catch (sbErr) {
          console.warn('Supabase follow list query notice:', sbErr)
        }
      }

      // 2. Fallback to local follow records if result is empty
      if (result.length === 0) {
        const matchedUsernames = new Set<string>()

        localRecords.forEach((r) => {
          const fFollower = r.follower.toLowerCase()
          const fFollowing = r.following.toLowerCase()

          if (type === 'followers') {
            // Find who follows targetUsername
            if (
              fFollowing === targetUsername ||
              (targetUsername === 'pthanh2803' &&
                (fFollowing === 'admin@gmail.com' ||
                  fFollowing === 'a0000000-0000-0000-0000-000000000005'))
            ) {
              if (fFollower !== targetUsername && fFollower !== 'admin@gmail.com') {
                matchedUsernames.add(fFollower)
              }
            }
          } else {
            // Find who targetUsername follows
            if (
              fFollower === targetUsername ||
              (targetUsername === 'pthanh2803' &&
                (fFollower === 'admin@gmail.com' ||
                  fFollower === 'a0000000-0000-0000-0000-000000000005'))
            ) {
              if (fFollowing !== targetUsername && fFollowing !== 'admin@gmail.com') {
                matchedUsernames.add(fFollowing)
              }
            }
          }
        })

        matchedUsernames.forEach((uName) => {
          let userDetail = DEMO_ACCOUNTS_MAP[uName]
          if (!userDetail) {
            // Check registered user in localStorage
            try {
              const regRaw = localStorage.getItem(`instagram_user_${uName}`)
              if (regRaw) {
                const reg = JSON.parse(regRaw)
                userDetail = {
                  id: reg.id || `user_${uName}`,
                  username: reg.username || uName,
                  fullName: reg.fullName || reg.name || uName,
                  avatar: reg.avatar || '/images/nonuser.png',
                  isVerified: false,
                }
              }
            } catch {}
          }

          if (userDetail) {
            const isFollowed =
              (isOwnList && type === 'following') ||
              isUserFollowing(currentUsername, userDetail.username)

            result.push({
              ...userDetail,
              isFollowing: isFollowed,
            })
          }
        })
      }

      setUsers(result)
    } catch (err) {
      console.error('Error loading follow list:', err)
    } finally {
      setLoading(false)
    }
  }, [profileUsername, profileId, type, currentUsername, targetUsername, isOwnList])

  useEffect(() => {
    if (isOpen) {
      loadList()
    }
  }, [isOpen, loadList])

  // Toggle follow action for a user row
  const handleToggleFollowRow = async (targetUser: FollowUserItem) => {
    const nextState = !targetUser.isFollowing

    setUsers((prev) =>
      prev.map((u) =>
        u.id === targetUser.id || u.username.toLowerCase() === targetUser.username.toLowerCase()
          ? { ...u, isFollowing: nextState }
          : u,
      ),
    )

    // 1. Update localStorage
    try {
      const currentList = getLocalFollowRecords()
      const targetName = targetUser.username.toLowerCase()
      let updatedList: FollowRecord[] = []

      if (nextState) {
        if (
          !currentList.some(
            (f) =>
              f.follower.toLowerCase() === currentUsername &&
              f.following.toLowerCase() === targetName,
          )
        ) {
          updatedList = [...currentList, { follower: currentUsername, following: targetName }]
        } else {
          updatedList = currentList
        }
      } else {
        updatedList = currentList.filter(
          (f) =>
            !(
              (f.follower.toLowerCase() === currentUsername ||
                (currentUsername === 'pthanh2803' &&
                  f.follower.toLowerCase() === 'admin@gmail.com')) &&
              (f.following.toLowerCase() === targetName ||
                (targetName === 'pthanh2803' && f.following.toLowerCase() === 'admin@gmail.com'))
            ),
        )
      }

      saveLocalFollowRecords(updatedList)
    } catch {}

    // 2. Update Supabase
    if (isSupabaseConfigured() && user?.id && isValidUUID(user.id)) {
      try {
        const supabase = createClient()
        let targetUUID = targetUser.id
        if (!isValidUUID(targetUUID)) {
          const { data: pData } = await supabase
            .from('profiles')
            .select('id')
            .eq('username', targetUser.username)
            .maybeSingle()
          if (pData?.id) targetUUID = pData.id
        }

        if (targetUUID && isValidUUID(targetUUID)) {
          if (nextState) {
            await supabase
              .from('follows')
              .insert({ follower_id: user.id, following_id: targetUUID })

            // Send follow notification
            await supabase.from('notifications').insert({
              recipient_id: targetUUID,
              actor_id: user.id,
              type: 'follow',
            })
          } else {
            await supabase
              .from('follows')
              .delete()
              .match({ follower_id: user.id, following_id: targetUUID })
          }
        }
      } catch (err) {
        console.error('Failed to sync follow state to Supabase:', err)
      }
    }
  }

  // Filtered users by search query
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users
    const q = searchQuery.toLowerCase().trim()
    return users.filter(
      (u) => u.username.toLowerCase().includes(q) || u.fullName.toLowerCase().includes(q),
    )
  }, [users, searchQuery])

  if (!isOpen) return null

  const modalTitle = type === 'followers' ? 'Người theo dõi' : 'Đang theo dõi'

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md h-[480px] max-h-[85vh] overflow-hidden shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-800">
          <div className="w-6" />
          <h2 className="text-base font-bold text-white text-center flex-1">{modalTitle}</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-neutral-800 transition cursor-pointer"
            aria-label="Đóng"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-3 border-b border-neutral-800/80">
          <div className="flex items-center gap-2 bg-neutral-800 px-3 py-1.5 rounded-lg">
            <Search size={16} className="text-zinc-400 flex-shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm..."
              className="bg-transparent text-sm text-white placeholder-zinc-500 outline-none w-full"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-zinc-400 hover:text-white">
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* User List */}
        <div className="flex-1 overflow-y-auto px-4 py-2 divide-y divide-neutral-800/40">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-zinc-400 gap-2">
              <Loader2 size={24} className="animate-spin text-zinc-500" />
              <span className="text-xs">Đang tải danh sách...</span>
            </div>
          ) : filteredUsers.length > 0 ? (
            filteredUsers.map((item) => {
              const isCurrentUser =
                user &&
                (user.username?.toLowerCase() === item.username.toLowerCase() ||
                  user.id === item.id)

              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-3 gap-3 hover:bg-neutral-800/30 px-2 rounded-xl transition"
                >
                  <div
                    onClick={() => {
                      router.push(`/profile/${item.username}`)
                      onClose()
                    }}
                    className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                  >
                    <div className="relative w-11 h-11 rounded-full overflow-hidden bg-neutral-700 flex-shrink-0 border border-neutral-700">
                      <Image src={item.avatar} alt={item.username} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="font-semibold text-white text-xs hover:underline truncate">
                          {item.username}
                        </span>
                        {item.isVerified && (
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        )}
                      </div>
                      <p className="text-zinc-400 text-xs truncate">{item.fullName}</p>
                    </div>
                  </div>

                  {/* Follow / Following Action Button (Hide if self) */}
                  {!isCurrentUser && (
                    <button
                      onClick={() => handleToggleFollowRow(item)}
                      className={`text-xs font-semibold py-1.5 px-3.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 flex-shrink-0 ${
                        item.isFollowing
                          ? 'bg-neutral-800 hover:bg-neutral-700 text-white'
                          : 'bg-blue-600 hover:bg-blue-500 text-white'
                      }`}
                    >
                      {item.isFollowing ? (
                        <>
                          <UserCheck size={14} />
                          <span>Đang theo dõi</span>
                        </>
                      ) : (
                        <>
                          <UserPlus size={14} />
                          <span>Theo dõi</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              )
            })
          ) : (
            <div className="py-20 text-center text-zinc-500 text-sm">
              {searchQuery ? 'Không tìm thấy người dùng phù hợp.' : 'Chưa có người dùng nào.'}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
