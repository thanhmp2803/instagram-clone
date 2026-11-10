export interface IReelAuthor {
  id: string
  username: string
  name?: string
  avatar: string
  isVerified?: boolean
  isFollowing?: boolean
}

export interface IReelAudio {
  id: string
  title: string
  artist: string
  coverUrl?: string
  isOriginal?: boolean
}

export interface IReel {
  id: string
  videoUrl: string
  thumbnailUrl?: string
  author: IReelAuthor
  caption: string
  audio: IReelAudio
  likesCount: number
  commentsCount: number
  sharesCount: number
  isLiked?: boolean
  isSaved?: boolean
  tags?: string[]
  createdAt?: string
}

export interface IVideoPlayerProps {
  src: string
  poster?: string
  isMuted: boolean
  onToggleMute: () => void
  isActive: boolean
  reelId?: string
  onDoubleTap?: () => void
}

export interface IReelSidebarProps {
  reel: IReel
  isLiked: boolean
  likesCount: number
  isSaved: boolean
  onToggleLike: () => void
  onToggleSave: () => void
  onOpenComments?: () => void
  onShare?: () => void
}

export interface IReelInfoProps {
  author: IReelAuthor
  caption: string
  audio: IReelAudio
  isFollowing?: boolean
  onToggleFollow?: () => void
}

export interface IReelItemProps {
  reel: IReel
  isActive: boolean
  isGlobalMuted: boolean
  onToggleGlobalMute: () => void
}
