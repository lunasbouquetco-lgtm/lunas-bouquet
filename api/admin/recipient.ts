import { guarded } from '../_admin'

// Gate codes change, people move, "leave it with the neighbor" becomes "ring twice".
// Annie edits a recipient here. Only these fields are writable — the customer link and
// timestamps are not something the UI should be able to rewrite.
const EDITABLE = ['name', 'address', 'gate_code', 'delivery_notes', 'relationship'] as const

export default guarded(async (db, req, res) => {
  if (req.method !== 'PATCH' && req.method !== 'POST') {
    res.status(405).json({ error: 'Use PATCH.' })
    return
  }

  const body = (typeof req.body === 'string' ? JSON.parse(req.body) : req.body) as
    | (Record<string, unknown> & { id?: string })
    | undefined

  if (!body?.id) {
    res.status(400).json({ error: 'Missing recipient id.' })
    return
  }

  const patch: Record<string, string | null> = {}
  for (const key of EDITABLE) {
    if (key in body) {
      const v = body[key]
      // Empty string means "clear it", which for a gate code is a real intention —
      // unlike the order form, where a blank box just means the customer didn't retype it.
      patch[key] = typeof v === 'string' && v.trim() !== '' ? v.trim() : null
    }
  }

  if (Object.keys(patch).length === 0) {
    res.status(400).json({ error: 'Nothing to update.' })
    return
  }
  if (patch.name === null || patch.address === null) {
    res.status(400).json({ error: 'Name and address cannot be empty.' })
    return
  }

  const { error } = await db.from('recipients').update(patch).eq('id', body.id)
  if (error) {
    res.status(500).json({ error: error.message })
    return
  }
  res.status(200).json({ ok: true })
})
