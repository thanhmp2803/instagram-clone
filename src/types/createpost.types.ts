export type UploadStep = 'upload' | 'caption'

export interface UseCreatePostReturn {
  dragActive: boolean
  selectedFileUrl: string
  step: UploadStep
  caption: string
  setCaption: (caption: string) => void
  handleDrag: (e: React.DragEvent) => void
  handleDrop: (e: React.DragEvent) => void
  handleFileSelect: () => void
  handleGoBack: () => void
  handleNext: () => void
  handlePost: (onClose: () => void) => void
}

export interface CreatePostProps {
  isOpen: boolean
  onClose: () => void
}
