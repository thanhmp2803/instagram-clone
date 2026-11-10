'use client'
import { Profile } from '@components'
import { useAuth } from '@hooks'
import { useRouter } from 'next/navigation'
import { useEffect, Suspense } from 'react'
import { useTranslation } from 'react-i18next'
import { Loader } from 'lucide-react'

export default function ProfilePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { t } = useTranslation()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader className="w-6 h-6 animate-spin text-white" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">{t('login.redirect')}</div>
      </div>
    )
  }

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center">
          <Loader className="w-6 h-6 animate-spin text-white" />
        </div>
      }
    >
      <Profile />
    </Suspense>
  )
}
