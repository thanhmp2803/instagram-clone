'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useAuth } from './useAuth'
import { createClient, isSupabaseConfigured } from '@/utils/supabase/client'

const isValidUUID = (str?: string | null): boolean =>
  Boolean(str && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str))

export interface UseSaveOptions {
  postId?: string | number
}

export function useSave(initialOptions?: string | number | UseSaveOptions) {
  const { user } = useAuth()

  const postId = useMemo(() => {
    if (typeof initialOptions === 'string' || typeof initialOptions === 'number') {
      return String(initialOptions)
    }
    return initialOptions?.postId ? String(initialOptions.postId) : ''
  }, [initialOptions])

  const userKey = user?.username || user?.id || 'anon'
  const storageKey = useMemo(() => `instagram_bookmarks_${userKey}`, [userKey])

  // Initial state from localStorage
  const [isSaved, setIsSaved] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && postId) {
      try {
        const raw = localStorage.getItem(storageKey)
        if (raw) {
          const list: (string | number)[] = JSON.parse(raw)
          return list.some((id) => String(id) === postId)
        }
      } catch {}
    }
    return false
  })

  // Sync initial state from Supabase
  useEffect(() => {
    if (
      !postId ||
      !isSupabaseConfigured() ||
      !user?.id ||
      !isValidUUID(user.id) ||
      !isValidUUID(postId)
    ) {
      return
    }

    let isMounted = true
    const supabase = createClient()

    supabase
      .from('bookmarks')
      .select('post_id')
      .eq('user_id', user.id)
      .eq('post_id', postId)
      .maybeSingle()
      .then(({ data }) => {
        if (!isMounted) return
        if (data) {
          setIsSaved(true)
          if (typeof window !== 'undefined') {
            try {
              const raw = localStorage.getItem(storageKey)
              const list: string[] = raw ? JSON.parse(raw) : []
              if (!list.includes(postId)) {
                list.push(postId)
                localStorage.setItem(storageKey, JSON.stringify(list))
              }
            } catch {}
          }
        }
      })

    return () => {
      isMounted = false
    }
  }, [postId, storageKey, user?.id])

  // Toggle Save
  const toggleSave = useCallback(async () => {
    const nextSaved = !isSaved
    setIsSaved(nextSaved)

    // 1. Update localStorage
    if (typeof window !== 'undefined' && postId) {
      try {
        const raw = localStorage.getItem(storageKey)
        let list: string[] = raw ? JSON.parse(raw) : []
        if (nextSaved) {
          if (!list.includes(postId)) list.push(postId)
        } else {
          list = list.filter((id) => id !== postId)
        }
        localStorage.setItem(storageKey, JSON.stringify(list))
        window.dispatchEvent(new CustomEvent('instagram:bookmarks_updated'))
      } catch {}
    }

    // 2. Update Supabase
    if (isSupabaseConfigured() && user?.id && isValidUUID(user.id) && isValidUUID(postId)) {
      try {
        const supabase = createClient()
        if (nextSaved) {
          await supabase.from('bookmarks').insert({ user_id: user.id, post_id: postId })
        } else {
          await supabase.from('bookmarks').delete().match({ user_id: user.id, post_id: postId })
        }
      } catch (err) {
        console.warn('Supabase bookmark update notice:', err)
      }
    }
  }, [isSaved, postId, storageKey, user?.id])

  const saveButtonProps = {
    className: `cursor-pointer transition-colors ${
      isSaved ? 'text-white hover:text-gray-300' : 'hover:text-gray-400'
    }`,
    onClick: toggleSave,
    fill: isSaved ? 'currentColor' : 'none',
  }

  return {
    isSaved,
    toggleSave,
    saveButtonProps,
  }
}
