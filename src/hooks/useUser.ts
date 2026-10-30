import { useContext } from 'react'
import { AuthContext } from '@context'
import { useLocalStorage } from '@hooks'
import type { IUser } from '@types'

export type { IUser }

export const useUser = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useUser must be used within an AuthProvider')
  }

  const { user, setUser } = context
  const { setItem, removeItem } = useLocalStorage()

  const addUser = (user: IUser) => {
    setUser(user)
    setItem('user', JSON.stringify(user))
  }
  const removeUser = () => {
    setUser(null)
    removeItem('user')
  }

  return { user, addUser, removeUser, setUser }
}
