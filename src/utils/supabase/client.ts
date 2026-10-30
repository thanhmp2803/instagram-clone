import { createBrowserClient } from '@supabase/ssr'

export const getSupabaseKey = (): string | undefined => {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  )
}

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = getSupabaseKey()
  return Boolean(url && key && !url.includes('your-project-id') && !url.includes('placeholder'))
}

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
  const supabaseAnonKey = getSupabaseKey() || 'placeholder'

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
