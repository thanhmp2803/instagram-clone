'use client'
import { useMounted } from '@hooks'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import type { FormField, FormState } from '@types'
import Link from 'next/link'

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Password validation: at least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/

const formFields: FormField[] = [
  { id: 'email', type: 'email', placeholder: 'register.email' },
  { id: 'password', type: 'password', placeholder: 'register.password' },
  { id: 'fullName', type: 'text', placeholder: 'register.fullname' },
  { id: 'username', type: 'text', placeholder: 'register.username' },
]

export default function RegisterPage() {
  const mounted = useMounted()
  const { t } = useTranslation()
  const router = useRouter()
  const [formData, setFormData] = useState<FormState>({
    email: '',
    password: '',
    fullName: '',
    username: '',
  })
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validate full name
    if (formData.fullName.trim().length < 2) {
      setError(t('register.error_fullname'))
      return
    }

    // Validate email format
    if (!EMAIL_REGEX.test(formData.email)) {
      setError(t('register.error_email_format'))
      return
    }

    // Validate password strength
    if (!PASSWORD_REGEX.test(formData.password)) {
      setError(t('register.error_password_weak'))
      return
    }

    // Check if email already exists (mock check)
    const existingUsers = JSON.parse(localStorage.getItem('users') || '[]')
    if (existingUsers.some((u: { email: string }) => u.email === formData.email)) {
      setError(t('register.error_email_exists'))
      return
    }

    // Create new user object
    const newUser = {
      id: Date.now().toString(),
      name: formData.fullName,
      email: formData.email,
      password: formData.password,
      authToken: `token_${Date.now()}`,
    }

    // Save to temporary storage (will be saved permanently after birthday page)
    localStorage.setItem('tempUser', JSON.stringify(newUser))

    // Redirect to birthday page
    router.push('/register/birthday')
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-black flex items-start justify-center p-4 mt-27 md:mt-6">
      <div className="w-full max-w-88">
        <div className="bg-black p-8 md:border md:border-neutral-800">
          <div className="text-center mb-8">
            <h1 className="text-5xl text-white mb-2 font-instagram">Instagram</h1>
            <p className="text-gray-400 text-lg mt-4">{t('register.subtitle')}</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-1.5">
            {formFields.map((field) => (
              <input
                key={field.id}
                type={field.type}
                name={field.id}
                placeholder={t(field.placeholder)}
                value={formData[field.id]}
                onChange={handleInputChange}
                className="w-full px-2 py-2.5 bg-neutral-900 border border-neutral-700 rounded-sm text-white text-xs placeholder-gray-400 focus:outline-none focus:border-blue-500"
                required
              />
            ))}

            {error && <div className="text-red-500 text-sm text-center">{error}</div>}

            <p className="text-xs text-gray-400 text-center">
              {t('register.remind')}{' '}
              <span className="text-xs text-blue-600">{t('register.learnmore')}</span>
            </p>
            <p className="text-xs text-gray-400 text-center">
              {t('register.agree')}{' '}
              <span className="text-xs text-blue-600">{t('register.term')}</span>{' '}
              {t('register.and')}{' '}
              <span className="text-xs text-blue-600">{t('register.cookies')}</span> .
            </p>

            <button
              type="submit"
              className="w-full py-3 bg-blue-900 hover:bg-blue-600 text-gray-400 text-sm font-semibold rounded-lg transition cursor-pointer"
            >
              {t('register.register_button')}
            </button>
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
