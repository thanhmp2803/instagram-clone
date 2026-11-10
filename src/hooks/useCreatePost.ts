import { useState, useEffect, useMemo } from 'react'
import { usePost, useAuth } from '@hooks'
import { createClient, isSupabaseConfigured } from '@/utils/supabase/client'
import { resolveAvatar } from '@/utils/avatar'
import type { UploadStep, UseCreatePostReturn } from '@types'

const isValidUUID = (str?: string | null): boolean =>
  Boolean(str && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str))

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

export function useCreatePost(): UseCreatePostReturn {
  const { addPost } = usePost()
  const { user } = useAuth()
  const [dragActive, setDragActive] = useState(false)
  const [selectedFileUrl, setSelectedFileUrl] = useState<string>('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [step, setStep] = useState<UploadStep>('upload')
  const [caption, setCaption] = useState('')
  const [isUploading, setIsUploading] = useState(false)

  const isVideo = useMemo(() => {
    if (!selectedFile) return false
    return (
      selectedFile.type.startsWith('video/') || /\.(mp4|webm|mov|m4v)$/i.test(selectedFile.name)
    )
  }, [selectedFile])

  // Cleanup URL when component unmounts or selectedFileUrl changes
  useEffect(() => {
    return () => {
      if (selectedFileUrl && selectedFileUrl.startsWith('blob:')) {
        URL.revokeObjectURL(selectedFileUrl)
      }
    }
  }, [selectedFileUrl])

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileUpload(files)
    }
  }

  const handleFileSelect = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*,video/*'
    input.multiple = false
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files
      if (files && files.length > 0) {
        handleFileUpload(Array.from(files))
      }
    }
    input.click()
  }

  const handleFileUpload = (files: File[]) => {
    const file = files[0]
    const url = URL.createObjectURL(file)
    setSelectedFileUrl(url)
    setSelectedFile(file)
  }

  const handleGoBack = () => {
    if (step === 'caption') {
      setStep('upload')
    } else if (selectedFileUrl) {
      if (selectedFileUrl.startsWith('blob:')) {
        URL.revokeObjectURL(selectedFileUrl)
      }
      setSelectedFileUrl('')
      setSelectedFile(null)
    }
  }

  const handleNext = () => {
    if (selectedFileUrl && step === 'upload') {
      setStep('caption')
    }
  }

  const cleanupAndReset = (onClose: () => void) => {
    if (selectedFileUrl && selectedFileUrl.startsWith('blob:')) {
      URL.revokeObjectURL(selectedFileUrl)
    }
    setSelectedFileUrl('')
    setSelectedFile(null)
    setStep('upload')
    setCaption('')
    onClose()
  }

  const handlePost = async (onClose: () => void) => {
    if (!selectedFile) return
    setIsUploading(true)

    const currentUsername = user?.username || user?.name || 'user'
    const currentAvatar = resolveAvatar(currentUsername, user?.email, user?.avatar)

    try {
      let finalMediaUrl = ''
      const base64Data = await fileToBase64(selectedFile)

      // 1. Try Supabase Storage upload
      if (isSupabaseConfigured() && user?.id && isValidUUID(user.id)) {
        const supabase = createClient()

        let effectiveUserId = user.id
        try {
          const { data: authData } = await supabase.auth.getUser()
          if (authData?.user?.id) {
            effectiveUserId = authData.user.id
          }
        } catch {}

        const fileExt = selectedFile.name.split('.').pop() || (isVideo ? 'mp4' : 'jpg')
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`
        const filePath = `${effectiveUserId}/${fileName}`

        // Choose bucket: 'reels' for videos if available, or 'posts'
        const primaryBucket = isVideo ? 'reels' : 'posts'

        try {
          let uploadSuccess = false
          const { error: uploadError } = await supabase.storage
            .from(primaryBucket)
            .upload(filePath, selectedFile, {
              cacheControl: '3600',
              upsert: false,
            })

          if (!uploadError) {
            const {
              data: { publicUrl },
            } = supabase.storage.from(primaryBucket).getPublicUrl(filePath)
            finalMediaUrl = publicUrl
            uploadSuccess = true
          } else if (isVideo) {
            // Try fallback 'posts' bucket if 'reels' bucket wasn't created yet
            const { error: fallbackErr } = await supabase.storage
              .from('posts')
              .upload(filePath, selectedFile, {
                cacheControl: '3600',
                upsert: false,
              })
            if (!fallbackErr) {
              const {
                data: { publicUrl },
              } = supabase.storage.from('posts').getPublicUrl(filePath)
              finalMediaUrl = publicUrl
              uploadSuccess = true
            }
          }

          if (!uploadSuccess) {
            finalMediaUrl = base64Data
          }
        } catch (storageErr) {
          console.warn('Storage upload exception (using base64 fallback):', storageErr)
          finalMediaUrl = base64Data
        }

        // Ensure profile exists in public.profiles table
        try {
          await supabase.from('profiles').upsert(
            {
              id: effectiveUserId,
              username: currentUsername,
              full_name: user?.name || currentUsername,
              avatar_url: currentAvatar,
            },
            { onConflict: 'id' },
          )
        } catch (profileErr) {
          console.warn('Profile upsert notice:', profileErr)
        }

        // 2. If it's a Video, insert into public.reels table!
        if (isVideo) {
          try {
            await supabase.from('reels').insert({
              user_id: effectiveUserId,
              video_url: finalMediaUrl,
              caption: caption.trim() || '',
              audio_title: `Original audio - ${currentUsername}`,
              audio_artist: currentUsername,
            })
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('instagram:new_reel'))
            }
          } catch (reelInsertErr) {
            console.warn('Failed to insert into public.reels:', reelInsertErr)
          }
        }

        // 3. Also insert into public.posts table so it appears in user profile and feed
        const { data: postData, error: insertError } = await supabase
          .from('posts')
          .insert({
            user_id: effectiveUserId,
            image_url: finalMediaUrl,
            caption: caption.trim() || '',
          })
          .select('id')
          .single()

        if (!insertError && postData) {
          addPost({
            id: postData.id,
            userId: effectiveUserId,
            username: currentUsername,
            avatar: currentAvatar,
            image: finalMediaUrl,
            caption: caption.trim() || '',
            likes: 0,
            comments: 0,
          })
          cleanupAndReset(onClose)
          return
        } else if (insertError) {
          console.warn('Supabase post insert notice:', insertError.message)
        }
      }

      // 4. Client-side fallback if Supabase insert was not completed
      const fallbackMedia = finalMediaUrl || base64Data
      addPost({
        id: `post_${Date.now()}`,
        userId: user?.id,
        username: currentUsername,
        avatar: currentAvatar,
        image: fallbackMedia,
        caption: caption.trim() || '',
        likes: 0,
        comments: 0,
      })

      cleanupAndReset(onClose)
    } catch (err) {
      console.error('Error posting media:', err)
      cleanupAndReset(onClose)
    } finally {
      setIsUploading(false)
    }
  }

  return {
    dragActive,
    selectedFileUrl,
    selectedFile,
    isVideo,
    step,
    caption,
    isUploading,
    setCaption,
    handleDrag,
    handleDrop,
    handleFileSelect,
    handleGoBack,
    handleNext,
    handlePost,
  }
}
