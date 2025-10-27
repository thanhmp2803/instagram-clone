'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { Loader } from 'lucide-react'
import PostCard from './PostCard'
import { generatePostData } from '@mocks'
import type { Post } from '@types'
import { useTranslation } from 'react-i18next'

export const PostList: React.FC = () => {
  const { t } = useTranslation()
  const posts = generatePostData(t)

  const [visiblePosts, setVisiblePosts] = useState(posts.slice(0, 10))
  const [page, setPage] = useState(1)
  const loaderRef = useRef<HTMLDivElement | null>(null)

  const loadMore = useCallback(() => {
    const nextPosts = posts.slice(page * 10, (page + 1) * 10)
    if (nextPosts.length > 0) {
      setVisiblePosts((prev) => [...prev, ...nextPosts])
      setPage((prev) => prev + 1)
    }
  }, [posts, page])

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
      <div className="flex flex-col items-center py-6">
        {visiblePosts.map((post: Post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      <div ref={loaderRef} className="text-center py-6">
        {visiblePosts.length < posts.length ? (
          <div className="flex justify-center items-center">
            <Loader className="animate-spin h-6 w-6 text-gray-400" />
          </div>
        ) : (
          <span className="text-gray-400">{t('feed.end')}</span>
        )}
      </div>
    </>
  )
}
