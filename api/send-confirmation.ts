/// <reference types="node" />
// Emails the CUSTOMER a confirmation after they place an order.
//
// Annie's own notification still goes out via Web3Forms from the browser (unchanged).
// This is the second email — the one to the buyer — and it goes through Resend, which
// (unlike Web3Forms' free tier) can send to an arbitrary recipient.
//
// It is deliberately DORMANT until configured: with no RESEND_API_KEY set it returns a
// soft { sent: false } and the order flow carries on untouched. So shipping this changes
// nothing for customers until Christine adds the key and verifies the domain. See
// agents/EMAIL-SETUP.md.

type Req = { method?: string; body?: unknown }
type Res = {
  status: (code: number) => Res
  json: (body: unknown) => void
  setHeader?: (k: string, v: string) => void
}

const RESEND_API_KEY = process.env.RESEND_API_KEY
// Until the domain is verified in Resend, only Resend's shared sender works, and it can
// only email the account owner. Once lunasbouquet.com is verified, set ORDER_FROM_EMAIL
// to something like "Luna's Bouquet <orders@lunasbouquet.com>".
const FROM = process.env.ORDER_FROM_EMAIL || "Luna's Bouquet <onboarding@resend.dev>"

type Payload = {
  customerName?: string
  customerEmail?: string
  recipientName?: string
  arrangements?: string[]
  estimatedTotal?: number
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string
  )
}

function emailHtml(p: Payload): string {
  const first = (p.customerName || 'there').trim().split(' ')[0]
  const items = (p.arrangements || []).map((a) => `<li>${escapeHtml(a)}</li>`).join('')
  const total = p.estimatedTotal
    ? `$${p.estimatedTotal}`
    : 'to be confirmed'
  // Inline styles only — email clients strip <style> and external CSS. Brand colors from
  // the site: plum #3a2130, gold #a97c24, rosewood #a8465a, ivory #f6f1e7.
  return `<!doctype html>
<html><body style="margin:0;background:#f6f1e7;font-family:Georgia,'Times New Roman',serif;color:#2a2420;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f1e7;padding:32px 0;">
    <tr><td align="center">
      <table role="presentation" width="520" cellpadding="0" cellspacing="0" style="max-width:520px;background:#fbf8f1;border:1px solid #e2d8c4;">
        <tr><td style="padding:36px 40px 8px;text-align:center;">
          <p style="margin:0;font-size:12px;letter-spacing:3px;text-transform:uppercase;color:#a97c24;">Luna&rsquo;s Bouquet</p>
        </td></tr>
        <tr><td style="padding:8px 40px 0;text-align:center;">
          <h1 style="margin:0;font-size:30px;font-weight:normal;color:#3a2130;">Thank you, ${escapeHtml(first)}.</h1>
        </td></tr>
        <tr><td style="padding:20px 40px 0;font-size:17px;line-height:1.6;color:#2a2420;">
          <p style="margin:0;">Your order is in. Ahnaleigh will reach out personally to confirm the details and arrange payment. Something beautiful is on its way.</p>
        </td></tr>
        <tr><td style="padding:24px 40px 0;">
          <table role="presentation" width="100%" style="background:#f6f1e7;border-radius:4px;">
            <tr><td style="padding:18px 22px;font-size:16px;line-height:1.7;">
              ${p.recipientName ? `<p style="margin:0 0 8px;"><strong>For:</strong> ${escapeHtml(p.recipientName)}</p>` : ''}
              ${items ? `<p style="margin:0 0 4px;"><strong>Arrangements:</strong></p><ul style="margin:0 0 8px;padding-left:20px;">${items}</ul>` : ''}
              <p style="margin:0;"><strong>Estimated total:</strong> ${total}</p>
            </td></tr>
          </table>
        </td></tr>
        <tr><td style="padding:22px 40px 4px;font-size:15px;line-height:1.6;color:#6e6153;">
          <p style="margin:0;">No payment is due yet — Ahnaleigh arranges payment by Venmo, Zelle, check, or cash after confirming your order. Please allow 48 hours.</p>
        </td></tr>
        <tr><td style="padding:24px 40px 40px;text-align:center;">
          <p style="margin:0;font-size:13px;color:#a97c24;">lunasbouquet.com &middot; @lunas_bouquet12</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`
}

export default async function handler(req: Req, res: Res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Use POST.' })
    return
  }

  // Not configured yet → soft no-op, so the order flow never breaks on this.
  if (!RESEND_API_KEY) {
    res.status(200).json({ sent: false, reason: 'not-configured' })
    return
  }

  const body = (typeof req.body === 'string' ? JSON.parse(req.body) : req.body) as Payload
  const to = (body?.customerEmail || '').trim()
  if (!to) {
    res.status(400).json({ error: 'Missing customer email.' })
    return
  }

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM,
        to,
        subject: "We've got your order — Luna's Bouquet",
        html: emailHtml(body),
      }),
    })
    if (!r.ok) {
      const text = await r.text()
      res.status(502).json({ sent: false, error: text.slice(0, 300) })
      return
    }
    res.status(200).json({ sent: true })
  } catch (err) {
    res.status(500).json({ sent: false, error: err instanceof Error ? err.message : 'send failed' })
  }
}
