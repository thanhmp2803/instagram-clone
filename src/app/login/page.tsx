'use client'

import { useAuth, useMounted } from '@hooks'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import Link from 'next/link'
import type { IUser } from '@types'
import { isSupabaseConfigured } from '@/utils/supabase/client'

export interface MockUserAccount {
  id: string
  name: string
  username: string
  email: string
  password: string
  avatar: string
  authToken: string
  roleDescription?: string
}

export const mockUsers: MockUserAccount[] = [
  {
    id: 'a0000000-0000-0000-0000-000000000005',
    name: 'Mai Phước Thành',
    username: 'pthanh2803',
    email: 'admin@gmail.com',
    password: 'Admin123@',
    avatar: '/images/conmeo.jpg',
    authToken: 'token_admin',
    roleDescription: 'Tài khoản chính',
  },
  {
    id: 'a0000000-0000-0000-0000-000000000001',
    name: 'Sarah Connor',
    username: 'creative_coder',
    email: 'sarah@gmail.com',
    password: 'Password123@',
    avatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    authToken: 'token_sarah',
    roleDescription: 'Frontend Dev',
  },
  {
    id: 'a0000000-0000-0000-0000-000000000003',
    name: 'Elena Rostova',
    username: 'chef_artisan',
    email: 'elena@gmail.com',
    password: 'Password123@',
    avatar:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    authToken: 'token_elena',
    roleDescription: 'Chef Baker',
  },
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
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    // Validate email format
    if (!EMAIL_REGEX.test(email)) {
      setError(t('login.error_email_format'))
      setIsSubmitting(false)
      return
    }

    try {
      // 1. Try Supabase Auth if configured
      if (isSupabaseConfigured()) {
        const result = await login(email, password)
        if (!result?.error) {
          router.push('/')
          return
        }

        // If Supabase auth failed (e.g. demo account not yet seeded in Supabase auth),
        // fallback to matching mock account
        const foundMock = mockUsers.find((u) => u.email === email && u.password === password)
        if (foundMock) {
          await login(foundMock)
          router.push('/')
          return
        }

        setError(result.error.message || t('login.error_invalid'))
        setIsSubmitting(false)
        return
      }

      // 2. Fallback to mock users
      let foundUser: IUser | undefined = mockUsers.find(
        (u) => u.email === email && u.password === password,
      )

      if (!foundUser) {
        const registeredUsers: (IUser & { password?: string })[] = JSON.parse(
          localStorage.getItem('users') || '[]',
        )
        foundUser = registeredUsers.find(
          (u) => u.email === email && u.password === password,
        )
      }

      if (foundUser) {
        await login(foundUser)
        router.push('/')
      } else {
        setError(t('login.error_invalid'))
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed'
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-black flex items-start justify-center p-4 mt-20 md:mt-2">
      <div className="w-full max-w-88">
        <div className="bg-black p-8 md:border md:border-neutral-800">
          <div className="text-center mb-8">
            <h1 className="text-5xl text-white mb-8 font-instagram">Instagram</h1>
          </div>
          <form onSubmit={handleSubmit} className="space-y-1.5">
            <input
              type="text"
              placeholder={t('login.email')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-2 py-2 bg-neutral-900 border border-neutral-700 rounded-sm text-white text-xs placeholder-gray-400 focus:outline-none focus:border-blue-500"
              required
            />
            <input
              type="password"
              placeholder={t('login.password')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-2 py-2 bg-neutral-900 border border-neutral-700 rounded-sm text-white text-xs placeholder-gray-400 focus:outline-none focus:border-blue-500"
              required
            />

            {error && <div className="text-red-500 text-sm text-center">{error}</div>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-blue-900 hover:bg-blue-600 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition cursor-pointer"
            >
              {isSubmitting ? '...' : t('login.login')}
            </button>
          </form>

          <div className="mt-4 text-center">
            <a href="#" className="text-sm text-white hover:underline">
              {t('login.forgot_password')}
            </a>
          </div>
        </div>

        {/* Quick Demo Accounts Selector */}
        <div className="mt-4 bg-black p-4 md:border md:border-neutral-800 rounded-sm">
          <p className="text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2.5">
            Tài khoản có sẵn (Bấm để điền nhanh):
          </p>
          <div className="space-y-2">
            {/* Primary Account: Mai Phước Thành */}
            {mockUsers.slice(0, 1).map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => {
                  setEmail(u.email)
                  setPassword(u.password)
                  setError('')
                }}
                className={`w-full p-2.5 rounded-md text-left border transition-all cursor-pointer flex items-center justify-between ${
                  email === u.email
                    ? 'bg-blue-950/60 border-blue-500 text-white'
                    : 'bg-zinc-900/90 border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white'
                }`}
              >
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>{u.name}</span>
                    <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.2 rounded font-normal">
                      Chính
                    </span>
                  </div>
                  <div className="text-[11px] text-zinc-400 font-mono">
                    @{u.username} • {u.email}
                  </div>
                </div>
              </button>
            ))}

            {/* Sample Accounts: Sarah & Elena */}
            <div className="grid grid-cols-2 gap-2">
              {mockUsers.slice(1).map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => {
                    setEmail(u.email)
                    setPassword(u.password)
                    setError('')
                  }}
                  className={`p-2 rounded-md text-left border transition-all cursor-pointer ${
                    email === u.email
                      ? 'bg-zinc-800 border-blue-500 text-white'
                      : 'bg-zinc-900/90 border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white'
                  }`}
                >
                  <div className="text-xs font-medium truncate">{u.name}</div>
                  <div className="text-[10px] text-zinc-400 truncate">@{u.username}</div>
                </button>
              ))}
            </div>
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
