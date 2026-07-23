# Luna's Bouquet — Build Plan

## Stack (decided)
- **Vite + React + TypeScript + Tailwind** — chosen so Annie can edit later in Lovable
  (same stack as the Butterfly Effect site). GitHub → Vercel deploy. Lovable connects at the end.
- **Supabase** — `orders` table, RLS insert-only from anon key. Client-side insert.
- **Web3Forms** — client-side email-on-order to Annie's inbox.
- All accounts already created by Christine: GitHub, Vercel, Web3Forms, Supabase.

## Phase 0 — Brand approval gate (BEFORE full build)
1. Rosa derives palette from McQueen inspiration + hero, ties to gold logo.
2. Pick fonts (display serif for the LB feel + a clean text face).
3. Ship Christine a **color artifact** + a **mark mockup** for sign-off.
4. Pricing CONFIRMED: $125/seasonal arrangement (vase + free delivery); $375 min one-off/custom.
5. Capture the Google Form fields exactly (via browser).
**Christine approves palette + font + pricing before Phase 1.**

## Phase 1 — Scaffold + design system
- Vite/React/TS/Tailwind scaffold. Tailwind theme = approved palette + fonts.
- Drop in logo + hero assets. Base layout, nav (centered logo tab), footer.

## Phase 2 — Marketing pages
- Home (full-bleed hero + headline overlay, offerings, story teaser, testimonials, CTA).
- About / Annie's story (dignified).
- Offerings (holidays, events, custom, membership) with correct pricing.
- Testimonials (Ashley, Lori + room for more).
- Contact (email, Instagram, delivery area, 48h notice).

## Phase 3 — Order form + backend
- Recreate Google Form fields in a styled React form.
- Supabase `orders` table + RLS insert policy + migration file.
- Web3Forms integration → Annie emailed on submit.
- Success/error states, validation, spam honeypot.

## Phase 4 — Verify (Toby + Priya)
- Run dev server, test order flow end to end in the browser.
- Real insert into Supabase (test project/table), real Web3Forms test to a safe inbox.
- Mobile pass at 375px. Contrast pass. Copy pass.

## Phase 5 — Ship (only on Christine's go)
- Push to GitHub, deploy to Vercel, connect domain, connect Lovable for Annie's future edits.

## Visual bar (Christine, 2026-07-23)
- Must be as gorgeous as the Insight AI and Butterfly Effect sites. Visual-rich, generous imagery.
- The **order form itself must be beautiful** — not a plain form. Same design language, imagery,
  editorial spacing. It's a destination page, not a utility.
- More MidJourney imagery is coming; build with tasteful placeholders + real hero now, swap in later.

## Guardrails
- Nothing to prod / no real customer email without Christine's explicit go.
- Secrets in .env.local, never committed. .gitignore from the start.
