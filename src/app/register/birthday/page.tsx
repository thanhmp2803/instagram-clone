'use client'
import { useAuth, useMounted } from '@hooks'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { Cake } from 'lucide-react'
import Link from 'next/link'

export default function BirthdayPage() {
  const mounted = useMounted()
  const { t } = useTranslation()
  const { login } = useAuth()
  const router = useRouter()
  const months = t('birthday.months', { returnObjects: true }) as string[]
  const [day, setDay] = useState('')
  const [month, setMonth] = useState('')
  const [year, setYear] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const yearNum = parseInt(year)

    // Validate year (must be at least 13 years old)
    const currentYear = new Date().getFullYear()
    if (yearNum < 1900 || yearNum > currentYear - 13) {
      setError(t('birthday.error_year'))
      return
    }

    // Get user data from localStorage that was saved during registration
    const tempUserData = JSON.parse(localStorage.getItem('tempUser') || '{}')

    if (tempUserData.email) {
      // Save user to users list
      const existingUsers = JSON.parse(localStorage.getItem('users') || '[]')
      existingUsers.push(tempUserData)
      localStorage.setItem('users', JSON.stringify(existingUsers))

      // Remove temp user data
      localStorage.removeItem('tempUser')

      // Auto login and redirect
      login(tempUserData)
      router.push('/')
    } else {
      // If no temp data, redirect to register
      router.push('/register')
    }
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-black flex items-start justify-center p-4 mt-20 md:mt-1">
      <div className="w-full max-w-88">
        <div className="bg-black py-2 px-7 md:border md:border-neutral-800">
          <div className="text-center mb-2">
            <Cake className="mx-auto text-white" size={95} />
            <p className="text-white text-sm mt-3 font-semibold">{t('birthday.title')}</p>
            <p className="text-white text-sm mt-1">{t('birthday.subtitle')}</p>
            <p className="text-blue-500 text-sm cursor-pointer">{t('birthday.why')}</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center justify-center gap-2">
              <select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-48 px-2 py-2.5 bg-neutral-900 border border-neutral-700 rounded-sm text-white text-xs placeholder-gray-400 focus:outline-none focus:border-blue-500"
                required
              >
                <option value="">{t('birthday.month')}</option>
                {Array.isArray(months) && months.length
                  ? months.map((m, idx) => (
                      <option key={idx} value={String(idx + 1)}>
                        {m}
                      </option>
                    ))
                  : Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={String(i + 1)}>
                        {i + 1}
                      </option>
                    ))}
              </select>

              <select
                value={day}
                onChange={(e) => setDay(e.target.value)}
                className="w-20 px-2 py-2 bg-neutral-900 border border-neutral-700 rounded-sm text-white text-xs placeholder-gray-400 focus:outline-none focus:border-blue-500"
                required
              >
                <option value="">{t('birthday.day')}</option>
                {Array.from({ length: 31 }, (_, i) => (
                  <option key={i + 1} value={String(i + 1)}>
                    {i + 1}
                  </option>
                ))}
              </select>

              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-28 px-2 py-2 bg-neutral-900 border border-neutral-700 rounded-sm text-white text-xs placeholder-gray-400 focus:outline-none focus:border-blue-500"
                required
              >
                <option value="">{t('birthday.year')}</option>
                {Array.from({ length: new Date().getFullYear() - 1899 }, (_, i) => {
                  const y = new Date().getFullYear() - i
                  return (
                    <option key={y} value={String(y)}>
                      {y}
                    </option>
                  )
                })}
              </select>
            </div>

            {error && <div className="text-red-500 text-sm text-center">{error}</div>}

            <p className="text-xs text-gray-400 text-center">{t('birthday.info')}</p>
            <p className="text-xs text-gray-400 text-center">{t('birthday.note')}</p>
            <button
              type="submit"
              className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition cursor-pointer"
            >
              {t('birthday.next_button')}
            </button>
            <div className="text-center mb-4">
              <Link
                href="/register"
                className="text-blue-500 hover:text-blue-400 text-sm font-semibold"
              >
                {t('birthday.back')}
              </Link>
            </div>
          </form>
        </div>

        <div className="mt-4 bg-black p-4 md:border md:border-neutral-800 text-center">
          <p className=" text-sm text-white">{t('register.have_account')}</p>
          <Link href="/login" className="text-blue-500 text-sm font-semibold hover:underline">
            {t('register.login')}
          </Link>
        </div>
      </div>
    </div>
  )
}
