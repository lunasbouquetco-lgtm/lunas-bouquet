import { guarded } from '../_admin.js'

// The events roll-up. Revenue comes from two places at once and they are simply added:
//   linked website orders (orders.event_id) + whatever Annie typed in by hand.
// Expenses are always by hand. Profit and margin are computed here so the grid, the
// totals row, and the charts can never disagree with each other.

const EDITABLE = [
  'name',
  'event_date',
  'type',
  'status',
  'manual_orders',
  'manual_revenue',
  'expense_vases',
  'expense_flowers',
  'expense_misc',
  'expense_detail',
  'notes',
] as const

const NUMERIC = new Set([
  'manual_orders',
  'manual_revenue',
  'expense_vases',
  'expense_flowers',
  'expense_misc',
])

function clean(body: Record<string, unknown>) {
  const patch: Record<string, unknown> = {}
  for (const key of EDITABLE) {
    if (!(key in body)) continue
    const v = body[key]
    if (NUMERIC.has(key)) {
      const n = typeof v === 'number' ? v : parseFloat(String(v ?? ''))
      patch[key] = Number.isFinite(n) ? n : 0
    } else if (key === 'event_date') {
      patch[key] = v ? String(v) : null
    } else {
      patch[key] = v === '' || v === undefined ? null : v
    }
  }
  return patch
}

export default guarded(async (db, req, res) => {
  const body = (typeof req.body === 'string' ? JSON.parse(req.body) : req.body) as Record<
    string,
    unknown
  > & { id?: string }

  if (req.method === 'POST') {
    const patch = clean(body)
    if (!patch.name) patch.name = 'New event'
    const { data, error } = await db.from('events').insert(patch).select('id').single()
    if (error) {
      res.status(500).json({ error: error.message })
      return
    }
    res.status(200).json({ ok: true, id: data.id })
    return
  }

  if (req.method === 'PATCH') {
    if (!body?.id) {
      res.status(400).json({ error: 'Missing event id.' })
      return
    }
    const patch = clean(body)
    if (Object.keys(patch).length === 0) {
      res.status(400).json({ error: 'Nothing to update.' })
      return
    }
    const { error } = await db.from('events').update(patch).eq('id', body.id)
    if (error) {
      res.status(500).json({ error: error.message })
      return
    }
    res.status(200).json({ ok: true })
    return
  }

  if (req.method === 'DELETE') {
    if (!body?.id) {
      res.status(400).json({ error: 'Missing event id.' })
      return
    }
    // Orders keep existing; their event_id is nulled by the FK rule.
    const { error } = await db.from('events').delete().eq('id', body.id)
    if (error) {
      res.status(500).json({ error: error.message })
      return
    }
    res.status(200).json({ ok: true })
    return
  }

  // --- GET: events with their linked-order roll-up ---
  const { data: events, error } = await db
    .from('events')
    .select('*')
    .order('event_date', { ascending: false, nullsFirst: false })
  if (error) {
    res.status(500).json({ error: error.message })
    return
  }

  // One pass over linked orders rather than a query per event.
  const { data: linked } = await db
    .from('orders')
    .select('event_id, estimated_total')
    .not('event_id', 'is', null)

  const rollup = new Map<string, { orders: number; revenue: number }>()
  for (const o of linked ?? []) {
    const key = (o as { event_id: string }).event_id
    const cur = rollup.get(key) ?? { orders: 0, revenue: 0 }
    cur.orders += 1
    cur.revenue += Number((o as { estimated_total: number | null }).estimated_total ?? 0)
    rollup.set(key, cur)
  }

  const rows = (events ?? []).map((e) => {
    const auto = rollup.get(e.id) ?? { orders: 0, revenue: 0 }
    const orders = auto.orders + Number(e.manual_orders ?? 0)
    const revenue = auto.revenue + Number(e.manual_revenue ?? 0)
    const expenses =
      Number(e.expense_vases ?? 0) + Number(e.expense_flowers ?? 0) + Number(e.expense_misc ?? 0)
    const profit = revenue - expenses
    return {
      ...e,
      autoOrders: auto.orders,
      autoRevenue: auto.revenue,
      orders,
      revenue,
      expenses,
      profit,
      // Share of revenue kept. Null rather than 0 when there's no revenue, so the UI
      // can show "—" instead of a misleading 0%.
      margin: revenue > 0 ? profit / revenue : null,
      avgPerOrder: orders > 0 ? revenue / orders : null,
    }
  })

  const totals = rows.reduce(
    (a, r) => ({
      orders: a.orders + r.orders,
      revenue: a.revenue + r.revenue,
      expenses: a.expenses + r.expenses,
      profit: a.profit + r.profit,
      vases: a.vases + Number(r.expense_vases ?? 0),
      flowers: a.flowers + Number(r.expense_flowers ?? 0),
      misc: a.misc + Number(r.expense_misc ?? 0),
    }),
    { orders: 0, revenue: 0, expenses: 0, profit: 0, vases: 0, flowers: 0, misc: 0 }
  )

  res.status(200).json({ events: rows, totals })
})
