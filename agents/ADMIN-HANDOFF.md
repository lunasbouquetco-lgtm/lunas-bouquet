# Admin / Customer Book — Handoff

Built 2026-07-23. The admin lives at **`/admin`** and is not linked from anywhere on the
public site.

## What it does

- **Overview** — order count, how many need attention, customer count, estimated lifetime
  value, and the eight most recent orders.
- **Orders** — every order, filterable by status, with the full delivery details. One button
  moves an order along: new → confirmed → paid → delivered.
- **Customers** — searchable by name or email, each row showing order count, recipient
  count, and total spend.
- **Customer detail** — every recipient that customer sends to, each with its own address,
  **gate code**, and delivery notes, all editable inline. Plus their full order history.

## The data shape

A **customer** (the person who pays) sends to one or more **recipients**. Delivery details
live on the recipient, because that is the part that repeats: Mom's house has a gate code,
the office has a front-desk instruction, and the same customer uses both. An **order**
points at one customer and one recipient.

The order form now has a dedicated **gate or building code** field instead of burying it in
free-text delivery instructions, so it lands in a real column Annie can read at a glance.

Repeat orders reuse the existing customer (matched on email) and recipient (matched on name
+ address) rather than creating duplicates. A blank gate code on a repeat order does **not**
wipe a code already on file — only an edit in the admin clears it.

## How the password actually works

Christine chose a shared password over per-person sign-in. Worth knowing what that means
here:

The browser holds the Supabase anon key, and that key ships inside the JS bundle where
anyone can read it. So a password box in React alone would protect nothing — the data would
still be one API call away. Instead:

- RLS on `customers`, `recipients`, and `orders` gives the browser **insert-only** access.
  There are no select policies, so a browser read returns zero rows no matter what.
- Every admin read goes through `/api/admin/*`, which runs on the server with the
  service-role key and checks `ADMIN_PASSWORD` on **every single request** (constant-time
  compare). There is no session token to forge.
- If `ADMIN_PASSWORD` is unset, the admin fails **closed**, not open.

The remaining trade-off is inherent to one shared secret: it cannot be revoked for one
person without changing it for everyone, and there is no record of who looked at what. If
that starts to matter, switching to email sign-in codes is a contained change — the server
guard is already the only gate.

## To turn it on

1. **Apply the migration.** Run `supabase/migrations/001_customers_recipients_orders.sql`
   in the Supabase SQL editor. *(Not applied — per the standing rule, build agents write
   migration files and never touch the live database.)*
2. **Set the server env vars** in `.env.local` for local work and in Vercel for production:
   - `ADMIN_PASSWORD` — the shared password
   - `SUPABASE_SERVICE_ROLE_KEY` — from Supabase → Project Settings → API
   - `SUPABASE_URL` — same URL as `VITE_SUPABASE_URL`

   These three have **no** `VITE_` prefix on purpose. That prefix is what puts a value into
   the browser bundle; the service-role key must never go there.
3. On Vercel, add them as regular (not Sensitive) env vars if you want to be able to pull
   them back down later.

## Verified 2026-07-23

- `npm run build` clean, including the `api/` folder (wired into the typecheck via
  `tsconfig.api.json` so a broken endpoint fails the build instead of at runtime).
- `npm run lint` — one fast-refresh warning in `parts.tsx`, cosmetic.
- Auth, against the running dev server: no password → 401, wrong password → 401, right
  password → 200, and `/api/admin/customers` with no password → 401.
- The password screen and admin shell render; sign-in works.
- The order form's new gate code field renders correctly.

## Not yet verified

- **Real data.** Every screen has only been seen in its loading/error state, because the
  service-role key is not set locally. Once step 1 and 2 above are done, the dashboard,
  customer list, and gate-code editing need a real pass.
- **Mobile.** The browser window would not resize during this session, so 375px was not
  visually checked. The layouts use wrapping grids, but that is reasoning, not proof.
- **A real order end to end** — placing an order and watching customer, recipient, and
  order rows appear. Blocked on the migration.

---

## Historical import (done 2026-07-24, overnight)

Annie's Google Form export was imported into the order book:

- **19 customers**, **34 orders**, all marked `status='delivered'` / `source='legacy'`
  with their real submission dates, so they read as history and don't show up as work
  to do. "Needs attention" is 0.
- **7 gate codes** were dug out of wherever they were hiding — delivery instructions,
  buried inside address text ("Gate code: 3986"), and a bare `#1234#` — and now live in
  the recipient's own `gate_code` field. Spot-verified: Kristin Heitz #3424,
  Carol Glantz #3986, Yasaman #2001.
- Apartment numbers were deliberately NOT treated as gate codes (e.g. "312 S Hardy Dr
  **#105**" is a unit, not a gate). That distinction is why the extraction is a
  whitelist of "gate"-context matches rather than any `#1234`.
- Repeat customers collapsed correctly: Ashley Trussell 6 orders, Grace Heitz 4,
  Jeremy Jondahl 3 (his family).

**Not imported:** a handful of rows with no usable address — the July "Pop-up Flower
Event" signups and a couple of junk rows (".", "Me"/"Mine"). They carried no recipient
address or order detail worth keeping. The "Total Orders" tab (payment amounts /
paid-unpaid status) was also left out; that's a separate follow-up if Annie wants
historical revenue in the book.

The import ran through a temporary `/api/admin/import` endpoint which has since been
**removed**. No customer data is stored in this repo — the repo is public, and the
records live only in Supabase.

## Editing and deleting orders

The order list now supports more than moving statuses along:

- **Edit** — card message and delivery instructions, inline.
- **Delete** — two clicks ("Delete" → "Yes, delete") so a stray tap can't erase a real
  order.

Recipients (address, gate code, notes) are still edited from the customer detail page.
