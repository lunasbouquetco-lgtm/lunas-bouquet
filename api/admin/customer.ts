import { guarded, type Req } from '../_admin.js'

function query(req: Req, key: string): string {
  const q = (req as unknown as { query?: Record<string, string | string[]> }).query ?? {}
  const v = q[key]
  return (Array.isArray(v) ? v[0] : v) ?? ''
}

// One customer in full: their saved recipients (with addresses and gate codes) and
// every order they've placed. This is the only endpoint that returns gate codes.
export default guarded(async (db, req, res) => {
  const id = query(req, 'id')
  if (!id) {
    res.status(400).json({ error: 'Missing customer id.' })
    return
  }

  const [customer, recipients, orders] = await Promise.all([
    db.from('customers').select('*').eq('id', id).single(),
    db
      .from('recipients')
      .select('*')
      .eq('customer_id', id)
      .order('created_at', { ascending: true }),
    db
      .from('orders')
      .select('*')
      .eq('customer_id', id)
      .order('created_at', { ascending: false }),
  ])

  if (customer.error) {
    res.status(404).json({ error: 'Customer not found.' })
    return
  }

  res.status(200).json({
    customer: customer.data,
    recipients: recipients.data ?? [],
    orders: orders.data ?? [],
  })
})
