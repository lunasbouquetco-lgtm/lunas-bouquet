import { guarded } from '../_admin'

// The dashboard's top numbers. Counts come back as head-only queries so we're not
// pulling every row across the wire just to length it.
export default guarded(async (db, _req, res) => {
  const [orders, customers, recent] = await Promise.all([
    db.from('orders').select('id', { count: 'exact', head: true }),
    db.from('customers').select('id', { count: 'exact', head: true }),
    db
      .from('orders')
      .select('id, created_at, status, estimated_total, arrangements, customer_name, recipient_name')
      .order('created_at', { ascending: false })
      .limit(8),
  ])

  const err = orders.error || customers.error || recent.error
  if (err) {
    res.status(500).json({ error: err.message })
    return
  }

  const rows = recent.data ?? []

  // "New" is what Annie actually needs to act on, so surface it separately.
  const { count: newCount } = await db
    .from('orders')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'new')

  // Lifetime estimated value. Custom/event orders carry $0 here because they're quoted
  // separately, so this reads low on purpose rather than inventing a number.
  const { data: totals } = await db.from('orders').select('estimated_total')
  const lifetimeValue = (totals ?? []).reduce(
    (sum, r: { estimated_total: number | null }) => sum + (r.estimated_total ?? 0),
    0
  )

  res.status(200).json({
    orderCount: orders.count ?? 0,
    customerCount: customers.count ?? 0,
    newOrderCount: newCount ?? 0,
    lifetimeValue,
    recentOrders: rows,
  })
})
