import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import {
  getOrders,
  setOrderStatus,
  type Order,
  type OrderStatus,
} from '@/lib/adminApi'
import { StatusPill, formatDate, EmptyState, ErrorNote } from './parts'

const FILTERS: { value: string; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'new', label: 'New' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'paid', label: 'Paid' },
  { value: 'delivered', label: 'Delivered' },
]

const NEXT: Partial<Record<OrderStatus, OrderStatus>> = {
  new: 'confirmed',
  confirmed: 'paid',
  paid: 'delivered',
}

export default function Orders() {
  const [orders, setOrders] = useState<Order[] | null>(null)
  const [filter, setFilter] = useState('')
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState('')

  const load = useCallback(() => {
    setError('')
    getOrders(filter)
      .then((r) => setOrders(r.orders))
      .catch((e) => setError(e instanceof Error ? e.message : 'Could not load.'))
  }, [filter])

  useEffect(load, [load])

  async function advance(o: Order) {
    const next = NEXT[o.status]
    if (!next) return
    setBusyId(o.id)
    try {
      await setOrderStatus(o.id, next)
      load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not update.')
    } finally {
      setBusyId('')
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-display text-2xl text-plum">Orders</h2>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilter(f.value)}
              aria-pressed={filter === f.value}
              className={`label rounded-full border px-4 py-1.5 text-[0.58rem] transition-colors ${
                filter === f.value
                  ? 'border-rosewood bg-rosewood text-white'
                  : 'border-edge text-muted hover:border-gold hover:text-gold'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {error && <ErrorNote>{error}</ErrorNote>}

      {!orders && !error && (
        <p className="flex items-center gap-2 font-ui text-sm text-muted">
          <Loader2 size={15} className="animate-spin" /> Loading...
        </p>
      )}

      {orders && orders.length === 0 && (
        <EmptyState>{filter ? `Nothing ${filter} right now.` : 'No orders yet.'}</EmptyState>
      )}

      {orders && orders.length > 0 && (
        <ul className="flex flex-col gap-4">
          {orders.map((o) => (
            <li key={o.id} className="rounded-sm border border-edge bg-surface px-5 py-5">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <StatusPill status={o.status} />
                {o.customer_id ? (
                  <Link
                    to={`/admin/customers/${o.customer_id}`}
                    className="font-display text-xl text-plum underline decoration-gold/40 underline-offset-4 hover:text-rosewood"
                  >
                    {o.customer_name}
                  </Link>
                ) : (
                  <span className="font-display text-xl text-plum">{o.customer_name}</span>
                )}
                <span className="ml-auto flex items-center gap-4">
                  <span className="font-ui text-sm text-muted">{formatDate(o.created_at)}</span>
                  <span className="font-display text-xl text-rosewood">
                    {o.estimated_total ? `$${o.estimated_total}` : 'Quote'}
                  </span>
                </span>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Detail label="Arrangements">
                  {o.arrangements.join(', ') || '—'}
                </Detail>
                <Detail label="Deliver to">
                  {o.recipient_name}
                  <span className="block whitespace-pre-line text-muted">
                    {o.recipient_address}
                  </span>
                </Detail>
                {o.card_message && (
                  <Detail label="Card">&ldquo;{o.card_message}&rdquo;</Detail>
                )}
                {o.delivery_instructions && (
                  <Detail label="Instructions">{o.delivery_instructions}</Detail>
                )}
                {o.custom_details && <Detail label="Custom">{o.custom_details}</Detail>}
                <Detail label="Reach them">
                  {o.customer_phone || '—'}
                  <span className="block text-muted">{o.customer_email}</span>
                </Detail>
              </div>

              {NEXT[o.status] && (
                <button
                  type="button"
                  onClick={() => advance(o)}
                  disabled={busyId === o.id}
                  className="label mt-5 inline-flex items-center gap-2 rounded-full border border-gold px-5 py-2 text-[0.58rem] text-gold transition-colors hover:bg-gold hover:text-white disabled:opacity-50"
                >
                  {busyId === o.id && <Loader2 size={12} className="animate-spin" />}
                  Mark {NEXT[o.status]}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="label text-[0.56rem] text-muted">{label}</p>
      <p className="mt-1 font-body text-lg text-ink">{children}</p>
    </div>
  )
}
