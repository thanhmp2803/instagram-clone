'use client'
import { X, Image as ImageIcon, SquarePlay, ArrowLeft } from 'lucide-react'
import Image from 'next/image'
import { useCreatePost } from '@hooks'
import { useTranslation } from 'react-i18next'
import type { CreatePostProps } from '@types'

export function CreatePost({ isOpen, onClose }: CreatePostProps) {
  const { t } = useTranslation()
  const {
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
  } = useCreatePost()

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black/30 backdrop-blur-[2px] flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl w-full max-w-md mx-10 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-center p-3 bg-black relative h-14">
          {/* Back Button - Only show when image is selected */}
          {selectedFileUrl && (
            <button
              onClick={handleGoBack}
              className="absolute left-4 p-2 hover:bg-gray-800 rounded transition-colors text-white"
            >
              <ArrowLeft size={20} />
            </button>
          )}

          <h2 className="text-lg font-semibold text-white">{t('create_post.title')}</h2>

          <button
            onClick={
              step === 'caption'
                ? () => handlePost(onClose)
                : selectedFileUrl
                  ? handleNext
                  : onClose
            }
            className={`absolute right-4 p-2 rounded transition-colors ${
              selectedFileUrl
                ? 'text-blue-500 hover:text-blue-400 font-semibold'
                : 'hover:bg-gray-800 text-white'
            }`}
          >
            {step === 'caption' ? (
              <span className="text-sm">{t('create_post.post')}</span>
            ) : selectedFileUrl ? (
              <span className="text-sm">{t('create_post.next')}</span>
            ) : (
              <X size={20} />
            )}
          </button>
        </div>

        {/* Content */}
        <div className="h-96 relative">
          {selectedFileUrl ? (
            step === 'caption' ? (
              /* Caption Step */
              <div className="w-full h-full flex flex-col">
                {/* Image Preview */}
                <div className="flex-1 relative">
                  <Image src={selectedFileUrl} alt="Preview" fill className="object-cover" />
                </div>

                {/* Caption Input Section */}
                <div className="p-3 bg-zinc-800">
                  {/* User Info */}
                  <div className="flex items-center mb-3">
                    <Image
                      src="/images/conmeo.jpg"
                      alt="Profile"
                      width={32}
                      height={32}
                      className="w-7 h-7 rounded-full object-cover aspect-square"
                    />
                    <span className="ml-3 text-white font-semibold text-sm">pthanh2803</span>
                  </div>

                  {/* Caption Textarea */}
                  <textarea
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder={t('create_post.caption_placeholder')}
                    className="w-full h-10 resize-none border-none outline-none text-sm text-white placeholder-gray-400 bg-transparent"
                    maxLength={2200}
                  />
                </div>
              </div>
            ) : (
              /* Preview Image Only */
              <div className="w-full h-full relative">
                <Image src={selectedFileUrl} alt="Preview" fill className="object-cover" />
              </div>
            )
          ) : (
            /* Upload Zone */
            <div
              className={`h-full flex flex-col items-center justify-center text-center transition-colors ${
                dragActive ? 'bg-zinc-800' : 'bg-zinc-900 hover:bg-zinc-800'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {/* Icon */}
              <div className="flex items-center justify-center mb-4">
                <div className="relative">
                  <ImageIcon size={80} className="text-gray-300" />
                  <div className="absolute -bottom-2 -right-2 bg-gray-600 rounded-full p-1">
                    <SquarePlay size={30} />
                  </div>
                </div>
              </div>

              <p className="text-base text-white mb-4 font-normal">{t('create_post.drag_text')}</p>

              <button
                onClick={handleFileSelect}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg font-normal transition-colors cursor-pointer"
              >
                {t('create_post.select_button')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
