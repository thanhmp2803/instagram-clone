'use client'
import { createContext, useState, ReactNode, useCallback, useMemo } from 'react'
import { Post } from '@types'
import { useTranslation } from 'react-i18next'

interface PostContextType {
  posts: Post[]
  addPost: (newPost: Omit<Post, 'id' | 'time'>) => void
}

export const PostContext = createContext<PostContextType | undefined>(undefined)

interface PostProviderProps {
  children: ReactNode
}

export function PostProvider({ children }: PostProviderProps) {
  const [posts, setPosts] = useState<Post[]>([])
  const { t } = useTranslation()

  const addPost = useCallback(
    (newPost: Omit<Post, 'id' | 'time'>) => {
      const post: Post = {
        ...newPost,
        id: Date.now(),
        time: t('feed.time.just_now'),
      }

      setPosts((prevPosts) => [post, ...prevPosts])
    },
    [t],
  )

  const value = useMemo(() => ({ posts, addPost }), [posts, addPost])

  return <PostContext.Provider value={value}>{children}</PostContext.Provider>
}
