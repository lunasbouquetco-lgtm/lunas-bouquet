import { guarded, type Req } from '../_admin'

function query(req: Req, key: string): string {
  // Vercel gives us req.query; the dev plugin passes the parsed URL the same way.
  const q = (req as unknown as { query?: Record<string, string | string[]> }).query ?? {}
  const v = q[key]
  return (Array.isArray(v) ? v[0] : v) ?? ''
}

// The customer list: one row per customer with their order count and total spend,
// plus how many recipients they send to. Search matches name or email.
export default guarded(async (db, req, res) => {
  const search = query(req, 'q').trim()

  let sel = db
    .from('customers')
    .select('id, created_at, name, email, phone, notes, recipients(id), orders(id, estimated_total)')
    .order('created_at', { ascending: false })
    .limit(200)

  if (search) {
    // Escape commas — PostgREST uses them as the or() separator, so an unescaped one
    // in a search box would corrupt the filter.
    const safe = search.replace(/[,()]/g, ' ')
    sel = sel.or(`name.ilike.%${safe}%,email.ilike.%${safe}%`)
  }

  const { data, error } = await sel
  if (error) {
    res.status(500).json({ error: error.message })
    return
  }

  type Row = {
    id: string
    created_at: string
    name: string
    email: string
    phone: string | null
    notes: string | null
    recipients: { id: string }[] | null
    orders: { id: string; estimated_total: number | null }[] | null
  }

  const customers = (data as Row[]).map((c) => ({
    id: c.id,
    created_at: c.created_at,
    name: c.name,
    email: c.email,
    phone: c.phone,
    notes: c.notes,
    recipientCount: c.recipients?.length ?? 0,
    orderCount: c.orders?.length ?? 0,
    totalValue: (c.orders ?? []).reduce((s, o) => s + (o.estimated_total ?? 0), 0),
  }))

  res.status(200).json({ customers })
})
