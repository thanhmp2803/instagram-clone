'use client'

import Image from 'next/image'
import { CheckCircle } from 'lucide-react'
import type { IChatListItemProps } from '@types'

export function ChatListItem({ conversation, isSelected, onClick }: IChatListItemProps) {
  const { participant, messages, unreadCount, updatedAt } = conversation
  const lastMessage = messages[messages.length - 1]
  const hasUnread = Boolean(unreadCount && unreadCount > 0)
  const isMetaAi =
    participant.id === 'meta-ai' ||
    participant.username === 'meta_ai' ||
    participant.username.includes('meta_ai')

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3.5 px-4 py-3 transition-colors text-left cursor-pointer border-b border-zinc-900/60 ${
        isSelected
          ? 'bg-zinc-800/90'
          : hasUnread
            ? 'bg-zinc-900/40 hover:bg-zinc-900/80'
            : 'hover:bg-zinc-900/60 bg-transparent'
      }`}
    >
      {/* Participant Avatar with Online Indicator */}
      <div className="relative w-13 h-13 sm:w-14 sm:h-14 flex-shrink-0">
        <div
          className={`w-full h-full rounded-full overflow-hidden ${
            isMetaAi
              ? 'p-[2px] bg-gradient-to-tr from-[#0064E0] via-[#8B5CF6] to-[#EC4899] shadow-sm'
              : hasUnread
                ? 'border border-blue-500 ring-2 ring-blue-500/30'
                : 'border border-zinc-800'
          }`}
        >
          <div className="w-full h-full rounded-full overflow-hidden bg-black">
            <Image
              src={participant.avatar}
              alt={participant.username}
              width={56}
              height={56}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        {participant.isOnline && (
          <span
            aria-label="Online"
            className={`absolute bottom-0 right-0 w-3.5 h-3.5 border-2 border-black rounded-full ${
              isMetaAi ? 'bg-cyan-400' : 'bg-green-500'
            }`}
          />
        )}
      </div>

      {/* User Information and Latest Message Preview */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1.5 truncate">
            <span
              className={`text-sm truncate ${
                hasUnread ? 'text-white font-bold' : 'text-zinc-100 font-semibold'
              }`}
            >
              {participant.name || participant.username}
            </span>
            {isMetaAi ? (
              <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-fuchsia-500 text-white leading-none tracking-wider shadow-sm">
                AI
              </span>
            ) : (
              participant.isVerified && (
                <CheckCircle className="w-3.5 h-3.5 fill-blue-500 text-black flex-shrink-0" />
              )
            )}
          </div>
          <span
            className={`text-[11px] whitespace-nowrap ml-2 ${
              hasUnread ? 'text-blue-400 font-semibold' : 'text-zinc-500'
            }`}
          >
            {updatedAt}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <p
            className={`text-xs truncate max-w-[200px] ${
              hasUnread ? 'text-white font-semibold' : 'text-zinc-400 font-normal'
            }`}
          >
            {lastMessage ? lastMessage.text : 'Hỏi Meta AI bất cứ điều gì...'}
          </p>

          {/* Unread Message Notification Badge / Dot */}
          {hasUnread && (
            <span className="min-w-4 h-4 px-1 rounded-full bg-blue-500 text-[10px] font-bold text-white flex items-center justify-center flex-shrink-0 ml-2 shadow-sm">
              {unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  )
}
