-- ==============================================================================
-- INSTAGRAM CLONE: MIGRATION 005 - FULL BACKEND SEEDING & DEDUPLICATION
-- Run this script in your Supabase SQL Editor:
-- Supabase Dashboard -> SQL Editor -> New Query -> Paste & Run
-- ==============================================================================

-- 1. ENSURE ALL TABLES EXIST & HAVE OPEN PERMISSIVE RLS
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT DEFAULT '/images/nonuser.png',
  bio TEXT DEFAULT '',
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  image_url TEXT NOT NULL,
  caption TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.post_likes (
  user_id UUID NOT NULL,
  post_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, post_id)
);

CREATE TABLE IF NOT EXISTS public.post_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL,
  user_id UUID NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.reels (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  caption TEXT DEFAULT '',
  audio_title TEXT DEFAULT 'Original audio',
  audio_artist TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.reel_likes (
  user_id UUID NOT NULL,
  reel_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, reel_id)
);

CREATE TABLE IF NOT EXISTS public.follows (
  follower_id UUID NOT NULL,
  following_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (follower_id, following_id)
);

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recipient_id UUID NOT NULL,
  actor_id UUID NOT NULL,
  type TEXT NOT NULL,
  post_id UUID,
  comment_text TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.conversation_participants (
  conversation_id UUID NOT NULL,
  user_id UUID NOT NULL,
  PRIMARY KEY (conversation_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL,
  sender_id UUID NOT NULL,
  text TEXT NOT NULL,
  liked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ENABLE ROW LEVEL SECURITY & OPEN POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "profiles_open_policy" ON public.profiles;
CREATE POLICY "profiles_open_policy" ON public.profiles FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "posts_open_policy" ON public.posts;
CREATE POLICY "posts_open_policy" ON public.posts FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "post_likes_open_policy" ON public.post_likes;
CREATE POLICY "post_likes_open_policy" ON public.post_likes FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "post_comments_open_policy" ON public.post_comments;
CREATE POLICY "post_comments_open_policy" ON public.post_comments FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.reels ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "reels_open_policy" ON public.reels;
CREATE POLICY "reels_open_policy" ON public.reels FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.reel_likes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "reel_likes_open_policy" ON public.reel_likes;
CREATE POLICY "reel_likes_open_policy" ON public.reel_likes FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "follows_open_policy" ON public.follows;
CREATE POLICY "follows_open_policy" ON public.follows FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "notifications_open_policy" ON public.notifications;
CREATE POLICY "notifications_open_policy" ON public.notifications FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "conversations_open_policy" ON public.conversations;
CREATE POLICY "conversations_open_policy" ON public.conversations FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "participants_open_policy" ON public.conversation_participants;
CREATE POLICY "participants_open_policy" ON public.conversation_participants FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "messages_open_policy" ON public.messages;
CREATE POLICY "messages_open_policy" ON public.messages FOR ALL USING (true) WITH CHECK (true);

-- 3. ENSURE DEMO PROFILES EXIST WITH CORRECT METADATA & AVATAR
DO $$
BEGIN
  -- Sarah Connor (creative_coder)
  IF EXISTS (SELECT 1 FROM public.profiles WHERE username = 'creative_coder') THEN
    UPDATE public.profiles
    SET full_name = 'Sarah Connor',
        avatar_url = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        bio = 'Frontend Engineer & UI enthusiast 💻 Building modern web experiences ✨ SF, California',
        is_verified = true
    WHERE username = 'creative_coder';
  ELSE
    INSERT INTO public.profiles (id, username, full_name, avatar_url, bio, is_verified)
    VALUES (
      'a0000000-0000-0000-0000-000000000001',
      'creative_coder',
      'Sarah Connor',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      'Frontend Engineer & UI enthusiast 💻 Building modern web experiences ✨ SF, California',
      true
    );
  END IF;

  -- Elena Rostova (chef_artisan)
  IF EXISTS (SELECT 1 FROM public.profiles WHERE username = 'chef_artisan') THEN
    UPDATE public.profiles
    SET full_name = 'Elena Rostova',
        avatar_url = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        bio = 'Sourdough baker & Culinary creator 🥖 Sourdough workshops & slow fermentation 🧈',
        is_verified = false
    WHERE username = 'chef_artisan';
  ELSE
    INSERT INTO public.profiles (id, username, full_name, avatar_url, bio, is_verified)
    VALUES (
      'a0000000-0000-0000-0000-000000000003',
      'chef_artisan',
      'Elena Rostova',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      'Sourdough baker & Culinary creator 🥖 Sourdough workshops & slow fermentation 🧈',
      false
    );
  END IF;

  -- Mai Phước Thành (pthanh2803)
  IF EXISTS (SELECT 1 FROM public.profiles WHERE username = 'pthanh2803') THEN
    UPDATE public.profiles
    SET full_name = 'Mai Phước Thành',
        avatar_url = '/images/conmeo.jpg',
        bio = 'Hi, I''m Thanh, a Frontend Developer. Passionate about Next.js, React & UI/UX 💻'
    WHERE username = 'pthanh2803';
  ELSE
    INSERT INTO public.profiles (id, username, full_name, avatar_url, bio, is_verified)
    VALUES (
      'a0000000-0000-0000-0000-000000000005',
      'pthanh2803',
      'Mai Phước Thành',
      '/images/conmeo.jpg',
      'Hi, I''m Thanh, a Frontend Developer. Passionate about Next.js, React & UI/UX 💻',
      false
    );
  END IF;
END $$;

-- 4. SEED REAL POSTS (SARAH & ELENA)
DO $$
DECLARE
  sarah_id UUID;
  elena_id UUID;
  thanh_id UUID;
  post1_id UUID;
  post2_id UUID;
  post3_id UUID;
BEGIN
  SELECT id INTO sarah_id FROM public.profiles WHERE username = 'creative_coder' LIMIT 1;
  SELECT id INTO elena_id FROM public.profiles WHERE username = 'chef_artisan' LIMIT 1;
  SELECT id INTO thanh_id FROM public.profiles WHERE username = 'pthanh2803' LIMIT 1;

  -- Sarah's Posts
  IF sarah_id IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM public.posts WHERE user_id = sarah_id AND caption LIKE '%Tailwind%') THEN
      INSERT INTO public.posts (id, user_id, image_url, caption, created_at)
      VALUES (
        gen_random_uuid(),
        sarah_id,
        'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1000&auto=format&fit=crop&q=80',
        'Late night coding with Next.js 15 & Tailwind CSS ✨ Dark theme vibes!',
        NOW() - INTERVAL '3 hours'
      ) RETURNING id INTO post1_id;

      -- Add a comment
      IF post1_id IS NOT NULL AND elena_id IS NOT NULL THEN
        INSERT INTO public.post_comments (post_id, user_id, text, created_at)
        VALUES (post1_id, elena_id, 'Trông đỉnh quá bạn ơi! 💻🔥', NOW() - INTERVAL '2 hours');
      END IF;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public.posts WHERE user_id = sarah_id AND caption LIKE '%Coffee%') THEN
      INSERT INTO public.posts (id, user_id, image_url, caption, created_at)
      VALUES (
        gen_random_uuid(),
        sarah_id,
        'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1000&auto=format&fit=crop&q=80',
        'Coffee & clean code ☕ The only morning routine I need.',
        NOW() - INTERVAL '1 day'
      );
    END IF;
  END IF;

  -- Elena's Posts
  IF elena_id IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM public.posts WHERE user_id = elena_id AND caption LIKE '%Sourdough%') THEN
      INSERT INTO public.posts (id, user_id, image_url, caption, created_at)
      VALUES (
        gen_random_uuid(),
        elena_id,
        'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1000&auto=format&fit=crop&q=80',
        'Fresh artisan sourdough straight out of the Dutch oven! 🥖🌾 Crispy crust and open crumb.',
        NOW() - INTERVAL '5 hours'
      ) RETURNING id INTO post2_id;

      IF post2_id IS NOT NULL AND sarah_id IS NOT NULL THEN
        INSERT INTO public.post_comments (post_id, user_id, text, created_at)
        VALUES (post2_id, sarah_id, 'Nhìn ngon và giòn rụm quá Elena! 😍', NOW() - INTERVAL '4 hours');
      END IF;
    END IF;
  END IF;

  -- Thanh's Posts
  IF thanh_id IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM public.posts WHERE user_id = thanh_id) THEN
      INSERT INTO public.posts (id, user_id, image_url, caption, created_at)
      VALUES (
        gen_random_uuid(),
        thanh_id,
        'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1000&auto=format&fit=crop&q=80',
        'Xây dựng Instagram Clone với Supabase & Next.js 🚀 Backend mượt mà không cần hardcode!',
        NOW() - INTERVAL '30 minutes'
      );
    END IF;
  END IF;
