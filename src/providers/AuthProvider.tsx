'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import type { ReactNode } from 'react'
import type { IUser } from '@types'
import { AuthContext } from '@context'
import { createClient, isSupabaseConfigured } from '@/utils/supabase/client'

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const supabase = useMemo(() => createClient(), [])
  const isConfigured = useMemo(() => isSupabaseConfigured(), [])

  // Initial user is null to match server SSR render and avoid hydration mismatch
  const [user, setUser] = useState<IUser | null>(null)
  const [loading, setLoading] = useState(true)

  // Listen to Supabase auth state if configured, or load from localStorage on mount
  useEffect(() => {
    // 1. Initial check from localStorage on client
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser))
        } catch {
          localStorage.removeItem('user')
        }
      }
    }

    if (!isConfigured) {
      setLoading(false)
      return
    }

    let isMounted = true

    // 2. Get current session user from Supabase
    supabase.auth.getUser().then(({ data: { user: authUser } }) => {
      if (!isMounted) return
      if (authUser) {
        const metadata = authUser.user_metadata || {}
        const mappedUser: IUser = {
          id: authUser.id,
          email: authUser.email || '',
          name: metadata.full_name || metadata.name || 'Instagram User',
          username: metadata.username || (authUser.email ? authUser.email.split('@')[0] : 'user'),
          avatar: metadata.avatar_url || '/images/conmeo.jpg',
        }
        setUser(mappedUser)
      }
      setLoading(false)
    })

    // 3. Subscribe to auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!isMounted) return

      if (session?.user) {
        const authUser = session.user
        const metadata = authUser.user_metadata || {}
        const mappedUser: IUser = {
          id: authUser.id,
          email: authUser.email || '',
          name: metadata.full_name || metadata.name || 'Instagram User',
          username: metadata.username || (authUser.email ? authUser.email.split('@')[0] : 'user'),
          avatar: metadata.avatar_url || '/images/conmeo.jpg',
        }
        setUser(mappedUser)
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [supabase, isConfigured])

  // Login method supporting both Supabase credentials and mock user objects
  const login = useCallback(
    async (userOrEmail: IUser | string, password?: string) => {
      if (typeof userOrEmail === 'string' && password && isConfigured) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: userOrEmail,
          password,
        })
        if (error) {
          return { error }
        }
        if (data.user) {
          const metadata = data.user.user_metadata || {}
          const mappedUser: IUser = {
            id: data.user.id,
            email: data.user.email || '',
            name: metadata.full_name || metadata.name || 'Instagram User',
            username:
              metadata.username || (data.user.email ? data.user.email.split('@')[0] : 'user'),
            avatar: metadata.avatar_url || '/images/conmeo.jpg',
          }
          setUser(mappedUser)
        }
        return { error: null }
      }

      // Fallback for mock user object
      const mockUser = userOrEmail as IUser
      setUser(mockUser)
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(mockUser))
      }
      return { error: null }
    },
    [supabase, isConfigured],
  )

  // Sign up method with Supabase
  const signUp = useCallback(
    async (email: string, password: string, fullName: string, username: string) => {
      if (!isConfigured) {
        const newUser: IUser = {
          id: Date.now().toString(),
          email,
          name: fullName,
          username,
        }
        setUser(newUser)
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(newUser))
        }
        return { error: null }
      }

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            username,
            avatar_url: '/images/conmeo.jpg',
          },
        },
      })

      return { error }
    },
    [supabase, isConfigured],
  )

  // Logout method
  const logout = useCallback(async () => {
    if (isConfigured) {
      await supabase.auth.signOut()
    }
    setUser(null)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user')
    }
  }, [supabase, isConfigured])

  const contextValue = useMemo(
    () => ({ user, loading, setUser, login, signUp, logout }),
    [user, loading, login, signUp, logout],
  )

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}
