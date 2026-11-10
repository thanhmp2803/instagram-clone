'use client'

import { Plus, CheckCircle, type LucideIcon } from 'lucide-react'
import Image from 'next/image'
import { createProfileTabs, createProfileTabContents, getUserProfileData } from '@mocks'
import { useState, useMemo, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useMounted, useAuth, usePost } from '@hooks'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient, isSupabaseConfigured } from '@/utils/supabase/client'
import { formatRelativeTime } from '@/utils/formatTime'
import { resolveAvatar } from '@/utils/avatar'
import type { UserProfile } from '@types'
import { PostModal, type PostModalData } from './post/PostModal'
import { EditProfileModal } from './profile/EditProfileModal'
import { FollowListModal } from './profile/FollowListModal'
import {
  FOLLOWS_STORAGE_KEY,
  getLocalFollowRecords,
  saveLocalFollowRecords,
  isUserFollowing,
  getFollowersCount,
  getFollowingCount,
  FollowRecord,
} from '@/utils/follows'

interface _OldFollowRecord {
  follower: string
  following: string
}

interface ProfileItem {
  id: string | number
  imageUrl: string
  type: string
  caption?: string
  likes?: number
  comments?: number
  time?: string
}

interface ProfileProps {
  username?: string
}

const isValidUUID = (str?: string | null): boolean =>
  Boolean(str && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str))

