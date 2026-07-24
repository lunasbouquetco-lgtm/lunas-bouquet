import { supabase } from './supabase'
import { describe, estimateTotal, type Selection } from './arrangements'

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
  if (supabase) {
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
    if (error) {
      return { ok: false, error: error.message }
    }
  }

  // 2) Email Annie via Web3Forms so she sees the order right away.
  if (WEB3FORMS_KEY) {
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          subject: `New Luna's Bouquet order — ${input.customerName}`,
          from_name: "Luna's Bouquet website",
          replyto: input.customerEmail,
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
      if (!json.success && !supabase) {
        // If Supabase isn't set up, the email is our only channel — surface failure.
        return { ok: false, error: 'Could not send your order. Please try again.' }
      }
    } catch {
      if (!supabase) {
        return { ok: false, error: 'Could not send your order. Please try again.' }
      }
    }
  }

  // 3) Email the CUSTOMER a confirmation via /api/send-confirmation (Resend). This is
  // best-effort and must never block: the order is already saved, and the customer has
  // already seen the on-screen thank-you. A failure here (or the endpoint not being
  // configured yet) is swallowed so it can't turn a good order into an error.
  try {
    await fetch('/api/send-confirmation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName: input.customerName,
        customerEmail: input.customerEmail,
        recipientName: input.recipientName,
        arrangements: arrangementLabels,
        estimatedTotal: estimated,
      }),
    })
  } catch {
    // ignore — confirmation email is non-critical
  }

  return { ok: true }
}
