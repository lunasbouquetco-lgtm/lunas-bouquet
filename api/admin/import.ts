import { guarded } from '../_admin.js'

// One-time (idempotent) import of Annie's historical orders from her Google Form export.
// Guarded by the admin password and run with the service-role key, like the rest of
// /api/admin/*. Historical orders are marked status='delivered', source='legacy' so they
// don't look like new orders Annie needs to act on, and each row's real submission
// timestamp becomes the order's created_at so the history reads true.
//
// Idempotent: a legacy order is keyed by (created_at, recipient_name), so re-running
// imports nothing twice. Safe to call more than once.

type Row = {
  customer_name: string
  customer_email: string
  customer_phone: string
  recipient_name: string
  recipient_address: string
  gate_code: string
  arrangements: string[]
  card_message: string
  delivery_notes: string
  created_at: string | null
  estimated_total: number
}

export default guarded(async (db, req, res) => {
  const body = (typeof req.body === 'string' ? JSON.parse(req.body) : req.body) as {
    orders?: Row[]
  }
  const rows = body?.orders ?? []
  if (!Array.isArray(rows) || rows.length === 0) {
    res.status(400).json({ error: 'No orders provided.' })
    return
  }

  let customersCreated = 0
  let recipientsCreated = 0
  let ordersCreated = 0
  let ordersSkipped = 0
  const errors: string[] = []

  for (const row of rows) {
    try {
      // --- customer: find by email, else by name; create if absent ---
      let customerId: string | null = null
      const email = (row.customer_email || '').trim().toLowerCase()
      if (email) {
        const { data } = await db.from('customers').select('id').eq('email', email).maybeSingle()
        customerId = data?.id ?? null
      }
      if (!customerId) {
        const { data } = await db
          .from('customers')
          .select('id')
          .ilike('name', row.customer_name)
          .maybeSingle()
        customerId = data?.id ?? null
      }
      if (!customerId) {
        const { data, error } = await db
          .from('customers')
          .insert({
            name: row.customer_name,
            // Email is unique; fall back to a synthetic placeholder when the form left it
            // blank so the row can still be inserted rather than collide on null.
            email: email || `no-email+${row.recipient_name}@import.local`.toLowerCase(),
            phone: row.customer_phone || null,
          })
          .select('id')
          .single()
        if (error) throw new Error(`customer: ${error.message}`)
        customerId = data.id
        customersCreated++
      }

      // --- recipient: find by (customer, name, address); create if absent ---
      let recipientId: string | null = null
      {
        const { data } = await db
          .from('recipients')
          .select('id, gate_code, delivery_notes')
          .eq('customer_id', customerId)
          .ilike('name', row.recipient_name)
          .eq('address', row.recipient_address || '')
          .maybeSingle()
        if (data) {
          recipientId = data.id
          // backfill a gate code / notes if this row has one and the saved row doesn't
          const patch: Record<string, string> = {}
          if (row.gate_code && !data.gate_code) patch.gate_code = row.gate_code
          if (row.delivery_notes && !data.delivery_notes) patch.delivery_notes = row.delivery_notes
          if (Object.keys(patch).length) await db.from('recipients').update(patch).eq('id', recipientId)
        }
      }
      if (!recipientId) {
        const { data, error } = await db
          .from('recipients')
          .insert({
            customer_id: customerId,
            name: row.recipient_name,
            address: row.recipient_address || '(address not on file)',
            gate_code: row.gate_code || null,
            delivery_notes: row.delivery_notes || null,
          })
          .select('id')
          .single()
        if (error) throw new Error(`recipient: ${error.message}`)
        recipientId = data.id
        recipientsCreated++
      }

      // --- order: idempotent on (created_at, recipient_name) ---
      if (row.created_at) {
        const { data: existing } = await db
          .from('orders')
          .select('id')
          .eq('created_at', row.created_at)
          .eq('recipient_name', row.recipient_name)
          .maybeSingle()
        if (existing) {
          ordersSkipped++
          continue
        }
      }

      const { error: oErr } = await db.from('orders').insert({
        customer_id: customerId,
        recipient_id: recipientId,
        arrangements: row.arrangements ?? [],
        card_message: row.card_message || null,
        delivery_instructions: row.delivery_notes || null,
        estimated_total: row.estimated_total ?? 0,
        status: 'delivered',
        source: 'legacy',
        admin_notes: 'Imported from Google Form',
        created_at: row.created_at ?? undefined,
        customer_name: row.customer_name,
        customer_email: email || null,
        customer_phone: row.customer_phone || null,
        recipient_name: row.recipient_name,
        recipient_address: row.recipient_address || null,
      })
      if (oErr) throw new Error(`order: ${oErr.message}`)
      ordersCreated++
    } catch (err) {
      errors.push(`${row.recipient_name}: ${err instanceof Error ? err.message : 'failed'}`)
    }
  }

  res.status(200).json({
    ok: true,
    customersCreated,
    recipientsCreated,
    ordersCreated,
    ordersSkipped,
    errors,
  })
})
