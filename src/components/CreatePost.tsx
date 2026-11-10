'use client'

import { X, Image as ImageIcon, SquarePlay, ArrowLeft, Film } from 'lucide-react'
import Image from 'next/image'
import { useCreatePost, useAuth } from '@hooks'
import { useTranslation } from 'react-i18next'
import { resolveAvatar } from '@/utils/avatar'
import type { CreatePostProps } from '@types'

export function CreatePost({ isOpen, onClose }: CreatePostProps) {
  const { t } = useTranslation()
  const { user } = useAuth()
  const {
    dragActive,
    selectedFileUrl,
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
  } = useCreatePost()

  if (!isOpen) return null

  const currentUsername = user?.username || user?.name || 'user'
  const currentAvatar = resolveAvatar(currentUsername, user?.email, user?.avatar)

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-zinc-950 border-b border-zinc-800 relative h-14">
          {/* Back Button - Only show when file is selected */}
          {selectedFileUrl ? (
            <button
              onClick={handleGoBack}
              disabled={isUploading}
              aria-label="Back"
              className="p-1.5 hover:bg-zinc-800 rounded-full transition-colors text-white disabled:opacity-50 cursor-pointer"
            >
              <ArrowLeft size={20} />
            </button>
          ) : (
            <div className="w-8" />
          )}

          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-white">
              {isVideo ? 'Tạo Reel mới' : t('create_post.title')}
            </h2>
            {isVideo && (
              <span className="flex items-center gap-1 bg-gradient-to-r from-purple-600 to-pink-600 text-[10px] font-bold px-2 py-0.5 rounded-full text-white shadow-sm">
                <Film size={12} />
                Reel
              </span>
            )}
          </div>

          <button
            onClick={
              step === 'caption'
                ? () => handlePost(onClose)
                : selectedFileUrl
                  ? handleNext
                  : onClose
            }
            disabled={isUploading}
            className={`p-1.5 rounded-lg transition-colors disabled:opacity-50 cursor-pointer ${
              selectedFileUrl
                ? 'text-blue-500 hover:text-blue-400 font-semibold text-sm'
                : 'hover:bg-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            {step === 'caption' ? (
              <span>{isUploading ? 'Đang tải...' : t('create_post.post')}</span>
            ) : selectedFileUrl ? (
              <span>{t('create_post.next')}</span>
            ) : (
              <X size={20} />
            )}
          </button>
        </div>

        {/* Content */}
        <div className="h-[420px] relative bg-black">
          {selectedFileUrl ? (
            step === 'caption' ? (
              /* Caption Step */
              <div className="w-full h-full flex flex-col sm:flex-row">
                {/* Media Preview (Video or Image) */}
                <div className="sm:w-3/5 h-64 sm:h-full relative bg-zinc-950 flex items-center justify-center overflow-hidden border-b sm:border-b-0 sm:border-r border-zinc-800">
                  {isVideo ? (
                    <video
                      src={selectedFileUrl}
                      autoPlay
                      loop
                      muted
                      playsInline
                      controls
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <Image src={selectedFileUrl} alt="Preview" fill className="object-contain" />
                  )}
                </div>

                {/* Caption Input Section */}
                <div className="sm:w-2/5 p-4 bg-zinc-900 flex flex-col justify-between">
                  <div>
                    {/* User Info */}
                    <div className="flex items-center mb-3">
                      <Image
                        src={currentAvatar}
                        alt="Profile"
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-full object-cover aspect-square border border-zinc-700"
                      />
                      <span className="ml-2.5 text-white font-semibold text-sm">
                        {currentUsername}
                      </span>
                    </div>

                    {/* Caption Textarea */}
                    <textarea
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                      placeholder={
                        isVideo
                          ? 'Viết chú thích cho Reel của bạn... #reel #viral'
                          : t('create_post.caption_placeholder')
                      }
                      disabled={isUploading}
                      className="w-full h-36 resize-none border-none outline-none text-sm text-white placeholder-zinc-500 bg-transparent"
                      maxLength={2200}
                    />
                  </div>

                  {isVideo && (
                    <div className="text-[11px] text-zinc-400 bg-zinc-800/60 p-2.5 rounded-lg border border-zinc-700/50">
                      ✨ Video này sẽ tự động xuất hiện trong mục <strong>Reels</strong> và trên
                      trang cá nhân của bạn.
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Preview Media Only */
              <div className="w-full h-full relative flex items-center justify-center bg-black">
                {isVideo ? (
                  <video
                    src={selectedFileUrl}
                    autoPlay
                    loop
                    muted
                    playsInline
                    controls
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <Image src={selectedFileUrl} alt="Preview" fill className="object-contain" />
                )}
              </div>
            )
          ) : (
            /* Upload Zone */
            <div
              className={`h-full flex flex-col items-center justify-center text-center p-6 transition-colors ${
                dragActive ? 'bg-zinc-800' : 'bg-zinc-950 hover:bg-zinc-900/60'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {/* Icon */}
              <div className="flex items-center justify-center mb-4">
                <div className="relative">
                  <ImageIcon size={72} className="text-zinc-400" />
                  <div className="absolute -bottom-2 -right-2 bg-gradient-to-tr from-purple-600 to-pink-500 rounded-full p-2 shadow-lg">
                    <SquarePlay size={24} className="text-white" />
                  </div>
                </div>
              </div>

              <p className="text-base text-white mb-2 font-medium">Kéo ảnh và video vào đây</p>
              <p className="text-xs text-zinc-400 mb-5 max-w-xs">
                Hỗ trợ ảnh JPG, PNG và video MP4, WebM (tự động đăng thành Reels)
              </p>

              <button
                onClick={handleFileSelect}
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-lg active:scale-95 cursor-pointer"
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
