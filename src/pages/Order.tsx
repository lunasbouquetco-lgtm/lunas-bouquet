import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Check, ArrowRight, Loader2, Flower2 } from 'lucide-react'
import Reveal from '@/components/Reveal'
import bloom from '@/assets/bloom.jpg'
import {
  HOLIDAY_ARRANGEMENTS,
  CUSTOM_OPTION,
  ARRANGEMENT_PRICE,
  ROSE_PRICE,
  ROSE_COUNT,
  estimateTotal,
  type Selection,
  type Size,
} from '@/lib/arrangements'
import { submitOrder } from '@/lib/submitOrder'
import PageMeta from '@/components/PageMeta'

type Status = 'idle' | 'submitting' | 'success' | 'error'

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function Order() {
  // holiday id -> size. Presence of a key means "selected"; the value is which size.
  const [selection, setSelection] = useState<Selection>({})
  const selected = Object.keys(selection)
  const [form, setForm] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    recipientName: '',
    recipientAddress: '',
    gateCode: '',
    customDetails: '',
    cardMessage: '',
    deliveryInstructions: '',
    website: '', // honeypot
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [status, setStatus] = useState<Status>('idle')
  const [serverError, setServerError] = useState('')

  const customSelected = selected.includes(CUSTOM_OPTION.id)
  const estimate = estimateTotal(selection)
  const seasonalCount = selected.filter((id) => id !== CUSTOM_OPTION.id).length

  function toggle(id: string) {
    setSelection((prev) => {
      const next = { ...prev }
      if (id in next) delete next[id]
      else next[id] = 'signature' // default to the $125 arrangement
      return next
    })
    setErrors((e) => ({ ...e, arrangements: '' }))
  }

  function setSize(id: string, size: Size) {
    setSelection((prev) => ({ ...prev, [id]: size }))
  }

  function set(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
    setErrors((e) => ({ ...e, [field]: '' }))
  }

  function validate(): boolean {
    const next: Record<string, string> = {}
    if (selected.length === 0) next.arrangements = 'Please choose at least one option.'
    if (!form.customerName.trim()) next.customerName = 'Please add your name.'
    if (!form.customerPhone.trim()) next.customerPhone = 'Please add a phone number.'
    if (!form.customerEmail.trim()) next.customerEmail = 'Please add your email.'
    else if (!emailRe.test(form.customerEmail)) next.customerEmail = 'That email looks off.'
    if (!form.recipientName.trim()) next.recipientName = 'Who is this for?'
    if (!form.recipientAddress.trim()) next.recipientAddress = 'Please add a delivery address.'
    setErrors(next)
    if (Object.keys(next).length > 0) {
      const first = document.querySelector('[data-invalid="true"]')
      first?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return false
    }
    return true
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setServerError('')
    if (!validate()) return
    setStatus('submitting')
    const res = await submitOrder({ ...form, selection })
    if (res.ok) {
      setStatus('success')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      setStatus('error')
      setServerError(res.error || 'Something went wrong. Please try again.')
    }
  }

  if (status === 'success') {
    return <SuccessView name={form.customerName} />
  }

  // The bottom padding sits on this outer wrapper rather than only on the form column:
  // the floral aside is a grid item, so it stretches to the bottom of the grid and would
  // otherwise butt straight into the dark footer with no breathing room between them.
  return (
    <div className="bg-ivory pb-20 pt-28 sm:pb-28 sm:pt-32">
      <PageMeta
        title="Order Flowers for Delivery in Phoenix | Luna's Bouquet"
        description="Reserve a seasonal arrangement or a 100-rose bouquet for any holiday. Free delivery across the Phoenix metro and Scottsdale. No payment until Ahnaleigh confirms your order."
        path="/order"
      />
      <div className="mx-auto grid max-w-7xl gap-0 px-0 lg:grid-cols-[0.85fr_1.15fr]">
        {/* Left: floral panel */}
        <aside className="relative hidden lg:block">
          <div className="sticky top-0 h-screen">
            <img src={bloom} alt="" aria-hidden className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-plum/85 via-plum/25 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-10 text-ivory">
              <p className="label text-gold-light">Place your order</p>
              <h2 className="mt-4 font-display text-4xl leading-tight text-white">
                Let&apos;s make something beautiful.
              </h2>
              <p className="mt-4 max-w-sm font-body text-lg leading-relaxed text-ivory/85">
                Tell us what you would like and where it is going. Ahnaleigh will reach out
                personally to confirm the details and arrange payment.
              </p>
            </div>
          </div>
        </aside>

        {/* Right: form */}
        <div className="px-6 pb-24 pt-10 sm:px-10 lg:pt-16">
          <div className="lg:hidden">
            <p className="label text-gold">Place your order</p>
            <h1 className="mt-4 font-display text-4xl leading-tight text-plum">
              Let&apos;s make something beautiful.
            </h1>
            <p className="mt-4 font-body text-lg text-ink/75">
              Ahnaleigh will reach out personally to confirm the details and arrange payment.
            </p>
            <div className="mt-8 h-px w-16 bg-gold/40" />
          </div>

          <form onSubmit={onSubmit} noValidate className="mt-10 flex flex-col gap-12 lg:mt-0">
            {/* Honeypot */}
            <input
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              value={form.website}
              onChange={(e) => set('website', e.target.value)}
              className="absolute left-[-9999px] h-0 w-0 opacity-0"
              aria-hidden
            />

            {/* Step 1: selection */}
            <Section n="01" title="What would you like?">
              <p className="mb-5 font-body text-lg text-ink/70">
                Each seasonal arrangement is ${ARRANGEMENT_PRICE}, with a vase and free delivery.
                Choose as many as you like.
              </p>
              <div
                className="grid gap-3 sm:grid-cols-2"
                data-invalid={errors.arrangements ? 'true' : 'false'}
              >
                {HOLIDAY_ARRANGEMENTS.map((a) => (
                  <OptionCard
                    key={a.id}
                    checked={a.id in selection}
                    onToggle={() => toggle(a.id)}
                    label={a.label}
                    sub={a.delivery}
                    size={selection[a.id]}
                    onSize={(s) => setSize(a.id, s)}
                  />
                ))}
                <div className="sm:col-span-2">
                  <OptionCard
                    checked={customSelected}
                    onToggle={() => toggle(CUSTOM_OPTION.id)}
                    label={CUSTOM_OPTION.label}
                    sub={CUSTOM_OPTION.delivery}
                    accent
                  />
                </div>
              </div>
              {errors.arrangements && <ErrorText>{errors.arrangements}</ErrorText>}

              {customSelected && (
                <div className="mt-4">
                  <Field
                    label="Tell us about your custom order or event"
                    id="customDetails"
                    hint="Date, style, colors, guest count, venue — anything helps."
                  >
                    <textarea
                      id="customDetails"
                      rows={4}
                      value={form.customDetails}
                      onChange={(e) => set('customDetails', e.target.value)}
                      className={inputCls}
                      placeholder="I'm dreaming of..."
                    />
                  </Field>
                </div>
              )}

              {seasonalCount > 0 && (
                <div className="mt-5 flex items-center justify-between rounded-sm bg-champagne/60 px-5 py-4">
                  <span className="font-body text-lg text-plum">
                    {seasonalCount} seasonal arrangement{seasonalCount > 1 ? 's' : ''}
                    {seasonalCount >= 3 && <span className="text-gold"> · $10 off each</span>}
                  </span>
                  <span className="font-display text-2xl text-rosewood">
                    ${estimate}
                    <span className="ml-1 align-middle text-sm text-ink/50">est.</span>
                  </span>
                </div>
              )}
            </Section>

            {/* Step 2: your info */}
            <Section n="02" title="Your information">
              <div className="grid gap-5">
                <Field label="First & last name" id="customerName" error={errors.customerName}>
                  <input
                    id="customerName"
                    value={form.customerName}
                    onChange={(e) => set('customerName', e.target.value)}
                    className={inputCls}
                    autoComplete="name"
                  />
                </Field>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Phone number" id="customerPhone" error={errors.customerPhone}>
                    <input
                      id="customerPhone"
                      type="tel"
                      value={form.customerPhone}
                      onChange={(e) => set('customerPhone', e.target.value)}
                      className={inputCls}
                      autoComplete="tel"
                    />
                  </Field>
                  <Field label="Email" id="customerEmail" error={errors.customerEmail}>
                    <input
                      id="customerEmail"
                      type="email"
                      value={form.customerEmail}
                      onChange={(e) => set('customerEmail', e.target.value)}
                      className={inputCls}
                      autoComplete="email"
                    />
                  </Field>
                </div>
              </div>
            </Section>

            {/* Step 3: recipient */}
            <Section n="03" title="Where is it going?">
              <div className="grid gap-5">
                <Field label="Recipient's name" id="recipientName" error={errors.recipientName}>
                  <input
                    id="recipientName"
                    value={form.recipientName}
                    onChange={(e) => set('recipientName', e.target.value)}
                    className={inputCls}
                  />
                </Field>
                <Field
                  label="Delivery address"
                  id="recipientAddress"
                  error={errors.recipientAddress}
                >
                  <textarea
                    id="recipientAddress"
                    rows={2}
                    value={form.recipientAddress}
                    onChange={(e) => set('recipientAddress', e.target.value)}
                    className={inputCls}
                    placeholder="Street, city, ZIP"
                  />
                </Field>
                <Field
                  label="Gate or building code"
                  id="gateCode"
                  hint="Optional · if there is one"
                >
                  <input
                    id="gateCode"
                    value={form.gateCode}
                    onChange={(e) => set('gateCode', e.target.value)}
                    className={inputCls}
                    autoComplete="off"
                    placeholder="#1234"
                  />
                </Field>
              </div>
            </Section>

            {/* Step 4: the details */}
            <Section n="04" title="A few final touches">
              <div className="grid gap-5">
                <Field label="Message for the card" id="cardMessage" hint="Optional">
                  <input
                    id="cardMessage"
                    value={form.cardMessage}
                    onChange={(e) => set('cardMessage', e.target.value)}
                    className={inputCls}
                    placeholder="Happy birthday, with love..."
                  />
                </Field>
                <Field
                  label="Delivery instructions"
                  id="deliveryInstructions"
                  hint="Optional · leave with a neighbor, ring twice, etc."
                >
                  <textarea
                    id="deliveryInstructions"
                    rows={2}
                    value={form.deliveryInstructions}
                    onChange={(e) => set('deliveryInstructions', e.target.value)}
                    className={inputCls}
                  />
                </Field>
              </div>
            </Section>

            {status === 'error' && (
              <p className="rounded-sm bg-rosewood/10 px-5 py-4 font-body text-lg text-rosewood-dark">
                {serverError}
              </p>
            )}

            <div className="flex flex-col gap-4 border-t border-gold/20 pt-8">
              <p className="font-body text-lg text-ink/60">
                No payment now. Ahnaleigh will reach out to confirm your order and arrange payment by
                Venmo, Zelle, check, or cash. Please allow 48 hours.
              </p>
              <button
                type="submit"
                disabled={status === 'submitting'}
                className="label inline-flex items-center justify-center gap-2 rounded-full bg-rosewood px-8 py-4 text-white transition-colors hover:bg-rosewood-dark disabled:opacity-70"
              >
                {status === 'submitting' ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Sending...
                  </>
                ) : (
                  <>
                    Place my order <ArrowRight size={15} />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

const inputCls =
  'w-full rounded-sm border border-gold/25 bg-surface px-4 py-3 font-body text-lg text-ink transition-colors placeholder:text-ink/35 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/25'

function Section({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <Reveal as="section">
      <div className="mb-6 flex items-baseline gap-4">
        <span className="label text-gold/70">{n}</span>
        <h2 className="font-display text-3xl text-plum">{title}</h2>
      </div>
      {children}
    </Reveal>
  )
}

function Field({
  label,
  id,
  hint,
  error,
  children,
}: {
  label: string
  id: string
  hint?: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div data-invalid={error ? 'true' : 'false'}>
      <label htmlFor={id} className="mb-2 flex items-baseline justify-between">
        <span className="label text-[0.66rem] text-plum">{label}</span>
        {hint && <span className="font-body text-base italic text-ink/45">{hint}</span>}
      </label>
      {children}
      {error && <ErrorText>{error}</ErrorText>}
    </div>
  )
}

function ErrorText({ children }: { children: React.ReactNode }) {
  return <p className="mt-2 font-body text-base text-rosewood-dark">{children}</p>
}

function OptionCard({
  checked,
  onToggle,
  label,
  sub,
  accent,
  size,
  onSize,
}: {
  checked: boolean
  onToggle: () => void
  label: string
  sub: string
  accent?: boolean
  size?: Size
  onSize?: (s: Size) => void
}) {
  return (
    <div
      className={`rounded-sm border transition-all duration-300 ${
        checked
          ? 'border-rosewood bg-rosewood/8 shadow-[0_10px_30px_-20px_rgba(168,70,90,0.7)]'
          : accent
          ? 'border-gold/40 bg-champagne/40 hover:border-gold'
          : 'border-gold/20 bg-surface hover:border-gold/50'
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={checked}
        className="flex w-full items-start gap-3 px-5 py-4 text-left"
      >
        <span
          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors ${
            checked ? 'border-rosewood bg-rosewood text-white' : 'border-gold/40 text-transparent'
          }`}
        >
          <Check size={12} />
        </span>
        <span>
          <span className="flex items-center gap-2 font-display text-xl text-plum">
            {accent && <Flower2 size={16} className="text-gold" />}
            {label}
          </span>
          <span className="mt-0.5 block font-body text-base text-ink/60">{sub}</span>
        </span>
      </button>

      {/* The size choice only appears once the holiday is chosen — showing two prices
          on every unselected card would make the list read as twelve options, not six. */}
      {/* Stacked, not side by side: these cards sit in a two-column grid, so a row of
          two chips leaves each about 110px wide and "100 roses" wraps mid-phrase. */}
      {checked && onSize && (
        <div className="flex flex-col gap-2 border-t border-rosewood/15 px-5 py-4">
          <SizeChip
            active={size !== 'roses'}
            onClick={() => onSize('signature')}
            title="Signature"
            price={`$${ARRANGEMENT_PRICE}`}
            note="Seasonal blooms"
          />
          <SizeChip
            active={size === 'roses'}
            onClick={() => onSize('roses')}
            title={`${ROSE_COUNT} roses`}
            price={`$${ROSE_PRICE}`}
            note="Roses only"
          />
        </div>
      )}
    </div>
  )
}

function SizeChip({
  active,
  onClick,
  title,
  price,
  note,
}: {
  active: boolean
  onClick: () => void
  title: string
  price: string
  note: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex flex-1 items-baseline justify-between gap-3 rounded-sm border px-4 py-2.5 text-left transition-colors ${
        active
          ? 'border-rosewood bg-surface'
          : 'border-transparent bg-surface/50 hover:border-gold/30'
      }`}
    >
      <span>
        <span className={`block font-body text-lg ${active ? 'text-plum' : 'text-ink/60'}`}>
          {title}
        </span>
        <span className="block font-ui text-xs uppercase tracking-[0.14em] text-ink/40">
          {note}
        </span>
      </span>
      <span
        className={`font-display text-lg ${active ? 'text-rosewood' : 'text-ink/45'}`}
      >
        {price}
      </span>
    </button>
  )
}

function SuccessView({ name }: { name: string }) {
  const first = name.trim().split(' ')[0] || 'there'
  return (
    <section className="flex min-h-screen items-center justify-center bg-ivory px-6 py-32 text-center">
      <Reveal>
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gold/15 text-gold">
          <Flower2 size={30} />
        </span>
        <p className="label mt-8 text-gold">Order received</p>
        <h1 className="mt-5 font-display text-5xl leading-tight text-plum sm:text-6xl">
          Thank you, {first}.
        </h1>
        <p className="mx-auto mt-6 max-w-lg font-body text-xl leading-relaxed text-ink/75">
          Your order is in, and Ahnaleigh will reach out personally to confirm the details and
          arrange payment. Something beautiful is on its way.
        </p>
        <Link
          to="/"
          className="label mt-10 inline-flex items-center gap-2 rounded-full bg-rosewood px-8 py-4 text-white transition-colors hover:bg-rosewood-dark"
        >
          Back home <ArrowRight size={15} />
        </Link>
      </Reveal>
    </section>
  )
}
