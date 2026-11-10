-- ==============================================================================
-- INSTAGRAM CLONE: MIGRATION 007 - SYNC FOLLOWS, NOTIFICATIONS & SEED DATA
-- Chạy script này trong Supabase SQL Editor (Dashboard > SQL Editor > New query)
-- Script này an toàn, có thể chạy nhiều lần (Idempotent)
-- ==============================================================================

-- 1. TẠO BẢNG NOTIFICATIONS (NẾU CHƯA CÓ)
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recipient_id UUID NOT NULL,
  actor_id UUID NOT NULL,
  type TEXT NOT NULL, -- 'like', 'comment', 'follow'
  post_id UUID,
  comment_text TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TẠO BẢNG BOOKMARKS (NẾU CHƯA CÓ)
CREATE TABLE IF NOT EXISTS public.bookmarks (
  user_id UUID NOT NULL,
  post_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, post_id)
);

-- 3. ĐẢM BẢO BẢNG FOLLOWS VÀ PROFILES TỒN TẠI
CREATE TABLE IF NOT EXISTS public.follows (
  follower_id UUID NOT NULL,
  following_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (follower_id, following_id)
);

-- 4. BẬT VÀ MỞ CHÍNH SÁCH ROW LEVEL SECURITY (RLS) THOÁNG ĐỂ CLIENT KHÔNG BỊ CHẶN 403
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  -- Follows policies
  DROP POLICY IF EXISTS "Follows are viewable by everyone" ON public.follows;
  CREATE POLICY "Follows are viewable by everyone" ON public.follows FOR SELECT USING (true);
  DROP POLICY IF EXISTS "Users can follow others" ON public.follows;
  CREATE POLICY "Users can follow others" ON public.follows FOR INSERT WITH CHECK (true);
  DROP POLICY IF EXISTS "Users can unfollow others" ON public.follows;
  CREATE POLICY "Users can unfollow others" ON public.follows FOR DELETE USING (true);

  -- Notifications policies
  DROP POLICY IF EXISTS "Notifications are viewable by recipient" ON public.notifications;
  CREATE POLICY "Notifications are viewable by recipient" ON public.notifications FOR SELECT USING (true);
  DROP POLICY IF EXISTS "Users can insert notifications" ON public.notifications;
  CREATE POLICY "Users can insert notifications" ON public.notifications FOR INSERT WITH CHECK (true);
  DROP POLICY IF EXISTS "Users can update notifications" ON public.notifications;
  CREATE POLICY "Users can update notifications" ON public.notifications FOR UPDATE USING (true);

  -- Bookmarks policies
  DROP POLICY IF EXISTS "Bookmarks viewable" ON public.bookmarks;
  CREATE POLICY "Bookmarks viewable" ON public.bookmarks FOR SELECT USING (true);
  DROP POLICY IF EXISTS "Bookmarks insert" ON public.bookmarks;
  CREATE POLICY "Bookmarks insert" ON public.bookmarks FOR INSERT WITH CHECK (true);
  DROP POLICY IF EXISTS "Bookmarks delete" ON public.bookmarks;
  CREATE POLICY "Bookmarks delete" ON public.bookmarks FOR DELETE USING (true);

  -- Profiles update/insert
  DROP POLICY IF EXISTS "Profiles viewable by everyone" ON public.profiles;
  CREATE POLICY "Profiles viewable by everyone" ON public.profiles FOR SELECT USING (true);
  DROP POLICY IF EXISTS "Profiles insert/upsert" ON public.profiles;
  CREATE POLICY "Profiles insert/upsert" ON public.profiles FOR INSERT WITH CHECK (true);
  DROP POLICY IF EXISTS "Profiles update" ON public.profiles;
  CREATE POLICY "Profiles update" ON public.profiles FOR UPDATE USING (true);
END $$;

-- 5. ĐẢM BẢO CÁC STORAGE BUCKETS TỒN TẠI VỚI QUYỀN PUBLIC
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true), ('posts', 'posts', true), ('reels', 'reels', true)
ON CONFLICT (id) DO NOTHING;

DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Public Storage Read avatars" ON storage.objects;
  CREATE POLICY "Public Storage Read avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
  DROP POLICY IF EXISTS "Public Storage Upload avatars" ON storage.objects;
  CREATE POLICY "Public Storage Upload avatars" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars');
  DROP POLICY IF EXISTS "Public Storage Update avatars" ON storage.objects;
  CREATE POLICY "Public Storage Update avatars" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars');

  DROP POLICY IF EXISTS "Public Storage Read posts" ON storage.objects;
  CREATE POLICY "Public Storage Read posts" ON storage.objects FOR SELECT USING (bucket_id = 'posts');
  DROP POLICY IF EXISTS "Public Storage Upload posts" ON storage.objects;
  CREATE POLICY "Public Storage Upload posts" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'posts');

  DROP POLICY IF EXISTS "Public Storage Read reels" ON storage.objects;
  CREATE POLICY "Public Storage Read reels" ON storage.objects FOR SELECT USING (bucket_id = 'reels');
  DROP POLICY IF EXISTS "Public Storage Upload reels" ON storage.objects;
  CREATE POLICY "Public Storage Upload reels" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'reels');
