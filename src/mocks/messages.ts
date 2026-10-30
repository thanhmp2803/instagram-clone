import type { IConversation, IMessage, IMessageUser } from '@types'

// 1. Core Users + Meta AI
export const USER_THANH: IMessageUser = {
  id: 'user-thanh',
  username: 'pthanh2803',
  name: 'Mai Phước Thành',
  avatar: '/images/conmeo.jpg',
  isVerified: false,
  isOnline: true,
  bio: "Hi, I'm Thanh, a Frontend Developer.",
}

export const USER_SARAH: IMessageUser = {
  id: 'user-sarah',
  username: 'creative_coder',
  name: 'Sarah Connor',
  avatar:
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  isVerified: true,
  isOnline: true,
  lastSeen: 'Active now',
  bio: 'Frontend Engineer & UI enthusiast 💻',
}

export const USER_ELENA: IMessageUser = {
  id: 'user-elena',
  username: 'chef_artisan',
  name: 'Elena Rostova',
  avatar:
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  isVerified: false,
  isOnline: true,
  lastSeen: 'Active now',
  bio: 'Sourdough baker & Culinary creator 🥖',
}

export const USER_META_AI: IMessageUser = {
  id: 'meta-ai',
  username: 'meta_ai',
  name: 'Meta AI',
  avatar: '/images/meta-ai.svg',
  isVerified: true,
  isOnline: true,
  lastSeen: 'Trợ lý AI • Luôn trực tuyến',
  bio: 'Meta AI thông minh trên Instagram ✨ Đặt câu hỏi, xin gợi ý caption hoặc trò chuyện cùng tôi!',
}

// Default mock user is the primary account: Mai Phước Thành
export const currentMockUser: IMessageUser = USER_THANH

export const ALL_DEMO_USERS: IMessageUser[] = [USER_THANH, USER_SARAH, USER_ELENA, USER_META_AI]

// Helper to find any demo user by their ID, username or legacy ID
export function getUserByAnyId(identifier?: string | null): IMessageUser | undefined {
  if (!identifier) return undefined
  const idLower = identifier.toLowerCase()

  if (
    idLower === 'meta-ai' ||
    idLower === 'meta_ai' ||
    idLower === 'user-meta-ai' ||
    idLower.includes('meta-ai') ||
    idLower.includes('meta_ai')
  ) {
    return USER_META_AI
  }

  if (
    idLower === 'user-thanh' ||
    idLower === 'current-user-1' ||
    idLower === '1' ||
    idLower === 'pthanh2803' ||
    idLower === 'admin@gmail.com' ||
    idLower === 'a0000000-0000-0000-0000-000000000005'
  ) {
    return USER_THANH
  }

  if (
    idLower === 'user-sarah' ||
    idLower === 'author-1' ||
    idLower === 'creative_coder' ||
    idLower === 'sarah@gmail.com' ||
    idLower === 'a0000000-0000-0000-0000-000000000001'
  ) {
    return USER_SARAH
  }

  if (
    idLower === 'user-elena' ||
    idLower === 'author-5' ||
    idLower === 'chef_artisan' ||
    idLower === 'elena@gmail.com' ||
    idLower === 'a0000000-0000-0000-0000-000000000003'
  ) {
    return USER_ELENA
  }

  return undefined
}

// Get the correct avatar for any message sender
export function getSenderAvatar(senderId: string, fallbackAvatar?: string): string {
  const user = getUserByAnyId(senderId)
  if (user) return user.avatar
  return fallbackAvatar || '/images/nonuser.png'
}

// 2. Initial Shared Messages between conversations
export const initialMessagesMetaAi: IMessage[] = [
  {
    id: 'm-ai-1',
    senderId: 'meta-ai',
    text: 'Xin chào! 👋 Mình là Meta AI trên Instagram. Mình có thể giúp bạn viết caption xịn, gợi ý ý tưởng làm Reels, giải đáp thắc mắc hoặc trò chuyện bất cứ khi nào bạn muốn. Bạn cần mình giúp gì hôm nay nè? ✨',
    timestamp: '10:00 AM',
    status: 'read',
  },
]

export const initialMessagesThanhSarah: IMessage[] = [
  {
    id: 'm-ts-1',
    senderId: 'user-sarah',
    text: 'Hey Thanh! Did you check out the new Instagram Reels feature you built?',
    timestamp: '10:15 AM',
    status: 'read',
  },
  {
    id: 'm-ts-2',
    senderId: 'user-thanh',
    text: 'Hey Sarah! Yes, vertical scroll snapping & IntersectionObserver autoplay work super smooth now! 🚀',
    timestamp: '10:17 AM',
    status: 'read',
  },
  {
    id: 'm-ts-3',
    senderId: 'user-sarah',
    text: 'Awesome! The double-tap heart burst animation is so satisfying ❤️',
    timestamp: '10:19 AM',
    status: 'read',
    liked: true,
  },
  {
    id: 'm-ts-4',
    senderId: 'user-thanh',
    text: 'Now the Direct Messages feature works in real-time with dual-mode Supabase!',
    timestamp: '10:22 AM',
    status: 'read',
  },
  {
    id: 'm-ts-5',
    senderId: 'user-sarah',
    text: 'Can’t wait to test! Send me a message when it is ready 🔥',
    timestamp: '10:25 AM',
    status: 'read',
  },
]

