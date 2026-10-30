import type { IReel } from '@types'

export const mockReels: IReel[] = [
  {
    id: 'reel-1',
    videoUrl:
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=800&auto=format&fit=crop&q=80',
    author: {
      id: 'author-1',
      username: 'creative_coder',
      name: 'Sarah Connor',
      avatar:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      isVerified: true,
      isFollowing: false,
    },
    caption:
      'Building smooth vertical reels in Next.js 15 and Tailwind CSS! 💻✨ What do you think about CSS scroll snapping? #coding #reactjs #webdev #frontend',
    audio: {
      id: 'audio-1',
      title: 'Original audio - creative_coder',
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
    tags: ['coding', 'reactjs', 'webdev', 'frontend'],
  },
  {
    id: 'reel-2',
    videoUrl:
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&auto=format&fit=crop&q=80',
    author: {
      id: 'author-2',
      username: 'wanderlust_sam',
      name: 'Sam Wilson',
      avatar:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      isVerified: true,
      isFollowing: true,
    },
    caption:
      'Lost in the beauty of endless horizons. Never stop exploring the unseen world 🏔️🌲 #travel #nature #wanderlust #escapism',
    audio: {
      id: 'audio-2',
      title: 'Golden Hour (Chill Remix)',
      artist: 'JVKE ft. Chill Masters',
      coverUrl:
        'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=80&auto=format&fit=crop&q=80',
      isOriginal: false,
    },
    likesCount: 89500,
    commentsCount: 642,
    sharesCount: 1530,
    isLiked: true,
    isSaved: true,
    tags: ['travel', 'nature', 'wanderlust'],
  },
  {
    id: 'reel-3',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop&q=80',
    author: {
      id: 'author-3',
      username: 'doggo_chronicles',
      name: 'Golden Leo',
      avatar:
        'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=150&auto=format&fit=crop&q=80',
      isVerified: false,
      isFollowing: false,
    },
    caption:
      'When they tell you it is time for a walk vs when you actually reach the park 🐶❤️ Who can relate? #dogsoftiktok #cute #puppylove',
    audio: {
      id: 'audio-3',
      title: 'Happy Doggy Anthem',
      artist: 'Pet Beats Worldwide',
      coverUrl:
        'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=80&auto=format&fit=crop&q=80',
      isOriginal: false,
    },
    likesCount: 342100,
    commentsCount: 4210,
    sharesCount: 18900,
    isLiked: false,
    isSaved: false,
    tags: ['dogsoftiktok', 'cute', 'puppylove'],
  },
  {
    id: 'reel-4',
    videoUrl:
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80',
    author: {
      id: 'author-4',
      username: 'urban_vibes',
      name: 'Marcus Chen',
      avatar:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      isVerified: true,
      isFollowing: false,
    },
    caption:
      'Night lights and city rhythms. Exploring Tokyo alleyways after midnight 🌃🏮 #tokyo #citylife #cyberpunk #cinematic',
    audio: {
      id: 'audio-4',
      title: 'Midnight City Lights - Synthwave',
      artist: 'Neo Tokyo Wave',
      coverUrl:
        'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=80&auto=format&fit=crop&q=80',
      isOriginal: true,
    },
    likesCount: 67300,
    commentsCount: 512,
    sharesCount: 980,
    isLiked: false,
    isSaved: false,
    tags: ['tokyo', 'citylife', 'cyberpunk'],
  },
  {
    id: 'reel-5',
    videoUrl:
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80',
    author: {
      id: 'author-5',
      username: 'chef_artisan',
      name: 'Elena Rostova',
      avatar:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      isVerified: false,
      isFollowing: true,
    },
    caption:
      'Crispy sourdough and roasted garlic butter. The sound crunch is everything 🥖🧈 Turn your sound ON! #foodporn #baking #sourdough #cheflife',
    audio: {
      id: 'audio-5',
      title: 'Crispy ASMR Kitchen Session',
      artist: 'Artisan Eats',
      coverUrl:
        'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=80&auto=format&fit=crop&q=80',
      isOriginal: true,
    },
    likesCount: 215400,
    commentsCount: 2310,
    sharesCount: 8400,
    isLiked: false,
    isSaved: true,
    tags: ['foodporn', 'baking', 'sourdough'],
  },
  {
    id: 'reel-6',
    videoUrl:
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format&fit=crop&q=80',
    author: {
      id: 'author-6',
      username: 'speed_junkies',
      name: 'Apex Racers',
      avatar:
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      isVerified: true,
      isFollowing: false,
    },
    caption:
      'Pure adrenaline on the mountain passes. The exhaust note is unmatched 🏎️💨 #supercars #drift #racing #cars',
    audio: {
      id: 'audio-6',
      title: 'Original Audio - V8 Twin Turbo',
      artist: 'Apex Racers',
      coverUrl:
        'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=80&auto=format&fit=crop&q=80',
      isOriginal: true,
    },
    likesCount: 452900,
    commentsCount: 5930,
    sharesCount: 31200,
    isLiked: true,
    isSaved: false,
    tags: ['supercars', 'drift', 'racing'],
  },
]