END $$;

-- 6. TẠO HOẶC CẬP NHẬT CÁC TÀI KHOẢN MẪU & LIÊN KẾT THEO DÕI BẰNG CHÍNH ID THỰC TẾ
DO $$ 
DECLARE
  v_sarah_id UUID;
  v_elena_id UUID;
  v_thanh_id UUID;
BEGIN
  -- 6.1. Tìm kiếm ID thực tế của từng tài khoản theo username trong bảng profiles
  SELECT id INTO v_sarah_id FROM public.profiles WHERE username = 'creative_coder' LIMIT 1;
  SELECT id INTO v_elena_id FROM public.profiles WHERE username = 'chef_artisan' LIMIT 1;
  SELECT id INTO v_thanh_id FROM public.profiles WHERE username = 'pthanh2803' LIMIT 1;

  -- 6.2. Sarah Connor: Nếu đã có thì cập nhật thông tin, nếu chưa có thì tạo mới
  IF v_sarah_id IS NOT NULL THEN
    UPDATE public.profiles
    SET full_name = 'Sarah Connor',
        avatar_url = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        bio = 'Frontend Engineer & UI enthusiast 💻 Building modern web experiences ✨ SF, California',
        is_verified = true
    WHERE id = v_sarah_id;
  ELSE
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

  -- 6.3. Elena Rostova: Nếu đã có thì cập nhật thông tin, nếu chưa có thì tạo mới
  IF v_elena_id IS NOT NULL THEN
    UPDATE public.profiles
    SET full_name = 'Elena Rostova',
        avatar_url = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        bio = 'Sourdough baker & Culinary creator 🥖 Sourdough workshops & slow fermentation 🧈',
        is_verified = false
    WHERE id = v_elena_id;
  ELSE
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

  -- 6.4. Mai Phước Thành: Nếu đã có thì cập nhật thông tin, nếu chưa có thì tạo mới
  IF v_thanh_id IS NOT NULL THEN
    UPDATE public.profiles
    SET full_name = 'Mai Phước Thành',
        avatar_url = COALESCE(avatar_url, '/images/conmeo.jpg'),
        bio = 'Hi, I''m Thanh, a Frontend Developer. Passionate about Next.js, React & UI/UX 💻'
    WHERE id = v_thanh_id;
  ELSE
    v_thanh_id := gen_random_uuid();
    INSERT INTO public.profiles (id, username, full_name, avatar_url, bio, is_verified)
    VALUES (
      v_thanh_id,
      'pthanh2803',
      'Mai Phước Thành',
      '/images/conmeo.jpg',
      'Hi, I''m Thanh, a Frontend Developer. Passionate about Next.js, React & UI/UX 💻',
      false
    )
    ON CONFLICT (username) DO UPDATE SET full_name = EXCLUDED.full_name;
    SELECT id INTO v_thanh_id FROM public.profiles WHERE username = 'pthanh2803' LIMIT 1;
  END IF;

  -- 7. TẠO CÁC MỐI QUAN HỆ THEO DÕI THỰC TẾ DỰA TRÊN CHÍNH UUID CỦA HỌ
  -- - Sarah Connor theo dõi Mai Phước Thành
  IF v_sarah_id IS NOT NULL AND v_thanh_id IS NOT NULL AND v_sarah_id <> v_thanh_id THEN
    INSERT INTO public.follows (follower_id, following_id)
    VALUES (v_sarah_id, v_thanh_id)
    ON CONFLICT (follower_id, following_id) DO NOTHING;
  END IF;

  -- - Elena Rostova theo dõi Mai Phước Thành
  IF v_elena_id IS NOT NULL AND v_thanh_id IS NOT NULL AND v_elena_id <> v_thanh_id THEN
    INSERT INTO public.follows (follower_id, following_id)
    VALUES (v_elena_id, v_thanh_id)
    ON CONFLICT (follower_id, following_id) DO NOTHING;
  END IF;

  -- - Mai Phước Thành theo dõi Sarah Connor
  IF v_thanh_id IS NOT NULL AND v_sarah_id IS NOT NULL AND v_thanh_id <> v_sarah_id THEN
    INSERT INTO public.follows (follower_id, following_id)
    VALUES (v_thanh_id, v_sarah_id)
    ON CONFLICT (follower_id, following_id) DO NOTHING;
  END IF;
END $$;

-- 8. TỰ ĐỘNG DỌN DẸP VÀ XÓA CÁC BẢN GHI THÔNG BÁO BỊ TRÙNG LẶP TRONG DATABASE
DELETE FROM public.notifications n1
WHERE n1.id IN (
  SELECT n.id
  FROM public.notifications n
  JOIN public.notifications n_older
    ON n.recipient_id = n_older.recipient_id
   AND n.actor_id = n_older.actor_id
   AND n.type = n_older.type
   AND COALESCE(n.post_id, '00000000-0000-0000-0000-000000000000'::uuid) = COALESCE(n_older.post_id, '00000000-0000-0000-0000-000000000000'::uuid)
   AND COALESCE(n.comment_text, '') = COALESCE(n_older.comment_text, '')
   AND n.id <> n_older.id
   AND n.created_at < n_older.created_at
);
