import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Loader2, Pencil, Trash2, Check, X, KeyRound } from 'lucide-react'
import {
  getCustomer,
  updateRecipient,
  deleteRecipient,
  type CustomerSummary,
  type Order,
  type Recipient,
} from '@/lib/adminApi'
import { StatusPill, formatDate, EmptyState, ErrorNote } from './parts'

export default function CustomerDetail() {
  const { id = '' } = useParams()
  const [data, setData] = useState<{
    customer: CustomerSummary
    recipients: Recipient[]
    orders: Order[]
  } | null>(null)
  const [error, setError] = useState('')

  const load = useCallback(() => {
    getCustomer(id)
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : 'Could not load.'))
  }, [id])

  useEffect(load, [load])

  if (error) return <ErrorNote>{error}</ErrorNote>
  if (!data)
    return (
      <p className="flex items-center gap-2 font-ui text-sm text-muted">
        <Loader2 size={15} className="animate-spin" /> Loading...
      </p>
    )

  const { customer, recipients, orders } = data

  return (
    <div className="flex flex-col gap-10">
      <div>
        <Link
          to="/admin/customers"
          className="label inline-flex items-center gap-1.5 text-[0.6rem] text-gold hover:text-rosewood"
        >
          <ArrowLeft size={13} /> All customers
        </Link>
        <h2 className="mt-4 font-display text-4xl text-plum">{customer.name}</h2>
        <p className="mt-2 font-body text-lg text-muted">
          {customer.email}
          {customer.phone && <> · {customer.phone}</>}
        </p>
        <p className="mt-1 font-ui text-sm text-muted">
          {orders.length} {orders.length === 1 ? 'order' : 'orders'} since{' '}
          {formatDate(customer.created_at)}
        </p>
      </div>

      <section>
        <h3 className="mb-4 font-display text-2xl text-plum">Sends flowers to</h3>
        {recipients.length === 0 ? (
          <EmptyState>No saved recipients yet.</EmptyState>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {recipients.map((r) => (
              <RecipientCard key={r.id} recipient={r} onSaved={load} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h3 className="mb-4 font-display text-2xl text-plum">Order history</h3>
        {orders.length === 0 ? (
          <EmptyState>No orders yet.</EmptyState>
        ) : (
          <ul className="divide-y divide-edge rounded-sm border border-edge bg-surface">
            {orders.map((o) => (
              <li key={o.id} className="px-5 py-4">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                  <StatusPill status={o.status} />
                  <span className="font-body text-lg text-ink">
                    {o.arrangements.join(', ') || 'No arrangements listed'}
                  </span>
                  <span className="ml-auto flex items-center gap-4">
                    <span className="font-ui text-sm text-muted">{formatDate(o.created_at)}</span>
                    <span className="font-display text-lg text-rosewood">
                      {o.estimated_total ? `$${o.estimated_total}` : 'Quote'}
                    </span>
                  </span>
                </div>
                {o.card_message && (
                  <p className="mt-2 font-body text-lg italic text-muted">
                    &ldquo;{o.card_message}&rdquo;
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

function RecipientCard({ recipient, onSaved }: { recipient: Recipient; onSaved: () => void }) {
  const [editing, setEditing] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [draft, setDraft] = useState(recipient)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function remove() {
    setBusy(true)
    setError('')
    try {
      await deleteRecipient(recipient.id)
      onSaved()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not delete.')
      setBusy(false)
    }
  }

  async function save() {
    setBusy(true)
    setError('')
    try {
      await updateRecipient(recipient.id, {
        name: draft.name,
        address: draft.address,
        gate_code: draft.gate_code ?? '',
        delivery_notes: draft.delivery_notes ?? '',
        relationship: draft.relationship ?? '',
      })
      setEditing(false)
      onSaved()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save.')
    } finally {
      setBusy(false)
    }
  }

  function cancel() {
    setDraft(recipient)
    setError('')
    setEditing(false)
  }

  return (
    <div className="rounded-sm border border-edge bg-surface px-5 py-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {editing ? (
            <input
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              aria-label="Recipient name"
              className={fieldCls}
            />
          ) : (
            <p className="font-display text-2xl text-plum">{recipient.name}</p>
          )}
          {!editing && recipient.relationship && (
            <p className="label mt-1 text-[0.58rem] text-gold">{recipient.relationship}</p>
          )}
        </div>

        {editing ? (
          <div className="flex shrink-0 gap-2">
            <IconBtn onClick={save} disabled={busy} label="Save">
              {busy ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
            </IconBtn>
            <IconBtn onClick={cancel} label="Cancel">
              <X size={14} />
            </IconBtn>
          </div>
        ) : confirmDelete ? (
          <div className="flex shrink-0 items-center gap-2">
            <span className="font-ui text-xs text-rosewood-dark">Delete?</span>
            <IconBtn onClick={remove} disabled={busy} label="Confirm delete">
              {busy ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
            </IconBtn>
            <IconBtn onClick={() => setConfirmDelete(false)} label="Keep">
              <X size={14} />
            </IconBtn>
          </div>
        ) : (
          <div className="flex shrink-0 gap-2">
            <IconBtn onClick={() => setEditing(true)} label={`Edit ${recipient.name}`}>
              <Pencil size={13} />
            </IconBtn>
            <IconBtn onClick={() => setConfirmDelete(true)} label={`Delete ${recipient.name}`}>
              <Trash2 size={13} />
            </IconBtn>
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-col gap-3">
        <Row label="Address">
          {editing ? (
            <textarea
              rows={2}
              value={draft.address}
              onChange={(e) => setDraft({ ...draft, address: e.target.value })}
              aria-label="Address"
              className={fieldCls}
            />
          ) : (
            <span className="whitespace-pre-line">{recipient.address}</span>
          )}
        </Row>

        <Row label="Gate code" icon>
          {editing ? (
            <input
              value={draft.gate_code ?? ''}
              onChange={(e) => setDraft({ ...draft, gate_code: e.target.value })}
              aria-label="Gate code"
              placeholder="—"
              className={fieldCls}
            />
          ) : recipient.gate_code ? (
            <span className="rounded-sm bg-champagne px-2.5 py-1 font-ui tracking-wider text-plum">
              {recipient.gate_code}
            </span>
          ) : (
            <span className="text-muted">None on file</span>
          )}
        </Row>

        <Row label="Notes">
          {editing ? (
            <textarea
              rows={2}
              value={draft.delivery_notes ?? ''}
              onChange={(e) => setDraft({ ...draft, delivery_notes: e.target.value })}
              aria-label="Delivery notes"
              className={fieldCls}
            />
          ) : (
            <span>{recipient.delivery_notes || <span className="text-muted">—</span>}</span>
          )}
        </Row>

        {editing && (
          <Row label="Label">
            <input
              value={draft.relationship ?? ''}
              onChange={(e) => setDraft({ ...draft, relationship: e.target.value })}
              aria-label="Relationship label"
              placeholder="Mom, Office, Assistant..."
              className={fieldCls}
            />
          </Row>
        )}
      </div>

      {error && <p className="mt-3 font-ui text-sm text-rosewood-dark">{error}</p>}
    </div>
  )
}

const fieldCls =
  'w-full rounded-sm border border-edge bg-ivory px-3 py-2 font-ui text-sm text-ink focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20'

function Row({
  label,
  icon,
  children,
}: {
  label: string
  icon?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="grid gap-1 sm:grid-cols-[7rem_1fr] sm:items-baseline sm:gap-3">
      <p className="label flex items-center gap-1.5 text-[0.56rem] text-muted">
        {icon && <KeyRound size={11} className="text-gold" />}
        {label}
      </p>
      <div className="font-body text-lg text-ink">{children}</div>
    </div>
  )
}

function IconBtn({
  onClick,
  disabled,
  label,
  children,
}: {
  onClick: () => void
  disabled?: boolean
  label: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-edge text-gold transition-colors hover:border-gold hover:bg-champagne/60 disabled:opacity-50"
    >
      {children}
    </button>
  )
}
