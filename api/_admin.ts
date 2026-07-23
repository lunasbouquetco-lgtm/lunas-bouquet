// Shared server-side logic for /api/admin/*.
//
// Why this exists at all: the browser holds the Supabase anon key, and RLS gives anon
// insert-only access. So the admin screens cannot read customers, recipients, or gate
// codes directly — every read goes through here, where the service-role key lives and
// where the password is actually checked. A password box in React alone would be
// decoration; this is the thing that enforces it.

import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD

export type Req = { method?: string; headers: Record<string, unknown>; body?: unknown }
export type Res = {
  status: (code: number) => Res
  json: (body: unknown) => void
  setHeader?: (k: string, v: string) => void
}

/** Constant-time compare so a wrong password can't be narrowed down by timing. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

export function checkPassword(req: Req): boolean {
  if (!ADMIN_PASSWORD) return false // unset password fails closed, never open
  const raw = req.headers['x-admin-password']
  const given = Array.isArray(raw) ? raw[0] : raw
  if (typeof given !== 'string' || given.length === 0) return false
  return safeEqual(given, ADMIN_PASSWORD)
}

let cached: SupabaseClient | null = null

export function admin(): SupabaseClient | null {
  if (cached) return cached
  if (!SUPABASE_URL || !SERVICE_KEY) return null
  cached = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  return cached
}

/**
 * Wraps a handler with the password gate and the "is this even configured" check,
 * so no individual endpoint can forget either one.
 */
export function guarded(
  handler: (db: SupabaseClient, req: Req, res: Res) => Promise<void>
) {
  return async (req: Req, res: Res) => {
    if (!checkPassword(req)) {
      // Deliberately vague: don't tell a guesser whether the password is merely wrong
      // or the whole admin is unconfigured.
      res.status(401).json({ error: 'Not authorized.' })
      return
    }
    const db = admin()
    if (!db) {
      res.status(503).json({
        error:
          'Admin is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY on the server.',
      })
      return
    }
    try {
      await handler(db, req, res)
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : 'Server error.' })
    }
  }
}

export const adminConfigured = Boolean(ADMIN_PASSWORD)
