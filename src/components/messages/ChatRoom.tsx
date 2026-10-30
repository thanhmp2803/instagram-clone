'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import type { KeyboardEvent } from 'react'
import Image from 'next/image'
import {
  ArrowLeft,
  Phone,
  Video,
  Info,
  Smile,
  ImageIcon,
  Mic,
  Heart,
  Send,
  CheckCircle,
} from 'lucide-react'
import { MessageBubble } from './MessageBubble'
import type { IChatRoomProps } from '@types'
import { isSenderCurrentUser } from '@/utils/avatar'

export function ChatRoom({
  conversation,
  currentUser,
  onSendMessage,
  onToggleLikeMessage,
  onBack,
}: IChatRoomProps) {
  const [inputText, setInputText] = useState('')
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  // Auto-scroll to the bottom of the conversation
  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior, block: 'end' })
  }, [])

  useEffect(() => {
    if (conversation) {
      scrollToBottom('smooth')
    }
  }, [conversation?.id, conversation?.messages?.length, scrollToBottom])

  const handleSend = () => {
    const trimmed = inputText.trim()
    if (!trimmed) return
    onSendMessage(trimmed)
    setInputText('')
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleSendHeart = () => {
    onSendMessage('❤️')
  }

  // Empty State: No conversation selected
  if (!conversation) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-black text-white p-6 select-none">
        <div className="w-24 h-24 rounded-full border-2 border-white flex items-center justify-center mb-4">
          <Send className="w-12 h-12 stroke-[1.5] -rotate-12 -translate-y-0.5" />
        </div>
        <h2 className="text-xl font-semibold mb-2">Your Messages</h2>
        <p className="text-zinc-400 text-sm text-center max-w-sm mb-6">
          Send private photos and messages to a friend or group.
        </p>
        <button className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm px-4 py-2 rounded-lg transition cursor-pointer">
          Send message
        </button>
      </div>
    )
  }

  const { participant, messages } = conversation

  return (
    <div className="w-full h-full flex flex-col bg-black text-white relative">
      {/* Chat Room Header */}
      <div className="h-16 px-4 border-b border-zinc-800 flex items-center justify-between bg-black/95 backdrop-blur-md z-10 flex-shrink-0">
        <div className="flex items-center gap-3">
          {/* Mobile Back Button */}
          {onBack && (
            <button
              onClick={onBack}
              aria-label="Back to chat list"
              className="lg:hidden p-1.5 -ml-1 text-zinc-300 hover:text-white rounded-full hover:bg-zinc-800 transition cursor-pointer"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
          )}

          {/* Participant Info */}
          <div className="relative w-10 h-10 rounded-full overflow-hidden border border-zinc-800 flex-shrink-0">
            <Image
              src={participant.avatar}
              alt={participant.username}
              width={40}
              height={40}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className="font-semibold text-sm text-white leading-tight">
                {participant.name || participant.username}
              </span>
              {participant.isVerified && (
                <CheckCircle className="w-3.5 h-3.5 fill-blue-500 text-black flex-shrink-0" />
              )}
            </div>
            <span className="text-[11px] text-zinc-400">
              {participant.isOnline ? 'Active now' : participant.lastSeen || 'Offline'}
            </span>
          </div>
        </div>

        {/* Action Call & Info Icons */}
        <div className="flex items-center gap-2 text-zinc-300">
          <button
            aria-label="Audio call"
            className="p-2 hover:bg-zinc-800 rounded-full transition cursor-pointer"
          >
            <Phone className="w-5 h-5 stroke-[1.8]" />
          </button>
          <button
            aria-label="Video call"
            className="p-2 hover:bg-zinc-800 rounded-full transition cursor-pointer"
          >
            <Video className="w-5 h-5 stroke-[1.8]" />
          </button>
          <button
            aria-label="Conversation info"
            className="p-2 hover:bg-zinc-800 rounded-full transition cursor-pointer"
          >
            <Info className="w-5 h-5 stroke-[1.8]" />
          </button>
        </div>
      </div>

      {/* Scrollable Message History */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1 no-scrollbar">
        {/* User profile intro header at top of chat */}
        <div className="flex flex-col items-center justify-center py-8 text-center border-b border-zinc-900 mb-6">
          <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-zinc-800 mb-3 shadow-md">
            <Image
              src={participant.avatar}
              alt={participant.username}
              width={80}
              height={80}
              className="w-full h-full object-cover"
            />
          </div>
          <h3 className="font-bold text-lg text-white mb-0.5">{participant.name}</h3>
          <p className="text-zinc-400 text-xs mb-1">@{participant.username} • Instagram</p>
          {participant.bio && (
            <p className="text-zinc-500 text-xs max-w-xs mb-4">{participant.bio}</p>
          )}
          <button className="bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs px-4 py-1.5 rounded-lg transition cursor-pointer">
            View profile
          </button>
        </div>

        {/* Messages List */}
        {messages.map((message) => {
          const isCurrentUser = isSenderCurrentUser(
            message.senderId,
            currentUser.id,
            currentUser.username,
          )

          return (
            <MessageBubble
              key={message.id}
              message={message}
              isCurrentUser={isCurrentUser}
              participant={participant}
              onToggleLike={onToggleLikeMessage}
            />
          )
        })}

        {/* Scroll Anchor */}
        <div ref={messagesEndRef} className="h-1" />
      </div>

      {/* Fixed Bottom Input Area */}
      <div className="p-3 sm:p-4 bg-black border-t border-zinc-800/80 flex-shrink-0">
        <div className="flex items-center gap-2.5 bg-zinc-900 border border-zinc-700/80 rounded-full px-4 py-2 focus-within:border-zinc-500 transition shadow-inner">
          {/* Emoji button */}
          <button
            type="button"
            aria-label="Add emoji"
            onClick={() => setInputText((prev) => `${prev}😊`)}
            className="text-zinc-400 hover:text-white transition cursor-pointer"
          >
            <Smile className="w-5 h-5 stroke-[1.8]" />
          </button>

          {/* Text Input */}
          <input
            type="text"
            placeholder="Message..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-sm text-white placeholder-zinc-500 outline-none"
          />

          {/* Right actions: If typing, show "Send"; otherwise show Mic/Image/Heart */}
          {inputText.trim().length > 0 ? (
            <button
              onClick={handleSend}
              className="text-blue-500 hover:text-blue-400 font-semibold text-sm px-1 transition cursor-pointer"
            >
              Send
            </button>
          ) : (
            <div className="flex items-center gap-2 text-zinc-400">
              <button
                type="button"
                aria-label="Voice note"
                className="hover:text-white transition cursor-pointer"
              >
                <Mic className="w-5 h-5 stroke-[1.8]" />
              </button>
              <button
                type="button"
                aria-label="Add photo"
                className="hover:text-white transition cursor-pointer"
              >
                <ImageIcon className="w-5 h-5 stroke-[1.8]" />
              </button>
              <button
                type="button"
                onClick={handleSendHeart}
                aria-label="Send heart"
                className="hover:text-red-500 transition cursor-pointer active:scale-90"
              >
                <Heart className="w-5 h-5 stroke-[1.8]" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
