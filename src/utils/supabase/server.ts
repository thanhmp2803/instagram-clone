import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getSupabaseKey } from './client'

export async function createClient() {
  const cookieStore = await cookies()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
  const supabaseAnonKey = getSupabaseKey() || 'placeholder'

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // Can be called from Server Component where cookies cannot be written
        }
      },
    },
  })
}
