'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { ChatList } from './ChatList'
import { ChatRoom } from './ChatRoom'
import {
  currentMockUser,
  getConversationsForUser,
  getUserByAnyId,
} from '@mocks'
import type { IConversation, IMessage, IMessageUser } from '@types'
import { useAuth, useMounted } from '@hooks'
import { createClient, isSupabaseConfigured } from '@/utils/supabase/client'

const SHARED_MESSAGES_KEY = 'instagram_shared_messages_v3'
const getUnreadStorageKey = (userId: string) => `instagram_unread_${userId}`

const isValidUUID = (str?: string | null): boolean =>
  Boolean(str && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str))

interface StoredConversationEntry {
  messages: IMessage[]
  lastActivityMs: number
  lastSenderId?: string
}

interface ParticipantRow {
  conversation_id: string
  profiles?:
    | {
        id?: string
        username?: string
        full_name?: string
        avatar_url?: string
        is_verified?: boolean
      }
    | {
        id?: string
        username?: string
        full_name?: string
        avatar_url?: string
        is_verified?: boolean
      }[]
    | null
}

interface MessageRow {
  id: string
  conversation_id: string
  sender_id: string
  text: string
  liked?: boolean
  created_at: string
}

export function MessagesView() {
  const mounted = useMounted()
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')

  // Resolve current logged in user (primary: Mai Phước Thành)
  const currentUser: IMessageUser = useMemo(() => {
    if (user?.id || user?.username) {
      const demoUser = getUserByAnyId(user.id) || getUserByAnyId(user.username)
      if (demoUser) {
        return demoUser
      }
      return {
        id: user.id,
        username: user.username || user.name || 'user',
        name: user.name || 'Instagram User',
        avatar: user.avatar || '/images/conmeo.jpg',
        isOnline: true,
      }
    }
    return currentMockUser
  }, [user])

  // Get base conversations tailored to this user
  const baseConversations = useMemo(
    () => getConversationsForUser(currentUser.id),
    [currentUser.id],
  )

  const [conversations, setConversations] = useState<IConversation[]>(baseConversations)
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(
    baseConversations[0]?.id || null,
  )

  // 1. Synchronize conversations with persistent localStorage store & sort newest to top
  const reloadConversationsFromStore = useCallback(() => {
    if (typeof window === 'undefined') return

    try {
      const raw = localStorage.getItem(SHARED_MESSAGES_KEY)
      const map: Record<string, StoredConversationEntry | IMessage[]> = raw ? JSON.parse(raw) : {}

      const unreadRaw = localStorage.getItem(getUnreadStorageKey(currentUser.id))
      const unreadMap: Record<string, number> = unreadRaw ? JSON.parse(unreadRaw) : {}

      const merged = baseConversations.map((c) => {
        const stored = map[c.id]
        if (stored) {
          const msgs = Array.isArray(stored) ? stored : stored.messages || []
          const lastActivityMs =
            !Array.isArray(stored) && stored.lastActivityMs
              ? stored.lastActivityMs
              : c.lastActivityMs || Date.now()
          const lastMsg = msgs[msgs.length - 1]
          const unread = unreadMap[c.id] ?? c.unreadCount ?? 0

          return {
            ...c,
            messages: msgs,
            unreadCount: unread,
            updatedAt: lastMsg ? lastMsg.timestamp : c.updatedAt,
            lastActivityMs,
          }
        }
        return {
          ...c,
          unreadCount: unreadMap[c.id] ?? c.unreadCount ?? 0,
          lastActivityMs: c.lastActivityMs || Date.now(),
        }
      })

      // Sort conversations so the one with the newest message/activity is at the top!
      merged.sort((a, b) => (b.lastActivityMs || 0) - (a.lastActivityMs || 0))

      setConversations(merged)
      setSelectedConversationId((prev) => {
        if (prev && merged.some((c) => c.id === prev)) {
          return prev
        }
        return merged[0]?.id || null
      })
    } catch (e) {
      console.error('Failed to load shared messages:', e)
      setConversations(baseConversations)
    }
  }, [baseConversations, currentUser.id])

  useEffect(() => {
    reloadConversationsFromStore()
  }, [reloadConversationsFromStore])

  // 2. Listen to cross-tab storage changes (handles real-time unread & sorting across tabs)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === SHARED_MESSAGES_KEY && e.newValue) {
        try {
          const map: Record<string, StoredConversationEntry> = JSON.parse(e.newValue)
          const unreadRaw = localStorage.getItem(getUnreadStorageKey(currentUser.id))
          const unreadMap: Record<string, number> = unreadRaw ? JSON.parse(unreadRaw) : {}

          Object.keys(map).forEach((cid) => {
            const entry = map[cid]
            if (
              entry &&
              !Array.isArray(entry) &&
              entry.lastSenderId &&
              entry.lastSenderId !== currentUser.id
            ) {
              // If incoming message is for a conversation not currently open, increment unread!
              if (cid !== selectedConversationId) {
                unreadMap[cid] = (unreadMap[cid] || 0) + 1
              }
            }
          })

          localStorage.setItem(
            getUnreadStorageKey(currentUser.id),
            JSON.stringify(unreadMap),
          )
        } catch (err) {
          console.error('Error handling storage event:', err)
        }

        reloadConversationsFromStore()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [currentUser.id, reloadConversationsFromStore, selectedConversationId])

  // 3. Supabase Realtime & DB sync if configured
  useEffect(() => {
    if (!isSupabaseConfigured() || !isValidUUID(user?.id)) return

    const supabase = createClient()

    const fetchConversations = async () => {
      try {
        const { data: participantData, error: partErr } = await supabase
          .from('conversation_participants')
          .select('conversation_id')
          .eq('user_id', user!.id)

        if (partErr || !participantData || participantData.length === 0) {
          return
        }

        const convIds = participantData.map((p) => p.conversation_id)

        const { data: allParticipants } = await supabase
          .from('conversation_participants')
          .select(
            `
            conversation_id,
            profiles:user_id (
              id,
              username,
              full_name,
              avatar_url,
              is_verified
            )
          `,
          )
          .in('conversation_id', convIds)

        const { data: messagesData } = await supabase
          .from('messages')
          .select('*')
          .in('conversation_id', convIds)
          .order('created_at', { ascending: true })

        const participantsList = (allParticipants || []) as unknown as ParticipantRow[]
        const messagesList = (messagesData || []) as unknown as MessageRow[]

        const built: IConversation[] = convIds.map((cid) => {
          const convParts = participantsList.filter(
            (p) =>
              p.conversation_id === cid &&
              p.profiles &&
              (Array.isArray(p.profiles) ? p.profiles[0]?.id : p.profiles?.id) !== user!.id,
          )
          const prof = Array.isArray(convParts[0]?.profiles)
            ? convParts[0]?.profiles[0]
            : convParts[0]?.profiles

          const otherParticipant: IMessageUser = {
            id: prof?.id || 'other',
            username: prof?.username || 'user',
            name: prof?.full_name || 'Instagram User',
            avatar: prof?.avatar_url || '/images/nonuser.png',
            isVerified: prof?.is_verified ?? false,
            isOnline: true,
          }

          const convMsgs = messagesList.filter((m) => m.conversation_id === cid)
          const lastMsg = convMsgs[convMsgs.length - 1]
          const lastActivityMs = lastMsg ? new Date(lastMsg.created_at).getTime() : Date.now()

          const formattedMsgs: IMessage[] = convMsgs.map((m) => {
            const time = new Date(m.created_at).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })
            return {
              id: m.id,
              senderId: m.sender_id,
              text: m.text,
              timestamp: time,
              liked: m.liked,
              status: 'delivered',
            }
          })

          return {
            id: cid,
            participant: otherParticipant,
            messages: formattedMsgs,
            unreadCount: 0,
            updatedAt: lastMsg
              ? new Date(lastMsg.created_at).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : 'Just now',
            lastActivityMs,
          }
        })

        // Sort newest on top
        built.sort((a, b) => (b.lastActivityMs || 0) - (a.lastActivityMs || 0))

        if (built.length > 0) {
          setConversations(built)
          setSelectedConversationId((prev) => prev || built[0].id)
        }
      } catch (err) {
        console.error('Error fetching Supabase conversations:', err)
      }
    }

    fetchConversations()

    const channel = supabase
      .channel('chat_messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const newMsg = payload.new as MessageRow
          const time = new Date(newMsg.created_at).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })
          const incoming: IMessage = {
            id: newMsg.id,
            senderId: newMsg.sender_id,
            text: newMsg.text,
            timestamp: time,
            liked: newMsg.liked,
            status: 'delivered',
          }

          setConversations((prev) => {
            const isCurrentChat = newMsg.conversation_id === selectedConversationId
            const isFromOther = newMsg.sender_id !== currentUser.id

            const targetIndex = prev.findIndex((c) => c.id === newMsg.conversation_id)
            if (targetIndex === -1) return prev

            const target = prev[targetIndex]
            const exists = target.messages.some(
              (m) =>
                m.id === newMsg.id ||
                (m.text === newMsg.text && m.senderId === newMsg.sender_id),
            )
            if (exists) return prev

            const updatedMessages = [...target.messages, incoming]
            const updatedConversation: IConversation = {
              ...target,
              messages: updatedMessages,
              updatedAt: time,
              lastActivityMs: Date.now(),
              unreadCount:
                !isCurrentChat && isFromOther ? (target.unreadCount || 0) + 1 : 0,
            }

            // Move updated conversation to top (Index 0)
            const remaining = prev.filter((c) => c.id !== newMsg.conversation_id)
            return [updatedConversation, ...remaining]
          })
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [currentUser.id, selectedConversationId, user])

  const selectedConversation =
    conversations.find((c) => c.id === selectedConversationId) || null

  // Select a conversation and clear its unread count
  const handleSelectConversation = useCallback(
    (id: string) => {
      setSelectedConversationId(id)

      // Clear unread in localStorage
      if (typeof window !== 'undefined') {
        try {
          const unreadRaw = localStorage.getItem(getUnreadStorageKey(currentUser.id))
          const unreadMap = unreadRaw ? JSON.parse(unreadRaw) : {}
          unreadMap[id] = 0
          localStorage.setItem(
            getUnreadStorageKey(currentUser.id),
            JSON.stringify(unreadMap),
          )
        } catch (e) {
          console.error('Failed to clear unread in localStorage:', e)
        }
      }

      setConversations((prev) =>
        prev.map((c) => (c.id === id ? { ...c, unreadCount: 0 } : c)),
      )
    },
    [currentUser.id],
  )

  // Send a new message & immediately move conversation to the top
  const handleSendMessage = useCallback(
    async (text: string) => {
      if (!selectedConversationId) return

      const now = new Date()
      const nowMs = Date.now()
      const timeString = now.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })

      const tempId = `msg-${nowMs}`
      const newMessage: IMessage = {
        id: tempId,
        senderId: currentUser.id,
        text,
        timestamp: timeString,
        status: 'sent',
      }

      setConversations((prev) => {
        const targetIndex = prev.findIndex((c) => c.id === selectedConversationId)
        if (targetIndex === -1) return prev

        const targetConversation = prev[targetIndex]
        const updatedMessages = [...targetConversation.messages, newMessage]
        const updatedConversation: IConversation = {
          ...targetConversation,
          messages: updatedMessages,
          updatedAt: 'Just now',
          lastActivityMs: nowMs,
          unreadCount: 0,
        }

        // Re-order: Move updated conversation to index 0 (top of the list)
        const remaining = prev.filter((c) => c.id !== selectedConversationId)
        const updatedList = [updatedConversation, ...remaining]

        // Persist to shared localStorage map with lastSenderId and lastActivityMs
        if (typeof window !== 'undefined') {
          try {
            const raw = localStorage.getItem(SHARED_MESSAGES_KEY)
            const map = raw ? JSON.parse(raw) : {}
            map[selectedConversationId] = {
              messages: updatedMessages,
              lastActivityMs: nowMs,
              lastSenderId: currentUser.id,
            }
            localStorage.setItem(SHARED_MESSAGES_KEY, JSON.stringify(map))
          } catch (e) {
            console.error('Failed to save to localStorage:', e)
          }
        }

        return updatedList
      })

      // Send to Supabase if valid UUID
      if (
        isSupabaseConfigured() &&
        isValidUUID(selectedConversationId) &&
        isValidUUID(user?.id)
      ) {
        try {
          const supabase = createClient()
          const { data, error } = await supabase
            .from('messages')
            .insert({
              conversation_id: selectedConversationId,
              sender_id: user!.id,
              text,
            })
            .select('id')
            .single()

          if (!error && data) {
            setConversations((prev) =>
              prev.map((c) =>
                c.id === selectedConversationId
                  ? {
                      ...c,
                      messages: c.messages.map((m) =>
                        m.id === tempId ? { ...m, id: data.id, status: 'delivered' } : m,
                      ),
                    }
                  : c,
              ),
            )
          }
        } catch (err) {
          console.error('Failed to send message to Supabase:', err)
        }
      }
    },
    [currentUser.id, selectedConversationId, user],
  )

  // Toggle like reaction
  const handleToggleLikeMessage = useCallback(
    async (messageId: string) => {
      if (!selectedConversationId) return

      let nextLiked = false
      setConversations((prev) => {
        const targetIndex = prev.findIndex((c) => c.id === selectedConversationId)
        if (targetIndex === -1) return prev

        const target = prev[targetIndex]
        const updatedMessages = target.messages.map((m) => {
          if (m.id === messageId) {
            nextLiked = !m.liked
            return { ...m, liked: nextLiked }
          }
          return m
        })

        const updated = prev.map((c) =>
          c.id === selectedConversationId ? { ...c, messages: updatedMessages } : c,
        )

        if (typeof window !== 'undefined') {
          try {
            const raw = localStorage.getItem(SHARED_MESSAGES_KEY)
            const map = raw ? JSON.parse(raw) : {}
            const existingEntry = map[selectedConversationId]
            map[selectedConversationId] = {
              messages: updatedMessages,
              lastActivityMs:
                existingEntry && !Array.isArray(existingEntry)
                  ? existingEntry.lastActivityMs
                  : Date.now(),
              lastSenderId:
                existingEntry && !Array.isArray(existingEntry)
                  ? existingEntry.lastSenderId
                  : currentUser.id,
            }
            localStorage.setItem(SHARED_MESSAGES_KEY, JSON.stringify(map))
          } catch (e) {
            console.error('Failed to save like to localStorage:', e)
          }
        }

        return updated
      })

      if (isSupabaseConfigured() && isValidUUID(messageId)) {
        try {
          const supabase = createClient()
          await supabase.from('messages').update({ liked: nextLiked }).eq('id', messageId)
        } catch (err) {
          console.error('Failed to toggle message like on Supabase:', err)
        }
      }
    },
    [currentUser.id, selectedConversationId],
  )

  // Matching skeleton loader to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="w-full h-screen bg-black flex overflow-hidden">
        {/* Left Pane Skeleton */}
        <div className="w-full lg:w-[350px] xl:w-[380px] h-full border-r border-zinc-800 flex-shrink-0 flex flex-col p-4 animate-pulse">
          <div className="h-8 bg-zinc-800 rounded-md w-32 mb-6" />
          <div className="h-10 bg-zinc-900 rounded-xl mb-4" />
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-zinc-800" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-zinc-800 rounded w-24" />
                  <div className="h-3 bg-zinc-900 rounded w-36" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Pane Skeleton */}
        <div className="hidden lg:flex flex-1 h-full bg-black flex-col items-center justify-center text-zinc-600">
          <div className="w-16 h-16 rounded-full border-2 border-zinc-800 mb-3" />
          <div className="h-4 bg-zinc-800 rounded w-32" />
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-screen bg-black flex overflow-hidden">
      {/* Left Pane (Inbox / Chat List) */}
      <div
        className={`w-full lg:w-[350px] xl:w-[380px] h-full border-r border-zinc-800 flex-shrink-0 ${
          selectedConversationId ? 'hidden lg:flex' : 'flex'
        }`}
      >
        <ChatList
          conversations={conversations}
          selectedConversationId={selectedConversationId}
          onSelectConversation={handleSelectConversation}
          currentUser={currentUser}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      </div>

      {/* Right Pane (Active Chat Room) */}
      <div
        className={`flex-1 h-full bg-black ${
          selectedConversationId ? 'flex' : 'hidden lg:flex'
        }`}
      >
        <ChatRoom
          conversation={selectedConversation}
          currentUser={currentUser}
          onSendMessage={handleSendMessage}
          onToggleLikeMessage={handleToggleLikeMessage}
          onBack={() => setSelectedConversationId(null)}
        />
      </div>
    </div>
  )
}
