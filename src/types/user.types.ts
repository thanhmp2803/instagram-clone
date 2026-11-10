export interface UserProfile {
  username: string
  fullName: string
  avatar: string
  bio?: string
  posts: number
  followers: number
  following: number
  isVerified?: boolean
}
