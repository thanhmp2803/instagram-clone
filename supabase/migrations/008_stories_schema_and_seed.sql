-- ==============================================================================
-- INSTAGRAM CLONE: MIGRATION 008 - STORIES SCHEMA & SEED DATA
-- Chạy script này trong Supabase SQL Editor (Dashboard > SQL Editor > New query)
-- ==============================================================================

-- 1. TẠO BẢNG STORIES
CREATE TABLE IF NOT EXISTS public.stories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  media_url TEXT NOT NULL,
  media_type TEXT DEFAULT 'image', -- 'image' hoặc 'video'
  caption TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours')
);

-- 2. THIẾT LẬP ROW LEVEL SECURITY (RLS)
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  DROP POLICY IF EXISTS "Stories are viewable by everyone" ON public.stories;
  CREATE POLICY "Stories are viewable by everyone" ON public.stories FOR SELECT USING (true);

  DROP POLICY IF EXISTS "Users can insert stories" ON public.stories;
  CREATE POLICY "Users can insert stories" ON public.stories FOR INSERT WITH CHECK (true);

  DROP POLICY IF EXISTS "Users can delete own stories" ON public.stories;
  CREATE POLICY "Users can delete own stories" ON public.stories FOR DELETE USING (true);
END $$;

-- 3. SEED CÁC TÀI KHOẢN VÀ STORIES MẪU ĐA DẠNG
DO $$
DECLARE
  v_sarah_id UUID;
  v_elena_id UUID;
  v_travel_id UUID;
  v_coffee_id UUID;
  v_artist_id UUID;
  v_gym_id UUID;
