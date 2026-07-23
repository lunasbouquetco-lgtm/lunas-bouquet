import { supabase } from './supabase'
import {
  HOLIDAY_ARRANGEMENTS,
  CUSTOM_OPTION,
  estimateTotal,
} from './arrangements'

export type OrderInput = {
  customerName: string
  customerPhone: string
  customerEmail: string
  recipientName: string
  recipientAddress: string
  arrangements: string[] // ids
  customDetails: string
  cardMessage: string
  deliveryInstructions: string
  website?: string // honeypot — must stay empty
}

const WEB3FORMS_KEY = import.meta.env.VITE_WEB3FORMS_KEY as string | undefined

function labelFor(id: string): string {
  if (id === CUSTOM_OPTION.id) return CUSTOM_OPTION.label
  return HOLIDAY_ARRANGEMENTS.find((a) => a.id === id)?.label ?? id
}

export async function submitOrder(
  input: OrderInput
): Promise<{ ok: boolean; error?: string }> {
  // Honeypot: silently accept bots without doing anything.
  if (input.website && input.website.trim() !== '') {
    return { ok: true }
  }

  const arrangementLabels = input.arrangements.map(labelFor)
  const estimated = estimateTotal(input.arrangements)

  // 1) Store the order in Supabase (source of truth).
  if (supabase) {
    const { error } = await supabase.from('orders').insert({
      customer_name: input.customerName,
      customer_phone: input.customerPhone,
      customer_email: input.customerEmail,
      recipient_name: input.recipientName,
      recipient_address: input.recipientAddress,
      arrangements: arrangementLabels,
      custom_details: input.customDetails || null,
      card_message: input.cardMessage || null,
      delivery_instructions: input.deliveryInstructions || null,
      estimated_total: estimated,
      source: 'website',
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

  return { ok: true }
}
