import { guarded, type Req } from '../_admin.js'

function query(req: Req, key: string): string {
  const q = (req as unknown as { query?: Record<string, string | string[]> }).query ?? {}
  const v = q[key]
  return (Array.isArray(v) ? v[0] : v) ?? ''
}

const STATUSES = ['new', 'confirmed', 'paid', 'delivered', 'cancelled'] as const
// Fields Annie may edit on an order. The customer/recipient links and timestamps are
// not editable here — those belong to the customer and recipient records.
const EDITABLE = [
  'status',
  'card_message',
  'delivery_instructions',
  'admin_notes',
  'estimated_total',
  'amount_charged',
  'amount_paid',
] as const

// GET    → the order list, newest first, optionally filtered by status.
// PATCH  → edit an order (status, card message, delivery instructions, admin notes).
// DELETE → remove an order for good.
export default guarded(async (db, req, res) => {
  if (req.method === 'PATCH') {
    const body = (typeof req.body === 'string' ? JSON.parse(req.body) : req.body) as Record<
      string,
      unknown
    > & { id?: string }
    if (!body?.id) {
      res.status(400).json({ error: 'Missing order id.' })
      return
    }
    // Whitelist status — the column is an enum, so an unknown value should read as a bad
    // request, not a database error.
    if (
      body.status !== undefined &&
      !STATUSES.includes(body.status as (typeof STATUSES)[number])
    ) {
      res.status(400).json({ error: 'Unknown status.' })
      return
    }
    const patch: Record<string, unknown> = {}
    for (const key of EDITABLE) {
      if (key in body) patch[key] = body[key] === '' ? null : body[key]
    }
    if (Object.keys(patch).length === 0) {
      res.status(400).json({ error: 'Nothing to update.' })
      return
    }
    const { error } = await db.from('orders').update(patch).eq('id', body.id)
    if (error) {
      res.status(500).json({ error: error.message })
      return
    }
    res.status(200).json({ ok: true })
    return
  }

  if (req.method === 'DELETE') {
    const body = (typeof req.body === 'string' ? JSON.parse(req.body) : req.body) as {
      id?: string
    }
    if (!body?.id) {
      res.status(400).json({ error: 'Missing order id.' })
      return
    }
    const { error } = await db.from('orders').delete().eq('id', body.id)
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
