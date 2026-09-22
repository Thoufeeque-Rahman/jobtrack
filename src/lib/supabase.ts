import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

// Exported so components can check before rendering
export const isMissingConfig = !supabaseUrl || !supabaseAnonKey

// Use placeholder strings so createClient doesn't throw — API calls will simply
// fail when the app tries to use them without credentials.
export const supabase = createClient(
  supabaseUrl ?? 'https://placeholder.supabase.co',
  supabaseAnonKey ?? 'placeholder'
)
