'use client'

import { ChevronDown, SquarePen, Search } from 'lucide-react'
import { ChatListItem } from './ChatListItem'
import type { IChatListProps } from '@types'

export function ChatList({
  conversations,
  selectedConversationId,
  onSelectConversation,
  currentUser,
  searchQuery,
  onSearchChange,
}: IChatListProps) {
  const filteredConversations = conversations.filter(
    (c) =>
      c.participant.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.participant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.messages.some((m) => m.text.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  return (
    <div className="w-full h-full flex flex-col bg-black text-white select-none">
      {/* Top Header: Current User Bar */}
      <div className="flex items-center justify-between px-5 pt-6 pb-4">
        <button className="flex items-center gap-1.5 hover:opacity-80 transition cursor-pointer">
          <span className="font-bold text-xl tracking-tight text-white">
            {currentUser.username}
          </span>
          <ChevronDown className="w-4 h-4 text-zinc-400" />
        </button>

        <button
          aria-label="New Message"
          className="p-1.5 rounded-full hover:bg-zinc-800 transition text-zinc-200 hover:text-white cursor-pointer"
        >
          <SquarePen className="w-6 h-6 stroke-[1.8]" />
        </button>
      </div>

      {/* Search Bar */}
      <div className="px-4 pb-3">
        <div className="flex items-center gap-2.5 bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-zinc-400 focus-within:border-zinc-700 transition">
          <Search className="w-4 h-4 text-zinc-500 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-transparent text-sm text-white placeholder-zinc-500 outline-none"
          />
        </div>
      </div>

      {/* Sub-header Title */}
      <div className="px-5 py-2 flex items-center justify-between text-xs font-semibold text-zinc-400">
        <span>Messages</span>
        <button className="text-blue-500 hover:text-blue-400 cursor-pointer">Requests</button>
      </div>

      {/* Scrollable Conversation List */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center text-zinc-500">
            <p className="text-sm">No conversations found</p>
          </div>
        ) : (
          filteredConversations.map((conv) => (
            <ChatListItem
              key={conv.id}
              conversation={conv}
              isSelected={conv.id === selectedConversationId}
              onClick={() => onSelectConversation(conv.id)}
            />
          ))
        )}
      </div>
    </div>
  )
}

