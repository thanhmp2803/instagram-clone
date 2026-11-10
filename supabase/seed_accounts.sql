-- ==============================================================================
-- SUPABASE AUTH SEED SCRIPT: 3 DEMO ACCOUNTS
-- Chạy script này trong Supabase SQL Editor nếu bạn muốn đưa 3 tài khoản này
-- vào trực tiếp Supabase Auth (auth.users)
-- ==============================================================================

INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  role,
  aud
)
VALUES
  -- 1. TÀI KHOẢN CHÍNH: Mai Phước Thành (@pthanh2803)
  (
    'a0000000-0000-0000-0000-000000000005',
    '00000000-0000-0000-0000-000000000000',
    'admin@gmail.com',
    crypt('Admin123@', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Mai Phước Thành","username":"pthanh2803","avatar_url":"/images/conmeo.jpg"}',
    NOW(),
    NOW(),
    'authenticated',
    'authenticated'
  ),

  -- 2. TÀI KHOẢN MẪU 1: Sarah Connor (@creative_coder)
  (
    'a0000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'sarah@gmail.com',
    crypt('Password123@', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Sarah Connor","username":"creative_coder","avatar_url":"https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80"}',
    NOW(),
    NOW(),
    'authenticated',
    'authenticated'
  ),

  -- 3. TÀI KHOẢN MẪU 2: Elena Rostova (@chef_artisan)
  (
    'a0000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000000',
    'elena@gmail.com',
    crypt('Password123@', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Elena Rostova","username":"chef_artisan","avatar_url":"https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"}',
    NOW(),
    NOW(),
    'authenticated',
    'authenticated'
  )
ON CONFLICT (id) DO NOTHING;
