import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

/** Returns a user-facing message when env credentials are missing or still placeholders. */
export function getSupabaseConfigError() {
  if (!supabaseUrl || !supabaseKey) {
    return 'Missing Supabase configuration. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in your .env file.'
  }
  if (supabaseUrl.includes('your-project-ref') || supabaseKey.includes('your-anon')) {
    return 'Replace the placeholder values in .env with your real Supabase project credentials.'
  }
  return null
}

const configError = getSupabaseConfigError()

export const supabase = configError
  ? null
  : createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })

export const isSupabaseConfigured = !configError
export const supabaseConfigError = configError
