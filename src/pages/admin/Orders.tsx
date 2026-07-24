import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Loader2, Pencil, Trash2, Check, X, ArrowUpDown } from 'lucide-react'
import {
  getOrders,
  setOrderStatus,
  updateOrder,
  deleteOrder,
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
  const [sort, setSort] = useState<'newest' | 'oldest'>('newest')
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState('')

  const load = useCallback(() => {
    setError('')
    getOrders(filter, sort)
      .then((r) => setOrders(r.orders))
      .catch((e) => setError(e instanceof Error ? e.message : 'Could not load.'))
  }, [filter, sort])

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
        <div className="flex flex-wrap items-center gap-2">
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
          {/* Sort toggle, set apart from the status filters by a hairline. */}
          <span className="mx-1 h-5 w-px bg-edge" aria-hidden />
          <button
            type="button"
            onClick={() => setSort((s) => (s === 'newest' ? 'oldest' : 'newest'))}
            className="label inline-flex items-center gap-1.5 rounded-full border border-edge px-4 py-1.5 text-[0.58rem] text-muted transition-colors hover:border-gold hover:text-gold"
          >
            <ArrowUpDown size={12} />
            {sort === 'newest' ? 'Newest first' : 'Oldest first'}
          </button>
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
            <OrderCard key={o.id} order={o} busy={busyId === o.id} onAdvance={advance} onChanged={load} setError={setError} setBusy={setBusyId} />
          ))}
        </ul>
      )}
    </div>
  )
}

function OrderCard({
  order: o,
  busy,
  onAdvance,
  onChanged,
  setError,
  setBusy,
}: {
  order: Order
  busy: boolean
  onAdvance: (o: Order) => void
  onChanged: () => void
  setError: (s: string) => void
  setBusy: (s: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [card, setCard] = useState(o.card_message ?? '')
  const [instr, setInstr] = useState(o.delivery_instructions ?? '')

  async function save() {
    setBusy(o.id)
    try {
      await updateOrder(o.id, { card_message: card, delivery_instructions: instr })
      setEditing(false)
      onChanged()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save.')
    } finally {
      setBusy('')
    }
  }

  async function remove() {
    setBusy(o.id)
    try {
      await deleteOrder(o.id)
      onChanged()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not delete.')
    } finally {
      setBusy('')
    }
  }

  return (
    <li className="rounded-sm border border-edge bg-surface px-5 py-5">
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
        <Detail label="Arrangements">{o.arrangements.join(', ') || '—'}</Detail>
        <Detail label="Deliver to">
          {o.recipient_name}
          <span className="block whitespace-pre-line text-muted">{o.recipient_address}</span>
        </Detail>
        {editing ? (
          <>
            <label className="block">
              <span className="label text-[0.56rem] text-muted">Card message</span>
              <input
                value={card}
                onChange={(e) => setCard(e.target.value)}
                className={editCls}
              />
            </label>
            <label className="block">
              <span className="label text-[0.56rem] text-muted">Instructions</span>
              <input
                value={instr}
                onChange={(e) => setInstr(e.target.value)}
                className={editCls}
              />
            </label>
          </>
        ) : (
          <>
            {o.card_message && <Detail label="Card">&ldquo;{o.card_message}&rdquo;</Detail>}
            {o.delivery_instructions && (
              <Detail label="Instructions">{o.delivery_instructions}</Detail>
            )}
          </>
        )}
        {o.custom_details && <Detail label="Custom">{o.custom_details}</Detail>}
        <Detail label="Reach them">
          {o.customer_phone || '—'}
          <span className="block text-muted">{o.customer_email}</span>
        </Detail>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        {NEXT[o.status] && !editing && (
          <button
            type="button"
            onClick={() => onAdvance(o)}
            disabled={busy}
            className="label inline-flex items-center gap-2 rounded-full border border-gold px-5 py-2 text-[0.58rem] text-gold transition-colors hover:bg-gold hover:text-white disabled:opacity-50"
          >
            {busy && <Loader2 size={12} className="animate-spin" />}
            Mark {NEXT[o.status]}
          </button>
        )}

        {editing ? (
          <>
            <button
              type="button"
              onClick={save}
              disabled={busy}
              className="label inline-flex items-center gap-1.5 rounded-full bg-rosewood px-4 py-2 text-[0.58rem] text-white transition-colors hover:bg-rosewood-dark disabled:opacity-50"
            >
              {busy ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />} Save
            </button>
            <button
              type="button"
              onClick={() => {
                setCard(o.card_message ?? '')
                setInstr(o.delivery_instructions ?? '')
                setEditing(false)
              }}
              className="label inline-flex items-center gap-1.5 rounded-full border border-edge px-4 py-2 text-[0.58rem] text-muted transition-colors hover:border-gold hover:text-gold"
            >
              <X size={12} /> Cancel
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="label inline-flex items-center gap-1.5 rounded-full border border-edge px-4 py-2 text-[0.58rem] text-muted transition-colors hover:border-gold hover:text-gold"
          >
            <Pencil size={11} /> Edit
          </button>
        )}

        {/* Delete sits to the right and takes two clicks — a stray tap shouldn't erase
            a real order. */}
        {!editing &&
          (confirmDelete ? (
            <span className="ml-auto flex items-center gap-2">
              <span className="font-ui text-sm text-rosewood-dark">Delete for good?</span>
              <button
                type="button"
                onClick={remove}
                disabled={busy}
                className="label inline-flex items-center gap-1.5 rounded-full bg-rosewood-dark px-4 py-2 text-[0.58rem] text-white disabled:opacity-50"
              >
                {busy ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />} Yes,
                delete
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="label rounded-full border border-edge px-4 py-2 text-[0.58rem] text-muted hover:border-gold hover:text-gold"
              >
                Keep
              </button>
            </span>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              aria-label="Delete order"
              className="label ml-auto inline-flex items-center gap-1.5 rounded-full border border-transparent px-3 py-2 text-[0.58rem] text-muted transition-colors hover:border-rosewood/40 hover:text-rosewood-dark"
            >
              <Trash2 size={12} /> Delete
            </button>
          ))}
      </div>
    </li>
  )
}

const editCls =
  'mt-1 w-full rounded-sm border border-edge bg-ivory px-3 py-2 font-body text-base text-ink focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20'

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="label text-[0.56rem] text-muted">{label}</p>
      <p className="mt-1 font-body text-lg text-ink">{children}</p>
    </div>
  )
}
