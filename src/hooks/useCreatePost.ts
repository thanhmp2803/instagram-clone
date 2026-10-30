import { useState, useEffect } from 'react'
import { usePost, useAuth } from '@hooks'
import { createClient, isSupabaseConfigured } from '@/utils/supabase/client'
import type { UploadStep, UseCreatePostReturn } from '@types'

export function useCreatePost(): UseCreatePostReturn {
  const { addPost } = usePost()
  const { user } = useAuth()
  const [dragActive, setDragActive] = useState(false)
  const [selectedFileUrl, setSelectedFileUrl] = useState<string>('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [step, setStep] = useState<UploadStep>('upload')
  const [caption, setCaption] = useState('')
  const [isUploading, setIsUploading] = useState(false)

  // Cleanup URL when component unmounts or selectedFileUrl changes
  useEffect(() => {
    return () => {
      if (selectedFileUrl) {
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
      URL.revokeObjectURL(selectedFileUrl)
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
    if (selectedFileUrl) {
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

    try {
      if (isSupabaseConfigured() && user?.id) {
        const supabase = createClient()
        const fileExt = selectedFile.name.split('.').pop() || 'jpg'
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`
        const filePath = `${user.id}/${fileName}`

        // Upload to Supabase Storage 'posts' bucket
        const { error: uploadError } = await supabase.storage
          .from('posts')
          .upload(filePath, selectedFile, {
            cacheControl: '3600',
            upsert: false,
          })

        if (!uploadError) {
          const {
            data: { publicUrl },
          } = supabase.storage.from('posts').getPublicUrl(filePath)

          // Insert into posts table
          const { data: postData, error: insertError } = await supabase
            .from('posts')
            .insert({
              user_id: user.id,
              image_url: publicUrl,
              caption: caption.trim() || '',
            })
            .select('id')
            .single()

          if (!insertError && postData) {
            addPost({
              id: postData.id,
              username: user.username || user.name || 'user',
              avatar: user.avatar || '/images/conmeo.jpg',
              image: publicUrl,
              caption: caption.trim() || '',
              likes: 0,
              comments: 0,
            })
            cleanupAndReset(onClose)
            return
          }
        }
      }

      // Fallback: Convert image to base64 for persistent storage
      const reader = new FileReader()
      reader.onload = () => {
        const base64Image = reader.result as string

        const newPost = {
          username: user?.username || user?.name || 'pthanh2803',
          avatar: user?.avatar || '/images/conmeo.jpg',
          image: base64Image,
          caption: caption.trim() || '',
          likes: 0,
          comments: 0,
        }

        addPost(newPost)
        cleanupAndReset(onClose)
      }

      reader.readAsDataURL(selectedFile)
    } catch (err) {
      console.error('Error posting:', err)
      cleanupAndReset(onClose)
    } finally {
      setIsUploading(false)
    }
  }

  return {
    dragActive,
    selectedFileUrl,
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
