'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { Heart, MessageCircle, Compass, Film } from 'lucide-react'
import { createClient, isSupabaseConfigured } from '@/utils/supabase/client'
import { usePost } from '@hooks'
import { PostModal, type PostModalData } from '@/components/post/PostModal'
import { resolveAvatar } from '@/utils/avatar'
import { formatRelativeTime } from '@/utils/formatTime'

interface ExplorePost {
  id: string | number
  imageUrl: string
  caption: string
  likes: number
  comments: number
  username: string
  avatar: string
  time?: string
  created_at?: string
}

export default function ExplorePage() {
  const { posts: contextPosts } = usePost()
  const [posts, setPosts] = useState<ExplorePost[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedPost, setSelectedPost] = useState<PostModalData | null>(null)

  const fetchExplorePosts = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      if (contextPosts.length > 0) {
        setPosts(
          contextPosts.map((p) => ({
            id: p.id,
            imageUrl: p.image,
            caption: p.caption,
            likes: p.likes,
            comments: p.comments,
            username: p.username,
            avatar: p.avatar,
            time: p.time,
            created_at: p.created_at,
          })),
        )
      }
      return
    }

    try {
      setLoading(true)
      const supabase = createClient()

      // 1. Fetch posts directly
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select('id, user_id, image_url, caption, created_at')
        .order('created_at', { ascending: false })
        .limit(60)

      if (postsError || !postsData) {
        return
      }

      const postIds = postsData.map((p) => p.id)
      const userIds = Array.from(new Set(postsData.map((p) => p.user_id).filter(Boolean)))

      // 2. Fetch profiles
      const profilesMap = new Map<string, { username: string; avatar_url: string }>()
      if (userIds.length > 0) {
        const { data: profs } = await supabase
          .from('profiles')
          .select('id, username, avatar_url')
          .in('id', userIds)
        profs?.forEach((p) => profilesMap.set(p.id, p))
      }

      // 3. Fetch likes counts
      const likesMap = new Map<string, number>()
      if (postIds.length > 0) {
        const { data: likes } = await supabase
          .from('post_likes')
          .select('post_id')
          .in('post_id', postIds)
        likes?.forEach((l) => likesMap.set(l.post_id, (likesMap.get(l.post_id) || 0) + 1))
      }

      // 4. Fetch comments counts
      const commentsMap = new Map<string, number>()
      if (postIds.length > 0) {
        const { data: comments } = await supabase
          .from('post_comments')
          .select('post_id')
          .in('post_id', postIds)
        comments?.forEach((c) => commentsMap.set(c.post_id, (commentsMap.get(c.post_id) || 0) + 1))
      }

      const mapped: ExplorePost[] = postsData.map((p) => {
        const prof = profilesMap.get(p.user_id)
        const username = prof?.username || 'user'
        const avatar = resolveAvatar(username, null, prof?.avatar_url)

        return {
          id: p.id,
          imageUrl: p.image_url,
          caption: p.caption || '',
          likes: likesMap.get(p.id) ?? 0,
          comments: commentsMap.get(p.id) ?? 0,
          username,
          avatar,
          time: formatRelativeTime(p.created_at),
          created_at: p.created_at,
        }
      })

      // Merge with context posts if any were added client-side
      const allMap = new Map<string | number, ExplorePost>()
      contextPosts.forEach((cp) =>
        allMap.set(cp.id, {
          id: cp.id,
          imageUrl: cp.image,
          caption: cp.caption,
          likes: cp.likes,
          comments: cp.comments,
          username: cp.username,
          avatar: cp.avatar,
          time: cp.time,
          created_at: cp.created_at,
        }),
      )
      mapped.forEach((mp) => allMap.set(mp.id, mp))

      setPosts(Array.from(allMap.values()))
    } catch (err) {
      console.error('Failed to fetch explore posts:', err)
    } finally {
      setLoading(false)
    }
  }, [contextPosts])

  useEffect(() => {
    fetchExplorePosts()
  }, [fetchExplorePosts])

  return (
    <div className="min-h-screen bg-black text-white px-2 sm:px-4 md:px-8 py-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 px-1">
        <Compass className="w-7 h-7 text-white" />
        <h1 className="text-2xl font-bold tracking-tight">Khám phá</h1>
      </div>

      {/* Grid of posts */}
      {posts.length === 0 && !loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-center text-zinc-500">
          <Compass className="w-16 h-16 stroke-[1.2] mb-3 text-zinc-600" />
          <p className="text-base font-semibold text-zinc-300">Chưa có bài viết khám phá</p>
          <p className="text-sm mt-1">Các bài đăng mới từ mọi người sẽ xuất hiện ở đây.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-1 sm:gap-4 md:gap-6">
          {posts.map((post) => (
            <div
              key={post.id}
              onClick={() =>
                setSelectedPost({
                  id: post.id,
                  imageUrl: post.imageUrl,
                  caption: post.caption,
                  username: post.username,
                  avatar: post.avatar,
                  likes: post.likes,
                  comments: post.comments,
                  time: post.time,
                  created_at: post.created_at,
                })
              }
              className="relative aspect-square group cursor-pointer overflow-hidden rounded-md bg-zinc-900 border border-zinc-800"
            >
              {post.imageUrl &&
              (/\.(mp4|webm|mov|m4v)(\?.*)?$/i.test(post.imageUrl) ||
                post.imageUrl.startsWith('data:video/')) ? (
                <>
                  <video
                    src={post.imageUrl}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute top-2 right-2 z-10 text-white drop-shadow">
                    <Film className="w-4 h-4 fill-white" />
                  </div>
                </>
              ) : (
                <Image
                  src={post.imageUrl}
                  alt={post.caption || 'Explore post'}
                  fill
                  sizes="(max-width: 768px) 50vw, 33vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              )}

              {/* Hover overlay with likes and comments */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-6 text-white font-semibold text-base select-none">
                <div className="flex items-center gap-1.5">
                  <Heart className="w-6 h-6 fill-white" />
                  <span>{post.likes}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MessageCircle className="w-6 h-6 fill-white" />
                  <span>{post.comments}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Post Modal */}
      {selectedPost && (
        <PostModal
          isOpen={Boolean(selectedPost)}
          onClose={() => setSelectedPost(null)}
          post={selectedPost}
        />
      )}
    </div>
  )
}
