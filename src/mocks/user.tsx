import { UserProfile } from '@types'

// 1. Mai Phước Thành (@pthanh2803) - Primary Account
export const USER_PROFILE_THANH: UserProfile = {
  username: 'pthanh2803',
  fullName: 'Mai Phước Thành',
  avatar: '/images/conmeo.jpg',
  bio: "Hi, I'm Thanh, a Frontend Developer. Passionate about Next.js, React & UI/UX 💻",
  posts: 9,
  followers: 340,
  following: 120,
  isVerified: false,
}

// 2. Sarah Connor (@creative_coder) - Sample Account 1
export const USER_PROFILE_SARAH: UserProfile = {
  username: 'creative_coder',
  fullName: 'Sarah Connor',
  avatar:
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  bio: 'Frontend Engineer & UI enthusiast 💻 Building modern web experiences ✨ SF, California',
  posts: 9,
  followers: 1420,
  following: 280,
  isVerified: true,
}

// 3. Elena Rostova (@chef_artisan) - Sample Account 2
export const USER_PROFILE_ELENA: UserProfile = {
  username: 'chef_artisan',
  fullName: 'Elena Rostova',
  avatar:
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  bio: 'Sourdough baker & Culinary creator 🥖 Sourdough workshops & slow fermentation 🧈',
  posts: 9,
  followers: 2890,
  following: 412,
  isVerified: false,
}

// Default export for backwards compatibility
export const mockUserProfile: UserProfile = USER_PROFILE_THANH

// Posts for Mai Phước Thành (Tech, Dev Setup, Coding)
export const mockUserPosts = [
  {
    id: 1,
    imageUrl:
      'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80',
    type: 'post',
  },
  {
    id: 2,
    imageUrl:
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80',
    type: 'post',
  },
  {
    id: 3,
    imageUrl:
      'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80',
    type: 'post',
  },
  {
    id: 4,
    imageUrl:
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&auto=format&fit=crop&q=80',
    type: 'post',
  },
  {
    id: 5,
    imageUrl:
      'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=600&auto=format&fit=crop&q=80',
    type: 'post',
  },
  {
    id: 6,
    imageUrl:
      'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&auto=format&fit=crop&q=80',
    type: 'post',
  },
  {
    id: 7,
    imageUrl:
      'https://images.unsplash.com/photo-1537432376769-00f5c2f4c8d2?w=600&auto=format&fit=crop&q=80',
    type: 'post',
  },
  {
    id: 8,
    imageUrl:
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80',
    type: 'post',
  },
  {
    id: 9,
    imageUrl:
      'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&auto=format&fit=crop&q=80',
    type: 'post',
  },
]

export const mockUserReels = [
  {
    id: 1,
    imageUrl:
      'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=600&auto=format&fit=crop&q=80',
    type: 'reel',
  },
  {
    id: 2,
    imageUrl:
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80',
    type: 'reel',
  },
  {
    id: 3,
    imageUrl:
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&auto=format&fit=crop&q=80',
    type: 'reel',
  },
]

// Posts for Sarah Connor (UI/UX Design, Coffee, Workspace, Lifestyle)
export const userPostsSarah = [
  {
    id: 101,
    imageUrl:
      'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=600&auto=format&fit=crop&q=80',
    type: 'post',
  },
  {
    id: 102,
    imageUrl:
      'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=600&auto=format&fit=crop&q=80',
    type: 'post',
  },
  {
    id: 103,
    imageUrl:
      'https://images.unsplash.com/photo-1542744094-3a31f272c490?w=600&auto=format&fit=crop&q=80',
    type: 'post',
  },
  {
    id: 104,
    imageUrl:
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&auto=format&fit=crop&q=80',
    type: 'post',
  },
  {
    id: 105,
    imageUrl:
      'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&auto=format&fit=crop&q=80',
    type: 'post',
  },
  {
    id: 106,
    imageUrl:
      'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&auto=format&fit=crop&q=80',
    type: 'post',
  },
  {
    id: 107,
    imageUrl:
      'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=600&auto=format&fit=crop&q=80',
    type: 'post',
  },
  {
    id: 108,
    imageUrl:
      'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=600&auto=format&fit=crop&q=80',
    type: 'post',
  },
  {
    id: 109,
    imageUrl:
      'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=600&auto=format&fit=crop&q=80',
    type: 'post',
  },
]