export const initialMessagesThanhElena: IMessage[] = [
  {
    id: 'm-te-1',
    senderId: 'user-thanh',
    text: 'Hi Elena! What was the secret to that blistered sourdough crust in your video?',
    timestamp: 'Yesterday',
    status: 'read',
  },
  {
    id: 'm-te-2',
    senderId: 'user-elena',
    text: 'Two ice cubes inside the Dutch oven before closing the lid! Creates maximum steam during the oven spring.',
    timestamp: 'Yesterday',
    status: 'read',
    liked: true,
  },
  {
    id: 'm-te-3',
    senderId: 'user-thanh',
    text: 'Brilliant tip, I will try that this weekend! 🥖',
    timestamp: 'Yesterday',
    status: 'read',
  },
]

export const initialMessagesSarahElena: IMessage[] = [
  {
    id: 'm-se-1',
    senderId: 'user-sarah',
    text: 'Elena, your sourdough looks delicious! Can you share the hydration ratio?',
    timestamp: 'Oct 28',
    status: 'read',
  },
  {
    id: 'm-se-2',
    senderId: 'user-elena',
    text: 'Hey Sarah! I usually use 75% hydration for beginners, 80% for open crumb! ✨',
    timestamp: 'Oct 28',
    status: 'read',
    liked: true,
  },
]

// 3. Dynamic Conversation Generator based on the logged-in user
export function getConversationsForUser(currentUserIdOrUsername?: string | null): IConversation[] {
  const resolved = getUserByAnyId(currentUserIdOrUsername) || USER_THANH
  const now = Date.now()

  const metaAiConversation: IConversation = {
    id: 'conv-meta-ai',
    participant: USER_META_AI,
    messages: initialMessagesMetaAi,
    unreadCount: 0,
    updatedAt: '10:00 AM',
    lastActivityMs: now - 1000 * 60 * 5, // 5 mins ago
  }

  // Case A: Mai Phước Thành (@pthanh2803) is logged in
  if (resolved.id === USER_THANH.id) {
    return [
      metaAiConversation,
      {
        id: 'conv-thanh-sarah',
        participant: USER_SARAH,
        messages: initialMessagesThanhSarah,
        unreadCount: 0,
        updatedAt: '10:25 AM',
        lastActivityMs: now - 1000 * 60 * 15, // 15 mins ago
      },
      {
        id: 'conv-thanh-elena',
        participant: USER_ELENA,
        messages: initialMessagesThanhElena,
        unreadCount: 0,
        updatedAt: 'Yesterday',
        lastActivityMs: now - 1000 * 60 * 60 * 24, // Yesterday
      },
    ]
  }

  // Case B: Sarah Connor (@creative_coder) is logged in
  if (resolved.id === USER_SARAH.id) {
    return [
      metaAiConversation,
      {
        id: 'conv-thanh-sarah',
        participant: USER_THANH, // Participant is Mai Phước Thành!
        messages: initialMessagesThanhSarah,
        unreadCount: 0,
        updatedAt: '10:25 AM',
        lastActivityMs: now - 1000 * 60 * 15,
      },
      {
        id: 'conv-sarah-elena',
        participant: USER_ELENA, // Participant is Elena
        messages: initialMessagesSarahElena,
        unreadCount: 0,
        updatedAt: 'Oct 28',
        lastActivityMs: now - 1000 * 60 * 60 * 48, // 2 days ago
      },
    ]
  }

  // Case C: Elena Rostova (@chef_artisan) is logged in
  return [
    metaAiConversation,
    {
      id: 'conv-thanh-elena',
      participant: USER_THANH, // Participant is Mai Phước Thành!
      messages: initialMessagesThanhElena,
      unreadCount: 0,
      updatedAt: 'Yesterday',
      lastActivityMs: now - 1000 * 60 * 60 * 24,
    },
    {
      id: 'conv-sarah-elena',
      participant: USER_SARAH, // Participant is Sarah
      messages: initialMessagesSarahElena,
      unreadCount: 0,
      updatedAt: 'Oct 28',
      lastActivityMs: now - 1000 * 60 * 60 * 48,
    },
  ]
}

// Legacy export for backwards compatibility
export const mockConversations: IConversation[] = getConversationsForUser('user-thanh')
