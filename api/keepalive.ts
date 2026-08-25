/// <reference types="node" />
// Keeps the Supabase project awake.
//
// Supabase's free tier pauses a project after 7 days with no API requests, and a paused
// project takes the whole order book down until someone logs in and restores it. Luna's
// is seasonal — quiet stretches between holidays are normal, not a problem — so relying
// on customer traffic to keep it alive is exactly the wrong bet.
//
// A Vercel cron hits this once a day and runs one trivial count query. It lives in the
// repo, costs nothing, and doesn't depend on anyone's laptop being on.
//
// Note: this prevents a pause, it can't undo one. If the project is already paused,
// Annie has to restore it from the Supabase dashboard first.

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const CRON_SECRET = process.env.CRON_SECRET

type Req = { method?: string; headers: Record<string, unknown> }
type Res = { status: (code: number) => Res; json: (body: unknown) => void }

function header(req: Req, name: string): string | undefined {
  const raw = req.headers[name]
  return Array.isArray(raw) ? raw[0] : typeof raw === 'string' ? raw : undefined
}

export default async function handler(req: Req, res: Res) {
  // Vercel's documented way to secure a cron is CRON_SECRET, which it sends back as
  // "Authorization: Bearer <secret>". Setting it is optional hardening — if it isn't
  // set, this stays open on purpose. A gate that guesses at some other header would
  // 401 the real cron and fail silently at the exact job it exists to do, which is a
  // far worse outcome than a stranger making us count rows.
  if (CRON_SECRET && header(req, 'authorization') !== `Bearer ${CRON_SECRET}`) {
    res.status(401).json({ error: 'Not authorized.' })
    return
  }

  if (!SUPABASE_URL || !SERVICE_KEY) {
    res.status(503).json({ error: 'Supabase is not configured on the server.' })
    return
  }

  const db = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  // Head-only count: touches the database, returns no rows.
  const { error } = await db.from('orders').select('id', { count: 'exact', head: true })

  if (error) {
    // A 500 here is the useful signal — it turns up in Vercel's cron log, which is the
    // one place a silent Supabase problem would otherwise go unnoticed.
    res.status(500).json({ ok: false, error: error.message })
    return
  }

  // Deliberately says nothing about the data — this endpoint may be reachable without
  // a secret, and order volume is Annie's business, not the internet's.
  res.status(200).json({ ok: true, at: new Date().toISOString() })
}
