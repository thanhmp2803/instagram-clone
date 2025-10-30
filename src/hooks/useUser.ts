import { useContext } from 'react'
import { AuthContext } from '@context'
import { useLocalStorage } from '@hooks'

export interface IUser {
  id: string
  name: string
  email: string
  authToken?: string
}

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
