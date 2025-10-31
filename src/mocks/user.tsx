import { UserProfile } from '@types'

export const mockUserProfile: UserProfile = {
  username: 'pthanh2803',
  fullName: 'Mai Phước Thành',
  avatar: '/images/conmeo.jpg',
  bio: "Hi, I'm Thanh, a Frontend Developer.",
  posts: 0,
  followers: 7,
  following: 100,
  isVerified: false,
}

export const mockUserPosts = [
  { id: 1, imageUrl: 'https://picsum.photos/400/533?random=1', type: 'post' },
  { id: 2, imageUrl: 'https://picsum.photos/400/533?random=2', type: 'post' },
  { id: 3, imageUrl: 'https://picsum.photos/400/533?random=3', type: 'post' },
  { id: 4, imageUrl: 'https://picsum.photos/400/533?random=4', type: 'post' },
  { id: 5, imageUrl: 'https://picsum.photos/400/533?random=5', type: 'post' },
  { id: 6, imageUrl: 'https://picsum.photos/400/533?random=6', type: 'post' },
  { id: 7, imageUrl: 'https://picsum.photos/400/533?random=7', type: 'post' },
  { id: 8, imageUrl: 'https://picsum.photos/400/533?random=8', type: 'post' },
  { id: 9, imageUrl: 'https://picsum.photos/400/533?random=9', type: 'post' },
]

export const mockUserReels = [
  { id: 1, imageUrl: 'https://picsum.photos/400/622?random=11', type: 'reel' },
  { id: 2, imageUrl: 'https://picsum.photos/400/622?random=12', type: 'reel' },
  { id: 3, imageUrl: 'https://picsum.photos/400/622?random=13', type: 'reel' },
  { id: 4, imageUrl: 'https://picsum.photos/400/622?random=14', type: 'reel' },
  { id: 5, imageUrl: 'https://picsum.photos/400/622?random=15', type: 'reel' },
  { id: 6, imageUrl: 'https://picsum.photos/400/622?random=16', type: 'reel' },
]

export const mockUserTagged = [
  { id: 1, imageUrl: 'https://picsum.photos/400/533?random=21', type: 'tagged' },
  { id: 2, imageUrl: 'https://picsum.photos/400/533?random=22', type: 'tagged' },
  { id: 3, imageUrl: 'https://picsum.photos/400/533?random=23', type: 'tagged' },
  { id: 4, imageUrl: 'https://picsum.photos/400/533?random=24', type: 'tagged' },
  { id: 5, imageUrl: 'https://picsum.photos/400/533?random=25', type: 'tagged' },
  { id: 6, imageUrl: 'https://picsum.photos/400/533?random=26', type: 'tagged' },
  { id: 7, imageUrl: 'https://picsum.photos/400/533?random=27', type: 'tagged' },
  { id: 8, imageUrl: 'https://picsum.photos/400/533?random=28', type: 'tagged' },
  { id: 9, imageUrl: 'https://picsum.photos/400/533?random=29', type: 'tagged' },
]
