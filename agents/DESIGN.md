# Luna's Bouquet — Locked Design System

Source of truth for the build. Theo builds the Tailwind theme from this.

## Typography (CONFIRMED by Christine, 2026-07-23)
- **Display / headings:** Prata (Google Fonts). High-contrast fashion-house serif. Used for the
  wordmark feel, hero headline, section titles, prices.
- **UI / labels / buttons / body-support:** Jost (Google Fonts). Light geometric sans, tracked
  uppercase for labels — echoes the logo's wide-tracked "LUNA'S BOUQUET".
- **Long body copy:** may use a readable serif (Cormorant/EB Garamond) or Jost at comfortable size;
  decide during build for legibility. Prata is display-only (too fine for paragraphs).
- Load via self-hosted woff2 or Google Fonts link (Vite site can use a font CDN at runtime, unlike
  the artifact). Prefer @fontsource packages for Lovable-friendliness.

## Palette (pending final nod; treated as locked unless Christine tweaks)
| Token        | Hex      | Role |
|--------------|----------|------|
| Ivory        | #F6F1E7  | Page ground |
| Champagne    | #ECE3D2  | Cards & surfaces |
| Antique Gold | #A97C24  | Brand thread: labels, rules, dividers, small accents |
| Gold Light   | #C6A24E  | Gold on dark grounds |
| Rosewood     | #A8465A  | Signature accent — buttons/CTAs ONLY, spent sparingly |
| Deep Plum    | #3A2130  | Footer, dark sections, deep ink |
| Sage         | #7C8060  | Natural secondary, greenery nods |
| Ink          | #2A2420  | Body text |

Discipline: cream ground, gold as the constant thread, rosewood is the ONE bold note (CTAs only).

## Brand assets (in /assets)
- `source/logo.png` — original gold-on-cream wordmark (2000×2000).
- `mark-gold.png` — wordmark knocked out to transparent, native gold. Use on ivory/champagne/plum.
- `mark-ivory.png` — wordmark recolored ivory, transparent. Use on gold/dark grounds.
- `hero-clean.png` — cleaned hero (grey placeholder panel + "MC" text removed). 1182×816.
- `source/mcqueen-inspiration.png` — mood reference (not for site use).

## Layout language
- Full-bleed floral hero, headline over cream negative space (left), single rosewood CTA.
- Generous editorial whitespace. Real type hierarchy. Imagery-forward (more MidJourney to come).
- Nav: centered logo "tab" feel from the homepage inspiration; gold hairline rules.
- The **order form is a designed destination** — floral imagery, same type/palette, not a plain form.

## Accessibility notes (Toby)
- Antique Gold #A97C24 on Ivory ≈ 4.0:1 — OK for large text/labels, NOT for small body. Body = Ink.
- Rosewood #A8465A with white text passes for buttons. Verify each pairing during build.
