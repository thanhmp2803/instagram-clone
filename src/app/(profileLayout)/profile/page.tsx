'use client'
import { Profile } from '@components'
import { useAuth } from '@hooks'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

export default function ProfilePage() {
  const { user } = useAuth()
  const router = useRouter()
  const { t } = useTranslation()

  useEffect(() => {
    if (!user) {
      router.push('/login')
    }
  }, [user, router])

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">{t('login.redirect')}</div>
      </div>
    )
  }

  return <Profile />
}
