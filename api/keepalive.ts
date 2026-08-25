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
const RESEND_API_KEY = process.env.RESEND_API_KEY
const FROM = process.env.ORDER_FROM_EMAIL || "Luna's Bouquet <onboarding@resend.dev>"
// Comma-separated, so more people can be added in Vercel without touching code.
const ALERT_EMAIL = process.env.ALERT_EMAIL || 'lunasbouquet.co@gmail.com'

// The database being down is the one failure that silently costs orders, so it gets an
// email rather than a log line nobody reads. Cooldown is in memory: there's nowhere
// durable to record it (the database is precisely what's broken), but it's enough to
// stop a repeatedly-hit endpoint from flooding an inbox. The cron runs once a day, well
// outside this window, so a real alert is never suppressed.
const ALERT_COOLDOWN_MS = 12 * 60 * 60 * 1000
let lastAlertAt = 0

async function alertDatabaseDown(detail: string): Promise<void> {
  if (!RESEND_API_KEY) return
  const now = Date.now()
  if (now - lastAlertAt < ALERT_COOLDOWN_MS) return
  lastAlertAt = now

  const html = `<div style="font-family:Georgia,'Times New Roman',serif;color:#2a2420;max-width:520px;">
    <p style="font-size:12px;letter-spacing:3px;text-transform:uppercase;color:#a97c24;margin:0 0 12px;">Luna&rsquo;s Bouquet</p>
    <h1 style="font-size:24px;font-weight:normal;color:#3a2130;margin:0 0 16px;">The order database is not responding.</h1>
    <p style="font-size:16px;line-height:1.6;margin:0 0 16px;">The daily check could not reach Supabase. New orders still email you — the website is built so nothing is lost — but they are <strong>not being saved to the order book</strong>, and the admin page will not load.</p>
    <p style="font-size:16px;line-height:1.6;margin:0 0 16px;"><strong>What to do:</strong> sign in at <a href="https://supabase.com/dashboard" style="color:#a8465a;">supabase.com/dashboard</a>, open the Luna&rsquo;s Bouquet project, and click <strong>Restore project</strong>. It takes a few minutes. Free projects pause on their own after 7 quiet days.</p>
    <p style="font-size:16px;line-height:1.6;margin:0 0 16px;">Any order email marked <strong>NOT SAVED</strong> while it was down needs re-entering by hand once it&rsquo;s back.</p>
    <p style="font-size:13px;color:#6e6153;margin:24px 0 0;">Technical detail: ${detail.slice(0, 200).replace(/[<>&]/g, '')}</p>
  </div>`

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: FROM,
        to: ALERT_EMAIL.split(',').map((a) => a.trim()).filter(Boolean),
        subject: "Action needed: Luna's Bouquet order database is down",
        html,
      }),
    })
  } catch {
    // Nothing useful to do if the alert itself can't send; the 500 below still logs.
  }
}

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
  let failure = ''
  try {
    const { error } = await db.from('orders').select('id', { count: 'exact', head: true })
    if (error) failure = error.message
  } catch (err) {
    // A paused project throws (DNS stops resolving) rather than returning an error.
    failure = err instanceof Error ? err.message : 'database unreachable'
  }

  if (failure) {
    await alertDatabaseDown(failure)
    // The 500 also turns up in Vercel's cron log, which is where you'd look second.
    res.status(500).json({ ok: false, error: failure })
    return
  }

  // Deliberately says nothing about the data — this endpoint may be reachable without
  // a secret, and order volume is Annie's business, not the internet's.
  res.status(200).json({ ok: true, at: new Date().toISOString() })
}
