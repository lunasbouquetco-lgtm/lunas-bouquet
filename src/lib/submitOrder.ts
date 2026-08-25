import { supabase } from './supabase'
import {
  describe,
  estimateTotal,
  HOLIDAY_ARRANGEMENTS,
  type Selection,
} from './arrangements'

export type OrderInput = {
  customerName: string
  customerPhone: string
  customerEmail: string
  recipientName: string
  recipientAddress: string
  gateCode: string
  selection: Selection // holiday id -> size
  customDetails: string
  cardMessage: string
  deliveryInstructions: string
  website?: string // honeypot — must stay empty
}

const WEB3FORMS_KEY = import.meta.env.VITE_WEB3FORMS_KEY as string | undefined

export async function submitOrder(
  input: OrderInput
): Promise<{ ok: boolean; error?: string }> {
  // Honeypot: silently accept bots without doing anything.
  if (input.website && input.website.trim() !== '') {
    return { ok: true }
  }

  // Labels carry the size, so Annie's order book reads "Mother's Day — 100 roses"
  // rather than making her cross-reference a price to know what to build.
  const arrangementLabels = Object.entries(input.selection).map(([id, size]) =>
    describe(id, size)
  )
  const estimated = estimateTotal(input.selection)

  // 1) Store the order in Supabase (source of truth).
  //
  // One RPC rather than three inserts: the browser holds the anon key and cannot read
  // these tables, so it cannot look up whether this customer or recipient already
  // exists. place_order() does the find-or-create server-side and returns only the new
  // order id. It also protects a saved gate code from being blanked by a repeat order
  // that left the field empty.
  //
  // If this fails, we do NOT give up on the order — see step 2. A database that's
  // unreachable (Supabase's free tier pauses after 7 days idle) used to return early
  // here, which meant Annie never got the email and the order vanished. Losing an
  // order is far worse than losing the record of one.
  let savedToDatabase = false
  let databaseError = ''
  if (supabase) {
    try {
      const { error } = await supabase.rpc('place_order', {
        p_customer_name: input.customerName,
        p_customer_email: input.customerEmail,
        p_customer_phone: input.customerPhone,
        p_recipient_name: input.recipientName,
        p_recipient_address: input.recipientAddress,
        p_gate_code: input.gateCode || '',
        p_arrangements: arrangementLabels,
        p_custom_details: input.customDetails || '',
        p_card_message: input.cardMessage || '',
        p_delivery_instructions: input.deliveryInstructions || '',
        p_estimated_total: estimated,
      })
      if (error) databaseError = error.message
      else savedToDatabase = true
    } catch (err) {
      // A paused or unreachable project throws rather than returning an error object.
      databaseError = err instanceof Error ? err.message : 'database unreachable'
    }
  }

  // 2) Email Annie via Web3Forms so she sees the order right away.
  //
  // This runs whether or not step 1 worked, and it is the safety net: as long as this
  // email lands, the order is not lost, even with the database down. When the save
  // failed, the email says so loudly so Annie knows this one isn't in the order book.
  let emailedAnnie = false
  if (WEB3FORMS_KEY) {
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          subject: savedToDatabase
            ? `New Luna's Bouquet order — ${input.customerName}`
            : `[NOT SAVED — action needed] New order — ${input.customerName}`,
          from_name: "Luna's Bouquet website",
          replyto: input.customerEmail,
          ...(savedToDatabase
            ? {}
            : {
                '⚠️ Order book': `This order did NOT save to the database, so it is NOT in the admin. Keep this email — it is the only copy. (${databaseError || 'database unreachable'})`,
              }),
          'Customer': input.customerName,
          'Phone': input.customerPhone,
          'Email': input.customerEmail,
          'Recipient': input.recipientName,
          'Delivery address': input.recipientAddress,
          'Gate code': input.gateCode || '—',
          'Arrangements': arrangementLabels.join(', ') || '(none selected)',
          'Custom / event details': input.customDetails || '—',
          'Card message': input.cardMessage || '—',
          'Delivery instructions': input.deliveryInstructions || '—',
          'Estimated total': estimated ? `$${estimated}` : 'Quoted separately',
        }),
      })
      const json = await res.json()
      emailedAnnie = Boolean(json.success)
    } catch {
      emailedAnnie = false
    }
  }

  // The order is accepted if it landed anywhere Annie will see it. Only when BOTH the
  // database and the email failed has the order truly gone nowhere — that, and only
  // that, is worth showing the customer an error and asking them to try again.
  if (!savedToDatabase && !emailedAnnie) {
    return {
      ok: false,
      error: 'We could not send your order right now. Please try again, or email lunasbouquet.co@gmail.com.',
    }
  }

  // 3) Email the CUSTOMER a confirmation via /api/send-confirmation (Resend). This is
  // best-effort and must never block: the order is already saved, and the customer has
  // already seen the on-screen thank-you. A failure here (or the endpoint not being
  // configured yet) is swallowed so it can't turn a good order into an error.
  try {
    // Include each arrangement's delivery date so the email can remind the customer
    // when it's coming. Custom/event orders have no fixed date, so delivery is blank.
    const arrangementLines = Object.entries(input.selection).map(([id, size]) => ({
      label: describe(id, size),
      delivery: HOLIDAY_ARRANGEMENTS.find((a) => a.id === id)?.delivery ?? '',
    }))
    await fetch('/api/send-confirmation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName: input.customerName,
        customerEmail: input.customerEmail,
        recipientName: input.recipientName,
        arrangements: arrangementLines,
        estimatedTotal: estimated,
      }),
    })
  } catch {
    // ignore — confirmation email is non-critical
  }

  return { ok: true }
}
