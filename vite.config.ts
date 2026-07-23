import { defineConfig, loadEnv, type Plugin, type ViteDevServer } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

/**
 * `vite dev` serves the React app but knows nothing about the /api folder — that only
 * becomes functions once Vercel builds it. This plugin runs the very same handler
 * modules in dev, so the admin works on localhost without `vercel dev` and we're
 * testing the real code path rather than a mock.
 */
function apiPlugin(env: Record<string, string>): Plugin {
  return {
    name: 'lunas-api-dev',
    configureServer(server: ViteDevServer) {
      // Handlers read process.env under server-side names (no VITE_ prefix), which Vite
      // does not load into the dev process on its own.
      for (const [k, v] of Object.entries(env)) {
        if (process.env[k] === undefined) process.env[k] = v
      }

      server.middlewares.use(async (req, res, next) => {
        const url = req.url ?? ''
        if (!url.startsWith('/api/')) return next()

        const parsed = new URL(url, 'http://localhost')
        const file = path.join(process.cwd(), 'api', `${parsed.pathname.slice(5)}.ts`)

        try {
          const mod = await server.ssrLoadModule(file)
          const handler = mod.default as (req: unknown, res: unknown) => Promise<void>

          // Buffer the body so handlers can read req.body the way they do on Vercel.
          const chunks: Buffer[] = []
          for await (const chunk of req) chunks.push(chunk as Buffer)
          const raw = Buffer.concat(chunks).toString('utf8')

          const shimReq = {
            method: req.method,
            headers: req.headers,
            query: Object.fromEntries(parsed.searchParams),
            body: raw ? JSON.parse(raw) : undefined,
          }

          const shimRes = {
            status(code: number) {
              res.statusCode = code
              return shimRes
            },
            setHeader(k: string, v: string) {
              res.setHeader(k, v)
              return shimRes
            },
            json(body: unknown) {
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify(body))
            },
          }

          await handler(shimReq, shimRes)
        } catch (err) {
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(
            JSON.stringify({ error: err instanceof Error ? err.message : 'Dev API error' })
          )
        }
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  // '' prefix so server-only vars (ADMIN_PASSWORD, SUPABASE_SERVICE_ROLE_KEY) load too.
  // They are handed to the dev middleware only, never into the client bundle.
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react(), tailwindcss(), apiPlugin(env)],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  }
})
