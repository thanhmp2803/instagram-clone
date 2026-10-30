-- ==============================================================================
-- INSTAGRAM CLONE: MIGRATION 006 - BOOKMARKS TABLE & AVATAR STORAGE POLICIES
-- Run this in your Supabase SQL Editor if you want to apply to your cloud database
-- ==============================================================================

-- 1. Create bookmarks table
CREATE TABLE IF NOT EXISTS public.bookmarks (
  user_id UUID NOT NULL,
  post_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, post_id)
);

-- 2. Enable Row Level Security & Open Permissive Policies
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public bookmarks viewable' AND tablename = 'bookmarks') THEN
    CREATE POLICY "Public bookmarks viewable" ON public.bookmarks FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert bookmarks' AND tablename = 'bookmarks') THEN
    CREATE POLICY "Users can insert bookmarks" ON public.bookmarks FOR INSERT WITH CHECK (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete bookmarks' AND tablename = 'bookmarks') THEN
    CREATE POLICY "Users can delete bookmarks" ON public.bookmarks FOR DELETE USING (true);
  END IF;
END $$;

-- 3. Ensure 'avatars' storage bucket exists with public read/write
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public avatars read' AND tablename = 'objects') THEN
    CREATE POLICY "Public avatars read" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow avatars upload' AND tablename = 'objects') THEN
    CREATE POLICY "Allow avatars upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow avatars update' AND tablename = 'objects') THEN
    CREATE POLICY "Allow avatars update" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars');
  END IF;
END $$;

