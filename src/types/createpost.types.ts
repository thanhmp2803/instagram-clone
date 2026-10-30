export type UploadStep = 'upload' | 'caption'

export interface UseCreatePostReturn {
  dragActive: boolean
  selectedFileUrl: string
  selectedFile?: File | null
  isVideo?: boolean
  step: UploadStep
  caption: string
  isUploading?: boolean
  setCaption: (caption: string) => void
  handleDrag: (e: React.DragEvent) => void
  handleDrop: (e: React.DragEvent) => void
  handleFileSelect: () => void
  handleGoBack: () => void
  handleNext: () => void
  handlePost: (onClose: () => void) => Promise<void> | void
}

export interface CreatePostProps {
  isOpen: boolean
  onClose: () => void
}
