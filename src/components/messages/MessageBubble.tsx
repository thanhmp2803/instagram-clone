'use client'

import Image from 'next/image'
import { Heart } from 'lucide-react'
import type { IMessageBubbleProps } from '@types'
import { getSenderAvatar } from '@mocks'

export function MessageBubble({
  message,
  isCurrentUser,
  participant,
  onToggleLike,
}: IMessageBubbleProps) {
  const handleLikeClick = () => {
    onToggleLike?.(message.id)
  }

  // Get the real avatar of the sender
  const senderAvatar = getSenderAvatar(message.senderId, participant.avatar)

  return (
    <div
      className={`flex items-end gap-2 mb-3 group select-text ${
        isCurrentUser ? 'justify-end' : 'justify-start'
      }`}
    >
      {/* Participant Avatar for incoming messages */}
      {!isCurrentUser && (
        <div className="relative w-7 h-7 rounded-full overflow-hidden flex-shrink-0 mb-1 border border-zinc-800">
          <Image
            src={senderAvatar}
            alt={participant.username}
            width={28}
            height={28}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Message Content & Bubble Container */}
      <div
        className={`relative max-w-[75%] sm:max-w-[65%] ${isCurrentUser ? 'order-1' : 'order-2'}`}
      >
        <div
          onDoubleClick={handleLikeClick}
          className={`px-4 py-2.5 text-sm leading-relaxed rounded-2xl break-words transition-all shadow-sm ${
            isCurrentUser
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-sm'
              : 'bg-zinc-800 text-zinc-100 rounded-bl-sm border border-zinc-700/60'
          }`}
        >
          <p>{message.text}</p>
        </div>

        {/* Liked Heart Reaction Badge */}
        {message.liked && (
          <div
            onClick={handleLikeClick}
            className={`absolute -bottom-2.5 cursor-pointer bg-zinc-900 border border-zinc-700 rounded-full p-1 shadow-md flex items-center justify-center transition-transform hover:scale-110 active:scale-95 ${
              isCurrentUser ? 'left-2' : 'right-2'
            }`}
          >
            <Heart className="w-3 h-3 fill-red-500 text-red-500" />
          </div>
        )}

        {/* Timestamp */}
        <div
          className={`text-[10px] text-zinc-500 mt-1 px-1 ${
            isCurrentUser ? 'text-right' : 'text-left'
          }`}
        >
          {message.timestamp}
        </div>
      </div>

      {/* Hover action to toggle like */}
      <button
        onClick={handleLikeClick}
        aria-label="Like message"
        className={`opacity-0 group-hover:opacity-100 transition-opacity p-1 text-zinc-400 hover:text-red-500 cursor-pointer ${
          isCurrentUser ? 'order-0 mr-1' : 'order-3 ml-1'
        }`}
      >
        <Heart
          className={`w-4 h-4 ${
            message.liked ? 'fill-red-500 text-red-500' : 'stroke-[1.75]'
          }`}
        />
      </button>
    </div>
  )
}
