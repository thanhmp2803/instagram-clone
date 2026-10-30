import type { IReel } from '@types'

export const mockReels: IReel[] = [
  {
    id: 'reel-1',
    videoUrl: 'https://assets.mixkit.co/videos/39767/39767-720.mp4',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=800&auto=format&fit=crop&q=80',
    author: {
      id: 'a0000000-0000-0000-0000-000000000001',
      username: 'creative_coder',
      name: 'Sarah Connor',
      avatar:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      isVerified: true,
      isFollowing: false,
    },
    caption:
      'Night coding sessions in Tokyo! 🌃✨ Smooth vertical reels with Next.js 15 and Tailwind CSS. What do you think? #coding #nextjs #nightvibes',
    audio: {
      id: 'audio-1',
      title: 'Midnight Synthwave - creative_coder',
      artist: 'creative_coder',
      coverUrl:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&auto=format&fit=crop&q=80',
      isOriginal: true,
    },
    likesCount: 124300,
    commentsCount: 1840,
    sharesCount: 3200,
    isLiked: false,
    isSaved: false,
    tags: ['coding', 'nextjs', 'nightvibes', 'developer'],
  },
  {
    id: 'reel-2',
    videoUrl: 'https://assets.mixkit.co/videos/34487/34487-720.mp4',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
    author: {
      id: 'a0000000-0000-0000-0000-000000000003',
      username: 'chef_artisan',
      name: 'Elena Rostova',
      avatar:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      isVerified: false,
      isFollowing: true,
    },
    caption:
      'Golden hour serenity at Da Nang beach 🌅🌊 Listening to the waves crashing is the best therapy. #nature #ocean #vietnam #travel',
    audio: {
      id: 'audio-2',
      title: 'Ocean Sunset Melodies',
      artist: 'Elena Rostova',
      coverUrl:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80',
      isOriginal: true,
    },
    likesCount: 89500,
    commentsCount: 642,
    sharesCount: 1530,
    isLiked: true,
    isSaved: true,
    tags: ['nature', 'ocean', 'vietnam', 'travel'],
  },
  {
    id: 'reel-3',
    videoUrl: 'https://assets.mixkit.co/videos/34404/34404-720.mp4',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&auto=format&fit=crop&q=80',
    author: {
      id: 'a0000000-0000-0000-0000-000000000005',
      username: 'pthanh2803',
      name: 'Mai Phước Thành',
      avatar: '/images/conmeo.jpg',
      isVerified: false,
      isFollowing: false,
    },
    caption:
      'Morning pour-over espresso ritual ☕✨ The rich aroma of freshly roasted Arabica beans. #coffee #coffeelover #espresso #latteart',
    audio: {
      id: 'audio-3',
      title: 'Cafe Lo-Fi Vibes',
      artist: 'pthanh2803',
      coverUrl: '/images/conmeo.jpg',
      isOriginal: true,
    },
    likesCount: 42100,
    commentsCount: 312,
    sharesCount: 980,
    isLiked: false,
    isSaved: false,
    tags: ['coffee', 'coffeelover', 'espresso', 'morning'],
  },
  {
    id: 'reel-4',
    videoUrl:
      'https://assets.mixkit.co/videos/preview/mixkit-tree-with-yellow-flowers-1173-large.mp4',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=800&auto=format&fit=crop&q=80',
    author: {
      id: 'a0000000-0000-0000-0000-000000000001',
      username: 'creative_coder',
      name: 'Sarah Connor',
      avatar:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      isVerified: true,
      isFollowing: false,
    },
    caption:
      'Spring vibes in bloom 🌸💛 Nature showing off its vibrant colors in the afternoon sun! #spring #flowers #sunshine',
    audio: {
      id: 'audio-4',
      title: 'Spring Waltz - Acoustic',
      artist: 'Sarah Connor',
      coverUrl:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&auto=format&fit=crop&q=80',
      isOriginal: false,
    },
    likesCount: 65400,
    commentsCount: 450,
    sharesCount: 890,
    isLiked: false,
    isSaved: false,
    tags: ['spring', 'flowers', 'sunshine'],
  },
  {
    id: 'reel-5',
    videoUrl:
      'https://assets.mixkit.co/videos/preview/mixkit-curvy-road-on-a-tree-covered-hill-41537-large.mp4',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&auto=format&fit=crop&q=80',
    author: {
      id: 'a0000000-0000-0000-0000-000000000003',
      username: 'chef_artisan',
      name: 'Elena Rostova',
      avatar:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      isVerified: false,
      isFollowing: true,
    },
    caption:
      'Winding road through the misty mountains 🌲🛣️ There is nothing quite like a weekend road trip. #roadtrip #travel #mountains',
    audio: {
      id: 'audio-5',
      title: 'Highway to Horizon',
      artist: 'Elena Rostova',
      coverUrl:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80',
      isOriginal: true,
    },
    likesCount: 112000,
    commentsCount: 980,
    sharesCount: 4320,
    isLiked: false,
    isSaved: false,
    tags: ['roadtrip', 'travel', 'mountains', 'freedom'],
  },
]
