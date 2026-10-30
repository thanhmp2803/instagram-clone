'use client'

import { useState, useRef, useCallback } from 'react'
import Image from 'next/image'
import { X, Camera, Loader2, Check } from 'lucide-react'
import { createClient, isSupabaseConfigured } from '@/utils/supabase/client'
import { resolveAvatar } from '@/utils/avatar'
import type { UserProfile } from '@types'
import { useAuth } from '@hooks'

interface EditProfileModalProps {
  isOpen: boolean
  onClose: () => void
  profile: UserProfile
  onProfileUpdated: (updated: UserProfile) => void
}

const isValidUUID = (str?: string | null): boolean =>
  Boolean(str && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str))

export function EditProfileModal({
  isOpen,
  onClose,
  profile,
  onProfileUpdated,
}: EditProfileModalProps) {
  const { user } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [fullName, setFullName] = useState(profile.fullName || '')
  const [username, setUsername] = useState(profile.username || '')
  const [bio, setBio] = useState(profile.bio || '')
  const [avatarPreview, setAvatarPreview] = useState<string>(
    profile.avatar || '/images/nonuser.png',
  )
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // Handle avatar file selection
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Vui lòng chọn tệp hình ảnh (JPEG, PNG, WebP).')
      return
    }

    if (file.size > 8 * 1024 * 1024) {
      setErrorMessage('Kích thước ảnh tối đa là 8MB.')
      return
    }

    setErrorMessage('')
    setSelectedFile(file)
    const previewUrl = URL.createObjectURL(file)
    setAvatarPreview(previewUrl)
  }

  // Handle Save
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      const cleanUsername = username.trim().toLowerCase().replace(/\s+/g, '_')
      if (!cleanUsername) {
        setErrorMessage('Tên người dùng không được để trống.')
        return
      }

      setIsSaving(true)
      setErrorMessage('')
      setSuccessMessage('')

      try {
        let finalAvatarUrl = avatarPreview

        // 1. If user chose a new photo, upload to Supabase Storage
        if (selectedFile) {
          if (isSupabaseConfigured()) {
            try {
              const supabase = createClient()
              const fileExt = selectedFile.name.split('.').pop() || 'jpg'
              const fileName = `${cleanUsername}_${Date.now()}.${fileExt}`
              const filePath = `${fileName}`

              const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, selectedFile, { upsert: true })

              if (!uploadError) {
                const { data: publicUrlData } = supabase.storage
                  .from('avatars')
                  .getPublicUrl(filePath)

                if (publicUrlData?.publicUrl) {
                  finalAvatarUrl = publicUrlData.publicUrl
                }
              } else {
                console.warn('Avatar storage upload notice:', uploadError.message)
              }
            } catch (storageErr) {
              console.warn('Failed to upload to avatars bucket:', storageErr)
            }
          }

          // Fallback to base64 if storage didn't return public url
          if (finalAvatarUrl.startsWith('blob:')) {
            const base64: string = await new Promise((resolve) => {
              const reader = new FileReader()
              reader.onload = () => resolve(reader.result as string)
              reader.readAsDataURL(selectedFile)
            })
            finalAvatarUrl = base64
          }
        }

        const effectiveUserId =
          user?.id && isValidUUID(user.id) ? user.id : 'a0000000-0000-0000-0000-000000000005'

        // 2. Update Supabase public.profiles table
        if (isSupabaseConfigured()) {
          try {
            const supabase = createClient()
            await supabase.from('profiles').upsert(
              {
                id: effectiveUserId,
                username: cleanUsername,
                full_name: fullName.trim() || cleanUsername,
                bio: bio.trim(),
                avatar_url: finalAvatarUrl,
                updated_at: new Date().toISOString(),
              },
              { onConflict: 'id' },
            )
          } catch (dbErr) {
            console.error('Failed to update profile on Supabase:', dbErr)
          }
        }

        // 3. Update localStorage profile
        const updatedProfile: UserProfile = {
          ...profile,
          username: cleanUsername,
          fullName: fullName.trim() || cleanUsername,
          bio: bio.trim(),
          avatar: finalAvatarUrl,
        }

        if (typeof window !== 'undefined') {
          try {
            const userStoreKey = `instagram_user_${cleanUsername}`
            localStorage.setItem(userStoreKey, JSON.stringify(updatedProfile))

            // Sync with current user session
            const curRaw = localStorage.getItem('instagram_current_user')
            if (curRaw) {
              const cur = JSON.parse(curRaw)
              localStorage.setItem(
                'instagram_current_user',
                JSON.stringify({
                  ...cur,
                  username: cleanUsername,
                  name: fullName.trim(),
                  avatar: finalAvatarUrl,
                }),
              )
            }

            // Dispatch global event so sidebar, header, etc. update instantly
            window.dispatchEvent(
              new CustomEvent('instagram:profile_updated', {
                detail: updatedProfile,
              }),
            )
          } catch {}
        }

        onProfileUpdated(updatedProfile)
        setSuccessMessage('Đã cập nhật trang cá nhân thành công!')
        setTimeout(() => {
          onClose()
        }, 600)
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Có lỗi xảy ra khi lưu thông tin.'
        setErrorMessage(message)
      } finally {
        setIsSaving(false)
      }
    },
    [
      username,
      fullName,
      bio,
      avatarPreview,
      selectedFile,
      user?.id,
      profile,
      onProfileUpdated,
      onClose,
    ],
  )

  if (!isOpen) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
          <h2 className="text-lg font-bold text-white">Chỉnh sửa trang cá nhân</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-neutral-800 transition cursor-pointer"
            aria-label="Đóng"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Avatar Change Row */}
          <div className="flex items-center gap-5 p-3.5 bg-neutral-800/60 rounded-xl border border-neutral-750">
            <div className="relative w-16 h-16 rounded-full overflow-hidden bg-neutral-700 flex-shrink-0 border-2 border-neutral-700">
              <Image
                src={resolveAvatar(username, null, avatarPreview)}
                alt="Avatar preview"
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white text-sm truncate">{username}</p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-1 text-xs font-semibold text-blue-400 hover:text-blue-300 transition flex items-center gap-1.5 cursor-pointer"
              >
                <Camera size={14} />
                <span>Đổi ảnh đại diện</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>
          </div>

          {/* Full Name Input */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Tên hiển thị</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Tên của bạn"
              maxLength={50}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-neutral-500 transition"
            />
          </div>

          {/* Username Input */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
              Tên người dùng (Username)
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="username"
              maxLength={30}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-neutral-500 transition"
            />
            <p className="text-[11px] text-zinc-500 mt-1">
              Người khác có thể tìm thấy bạn qua tên người dùng này.
            </p>
          </div>

          {/* Bio Input */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
              Tiểu sử (Bio)
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Viết một vài dòng giới thiệu về bản thân..."
              rows={3}
              maxLength={150}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-neutral-500 transition resize-none"
            />
            <div className="flex justify-end text-[11px] text-zinc-500 mt-0.5">
              {bio.length}/150
            </div>
          </div>

          {/* Error / Success Feedback */}
          {errorMessage && (
            <div className="p-3 bg-red-950/60 border border-red-800/80 rounded-lg text-xs text-red-300">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-green-950/60 border border-green-800/80 rounded-lg text-xs text-green-300 flex items-center gap-2">
              <Check size={14} className="text-green-400" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-zinc-300 hover:text-white hover:bg-neutral-800 transition cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2 rounded-lg text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSaving && <Loader2 size={16} className="animate-spin" />}
              <span>{isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
