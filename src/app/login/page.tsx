'use client'
import { useAuth, useMounted } from '@hooks'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import Link from 'next/link'

const mockUsers = [
  { id: '1', name: 'Mai Phước Thành', email: 'admin@gmail.com', password: 'Admin123@' },
  { id: '2', name: 'User Test', email: 'user@gmail.com', password: 'User1234@' },
]

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function LoginPage() {
  const mounted = useMounted()
  const { t } = useTranslation()
  const { login } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validate email format
    if (!EMAIL_REGEX.test(email)) {
      setError(t('login.error_email_format'))
      return
    }

    // Check mock users first
    let foundUser = mockUsers.find((u) => u.email === email && u.password === password)

    // If not found in mock users, check registered users in localStorage
    if (!foundUser) {
      const registeredUsers = JSON.parse(localStorage.getItem('users') || '[]')
      foundUser = registeredUsers.find(
        (u: { email: string; password: string }) => u.email === email && u.password === password,
      )
    }

    if (foundUser) {
      login(foundUser)
      router.push('/')
    } else {
      setError(t('login.error_invalid'))
    }
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-black flex items-start justify-center p-4 mt-27 md:mt-6">
      <div className="w-full max-w-88">
        <div className="bg-black p-8 md:border md:border-neutral-800">
          <div className="text-center mb-8">
            <h1 className="text-5xl text-white mb-2 font-instagram">Instagram</h1>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              placeholder={t('login.email')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-2 py-1 bg-neutral-900 border border-neutral-700 rounded-sm text-white text-xs placeholder-gray-400 focus:outline-none focus:border-blue-500"
              required
            />
            <input
              type="password"
              placeholder={t('login.password')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-2 py-1 bg-neutral-900 border border-neutral-700 rounded-sm text-white text-xs placeholder-gray-400 focus:outline-none focus:border-blue-500"
              required
            />

            {error && <div className="text-red-500 text-sm text-center">{error}</div>}

            <button
              type="submit"
              className="w-full py-3 bg-blue-900 hover:bg-blue-600 text-white text-sm font-semibold rounded-lg transition cursor-pointer"
            >
              {t('login.login')}
            </button>
          </form>

          <div className="mt-4 text-center">
            <a href="#" className="text-sm text-white hover:underline">
              {t('login.forgot_password')}
            </a>
          </div>
        </div>

        <div className="mt-4 bg-black p-4 md:border md:border-neutral-800 text-center">
          <p className="text-sm text-gray-400">
            {t('login.no_account')}{' '}
            <Link href="/register" className="text-blue-500 font-semibold">
              {t('login.sign_up')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
