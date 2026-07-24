# Customer confirmation email — setup (≈10 min)

The code is **done and live**, but dormant. Right now when a customer orders:

- Annie gets her notification (Web3Forms) — working.
- The customer sees the on-screen thank-you — working.
- The customer confirmation *email* is wired up but **won't send until you add a Resend
  key**. Until then `/api/send-confirmation` returns a soft "not configured" and the order
  flow is completely unaffected. Nothing is broken by this being off.

To turn it on:

## 1. Make a Resend account (free)

Resend's free tier is 3,000 emails/month, 100/day — far more than Luna's needs, $0.
Sign up at resend.com with the Luna's Bouquet Gmail.

## 2. Verify the domain (so email comes *from* lunasbouquet.com)

In Resend → **Domains → Add Domain** → `lunasbouquet.com`. Resend shows a few DNS records
(a couple of TXT/CNAME for DKIM + SPF). Add them in **GoDaddy DNS** — the same place you
just changed the A records. Resend flips the domain to "Verified" within minutes.

Skipping this still works for testing, but email can only go from `onboarding@resend.dev`
and only to your own address. Verify the domain before real customers rely on it.

## 3. Add two env vars in Vercel

Vercel → the Luna's Bouquet project → **Settings → Environment Variables** (Production):

| Name | Value |
|---|---|
| `RESEND_API_KEY` | from Resend → API Keys → Create |
| `ORDER_FROM_EMAIL` | `Luna's Bouquet <orders@lunasbouquet.com>` (only after step 2) |

If you skip `ORDER_FROM_EMAIL`, it falls back to Resend's test sender.

## 4. Redeploy

Env vars only take effect on a new build. Vercel → Deployments → newest → ⋯ → **Redeploy**.
Then place a test order to yourself and confirm the email arrives (check spam the first time).

---

**How to verify it's live:** `POST https://lunasbouquet.com/api/send-confirmation` with no
key returns `{"sent":false,"reason":"not-configured"}`. Once the key is set, a real order
returns `{"sent":true}` and the email goes out. The email template lives in
`api/send-confirmation.ts` — brand colors, "Thank you, [name]", the order summary, and the
48-hour / payment note.
