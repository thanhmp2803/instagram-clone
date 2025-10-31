'use client'
import { useState } from 'react'
import type { ReactNode } from 'react'
import type { IUser } from '@types'
import { AuthContext } from '@context'

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Load user from localStorage immediately
  const [user, setUser] = useState<IUser | null>(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        try {
          return JSON.parse(storedUser)
        } catch (error) {
          console.error('Error parsing stored user:', error)
          localStorage.removeItem('user')
        }
      }
    }
    return null
  })

  const login = (user: IUser) => {
    setUser(user)
    localStorage.setItem('user', JSON.stringify(user))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
  }

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout }}>{children}</AuthContext.Provider>
  )
}
