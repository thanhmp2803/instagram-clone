'use client'
import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { Loader } from 'lucide-react'
import PostCard from './PostCard'
import { generatePostData } from '@mocks'
import type { Post } from '@types'
import { useTranslation } from 'react-i18next'
import { useMounted, useSearch } from '@hooks'

// Skeleton component for post loading
const PostSkeleton = () => (
  <div className="bg-black text-white border border-gray-800 rounded-lg mb-4 sm:mb-6 w-full max-w-[468px] mx-auto animate-pulse">
    {/* Header skeleton */}
    <div className="flex items-center justify-between p-2 sm:p-3">
      <div className="flex items-center">
        <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
        <div className="ml-3">
          <div className="w-24 h-4 bg-gray-700 rounded mb-1"></div>
          <div className="w-16 h-3 bg-gray-700 rounded"></div>
        </div>
      </div>
      <div className="w-4 h-4 bg-gray-700 rounded"></div>
    </div>

    {/* Image skeleton */}
    <div className="w-full sm:h-[400px] md:h-[585px] bg-gray-700"></div>

    {/* Actions skeleton */}
    <div className="flex items-center justify-between px-2 sm:px-3 py-2">
      <div className="flex space-x-2 sm:space-x-3">
        <div className="w-6 h-6 bg-gray-700 rounded"></div>
        <div className="w-6 h-6 bg-gray-700 rounded"></div>
        <div className="w-6 h-6 bg-gray-700 rounded"></div>
      </div>
      <div className="w-6 h-6 bg-gray-700 rounded"></div>
    </div>

    {/* Content skeleton */}
    <div className="px-2 sm:px-3 pb-2 sm:pb-3">
      <div className="w-20 h-4 bg-gray-700 rounded mb-2"></div>
      <div className="w-full h-4 bg-gray-700 rounded mb-1"></div>
      <div className="w-3/4 h-4 bg-gray-700 rounded mb-2"></div>
      <div className="w-32 h-3 bg-gray-700 rounded"></div>
    </div>
  </div>
)

const PostListInner: React.FC<{
  posts: Post[]
  t: (key: string, options?: { count?: number }) => string
  searchTerm: string
}> = ({ posts, t, searchTerm }) => {
  // Filter posts based on search term
  const filteredPosts = useMemo(() => {
    if (!searchTerm.trim()) return posts

    return posts.filter(
      (post) =>
        post.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.caption.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }, [posts, searchTerm])

  const [visiblePosts, setVisiblePosts] = useState(() => filteredPosts.slice(0, 10))
  const [page, setPage] = useState(1)
  const loaderRef = useRef<HTMLDivElement | null>(null)

  const loadMore = useCallback(() => {
    const nextPosts = filteredPosts.slice(page * 10, (page + 1) * 10)
    if (nextPosts.length > 0) {
      setVisiblePosts((prev) => [...prev, ...nextPosts])
      setPage((prev) => prev + 1)
    }
  }, [filteredPosts, page])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore()
        }
      },
      { threshold: 1 },
    )

    if (loaderRef.current) observer.observe(loaderRef.current)
    return () => observer.disconnect()
  }, [loadMore])

  return (
    <>
      <div className="flex flex-col items-center w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl mx-auto px-2 sm:px-4">
        {filteredPosts.length === 0 && searchTerm.trim() ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-lg mb-2">{t('search.no_results')}</p>
            <p className="text-sm">{t('search.try_different')}</p>
          </div>
        ) : (
          visiblePosts.map((post: Post) => (
            <div key={post.id} className="w-full mb-4 sm:mb-6">
              <PostCard post={post} />
            </div>
          ))
        )}
      </div>

      {filteredPosts.length > 0 && (
        <div ref={loaderRef} className="text-center py-6">
          {visiblePosts.length < filteredPosts.length ? (
            <div className="flex justify-center items-center">
              <Loader className="animate-spin h-6 w-6 text-gray-400" />
            </div>
          ) : (
            <span className="text-gray-400">{t('feed.end')}</span>
          )}
        </div>
      )}
    </>
  )
}

export const PostList: React.FC = () => {
  const { t, ready, i18n } = useTranslation()
  const mounted = useMounted()
  const { searchTerm } = useSearch()

  // Memoize posts generation
  const posts = useMemo(() => {
    return mounted && ready ? generatePostData(t) : []
  }, [mounted, ready, t])

  // Show skeleton loading while not ready
  if (!mounted || !ready || posts.length === 0) {
    return (
      <div className="flex flex-col items-center w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl mx-auto px-2 sm:px-4">
        {Array(3)
          .fill(0)
          .map((_, index) => (
            <PostSkeleton key={index} />
          ))}
      </div>
    )
  }

  // Use key to force re-render when language or search changes
  return (
    <PostListInner
      key={`${mounted}-${ready}-${i18n.language}-${searchTerm}`}
      posts={posts}
      t={t}
      searchTerm={searchTerm}
    />
  )
}
