# Luna's Bouquet — start here

The website + order book for Luna's Bouquet, a Phoenix-area florist. This file is the
front door: what it is, where everything lives, and how to make the changes you'll
actually want to make. The deeper details live in the `agents/` folder (linked below).

Live at **https://lunasbouquet.com**.

---

## The 60-second picture

- **Public site** — Home, Bouquets, Order form, Our Story, Contact, and five city
  pages (`/flower-delivery/mesa`, `/scottsdale`, `/gilbert`, `/chandler`,
  `/paradise-valley`).
- **Private admin** — `/admin`, password `Flowers2026`. Orders, customers (with saved
  gate codes), and an Events revenue dashboard with charts. Not linked from the public
  site.
- **When someone orders:** it saves to the database, emails Annie (Web3Forms), and
  emails the customer a branded confirmation (Resend).

**Stack:** Vite + React + TypeScript + Tailwind. Database + admin API on Supabase.
Hosted on Vercel. Built so it can be edited in Lovable later.

---

## How changes go live (the one thing to understand)

Everything auto-deploys. The moment code lands on the `main` branch on GitHub, Vercel
rebuilds and publishes to lunasbouquet.com within a minute or two.

```
edit code  →  git commit  →  git push  →  Vercel builds  →  live
```

There is no separate "deploy" button to press for code changes. Push and it's live.
(Read `agents/VERCEL-NOTES.md` before touching deploy config — there are a few sharp
edges that have bitten us.)

**Repo:** `~/dev/lunas-bouquet` locally → GitHub `lunasbouquetco-lgtm/lunas-bouquet`
(branch pushed as `main`).

### Running it locally

```
cd ~/dev/lunas-bouquet
npm install        # first time only
npm run dev        # local preview at http://localhost:5173
npm run build      # type-checks everything; run before pushing
```

---

## Accounts & credentials (all under Annie's logins)

| What | Where | Notes |
|---|---|---|
| **Vercel** (hosting) | lunasbouquetco-8014's project | Auto-deploys from GitHub. Env vars live in Settings → Environment Variables. |
| **Supabase** (database) | project `yycmfbsuzfnlykdyeyal` | SQL Editor is where migrations run. |
| **GoDaddy** (domain) | lunasbouquet.com | DNS only; don't touch the A/CNAME records that point at Vercel. |
| **Resend** (customer emails) | lunasbouquet.co@gmail.com | Domain verified; sends from orders@lunasbouquet.com. |
| **GitHub** (code) | lunasbouquetco-lgtm/lunas-bouquet | Push here = deploy. |
| **Admin password** | `Flowers2026` | For `/admin`. To change it: update `ADMIN_PASSWORD` in Vercel, redeploy. |

**Env vars in Vercel** (needed for the site to work; already set):
`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_WEB3FORMS_KEY`, `SUPABASE_URL`,
`SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_PASSWORD`, `RESEND_API_KEY`, `ORDER_FROM_EMAIL`.
The `VITE_`-prefixed ones bake into the site at build time — **changing any env var
requires a redeploy to take effect.**

---

## Making common changes — where to look

Everything content-ish is in a small number of files. Change the file, push, done.

| I want to change… | Edit this |
|---|---|
| **Holiday names, prices, or delivery dates** | `src/lib/arrangements.ts` — single source of truth; the order form, Bouquets page, and confirmation email all read from it. |
| **The $275 / 100-rose or $125 numbers** | `src/lib/arrangements.ts` (`ROSE_PRICE`, `ARRANGEMENT_PRICE`, `CUSTOM_MINIMUM`). |
| **Which photos/videos show where** | Add files to Annie's "Arrangement Photos" folder, list them in `scripts/prepare-media.mjs`, run `node scripts/prepare-media.mjs`, then reference them in `src/lib/media.ts`. The script converts HEIC → JPEG and strips video audio automatically. |
| **A page's headline or paragraph copy** | The page's file in `src/pages/` (`Home.tsx`, `About.tsx`, `Bouquets.tsx`, `Contact.tsx`, `Order.tsx`). |
| **Testimonials (the rotating "Kind words")** | The `testimonials` array near the top of `src/pages/Home.tsx`. Add as many as you like. |
| **A city page's content** | `src/lib/serviceAreas.ts`. To add a new city, add an entry there and one line in `public/sitemap.xml`. |
| **The confirmation email wording/design** | `api/send-confirmation.ts`. |
| **Page titles / SEO descriptions** | The `<PageMeta>` block at the top of each page in `src/pages/`. |
| **Colors, fonts, spacing** | `src/index.css` (the palette + type tokens) — see `agents/DESIGN.md`. |

After any edit: `npm run build` (catches mistakes) → `git commit` → `git push`.

---

## The admin (`/admin`, password `Flowers2026`)

- **Orders** — filter by status, sort newest/oldest, advance an order (new → confirmed
  → paid → delivered), edit its card message / instructions / value, or delete it.
- **Customers** — search by name/email; each shows their recipients with saved
  addresses and **gate codes**, all editable. Recipients can be deleted too.
- **Events** — a revenue roll-up. Website orders tagged to an event sum automatically;
  type in anything the site never saw. Enter expenses (vases/flowers/misc); profit,
  margin, and the charts compute themselves.

Full detail: `agents/ADMIN-HANDOFF.md`.

---

## The database

Two migrations, already applied, in `supabase/migrations/`:
- `001_customers_recipients_orders.sql` — the order book (customers → recipients →
  orders, with gate codes on the recipient).
- `002_events.sql` — the events dashboard.

**To change the database structure:** write a new numbered migration file, then paste
it into Supabase → SQL Editor → Run. Two hard-won rules:
1. **Clear the editor completely (Cmd+A, Delete) before pasting**, and make sure nothing
   is highlighted — a partial selection runs only part of the script and "succeeds"
   silently.
2. Migration files are the record; apply them by hand in the SQL editor. Don't point
   automated tooling at the live database.

---

## Still open / good next steps

- **SEO off-site** (the highest-value remaining work, all in Annie's Google account):
  claim the **Google Business Profile**, ask the 19 imported past customers for Google
  reviews, and submit `lunasbouquet.com/sitemap.xml` to Google Search Console.
- **A phone number** on the site (there's only email + Instagram now).
- **A wide landscape hero photo** of Annie's own work to swap into the Bouquets hero
  (one line in `src/pages/Bouquets.tsx`).

---

## The `agents/` docs, in one place

| File | What it covers |
|---|---|
| `agents/claude.md` | Project constitution — who Annie is, what the business sells. |
| `agents/ADMIN-HANDOFF.md` | The admin in full, plus the historical import. |
| `agents/VERCEL-NOTES.md` | Deploy gotchas — **read before changing deploy config**. |
| `agents/EMAIL-SETUP.md` | How the confirmation email is wired (already live). |
| `agents/DESIGN.md` | The locked design system: palette, fonts, layout. |
| `agents/build-plan.md` | The original build plan. |
| `agents/ORDER-FORM-FIELDS.md` | The order form fields and their origin. |
