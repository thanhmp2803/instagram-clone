export interface IMessageUser {
  id: string
  username: string
  name: string
  avatar: string
  isVerified?: boolean
  isOnline?: boolean
  lastSeen?: string
  bio?: string
}

export interface IMessage {
  id: string
  senderId: string
  text: string
  timestamp: string
  status?: 'sent' | 'delivered' | 'read'
  liked?: boolean
}

export interface IConversation {
  id: string
  participant: IMessageUser
  messages: IMessage[]
  unreadCount?: number
  updatedAt: string
  lastActivityMs?: number
}

export interface IChatListProps {
  conversations: IConversation[]
  selectedConversationId: string | null
  onSelectConversation: (id: string) => void
  currentUser: IMessageUser
  searchQuery: string
  onSearchChange: (query: string) => void
}

export interface IChatListItemProps {
  conversation: IConversation
  isSelected: boolean
  onClick: () => void
}

export interface IChatRoomProps {
  conversation: IConversation | null
  currentUser: IMessageUser
  onSendMessage: (text: string) => void
  onToggleLikeMessage?: (messageId: string) => void
  onBack?: () => void
}

export interface IMessageBubbleProps {
  message: IMessage
  isCurrentUser: boolean
  participant: IMessageUser
  onToggleLike?: (messageId: string) => void
}

