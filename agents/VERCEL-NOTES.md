# Vercel notes

## vercel.json takes no comments

Vercel validates `vercel.json` against a strict schema and rejects unknown keys. A
`"comment"` property inside a rewrite rule fails the whole build with:

    The `vercel.json` schema validation failed with the following message:
    `rewrites[0]` should NOT have additional property `comment`

Note that this fails **before** the build runs, so the deployment shows as Error with no
build log. Explanations about the config go here, not in the file.

## What the rewrite is for

React Router owns the routes client-side. Vercel doesn't know that, so a request for
`/order` looks for a file at that path, finds none, and 404s. The rewrite sends every
non-API path to `index.html` so the browser can route.

Real files (assets, media, favicons, robots.txt, sitemap.xml) are served from disk before
the rewrite applies, and `/api/*` is excluded so the order-book endpoints still run.

Without this, only the homepage works. Every other page — including `/order` — 404s.

## api/ is compiled with Node's module rules

Vercel compiles the `api/` folder with `moduleResolution: nodenext`, which requires
explicit `.js` extensions on relative imports even in TypeScript source:

    import { guarded } from '../_admin.js'   // correct
    import { guarded } from '../_admin'      // 500s in production

`tsconfig.api.json` is set to `nodenext` to match, so this now fails locally at build time
instead of silently in production.

## Environment variables are baked in at build time

`VITE_*` values are substituted into the bundle when the site builds. Adding or changing
them in Vercel has **no effect until the next deployment**. If the order form can't reach
Supabase, check the bundle actually contains the project URL before debugging anything else:

    curl -s https://<deployment>/assets/index-*.js | grep -o 'https://[a-z0-9]*\.supabase\.co'

Server-side variables (`SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_PASSWORD`) are read at runtime
by the API functions, but still need a redeploy to attach to a new deployment.

## Deployment protection is on by default

New projects enable Vercel Authentication, which 302-redirects every visitor to a Vercel
login. Fine for staging, fatal for a shop. Settings → Deployment Protection → Vercel
Authentication → Disabled.

## The daily cron that keeps Supabase awake

`vercel.json` declares one cron job:

    "crons": [{ "path": "/api/keepalive", "schedule": "0 12 * * *" }]

It exists because Supabase's free tier pauses a project after 7 days with no API
requests, which would take the order book offline during a quiet stretch between
holidays. `api/keepalive.ts` runs a single head-only count against `orders` — enough
activity to reset the clock, cheap enough to be free.

Things that have bitten people with Vercel crons:

- **Crons only run from production deployments on `main`.** A preview deployment
  declaring a cron doesn't schedule anything. If the schedule looks missing, check you
  actually deployed to production.
- **Hobby plans allow daily crons only** (and 2 per account), and the time is
  approximate — `0 12 * * *` means sometime inside that UTC hour, not on the minute. A
  more frequent expression fails at deploy time with "Hobby accounts are limited to
  daily cron jobs." Daily is all we need; the pause window is 7 days.
- **Changing `crons` requires a deploy** to take effect, like everything else here.
- **It's open unless you set `CRON_SECRET`.** Vercel's only documented way to
  authenticate a cron is the `CRON_SECRET` env var, which it sends back as
  `Authorization: Bearer <secret>`. Guarding on any other header would 401 the real
  cron and fail silently at the one job this exists to do, so with no secret set the
  endpoint answers anyone — it returns `{ ok: true }` and nothing about the orders.
  To harden it: add `CRON_SECRET` in Vercel → Settings → Environment Variables, then
  redeploy. Testing by hand:

      curl -s https://lunasbouquet.com/api/keepalive
      # with a secret set:
      curl -s -H "Authorization: Bearer $CRON_SECRET" https://lunasbouquet.com/api/keepalive

- **A failure shows up in Vercel → Cron Jobs**, which is the only place a silent
  Supabase problem would otherwise surface. The endpoint returns 500 on a database
  error on purpose, so a broken database makes noise there.