export function Profile({ username }: ProfileProps) {
  const { t } = useTranslation()
  const mounted = useMounted()
  const { user: authUser } = useAuth()
  const { posts: allContextPosts } = usePost()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Target username to display
  const targetUsername = useMemo(() => {
    if (username) return username
    return authUser?.username || authUser?.name || 'user'
  }, [username, authUser])

  // Is viewing the logged-in user's own profile?
  const isOwnProfile = useMemo(() => {
    if (!username) return true
    if (!authUser) return false
    return (
      username.toLowerCase() === (authUser.username || '').toLowerCase() ||
      username.toLowerCase() === (authUser.id || '').toLowerCase() ||
      username.toLowerCase() === (authUser.email || '').toLowerCase()
    )
  }, [username, authUser])

  // Resolve base mock profile data (for demo accounts Sarah, Elena, Thanh)
  const baseData = useMemo(() => {
    return getUserProfileData(targetUsername)
  }, [targetUsername])

  const [profileUser, setProfileUser] = useState<UserProfile>(baseData.profile)
  const [profilePosts, setProfilePosts] = useState<ProfileItem[]>(baseData.posts)
  const [savedPosts, setSavedPosts] = useState<ProfileItem[]>([])
  const [isFollowing, setIsFollowing] = useState<boolean>(false)
  const [activeTab, setActiveTab] = useState<'posts' | 'saved' | 'tagged'>('posts')
  const [selectedPost, setSelectedPost] = useState<PostModalData | null>(null)

  // Modals state
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false)
  const [followModalConfig, setFollowModalConfig] = useState<{
    isOpen: boolean
    type: 'followers' | 'following'
  }>({
    isOpen: false,
    type: 'followers',
  })

  // Handle URL query parameters (?tab=saved, ?edit=true) safely after all states and isOwnProfile are defined
  useEffect(() => {
    if (!searchParams) return
    const tabParam = searchParams.get('tab')
    if (tabParam === 'saved' || tabParam === 'posts' || tabParam === 'tagged') {
      setActiveTab(tabParam)
    }
    const editParam = searchParams.get('edit')
    if (editParam === 'true' && isOwnProfile) {
      setIsEditProfileOpen(true)
    }
  }, [searchParams, isOwnProfile])

  // Check follow status and sync profile info from Supabase or LocalStorage
  const loadProfile = useCallback(async () => {
    let resolvedProfile: UserProfile = { ...baseData.profile }
    let resolvedPosts: ProfileItem[] = [...baseData.posts]
    const curAuthUsername = (authUser?.username || authUser?.name || 'pthanh2803').toLowerCase()
    let resolvedFollowing = isUserFollowing(curAuthUsername, targetUsername)
    const dynamicFollowers = getFollowersCount(targetUsername)
    const dynamicFollowing = getFollowingCount(targetUsername)

    // 1. Check local storage follow status
    if (false) {
      try {
        const rawFollows = localStorage.getItem(FOLLOWS_STORAGE_KEY)
        const follows: FollowRecord[] = rawFollows ? JSON.parse(rawFollows) : []
        const currentId = authUser.username || authUser.id
        resolvedFollowing = follows.some(
          (f) =>
            f.follower.toLowerCase() === currentId.toLowerCase() &&
            f.following.toLowerCase() === targetUsername.toLowerCase(),
        )
      } catch {}
    }

    // 2. Query Supabase if configured
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient()

        // Fetch profile
        const { data: profileRow } = await supabase
          .from('profiles')
          .select('id, username, full_name, avatar_url, bio, is_verified')
          .or(`username.eq.${targetUsername},id.eq.${targetUsername}`)
          .maybeSingle()

        if (profileRow) {
          // Count followers
          const { count: followersCount } = await supabase
            .from('follows')
            .select('*', { count: 'exact', head: true })
            .eq('following_id', profileRow.id)

          // Count following
          const { count: followingCount } = await supabase
            .from('follows')
            .select('*', { count: 'exact', head: true })
            .eq('follower_id', profileRow.id)

          // Count & fetch posts safely without nested join
          const { data: dbPosts } = await supabase
            .from('posts')
            .select('id, image_url, caption, created_at')
            .eq('user_id', profileRow.id)
            .order('created_at', { ascending: false })

          // Check if current authenticated user follows this profile
          if (authUser?.id && isValidUUID(authUser.id) && isValidUUID(profileRow.id)) {
            const { data: followCheck } = await supabase
              .from('follows')
              .select('follower_id')
              .eq('follower_id', authUser.id)
              .eq('following_id', profileRow.id)
              .maybeSingle()

            if (followCheck) {
              resolvedFollowing = true
            }
          }

          const resolvedAvatar = resolveAvatar(profileRow.username, null, profileRow.avatar_url)

          resolvedProfile = {
            id: profileRow.id,
            username: profileRow.username,
            fullName: profileRow.full_name || profileRow.username,
            avatar: resolvedAvatar,
            posts: dbPosts ? dbPosts.length : resolvedProfile.posts,
            followers: followersCount !== null ? followersCount : resolvedProfile.followers,
            following: followingCount !== null ? followingCount : resolvedProfile.following,
            bio: profileRow.bio ?? resolvedProfile.bio,
            isVerified: profileRow.is_verified ?? resolvedProfile.isVerified,
          }

          if (dbPosts && dbPosts.length > 0) {
            resolvedPosts = dbPosts.map((p) => ({
              id: p.id,
              imageUrl: p.image_url,
              type: 'post',
              caption: p.caption || '',
              likes: 0,
              comments: 0,
              time: formatRelativeTime(p.created_at),
            }))
          }
        }
      } catch (err) {
        console.error('Failed to load profile from Supabase:', err)
      }
    }

    // Merge context posts for current logged-in user
    const contextUserPosts = allContextPosts
      .filter(
        (p) =>
          p.username.toLowerCase() === targetUsername.toLowerCase() ||
          (p.userId && p.userId === resolvedProfile.id),
      )
      .map((p) => ({
        id: p.id,
        imageUrl: p.image,
        type: 'post',
        caption: p.caption || '',
        likes: p.likes ?? 0,
        comments: p.comments ?? 0,
        time: p.time,
      }))

    if (contextUserPosts.length > 0) {
      const mergedMap = new Map<string | number, ProfileItem>()
      contextUserPosts.forEach((p) => mergedMap.set(p.id, p))
      resolvedPosts.forEach((p) => mergedMap.set(p.id, p))
      resolvedPosts = Array.from(mergedMap.values())
      resolvedProfile.posts = resolvedPosts.length
    }

    resolvedProfile.followers =
      resolvedProfile.followers > 0 ? resolvedProfile.followers : dynamicFollowers
    resolvedProfile.following =
      resolvedProfile.following > 0 ? resolvedProfile.following : dynamicFollowing
    resolvedProfile.posts = resolvedPosts.length

    setProfileUser(resolvedProfile)
    setProfilePosts(resolvedPosts)
    setIsFollowing(resolvedFollowing)
  }, [baseData, targetUsername, authUser, allContextPosts])

  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  // Load Saved/Bookmarked posts for own profile
  const loadSavedPosts = useCallback(async () => {
    if (!isOwnProfile || !authUser) return

    const userKey = authUser.username || authUser.id || 'anon'
    const storageKey = `instagram_bookmarks_${userKey}`
    let savedIds: string[] = []

    // 1. Load from localStorage
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem(storageKey)
        if (raw) savedIds = JSON.parse(raw).map(String)
      } catch {}
    }

    // 2. Load from Supabase
    if (isSupabaseConfigured() && authUser.id && isValidUUID(authUser.id)) {
      try {
        const supabase = createClient()
        const { data: bRows } = await supabase
          .from('bookmarks')
          .select('post_id')
          .eq('user_id', authUser.id)

        if (bRows && bRows.length > 0) {
          const dbIds = bRows.map((r) => String(r.post_id))
          savedIds = Array.from(new Set([...savedIds, ...dbIds]))
        }
      } catch (err) {
        console.warn('Error loading bookmarks from Supabase:', err)
      }
    }

    if (savedIds.length === 0) {
      setSavedPosts([])
      return
    }

    // 3. Find matching posts from context posts
    const foundMap = new Map<string, ProfileItem>()

    allContextPosts.forEach((p) => {
      if (savedIds.includes(String(p.id))) {
        foundMap.set(String(p.id), {
          id: p.id,
          imageUrl: p.image,
          type: 'post',
          caption: p.caption,
          likes: p.likes,
          comments: p.comments,
          time: p.time,
        })
      }
    })

    // Fetch any missing posts from Supabase
    if (isSupabaseConfigured()) {
      const missingIds = savedIds.filter((id) => !foundMap.has(id) && isValidUUID(id))
      if (missingIds.length > 0) {
        try {
          const supabase = createClient()
          const { data: dbPosts } = await supabase
            .from('posts')
            .select('id, image_url, caption, created_at')
            .in('id', missingIds)

          dbPosts?.forEach((p) => {
            foundMap.set(String(p.id), {
              id: p.id,
              imageUrl: p.image_url,
              type: 'post',
              caption: p.caption || '',
              likes: 0,
              comments: 0,
              time: formatRelativeTime(p.created_at),
            })
          })
        } catch {}
      }
    }

    setSavedPosts(Array.from(foundMap.values()))
  }, [isOwnProfile, authUser, allContextPosts])

  useEffect(() => {
    if (activeTab === 'saved') {
      loadSavedPosts()
    }
  }, [activeTab, loadSavedPosts])

  // Listen for bookmark updates
  useEffect(() => {
    const handleBookmarkChange = () => {
      if (activeTab === 'saved') {
        loadSavedPosts()
      }
    }
    window.addEventListener('instagram:bookmarks_updated', handleBookmarkChange)
    return () => window.removeEventListener('instagram:bookmarks_updated', handleBookmarkChange)
  }, [activeTab, loadSavedPosts])

  // Listen for profile updates from EditProfileModal
  useEffect(() => {
    const handleProfileUpdated = (e: Event) => {
      const customEvent = e as CustomEvent<UserProfile>
      if (customEvent.detail) {
        setProfileUser((prev) => ({
          ...prev,
          ...customEvent.detail,
        }))
      }
    }
    window.addEventListener('instagram:profile_updated', handleProfileUpdated)
    return () => window.removeEventListener('instagram:profile_updated', handleProfileUpdated)
  }, [])

  // Listen for deleted posts
  useEffect(() => {
    const handlePostDeleted = (e: Event) => {
      const customEvent = e as CustomEvent<{ postId: string }>
      const delId = customEvent.detail?.postId
      if (!delId) return
      setProfilePosts((prev) => prev.filter((p) => String(p.id) !== delId))
      setSavedPosts((prev) => prev.filter((p) => String(p.id) !== delId))
      setProfileUser((prev) => ({
        ...prev,
        posts: Math.max(0, prev.posts - 1),
      }))
    }
    window.addEventListener('instagram:post_deleted', handlePostDeleted)
    return () => window.removeEventListener('instagram:post_deleted', handlePostDeleted)
  }, [])

  // Listen for follow updates
  useEffect(() => {
    const handleFollowChange = () => {
      loadProfile()
    }
    window.addEventListener('instagram:follow_updated', handleFollowChange)
    return () => window.removeEventListener('instagram:follow_updated', handleFollowChange)
  }, [loadProfile])

  // Toggle Follow / Unfollow
  const handleToggleFollow = useCallback(async () => {
    if (!authUser) {
      router.push('/login')
      return
    }

    const nextState = !isFollowing
    setIsFollowing(nextState)
    setProfileUser((prev) => ({
      ...prev,
      followers: nextState ? prev.followers + 1 : Math.max(0, prev.followers - 1),
    }))

    // Save to local storage
    if (typeof window !== 'undefined') {
      try {
        let follows = getLocalFollowRecords()
        const currentId = authUser.username || authUser.id

        if (nextState) {
          follows.push({ follower: currentId, following: targetUsername })

          // Send local notification to target user
          const notifStorageKey = `instagram_notifications_${targetUsername}`
          const rawNotifs = localStorage.getItem(notifStorageKey)
          const notifsList = rawNotifs ? JSON.parse(rawNotifs) : []
          notifsList.unshift({
            id: `notif_${Date.now()}`,
            actorId: authUser.id,
            actorUsername: authUser.username || authUser.name || 'user',
            actorAvatar: authUser.avatar || '/images/nonuser.png',
            actorFullName: authUser.name || '',
            type: 'follow',
            read: false,
            createdAt: new Date().toISOString(),
          })
          localStorage.setItem(notifStorageKey, JSON.stringify(notifsList.slice(0, 50)))
        } else {
          follows = follows.filter(
            (f) =>
              !(
                f.follower.toLowerCase() === currentId.toLowerCase() &&
                f.following.toLowerCase() === targetUsername.toLowerCase()
              ),
          )
        }
        saveLocalFollowRecords(follows)
      } catch {}
    }

    // Sync to Supabase
    if (isSupabaseConfigured() && authUser.id && isValidUUID(authUser.id)) {
      try {
        const supabase = createClient()
        const { data: targetData } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', targetUsername)
          .maybeSingle()

        if (targetData && isValidUUID(targetData.id)) {
          if (nextState) {
            await supabase.from('follows').insert({
              follower_id: authUser.id,
              following_id: targetData.id,
            })

            await supabase.from('notifications').insert({
              recipient_id: targetData.id,
              actor_id: authUser.id,
              type: 'follow',
            })
          } else {
            await supabase
              .from('follows')
              .delete()
              .match({ follower_id: authUser.id, following_id: targetData.id })
          }
        }
      } catch (e) {
        console.error('Failed to sync follow state to Supabase:', e)
      }
    }
  }, [authUser, isFollowing, targetUsername, router])

  // Direct Message to this user
  const handleSendMessage = useCallback(() => {
    router.push(`/messages?username=${encodeURIComponent(profileUser.username)}`)
  }, [profileUser.username, router])

  if (!mounted) {
    return null
  }

  const getTabData = () => {
    switch (activeTab) {
      case 'posts':
        return profilePosts
      case 'saved':
        return isOwnProfile ? savedPosts : []
      case 'tagged':
        return baseData.tagged
      default:
        return []
    }
  }

  const getItemHeight = () => {
    switch (activeTab) {
      case 'posts':
        return 'h-[189.78px] lg:h-[309px]'
      case 'saved':
        return 'h-[189.78px] lg:h-[309px]'
      case 'tagged':
        return 'h-[189.78px] lg:h-[309px]'
      default:
        return 'h-[189.78px] lg:h-[309px]'
    }
  }

  const renderEmptyState = (Icon: LucideIcon, message: string) => (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-16 h-16 rounded-full border-2 border-white flex items-center justify-center mb-4">
        <Icon size={32} />
      </div>
      <p className="text-sm text-gray-400 text-center">{message}</p>
    </div>
  )

  const renderGrid = () => {
    const data = getTabData()
    const heightClass = getItemHeight()

    if (data.length === 0) {
      const content = createProfileTabContents(t).find((c) => c.id === activeTab)
      if (content) {
        return renderEmptyState(content.icon, content.message)
      }
      return null
    }

    return (
      <div className="grid grid-cols-3 gap-0.5 lg:gap-1 w-full">
        {data.map((item) => (
          <div
            key={item.id}
            onClick={() => {
              setSelectedPost({
                id: item.id,
                imageUrl: item.imageUrl,
                caption: item.caption || '',
                username: profileUser.username,
                avatar: profileUser.avatar,
                likes: item.likes ?? 0,
                comments: item.comments ?? 0,
                time: item.time,
              })
            }}
            className={`relative w-full ${heightClass} bg-gray-800 cursor-pointer hover:opacity-90 transition-opacity overflow-hidden group`}
          >
            {item.imageUrl &&
            (/\.(mp4|webm|mov|m4v)(\?.*)?$/i.test(item.imageUrl) ||
              item.imageUrl.startsWith('data:video/')) ? (
              <video
                src={item.imageUrl}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <Image
                src={item.imageUrl}
                alt={`${item.type} ${item.id}`}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 33vw, 309px"
              />
            )}
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white font-semibold text-sm">
              <span>❤️ {item.likes ?? 0}</span>
              <span>💬 {item.comments ?? 0}</span>
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Available tabs: If viewing someone else, hide the 'saved' tab (private on Instagram)
  const tabs = createProfileTabs(t).filter((tab) => isOwnProfile || tab.id !== 'saved')

  return (
    <div className="min-h-screen bg-black text-white pb-20 lg:pb-0 overflow-x-hidden">
      {/* Header - Mobile */}
      <div className="sticky top-0 z-10 bg-black border-b border-gray-800 px-4 py-3 lg:hidden">
        <div className="flex items-center justify-center">
          <h1 className="text-lg font-semibold flex items-center gap-1.5">
            <span>{profileUser.username}</span>
            {profileUser.isVerified && (
              <CheckCircle className="w-4 h-4 fill-blue-500 text-black flex-shrink-0" />
            )}
          </h1>
        </div>
      </div>

      {/* Profile Info */}
      <div className="px-2 pt-10 lg:px-12 lg:pt-12 lg:max-w-4xl lg:mx-auto w-full">
        <div className="flex gap-4 mb-6 lg:gap-24 lg:mb-11">
          {/* Left: Avatar */}
          <div className="relative flex-shrink-0">
            <div
              onClick={() => {
                if (isOwnProfile) setIsEditProfileOpen(true)
              }}
              className={`w-20 h-20 lg:w-40 lg:h-40 rounded-full bg-gradient-to-tr from-gray-700 to-gray-800 flex items-center justify-center overflow-hidden border border-zinc-800 ${
                isOwnProfile ? 'cursor-pointer hover:opacity-90' : ''
              }`}
              title={isOwnProfile ? 'Chỉnh sửa ảnh đại diện' : undefined}
            >
              <Image
                src={profileUser.avatar}
                alt={profileUser.username}
                width={160}
                height={160}
                className="w-full h-full object-cover rounded-full"
                priority
              />
            </div>
          </div>

          {/* Right: Username and Actions */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col gap-3 mb-4 lg:flex-row lg:items-center lg:gap-6">
              <div className="flex items-center gap-2">
                <h1 className="text-lg lg:text-xl font-normal truncate">{profileUser.username}</h1>
                {profileUser.isVerified && (
                  <CheckCircle className="w-4 h-4 fill-blue-500 text-black flex-shrink-0" />
                )}
              </div>

              {/* Action Buttons: Own Profile vs Other User Profile */}
              <div className="flex gap-2 lg:flex-1">
                {isOwnProfile ? (
                  <>
                    <button
                      onClick={() => setIsEditProfileOpen(true)}
                      className="bg-neutral-800 hover:bg-neutral-700 text-white font-semibold py-1.5 px-6 rounded-lg text-sm transition cursor-pointer"
                    >
                      {t('profile.edit_profile')}
                    </button>
                    <button className="bg-neutral-800 hover:bg-neutral-700 text-white font-semibold py-1.5 px-6 rounded-lg text-sm transition cursor-pointer">
                      {t('profile.view_archive')}
                    </button>
                  </>
                ) : (
                  <>
                    {/* Follow / Following Button */}
                    <button
                      onClick={handleToggleFollow}
                      className={`font-semibold py-1.5 px-6 rounded-lg text-sm transition cursor-pointer ${
                        isFollowing
                          ? 'bg-neutral-800 hover:bg-neutral-700 text-white'
                          : 'bg-blue-600 hover:bg-blue-500 text-white'
                      }`}
                    >
                      {isFollowing ? 'Following' : 'Follow'}
                    </button>

                    {/* Direct Message Button */}
                    <button
                      onClick={handleSendMessage}
                      className="bg-neutral-800 hover:bg-neutral-700 text-white font-semibold py-1.5 px-6 rounded-lg text-sm transition cursor-pointer"
                    >
                      Message
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Desktop: Stats */}
            <div className="hidden lg:flex lg:gap-10 lg:mb-5 select-none">
              <div>
                <span className="font-semibold">{profileUser.posts}</span>
                <span className="text-gray-400 ml-1">{t('profile.posts')}</span>
              </div>
              <div
                onClick={() => setFollowModalConfig({ isOpen: true, type: 'followers' })}
                className="cursor-pointer hover:opacity-80 transition"
                title="Xem danh sách người theo dõi"
              >
                <span className="font-semibold">{profileUser.followers}</span>
                <span className="text-gray-400 ml-1">{t('profile.followers')}</span>
              </div>
              <div
                onClick={() => setFollowModalConfig({ isOpen: true, type: 'following' })}
                className="cursor-pointer hover:opacity-80 transition"
                title="Xem danh sách đang theo dõi"
              >
                <span className="font-semibold">{profileUser.following}</span>
                <span className="text-gray-400 ml-1">{t('profile.following')}</span>
              </div>
            </div>

            {/* Bio */}
            <div>
              <h2 className="font-semibold text-sm lg:text-base">{profileUser.fullName}</h2>
              {profileUser.bio && (
                <p className="text-sm text-gray-300 mt-1 whitespace-pre-line">{profileUser.bio}</p>
              )}
            </div>
          </div>
        </div>

        {/* Mobile: Stats */}
        <div className="flex justify-around py-3 border-t border-gray-800 lg:hidden text-center select-none">
          <div>
            <div className="font-semibold">{profileUser.posts}</div>
            <div className="text-xs text-gray-400">{t('profile.posts')}</div>
          </div>
          <div
            onClick={() => setFollowModalConfig({ isOpen: true, type: 'followers' })}
            className="cursor-pointer hover:opacity-80 transition"
          >
            <div className="font-semibold">{profileUser.followers}</div>
            <div className="text-xs text-gray-400">{t('profile.followers')}</div>
          </div>
          <div
            onClick={() => setFollowModalConfig({ isOpen: true, type: 'following' })}
            className="cursor-pointer hover:opacity-80 transition"
          >
            <div className="font-semibold">{profileUser.following}</div>
            <div className="text-xs text-gray-400">{t('profile.following')}</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex justify-around border-t border-gray-800 mt-6 lg:justify-center lg:gap-16">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'posts' | 'saved' | 'tagged')}
                className={`flex items-center gap-1.5 py-3 lg:py-4 -mt-px border-t transition-colors cursor-pointer ${
                  isActive
                    ? 'border-white text-white font-semibold'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                <Icon size={tab.size} />
                <span className="text-xs tracking-wider lg:text-xs font-semibold">{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Posts/Reels/Tagged/Saved Grid */}
        {renderGrid()}
      </div>

      {/* Post Modal */}
      <PostModal
        isOpen={!!selectedPost}
        onClose={() => setSelectedPost(null)}
        post={selectedPost}
      />

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        profile={profileUser}
        onProfileUpdated={(updated) => setProfileUser(updated)}
      />

      {/* Followers / Following List Modal */}
      <FollowListModal
        isOpen={followModalConfig.isOpen}
        onClose={() => setFollowModalConfig((prev) => ({ ...prev, isOpen: false }))}
        type={followModalConfig.type}
        profileId={profileUser.id}
        profileUsername={profileUser.username}
      />
    </div>
  )
}
