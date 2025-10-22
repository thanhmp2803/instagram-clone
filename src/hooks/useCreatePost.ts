import { useState, useEffect } from 'react'
import { usePost } from '@hooks'
import type { UploadStep, UseCreatePostReturn } from '@types'

export function useCreatePost(): UseCreatePostReturn {
  const { addPost } = usePost()
  const [dragActive, setDragActive] = useState(false)
  const [selectedFileUrl, setSelectedFileUrl] = useState<string>('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [step, setStep] = useState<UploadStep>('upload')
  const [caption, setCaption] = useState('')

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

  const handlePost = (onClose: () => void) => {
    if (!selectedFile) return

    // Convert image to base64 for persistent storage
    const reader = new FileReader()
    reader.onload = () => {
      const base64Image = reader.result as string

      const newPost = {
        username: 'pthanh2803',
        avatar: '/images/conmeo.jpg',
        image: base64Image,
        caption: caption.trim() || '',
        likes: 0,
        comments: 0,
      }

      addPost(newPost)

      // Cleanup and reset
      if (selectedFileUrl) {
        URL.revokeObjectURL(selectedFileUrl)
      }
      setSelectedFileUrl('')
      setSelectedFile(null)
      setStep('upload')
      setCaption('')
      onClose()
    }

    reader.readAsDataURL(selectedFile)
  }

  return {
    dragActive,
    selectedFileUrl,
    step,
    caption,
    setCaption,
    handleDrag,
    handleDrop,
    handleFileSelect,
    handleGoBack,
    handleNext,
    handlePost,
  }
}
