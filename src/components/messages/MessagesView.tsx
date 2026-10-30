'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { ChatList } from './ChatList'
import { ChatRoom } from './ChatRoom'
import { currentMockUser, getConversationsForUser, getUserByAnyId } from '@mocks'
import type { IConversation, IMessage, IMessageUser } from '@types'
import { useAuth, useMounted } from '@hooks'
import { createClient, isSupabaseConfigured } from '@/utils/supabase/client'
import { resolveAvatar, isSenderCurrentUser } from '@/utils/avatar'

const SHARED_MESSAGES_KEY = 'instagram_shared_messages_v3'
const getUnreadStorageKey = (userId: string) => `instagram_unread_${userId}`

const isValidUUID = (str?: string | null): boolean =>
  Boolean(str && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str))

function mergeAndDeduplicateConversations(
  currentList: IConversation[],
  incomingList: IConversation[],
  currentUserId?: string,
): IConversation[] {
  // Map keyed strictly by other participant's username lowercase
  const participantMap = new Map<string, IConversation>()
  const all = [...currentList, ...incomingList]

  for (const c of all) {
    const rawKey = c.participant?.username || c.participant?.id || c.id
    const key = rawKey.toLowerCase()

    const existing = participantMap.get(key)
    if (!existing) {
      participantMap.set(key, c)
    } else {
      // Merge: prefer real UUID conversation over mock 'conv-*'
      const existingIsUUID = isValidUUID(existing.id)
      const currentIsUUID = isValidUUID(c.id)

      const winner = currentIsUUID && !existingIsUUID ? c : existing
      const loser = currentIsUUID && !existingIsUUID ? existing : c

      // Merge messages from both, deduplicated by id or (text + timestamp)
      const msgMap = new Map<string, IMessage>()
      loser.messages.forEach((m) => {
        const mKey = m.id || `${m.text}_${m.timestamp}`
        msgMap.set(mKey, m)
      })
      winner.messages.forEach((m) => {
        const mKey = m.id || `${m.text}_${m.timestamp}`
        msgMap.set(mKey, m)
      })
      const mergedMessages = Array.from(msgMap.values())

      const finalConv: IConversation = {
        ...winner,
        participant: {
          ...winner.participant,
          name:
            winner.participant.name && winner.participant.name !== 'Instagram User'
              ? winner.participant.name
              : loser.participant.name || winner.participant.name,
          avatar: resolveAvatar(
            winner.participant.username,
            null,
            winner.participant.avatar || loser.participant.avatar,
          ),
        },
        messages: mergedMessages,
        lastActivityMs: Math.max(winner.lastActivityMs || 0, loser.lastActivityMs || 0),
        updatedAt:
          mergedMessages.length > 0
            ? mergedMessages[mergedMessages.length - 1].timestamp
            : winner.updatedAt,
        unreadCount: Math.max(winner.unreadCount || 0, loser.unreadCount || 0),
      }

      // If loser had a different ID (e.g. mock ID) and winner is UUID, migrate localStorage store
      if (typeof window !== 'undefined' && loser.id !== winner.id) {
        try {
          const raw = localStorage.getItem(SHARED_MESSAGES_KEY)
          if (raw) {
            const storeMap = JSON.parse(raw)
            if (storeMap[loser.id]) {
              delete storeMap[loser.id]
              storeMap[winner.id] = {
                messages: mergedMessages,
                lastActivityMs: finalConv.lastActivityMs,
                lastSenderId: currentUserId || winner.participant.id,
              }
              localStorage.setItem(SHARED_MESSAGES_KEY, JSON.stringify(storeMap))
            }
          }
        } catch {}
      }

      participantMap.set(key, finalConv)
    }
  }

  const result = Array.from(participantMap.values())
  result.sort((a, b) => (b.lastActivityMs || 0) - (a.lastActivityMs || 0))
  return result
}

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
  const searchParams = useSearchParams()
  const targetUsernameParam = searchParams.get('username')
  const [searchQuery, setSearchQuery] = useState('')

  // Resolve current logged in user
  const currentUser: IMessageUser = useMemo(() => {
    if (user?.id || user?.username) {
      const demoUser = getUserByAnyId(user.id) || getUserByAnyId(user.username)
      if (demoUser) {
        return {
          ...demoUser,
          id: user.id || demoUser.id,
          avatar: resolveAvatar(demoUser.username, user.email, demoUser.avatar),
        }
      }
      return {
        id: user.id,
        username: user.username || user.name || 'user',
        name: user.name || 'Instagram User',
        avatar: resolveAvatar(user.username, user.email, user.avatar),
        isOnline: true,
      }
    }
    return currentMockUser
  }, [user])

  // Get base conversations tailored to this user
  const baseConversations = useMemo(() => getConversationsForUser(currentUser.id), [currentUser.id])

  const [conversations, setConversations] = useState<IConversation[]>(baseConversations)
  const [isAiTyping, setIsAiTyping] = useState<boolean>(false)
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

      setConversations((prev) => {
        return mergeAndDeduplicateConversations(prev, merged, currentUser.id)
      })
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

  // 2. Direct message navigation from profile (/messages?username=...)
  useEffect(() => {
    if (!targetUsernameParam) return
    const lowerTarget = targetUsernameParam.toLowerCase()
    if (lowerTarget === currentUser.username.toLowerCase()) return

    const existing = conversations.find((c) => c.participant.username.toLowerCase() === lowerTarget)

    if (existing) {
      setSelectedConversationId(existing.id)
      return
    }

    const setupDirectConversation = async () => {
      // Resolve target participant
      let pUser: IMessageUser | undefined = getUserByAnyId(targetUsernameParam)

      if (!pUser && typeof window !== 'undefined') {
        try {
          const registered = JSON.parse(localStorage.getItem('users') || '[]') as Array<{
            id?: string
            username?: string
            name?: string
            avatar?: string
          }>
          const reg = registered.find((u) => (u.username || '').toLowerCase() === lowerTarget)
          if (reg) {
            pUser = {
              id: reg.id || reg.username || lowerTarget,
              username: reg.username || lowerTarget,
              name: reg.name || reg.username || 'Instagram User',
              avatar: reg.avatar || '/images/nonuser.png',
              isOnline: true,
            }
          }
        } catch {}
      }

      if (!pUser) {
        pUser = {
          id: `user-${lowerTarget}`,
          username: targetUsernameParam,
          name: targetUsernameParam,
          avatar: '/images/nonuser.png',
          isOnline: true,
        }
      }

      let resolvedConvId: string | null = null

      // If Supabase is configured and logged in, check or create conversation in Supabase
      if (isSupabaseConfigured() && user?.id && isValidUUID(user.id)) {
        try {
          const supabase = createClient()
          const { data: targetProf } = await supabase
            .from('profiles')
            .select('id, username, full_name, avatar_url, is_verified')
            .or(`username.eq.${targetUsernameParam},id.eq.${targetUsernameParam}`)
            .maybeSingle()

          if (targetProf && isValidUUID(targetProf.id)) {
            pUser = {
              id: targetProf.id,
              username: targetProf.username,
              name: targetProf.full_name || targetProf.username,
              avatar: targetProf.avatar_url || '/images/nonuser.png',
              isVerified: targetProf.is_verified || false,
              isOnline: true,
            }

            const { data: myParticipations } = await supabase
              .from('conversation_participants')
              .select('conversation_id')
              .eq('user_id', user.id)

            const myConvIds = (myParticipations || []).map((p) => p.conversation_id)
            if (myConvIds.length > 0) {
              const { data: commonConvs } = await supabase
                .from('conversation_participants')
                .select('conversation_id')
                .eq('user_id', targetProf.id)
                .in('conversation_id', myConvIds)
                .limit(1)

              if (commonConvs && commonConvs.length > 0) {
                resolvedConvId = commonConvs[0].conversation_id
              }
            }

            if (!resolvedConvId) {
              const { data: newConvRow, error: newConvErr } = await supabase
                .from('conversations')
                .insert({})
                .select('id')
                .single()

              if (!newConvErr && newConvRow) {
                resolvedConvId = newConvRow.id
                await supabase.from('conversation_participants').insert([
                  { conversation_id: resolvedConvId, user_id: user.id },
                  { conversation_id: resolvedConvId, user_id: targetProf.id },
                ])
              }
            }
          }
        } catch (e) {
          console.warn('Supabase conversation setup notice:', e)
        }
      }

      const finalConvId = resolvedConvId || `conv-${currentUser.id}-${pUser.id}`
      const newConv: IConversation = {
        id: finalConvId,
        participant: pUser,
        messages: [],
        unreadCount: 0,
        updatedAt: 'Just now',
        lastActivityMs: Date.now(),
      }

      setConversations((prev) => {
        return mergeAndDeduplicateConversations(prev, [newConv], currentUser.id)
      })
      setSelectedConversationId(finalConvId)
    }

    setupDirectConversation()
  }, [targetUsernameParam, currentUser.username, currentUser.id, conversations, user?.id])

  // 3. Listen to cross-tab storage changes (handles real-time unread & sorting across tabs)
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

          localStorage.setItem(getUnreadStorageKey(currentUser.id), JSON.stringify(unreadMap))
        } catch (err) {
          console.error('Error handling storage event:', err)
        }

        reloadConversationsFromStore()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [currentUser.id, reloadConversationsFromStore, selectedConversationId])

  // 4. Supabase Realtime & DB sync if configured
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
          .select('conversation_id, user_id')
          .in('conversation_id', convIds)

        const allUserIds = Array.from(new Set((allParticipants || []).map((p) => p.user_id)))
        const profilesMap = new Map<
          string,
          {
            id: string
            username: string
            full_name?: string
            avatar_url?: string
            is_verified?: boolean
          }
        >()
        if (allUserIds.length > 0) {
          const { data: profsData } = await supabase
            .from('profiles')
            .select('id, username, full_name, avatar_url, is_verified')
            .in('id', allUserIds)
          profsData?.forEach((p) => profilesMap.set(p.id, p))
        }

        const { data: messagesData } = await supabase
          .from('messages')
          .select('*')
          .in('conversation_id', convIds)
          .order('created_at', { ascending: true })

        const messagesList = (messagesData || []) as unknown as MessageRow[]

        const built: IConversation[] = convIds.map((cid) => {
          const otherPart = (allParticipants || []).find(
            (p) => p.conversation_id === cid && p.user_id !== user!.id,
          )
          const prof = otherPart ? profilesMap.get(otherPart.user_id) : undefined
          const demoOther = getUserByAnyId(otherPart?.user_id) || getUserByAnyId(prof?.username)

          const otherUsername = prof?.username || demoOther?.username || 'user'
          const otherName = prof?.full_name || demoOther?.name || 'Sarah Connor'
          const otherAvatar = resolveAvatar(
            otherUsername,
            null,
            prof?.avatar_url || demoOther?.avatar,
          )

          const otherParticipant: IMessageUser = {
            id: prof?.id || otherPart?.user_id || demoOther?.id || 'other',
            username: otherUsername,
            name: otherName,
            avatar: otherAvatar,
            isVerified: prof?.is_verified ?? demoOther?.isVerified ?? false,
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

        // Sort and merge with existing conversations using single-source deduplication
        if (built.length > 0) {
          setConversations((prev) => {
            return mergeAndDeduplicateConversations(prev, built, currentUser.id)
          })

          // Ensure selectedConversationId points to the UUID if it was pointing to mock ID
          setSelectedConversationId((prevSelected) => {
            if (!prevSelected) return built[0]?.id || null
            if (isValidUUID(prevSelected)) {
              // If already UUID and exists in built, keep it
              return prevSelected
            }
            // If it was mock ID (e.g. conv-thanh-sarah), find matching built UUID
            const match = built.find((b) => {
              const prevMatch = baseConversations.find((bc) => bc.id === prevSelected)
              return (
                prevMatch &&
                prevMatch.participant.username.toLowerCase() ===
                  b.participant.username.toLowerCase()
              )
            })
            return match ? match.id : prevSelected
          })
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
            const isFromOther = !isSenderCurrentUser(
              newMsg.sender_id,
              currentUser.id,
              currentUser.username,
            )
            const isCurrentChat = newMsg.conversation_id === selectedConversationId

            const targetIndex = prev.findIndex(
              (c) => c.id === newMsg.conversation_id || c.participant.id === newMsg.sender_id,
            )
            if (targetIndex === -1) return prev

            const target = prev[targetIndex]
            const exists = target.messages.some(
              (m) =>
                m.id === newMsg.id ||
                (m.text === newMsg.text &&
                  isSenderCurrentUser(m.senderId, newMsg.sender_id, currentUser.username)),
            )
            if (exists) return prev

            const updatedMessages = [...target.messages, incoming]
            const updatedConversation: IConversation = {
              ...target,
              messages: updatedMessages,
              updatedAt: time,
              lastActivityMs: Date.now(),
              unreadCount: !isCurrentChat && isFromOther ? (target.unreadCount || 0) + 1 : 0,
            }

            // Move updated conversation to top (Index 0)
            const remaining = prev.filter((_, idx) => idx !== targetIndex)
            return [updatedConversation, ...remaining]
          })
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [currentUser.id, selectedConversationId, user])

  const selectedConversation = conversations.find((c) => c.id === selectedConversationId) || null

  // Select a conversation and clear its unread count
  const handleSelectConversation = useCallback(
    (id: string) => {
      setSelectedConversationId(id)
      setIsAiTyping(false)

      // Clear unread in localStorage
      if (typeof window !== 'undefined') {
        try {
          const unreadRaw = localStorage.getItem(getUnreadStorageKey(currentUser.id))
          const unreadMap = unreadRaw ? JSON.parse(unreadRaw) : {}
          unreadMap[id] = 0
          localStorage.setItem(getUnreadStorageKey(currentUser.id), JSON.stringify(unreadMap))
        } catch (e) {
          console.error('Failed to clear unread in localStorage:', e)
        }
      }

      setConversations((prev) => prev.map((c) => (c.id === id ? { ...c, unreadCount: 0 } : c)))
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

      // Check if chatting with Meta AI Assistant
      const activeConv = conversations.find((c) => c.id === selectedConversationId)
      const isMetaAi =
        selectedConversationId === 'conv-meta-ai' ||
        activeConv?.participant?.id === 'meta-ai' ||
        activeConv?.participant?.username === 'meta_ai' ||
        activeConv?.participant?.username?.toLowerCase().includes('meta_ai')

      if (isMetaAi) {
        setIsAiTyping(true)
        try {
          const res = await fetch('/api/ai/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message: text,
              history: activeConv?.messages?.slice(-6).map((m) => ({
                role: isSenderCurrentUser(m.senderId, currentUser.id, currentUser.username)
                  ? 'user'
                  : 'model',
                text: m.text,
              })),
            }),
          })

          const data = await res.json()
          const replyText =
            data.reply || 'Meta AI đang bận kết nối, bạn thử lại sau giây lát nhé! ✨'

          setTimeout(() => {
            const aiTime = new Date().toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })
            const aiMs = Date.now()
            const aiMsg: IMessage = {
              id: `ai-msg-${aiMs}`,
              senderId: 'meta-ai',
              text: replyText,
              timestamp: aiTime,
              status: 'delivered',
            }

            setConversations((prev) => {
              const targetIndex = prev.findIndex((c) => c.id === selectedConversationId)
              if (targetIndex === -1) return prev

              const target = prev[targetIndex]
              const updatedMessages = [...target.messages, aiMsg]
              const updatedConv: IConversation = {
                ...target,
                messages: updatedMessages,
                updatedAt: aiTime,
                lastActivityMs: aiMs,
              }

              // Persist to shared localStorage map
              if (typeof window !== 'undefined') {
                try {
                  const raw = localStorage.getItem(SHARED_MESSAGES_KEY)
                  const map = raw ? JSON.parse(raw) : {}
                  map[selectedConversationId] = {
                    messages: updatedMessages,
                    lastActivityMs: aiMs,
                    lastSenderId: 'meta-ai',
                  }
                  localStorage.setItem(SHARED_MESSAGES_KEY, JSON.stringify(map))
                } catch (e) {
                  console.error('Failed to save AI reply to localStorage:', e)
                }
              }

              return prev.map((c) => (c.id === selectedConversationId ? updatedConv : c))
            })

            setIsAiTyping(false)
          }, 600)
        } catch (aiErr) {
          console.error('Error generating AI response:', aiErr)
          setIsAiTyping(false)
        }
        return
      }

      // Send to Supabase
      if (isSupabaseConfigured()) {
        try {
          const supabase = createClient()

          // 1. Determine effective sender ID (valid UUID)
          let senderId = user?.id
          if (!isValidUUID(senderId)) {
            const { data: authData } = await supabase.auth.getUser()
            if (authData?.user?.id) {
              senderId = authData.user.id
            }
          }
          if (!isValidUUID(senderId)) {
            const uLower = (currentUser.username || '').toLowerCase()
            if (uLower.includes('thanh') || uLower.includes('admin')) {
              senderId = 'a0000000-0000-0000-0000-000000000005'
            } else if (uLower.includes('sarah') || uLower.includes('creative')) {
              senderId = 'a0000000-0000-0000-0000-000000000001'
            } else if (uLower.includes('elena') || uLower.includes('chef')) {
              senderId = 'a0000000-0000-0000-0000-000000000003'
            } else {
              senderId = 'a0000000-0000-0000-0000-000000000005'
            }
          }

          // Ensure sender profile exists in public.profiles
          await supabase.from('profiles').upsert(
            {
              id: senderId,
              username: currentUser.username,
              full_name: currentUser.name,
              avatar_url: resolveAvatar(currentUser.username, user?.email, currentUser.avatar),
            },
            { onConflict: 'id' },
          )

          let activeConvId = isValidUUID(selectedConversationId) ? selectedConversationId : null

          // If current conversation was stored locally with string ID, provision in Supabase
          if (!activeConvId) {
            const currentConv = conversations.find((c) => c.id === selectedConversationId)
            if (currentConv && currentConv.participant) {
              const targetName = currentConv.participant.username
              let targetUserId: string | null = null

              // 2. Query or provision target user profile
              const { data: targetProf } = await supabase
                .from('profiles')
                .select('id')
                .or(`username.eq.${targetName},id.eq.${targetName}`)
                .maybeSingle()

              if (targetProf && isValidUUID(targetProf.id)) {
                targetUserId = targetProf.id
              } else {
                // Determine target UUID from demo users
                const demoTarget = getUserByAnyId(targetName)
                const tLower = targetName.toLowerCase()
                let targetUUID = 'a0000000-0000-0000-0000-000000000001'
                if (tLower.includes('thanh') || tLower.includes('admin')) {
                  targetUUID = 'a0000000-0000-0000-0000-000000000005'
                } else if (tLower.includes('elena') || tLower.includes('chef')) {
                  targetUUID = 'a0000000-0000-0000-0000-000000000003'
                }
                targetUserId = targetUUID

                await supabase.from('profiles').upsert(
                  {
                    id: targetUserId,
                    username: demoTarget?.username || targetName,
                    full_name: demoTarget?.name || targetName,
                    avatar_url: resolveAvatar(targetName, null, demoTarget?.avatar),
                  },
                  { onConflict: 'id' },
                )
              }

              // 3. Check if conversation already exists between senderId and targetUserId
              const { data: myParticipations } = await supabase
                .from('conversation_participants')
                .select('conversation_id')
                .eq('user_id', senderId)

              const myConvIds = (myParticipations || []).map((p) => p.conversation_id)
              if (myConvIds.length > 0) {
                const { data: commonConvs } = await supabase
                  .from('conversation_participants')
                  .select('conversation_id')
                  .eq('user_id', targetUserId)
                  .in('conversation_id', myConvIds)
                  .limit(1)

                if (commonConvs && commonConvs.length > 0) {
                  activeConvId = commonConvs[0].conversation_id
                }
              }

              // 4. Create new conversation in Supabase if not found
              if (!activeConvId) {
                const { data: newConv } = await supabase
                  .from('conversations')
                  .insert({})
                  .select('id')
                  .single()

                if (newConv) {
                  activeConvId = newConv.id
                  await supabase.from('conversation_participants').insert([
                    { conversation_id: activeConvId, user_id: senderId },
                    { conversation_id: activeConvId, user_id: targetUserId },
                  ])
                }
              }
            }
          }

          // 5. Insert message into Supabase public.messages table
          if (activeConvId) {
            const { data, error } = await supabase
              .from('messages')
              .insert({
                conversation_id: activeConvId,
                sender_id: senderId,
                text,
              })
              .select('id')
              .single()

            if (!error && data) {
              setSelectedConversationId(activeConvId)
              setConversations((prev) =>
                prev.map((c) =>
                  c.id === selectedConversationId || c.id === activeConvId
                    ? {
                        ...c,
                        id: activeConvId,
                        messages: c.messages.map((m) =>
                          m.id === tempId ? { ...m, id: data.id, status: 'delivered' } : m,
                        ),
                      }
                    : c,
                ),
              )
            } else if (error) {
              console.warn('Supabase message insert notice:', error.message)
            }
          }
        } catch (err) {
          console.error('Failed to send message to Supabase:', err)
        }
      }
    },
    [currentUser, selectedConversationId, user, conversations],
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
        className={`flex-1 h-full bg-black ${selectedConversationId ? 'flex' : 'hidden lg:flex'}`}
      >
        <ChatRoom
          conversation={selectedConversation}
          currentUser={currentUser}
          onSendMessage={handleSendMessage}
          onToggleLikeMessage={handleToggleLikeMessage}
          onBack={() => setSelectedConversationId(null)}
          isAiTyping={isAiTyping}
        />
      </div>
    </div>
  )
}
