import { guarded, type Req } from '../_admin.js'

function query(req: Req, key: string): string {
  const q = (req as unknown as { query?: Record<string, string | string[]> }).query ?? {}
  const v = q[key]
  return (Array.isArray(v) ? v[0] : v) ?? ''
}

const STATUSES = ['new', 'confirmed', 'paid', 'delivered', 'cancelled'] as const

// GET  → the order list, newest first, optionally filtered by status.
// PATCH → move one order along ('new' → 'confirmed' → 'paid' → 'delivered').
export default guarded(async (db, req, res) => {
  if (req.method === 'PATCH') {
    const body = (typeof req.body === 'string' ? JSON.parse(req.body) : req.body) as {
      id?: string
      status?: string
    }
    if (!body?.id || !body?.status) {
      res.status(400).json({ error: 'Missing id or status.' })
      return
    }
    // Whitelist rather than trusting the client — the column is an enum, and an
    // unknown value should read as a bad request, not a database error.
    if (!STATUSES.includes(body.status as (typeof STATUSES)[number])) {
      res.status(400).json({ error: 'Unknown status.' })
      return
    }
    const { error } = await db.from('orders').update({ status: body.status }).eq('id', body.id)
    if (error) {
      res.status(500).json({ error: error.message })
      return
    }
    res.status(200).json({ ok: true })
    return
  }

  const status = query(req, 'status')
  let sel = db
    .from('orders')
    .select(
      'id, created_at, status, arrangements, estimated_total, card_message, custom_details, ' +
        'delivery_instructions, customer_id, customer_name, customer_email, customer_phone, ' +
        'recipient_name, recipient_address'
    )
    .order('created_at', { ascending: false })
    .limit(200)

  if (status && STATUSES.includes(status as (typeof STATUSES)[number])) {
    sel = sel.eq('status', status)
  }

  const { data, error } = await sel
  if (error) {
    res.status(500).json({ error: error.message })
    return
  }
  res.status(200).json({ orders: data ?? [] })
})
