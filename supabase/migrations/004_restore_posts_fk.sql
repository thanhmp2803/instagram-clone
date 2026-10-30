-- ==============================================================================
-- INSTAGRAM CLONE: MIGRATION 004 - RESTORE FOREIGN KEYS & CHAT / NOTIFICATIONS ENHANCEMENT
-- Run this script in your Supabase SQL Editor:
-- Dashboard -> SQL Editor -> New Query -> Paste & Run
-- ==============================================================================

-- 1. SEED OR UPDATE CORE PROFILES SAFELY (Avoids duplicate key violations on username or id)
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

DO $$
BEGIN
  -- Update pthanh2803 if already exists, otherwise insert
  IF EXISTS (SELECT 1 FROM public.profiles WHERE username = 'pthanh2803') THEN
    UPDATE public.profiles
    SET avatar_url = '/images/conmeo.jpg',
        full_name = COALESCE(NULLIF(full_name, ''), 'Mai Phước Thành')
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

  -- Update creative_coder (Sarah Connor) if already exists, otherwise insert
  IF EXISTS (SELECT 1 FROM public.profiles WHERE username = 'creative_coder') THEN
    UPDATE public.profiles
    SET avatar_url = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        full_name = COALESCE(NULLIF(full_name, ''), 'Sarah Connor')
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

  -- Update chef_artisan (Elena Rostova) if already exists, otherwise insert
  IF EXISTS (SELECT 1 FROM public.profiles WHERE username = 'chef_artisan') THEN
    UPDATE public.profiles
    SET avatar_url = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        full_name = COALESCE(NULLIF(full_name, ''), 'Elena Rostova')
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
END $$;

-- 2. NOTIFICATIONS TABLE: Ensure table exists with post_id and comment_text columns
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recipient_id UUID NOT NULL,
  actor_id UUID NOT NULL,
  type TEXT NOT NULL, -- 'like' | 'comment' | 'follow'
  post_id UUID,
  comment_text TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'notifications' AND column_name = 'post_id'
  ) THEN
    ALTER TABLE public.notifications ADD COLUMN post_id UUID;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'notifications' AND column_name = 'comment_text'
  ) THEN
    ALTER TABLE public.notifications ADD COLUMN comment_text TEXT;
  END IF;
END $$;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can insert notifications" ON public.notifications;
CREATE POLICY "Users can insert notifications" ON public.notifications FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (true);

-- 3. POST COMMENTS TABLE
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Post comments are viewable by everyone" ON public.post_comments;
CREATE POLICY "Post comments are viewable by everyone" ON public.post_comments FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can insert post comments" ON public.post_comments;
CREATE POLICY "Users can insert post comments" ON public.post_comments FOR INSERT WITH CHECK (true);

-- 4. DIRECT MESSAGING & CHAT TABLES (Relax constraints and enable open policies)
ALTER TABLE public.conversation_participants DROP CONSTRAINT IF EXISTS conversation_participants_user_id_fkey;
ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS messages_sender_id_fkey;

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all conversations" ON public.conversations;
CREATE POLICY "Allow all conversations" ON public.conversations FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all conversation_participants" ON public.conversation_participants;
CREATE POLICY "Allow all conversation_participants" ON public.conversation_participants FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all messages" ON public.messages;
CREATE POLICY "Allow all messages" ON public.messages FOR ALL USING (true) WITH CHECK (true);

-- 5. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON public.notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON public.post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON public.post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user ON public.conversation_participants(user_id);