export const userReelsSarah = [
  {
    id: 101,
    imageUrl:
      'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=600&auto=format&fit=crop&q=80',
    type: 'reel',
  },
  {
    id: 102,
    imageUrl:
      'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=600&auto=format&fit=crop&q=80',
    type: 'reel',
  },
]

// Posts for Elena Rostova (Sourdough, Artisan Bakery, Pastry)
export const userPostsElena = [
  {
    id: 201,
    imageUrl:
      'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80',
    type: 'post',
  },
  {
    id: 202,
    imageUrl:
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80',
    type: 'post',
  },
  {
    id: 203,
    imageUrl:
      'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=600&auto=format&fit=crop&q=80',
    type: 'post',
  },
  {
    id: 204,
    imageUrl:
      'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=600&auto=format&fit=crop&q=80',
    type: 'post',
  },
  {
    id: 205,
    imageUrl:
      'https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=600&auto=format&fit=crop&q=80',
    type: 'post',
  },
  {
    id: 206,
    imageUrl:
      'https://images.unsplash.com/photo-1568254183919-78a4f43a2877?w=600&auto=format&fit=crop&q=80',
    type: 'post',
  },
  {
    id: 207,
    imageUrl:
      'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?w=600&auto=format&fit=crop&q=80',
    type: 'post',
  },
  {
    id: 208,
    imageUrl:
      'https://images.unsplash.com/photo-1579697096985-41fe1430e5df?w=600&auto=format&fit=crop&q=80',
    type: 'post',
  },
  {
    id: 209,
    imageUrl:
      'https://images.unsplash.com/photo-1511018556340-d16986a1c194?w=600&auto=format&fit=crop&q=80',
    type: 'post',
  },
]

export const userReelsElena = [
  {
    id: 201,
    imageUrl:
      'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80',
    type: 'reel',
  },
  {
    id: 202,
    imageUrl:
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80',
    type: 'reel',
  },
]

export const mockUserTagged = [
  {
    id: 1,
    imageUrl:
      'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&auto=format&fit=crop&q=80',
    type: 'tagged',
  },
  {
    id: 2,
    imageUrl:
      'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&auto=format&fit=crop&q=80',
    type: 'tagged',
  },
  {
    id: 3,
    imageUrl:
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&auto=format&fit=crop&q=80',
    type: 'tagged',
  },
]

// Helper function to resolve dynamic profile and post data by account
export function getUserProfileData(userIdOrUsername?: string | null) {
  const idLower = (userIdOrUsername || '').toLowerCase()

  if (
    idLower.includes('sarah') ||
    idLower.includes('creative_coder') ||
    idLower === 'a0000000-0000-0000-0000-000000000001'
  ) {
    return {
      profile: USER_PROFILE_SARAH,
      posts: userPostsSarah,
      reels: userReelsSarah,
      tagged: mockUserTagged,
    }
  }

  if (
    idLower.includes('elena') ||
    idLower.includes('chef_artisan') ||
    idLower === 'a0000000-0000-0000-0000-000000000003'
  ) {
    return {
      profile: USER_PROFILE_ELENA,
      posts: userPostsElena,
      reels: userReelsElena,
      tagged: mockUserTagged,
    }
  }

  // Default: Mai Phước Thành (@pthanh2803)
  return {
    profile: USER_PROFILE_THANH,
    posts: mockUserPosts,
    reels: mockUserReels,
    tagged: mockUserTagged,
  }
}
