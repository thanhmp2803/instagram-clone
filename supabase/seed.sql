-- ==============================================================================
-- INSTAGRAM CLONE: SAMPLE SEED DATA (3 CORE ACCOUNTS)
-- ==============================================================================

-- 1. SEED PROFILES (3 Accounts: Mai Phước Thành, Sarah Connor, Elena Rostova)
INSERT INTO public.profiles (id, username, full_name, avatar_url, bio, is_verified)
VALUES
  ('a0000000-0000-0000-0000-000000000005', 'pthanh2803', 'Mai Phước Thành', '/images/conmeo.jpg', 'Frontend Engineer & React/Next.js developer 💻', true),
  ('a0000000-0000-0000-0000-000000000001', 'creative_coder', 'Sarah Connor', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80', 'Frontend Engineer & UI enthusiast 💻', true),
  ('a0000000-0000-0000-0000-000000000003', 'chef_artisan', 'Elena Rostova', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', 'Sourdough baker & Culinary creator 🥖', false)
ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  full_name = EXCLUDED.full_name,
  avatar_url = EXCLUDED.avatar_url;

-- 2. SEED SAMPLE POSTS
INSERT INTO public.posts (id, user_id, image_url, caption, created_at)
VALUES
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000005', 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=800&auto=format&fit=crop&q=80', 'Coding late into the night with good music ☕💻 #developer #react #frontend', NOW() - INTERVAL '1 hour'),
  ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&auto=format&fit=crop&q=80', 'Morning mist rolling over the alpine peaks 🏔️ #wanderlust #landscape', NOW() - INTERVAL '3 hours'),
  ('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000003', 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80', 'Freshly baked sourdough loaf with golden blistered crust 🥖🧈', NOW() - INTERVAL '6 hours')
ON CONFLICT (id) DO NOTHING;

-- 3. SEED SAMPLE REELS
INSERT INTO public.reels (id, user_id, video_url, thumbnail_url, caption, audio_title, audio_artist)
VALUES
  ('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000005', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=800&auto=format&fit=crop&q=80', 'Building smooth vertical reels in Next.js 15 & Supabase! ✨ #coding #reactjs', 'Original audio - pthanh2803', 'pthanh2803'),
  ('c0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&auto=format&fit=crop&q=80', 'Lost in the beauty of endless mountain horizons 🏔️🌲 #travel #nature', 'Golden Hour (Chill Remix)', 'JVKE'),
  ('c0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000003', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4', 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80', 'Crispy sourdough and roasted garlic butter. Turn sound ON! 🥖', 'Crispy ASMR Kitchen Session', 'Artisan Eats')
ON CONFLICT (id) DO NOTHING;

-- 4. SEED SAMPLE CONVERSATIONS
INSERT INTO public.conversations (id, created_at, updated_at)
VALUES
  ('d0000000-0000-0000-0000-000000000001', NOW() - INTERVAL '1 day', NOW()), -- Thành & Sarah
  ('d0000000-0000-0000-0000-000000000002', NOW() - INTERVAL '2 days', NOW()), -- Thành & Elena
  ('d0000000-0000-0000-0000-000000000003', NOW() - INTERVAL '3 days', NOW())  -- Sarah & Elena
ON CONFLICT (id) DO NOTHING;

-- 5. SEED CONVERSATION PARTICIPANTS
INSERT INTO public.conversation_participants (conversation_id, user_id)
VALUES
  -- Thành & Sarah
  ('d0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000005'),
  ('d0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001'),
  -- Thành & Elena
  ('d0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000005'),
  ('d0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000003'),
  -- Sarah & Elena
  ('d0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001'),
  ('d0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000003')
ON CONFLICT (conversation_id, user_id) DO NOTHING;

-- 6. SEED SAMPLE MESSAGES
INSERT INTO public.messages (id, conversation_id, sender_id, text, created_at)
VALUES
  ('e0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Hey Thành! Did you check out the new Instagram Reels feature you built?', NOW() - INTERVAL '1 day'),
  ('e0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000005', 'Hey Sarah! Yes, vertical scrolling and real-time chat are super smooth! 🚀', NOW() - INTERVAL '23 hours'),
  ('e0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000005', 'Hi Elena! What was the secret to that blistered sourdough crust in your video?', NOW() - INTERVAL '2 days'),
  ('e0000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000003', 'Two ice cubes inside the Dutch oven before closing the lid! Creates maximum steam 🥖', NOW() - INTERVAL '1 day')
ON CONFLICT (id) DO NOTHING;
