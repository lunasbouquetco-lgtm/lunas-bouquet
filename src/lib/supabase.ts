import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

// The publishable/anon key is safe in the browser. RLS on the `orders` table
// allows inserts only (no reads), so the client can place orders but not read them.
export const supabase =
  url && anonKey ? createClient(url, anonKey) : null

export const supabaseConfigured = Boolean(url && anonKey)
