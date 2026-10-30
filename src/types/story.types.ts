export interface IStoryItem {
  id: string
  userId: string
  mediaUrl: string
  mediaType: 'image' | 'video'
  caption?: string
  createdAt: string
  expiresAt?: string
}

export interface IUserStories {
  userId: string
  username: string
  fullName: string
  avatarUrl: string
  isVerified?: boolean
  hasUnseen?: boolean
  stories: IStoryItem[]
}