END $$;

-- 5. SEED REAL REELS (High quality vertical 9:16 videos)
DO $$
DECLARE
  sarah_id UUID;
  elena_id UUID;
  thanh_id UUID;
BEGIN
  SELECT id INTO sarah_id FROM public.profiles WHERE username = 'creative_coder' LIMIT 1;
  SELECT id INTO elena_id FROM public.profiles WHERE username = 'chef_artisan' LIMIT 1;
  SELECT id INTO thanh_id FROM public.profiles WHERE username = 'pthanh2803' LIMIT 1;

  -- Clean up any old broken sample videos
  DELETE FROM public.reels WHERE video_url LIKE '%commondatastorage.googleapis.com%';

  -- Reel 1: Tokyo Night City (Sarah)
  IF sarah_id IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM public.reels WHERE video_url LIKE '%39767%') THEN
      INSERT INTO public.reels (id, user_id, video_url, thumbnail_url, caption, audio_title, audio_artist, created_at)
      VALUES (
        gen_random_uuid(),
        sarah_id,
        'https://assets.mixkit.co/videos/39767/39767-720.mp4',
        'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=800&auto=format&fit=crop&q=80',
        'Night coding sessions in Tokyo! 🌃✨ Smooth vertical reels with Next.js 15 and Tailwind CSS. What do you think? #coding #nextjs #nightvibes',
        'Midnight Synthwave - creative_coder',
        'creative_coder',
        NOW() - INTERVAL '2 days'
      );
    END IF;

    -- Reel 2: Spring Flowers (Sarah)
    IF NOT EXISTS (SELECT 1 FROM public.reels WHERE video_url LIKE '%1173%') THEN
      INSERT INTO public.reels (id, user_id, video_url, thumbnail_url, caption, audio_title, audio_artist, created_at)
      VALUES (
        gen_random_uuid(),
        sarah_id,
        'https://assets.mixkit.co/videos/preview/mixkit-tree-with-yellow-flowers-1173-large.mp4',
        'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=800&auto=format&fit=crop&q=80',
        'Spring vibes in bloom 🌸💛 Nature showing off its vibrant colors in the afternoon sun! #spring #flowers #sunshine',
        'Spring Waltz - Acoustic',
        'creative_coder',
        NOW() - INTERVAL '3 days'
      );
    END IF;
  END IF;

  -- Reel 3: Ocean Sunset Beach (Elena)
  IF elena_id IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM public.reels WHERE video_url LIKE '%34487%') THEN
      INSERT INTO public.reels (id, user_id, video_url, thumbnail_url, caption, audio_title, audio_artist, created_at)
      VALUES (
        gen_random_uuid(),
        elena_id,
        'https://assets.mixkit.co/videos/34487/34487-720.mp4',
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
        'Golden hour serenity at Da Nang beach 🌅🌊 Listening to the waves crashing is the best therapy. #nature #ocean #vietnam #travel',
        'Ocean Sunset Melodies',
        'chef_artisan',
        NOW() - INTERVAL '1 day'
      );
    END IF;

    -- Reel 4: Mountain Road (Elena)
    IF NOT EXISTS (SELECT 1 FROM public.reels WHERE video_url LIKE '%41537%') THEN
      INSERT INTO public.reels (id, user_id, video_url, thumbnail_url, caption, audio_title, audio_artist, created_at)
      VALUES (
        gen_random_uuid(),
        elena_id,
        'https://assets.mixkit.co/videos/preview/mixkit-curvy-road-on-a-tree-covered-hill-41537-large.mp4',
        'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&auto=format&fit=crop&q=80',
        'Winding road through the misty mountains 🌲🛣️ There is nothing quite like a weekend road trip. #roadtrip #travel #mountains',
        'Highway to Horizon',
        'chef_artisan',
        NOW() - INTERVAL '4 days'
      );
    END IF;
  END IF;

  -- Reel 5: Coffee Espresso Pour-over (Thanh)
  IF thanh_id IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM public.reels WHERE video_url LIKE '%34404%') THEN
      INSERT INTO public.reels (id, user_id, video_url, thumbnail_url, caption, audio_title, audio_artist, created_at)
      VALUES (
        gen_random_uuid(),
        thanh_id,
        'https://assets.mixkit.co/videos/34404/34404-720.mp4',
        'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&auto=format&fit=crop&q=80',
        'Morning pour-over espresso ritual ☕✨ The rich aroma of freshly roasted Arabica beans. #coffee #coffeelover #espresso',
        'Cafe Lo-Fi Beats',
        'pthanh2803',
        NOW() - INTERVAL '6 hours'
      );
    END IF;
  END IF;
END $$;

-- 6. SEED FOLLOW RELATIONSHIPS
DO $$
DECLARE
  sarah_id UUID;
  elena_id UUID;
  thanh_id UUID;
BEGIN
  SELECT id INTO sarah_id FROM public.profiles WHERE username = 'creative_coder' LIMIT 1;
  SELECT id INTO elena_id FROM public.profiles WHERE username = 'chef_artisan' LIMIT 1;
  SELECT id INTO thanh_id FROM public.profiles WHERE username = 'pthanh2803' LIMIT 1;

  IF sarah_id IS NOT NULL AND elena_id IS NOT NULL THEN
    INSERT INTO public.follows (follower_id, following_id)
    VALUES (sarah_id, elena_id)
    ON CONFLICT DO NOTHING;

    INSERT INTO public.follows (follower_id, following_id)
    VALUES (elena_id, sarah_id)
    ON CONFLICT DO NOTHING;
  END IF;

  IF thanh_id IS NOT NULL AND sarah_id IS NOT NULL THEN
    INSERT INTO public.follows (follower_id, following_id)
    VALUES (thanh_id, sarah_id)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