BEGIN
  -- 3.1. Tìm hoặc tạo Sarah Connor (creative_coder)
  SELECT id INTO v_sarah_id FROM public.profiles WHERE username = 'creative_coder' LIMIT 1;
  IF v_sarah_id IS NULL THEN
    v_sarah_id := gen_random_uuid();
    INSERT INTO public.profiles (id, username, full_name, avatar_url, bio, is_verified)
    VALUES (
      v_sarah_id,
      'creative_coder',
      'Sarah Connor',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      'Frontend Engineer & UI enthusiast 💻 Building modern web experiences ✨ SF, California',
      true
    )
    ON CONFLICT (username) DO UPDATE SET full_name = EXCLUDED.full_name;
    SELECT id INTO v_sarah_id FROM public.profiles WHERE username = 'creative_coder' LIMIT 1;
  END IF;

  -- 3.2. Tìm hoặc tạo Elena Rostova (chef_artisan)
  SELECT id INTO v_elena_id FROM public.profiles WHERE username = 'chef_artisan' LIMIT 1;
  IF v_elena_id IS NULL THEN
    v_elena_id := gen_random_uuid();
    INSERT INTO public.profiles (id, username, full_name, avatar_url, bio, is_verified)
    VALUES (
      v_elena_id,
      'chef_artisan',
      'Elena Rostova',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      'Sourdough baker & Culinary creator 🥖 Sourdough workshops & slow fermentation 🧈',
      false
    )
    ON CONFLICT (username) DO UPDATE SET full_name = EXCLUDED.full_name;
    SELECT id INTO v_elena_id FROM public.profiles WHERE username = 'chef_artisan' LIMIT 1;
  END IF;

  -- 3.3. Tìm hoặc tạo Alex Rivera (travel_lover)
  SELECT id INTO v_travel_id FROM public.profiles WHERE username = 'travel_lover' LIMIT 1;
  IF v_travel_id IS NULL THEN
    v_travel_id := gen_random_uuid();
    INSERT INTO public.profiles (id, username, full_name, avatar_url, bio, is_verified)
    VALUES (
      v_travel_id,
      'travel_lover',
      'Alex Rivera',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      'Travel photographer & Wanderlust explorer 🏖️ Chasing sunsets worldwide ✈️',
      true
    )
    ON CONFLICT (username) DO UPDATE SET full_name = EXCLUDED.full_name;
    SELECT id INTO v_travel_id FROM public.profiles WHERE username = 'travel_lover' LIMIT 1;
  END IF;

  -- 3.4. Tìm hoặc tạo Liam Chen (coffee_addict)
  SELECT id INTO v_coffee_id FROM public.profiles WHERE username = 'coffee_addict' LIMIT 1;
  IF v_coffee_id IS NULL THEN
    v_coffee_id := gen_random_uuid();
    INSERT INTO public.profiles (id, username, full_name, avatar_url, bio, is_verified)
    VALUES (
      v_coffee_id,
      'coffee_addict',
      'Liam Chen',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      'Specialty Barista & Roaster ☕ Cupping notes & latte art 🦢',
      false
    )
    ON CONFLICT (username) DO UPDATE SET full_name = EXCLUDED.full_name;
    SELECT id INTO v_coffee_id FROM public.profiles WHERE username = 'coffee_addict' LIMIT 1;
  END IF;

  -- 3.5. Tìm hoặc tạo Chloe Bennett (artist_soul)
  SELECT id INTO v_artist_id FROM public.profiles WHERE username = 'artist_soul' LIMIT 1;
  IF v_artist_id IS NULL THEN
    v_artist_id := gen_random_uuid();
    INSERT INTO public.profiles (id, username, full_name, avatar_url, bio, is_verified)
    VALUES (
      v_artist_id,
      'artist_soul',
      'Chloe Bennett',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      'Digital Illustrator & Oil painter 🎨 Visual stories & gallery exhibits ✨',
      true
    )
    ON CONFLICT (username) DO UPDATE SET full_name = EXCLUDED.full_name;
    SELECT id INTO v_artist_id FROM public.profiles WHERE username = 'artist_soul' LIMIT 1;
  END IF;

  -- 3.6. Tìm hoặc tạo Marcus Vance (gym_warrior)
  SELECT id INTO v_gym_id FROM public.profiles WHERE username = 'gym_warrior' LIMIT 1;
  IF v_gym_id IS NULL THEN
    v_gym_id := gen_random_uuid();
    INSERT INTO public.profiles (id, username, full_name, avatar_url, bio, is_verified)
    VALUES (
      v_gym_id,
      'gym_warrior',
      'Marcus Vance',
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
      'Calisthenics & Fitness coach 💪 Never skip a workout session #stayfit',
      false
    )
    ON CONFLICT (username) DO UPDATE SET full_name = EXCLUDED.full_name;
    SELECT id INTO v_gym_id FROM public.profiles WHERE username = 'gym_warrior' LIMIT 1;
  END IF;

  -- ==============================================================================
  -- 4. INSERT STORIES CHO TỪNG TÀI KHOẢN (TRÁNH LẶP LẠI)
  -- ==============================================================================

  -- Sarah Stories
  IF v_sarah_id IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM public.stories WHERE user_id = v_sarah_id AND caption LIKE '%matcha%') THEN
      INSERT INTO public.stories (user_id, media_url, media_type, caption, created_at)
      VALUES (
        v_sarah_id,
        'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1080&auto=format&fit=crop&q=80',
        'image',
        'Late night debugging with hot matcha 🍵💻 Building Next.js 15 apps!',
        NOW() - INTERVAL '3 hours'
      );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public.stories WHERE user_id = v_sarah_id AND caption LIKE '%Tokyo night%') THEN
      INSERT INTO public.stories (user_id, media_url, media_type, caption, created_at)
      VALUES (
        v_sarah_id,
        'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=1080&auto=format&fit=crop&q=80',
        'image',
        'Tokyo night walk ✨🌆 The city that never sleeps #vibes',
        NOW() - INTERVAL '1 hour'
      );
    END IF;
  END IF;

  -- Elena Stories
  IF v_elena_id IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM public.stories WHERE user_id = v_elena_id AND caption LIKE '%sourdough crust%') THEN
      INSERT INTO public.stories (user_id, media_url, media_type, caption, created_at)
      VALUES (
        v_elena_id,
        'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1080&auto=format&fit=crop&q=80',
        'image',
        'Golden sourdough crust straight from the oven 🥖🌾 100% natural yeast.',
        NOW() - INTERVAL '5 hours'
      );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public.stories WHERE user_id = v_elena_id AND caption LIKE '%croissant%') THEN
      INSERT INTO public.stories (user_id, media_url, media_type, caption, created_at)
      VALUES (
        v_elena_id,
        'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1080&auto=format&fit=crop&q=80',
        'image',
        'Morning croissant & espresso 🥐☕ Wishing everyone a sweet day!',
        NOW() - INTERVAL '2 hours'
      );
    END IF;
  END IF;

  -- Alex Stories (Travel)
  IF v_travel_id IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM public.stories WHERE user_id = v_travel_id AND caption LIKE '%Bali%') THEN
      INSERT INTO public.stories (user_id, media_url, media_type, caption, created_at)
      VALUES (
        v_travel_id,
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1080&auto=format&fit=crop&q=80',
        'image',
        'Turquoise crystal ocean in Bali 🏖️🌊 Sunset vibes.',
        NOW() - INTERVAL '4 hours'
      );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public.stories WHERE user_id = v_travel_id AND caption LIKE '%Pacific highway%') THEN
      INSERT INTO public.stories (user_id, media_url, media_type, caption, created_at)
      VALUES (
        v_travel_id,
        'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1080&auto=format&fit=crop&q=80',
        'image',
        'Pacific highway coastal road trip 🌲🛣️ Keep exploring!',
        NOW() - INTERVAL '2 hours'
      );
    END IF;
  END IF;

  -- Liam Stories (Coffee)
  IF v_coffee_id IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM public.stories WHERE user_id = v_coffee_id AND caption LIKE '%Swan pour%') THEN
      INSERT INTO public.stories (user_id, media_url, media_type, caption, created_at)
      VALUES (
        v_coffee_id,
        'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1080&auto=format&fit=crop&q=80',
        'image',
        'Latte art practice: Swan pour ☕🦢 Barista daily routine.',
        NOW() - INTERVAL '6 hours'
      );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public.stories WHERE user_id = v_coffee_id AND caption LIKE '%specialty coffee%') THEN
      INSERT INTO public.stories (user_id, media_url, media_type, caption, created_at)
      VALUES (
        v_coffee_id,
        'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=1080&auto=format&fit=crop&q=80',
        'image',
        'Aromatic specialty coffee beans freshly roasted 🍒🔥',
        NOW() - INTERVAL '1 hour'
      );
    END IF;
  END IF;

  -- Chloe Stories (Art)
  IF v_artist_id IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM public.stories WHERE user_id = v_artist_id AND caption LIKE '%Oil on canvas%') THEN
      INSERT INTO public.stories (user_id, media_url, media_type, caption, created_at)
      VALUES (
        v_artist_id,
        'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1080&auto=format&fit=crop&q=80',
        'image',
        'Oil on canvas in progress 🎨 Working on the color harmony.',
        NOW() - INTERVAL '7 hours'
      );
    END IF;
  END IF;

  -- Marcus Stories (Gym)
  IF v_gym_id IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM public.stories WHERE user_id = v_gym_id AND caption LIKE '%5 AM%') THEN
      INSERT INTO public.stories (user_id, media_url, media_type, caption, created_at)
      VALUES (
        v_gym_id,
        'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=1080&auto=format&fit=crop&q=80',
        'image',
        '5 AM morning grind session 💪 Never skip a Monday! #fitness',
        NOW() - INTERVAL '8 hours'
      );
    END IF;
  END IF;

END $$;
