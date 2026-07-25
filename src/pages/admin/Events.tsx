import { useCallback, useEffect, useState } from 'react'
import { Loader2, Plus, Trash2, Check } from 'lucide-react'
import {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  type EventRow,
  type EventTotals,
} from '@/lib/adminApi'
import { EmptyState, ErrorNote } from './parts'
import { ChartFrame, RevenueProfitChart, ExpenseSplitChart, SERIES } from './Charts'

const TYPES = ['Holiday', 'Non-Profit', 'Custom Order', 'Private Event']

const money = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

export default function Events() {
  const [rows, setRows] = useState<EventRow[] | null>(null)
  const [totals, setTotals] = useState<EventTotals | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState('')

  const load = useCallback(() => {
    getEvents()
      .then((r) => {
        setRows(r.events)
        setTotals(r.totals)
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Could not load.'))
  }, [])

  useEffect(load, [load])

  async function addRow() {
    setBusy('new')
    try {
      await createEvent({ name: 'New event', status: 'planned' })
      load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not add.')
    } finally {
      setBusy('')
    }
  }

  // Saves on blur — the grid should feel like a spreadsheet, not a form you submit.
  async function save(id: string, patch: Partial<EventRow>) {
    setBusy(id)
    try {
      await updateEvent(id, patch)
      load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save.')
    } finally {
      setBusy('')
    }
  }

  async function remove(id: string) {
    setBusy(id)
    try {
      await deleteEvent(id)
      load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not delete.')
    } finally {
      setBusy('')
    }
  }

  if (error) return <ErrorNote>{error}</ErrorNote>
  if (!rows || !totals)
    return (
      <p className="flex items-center gap-2 font-ui text-sm text-muted">
        <Loader2 size={15} className="animate-spin" /> Loading...
      </p>
    )

  // Charts read oldest → newest so time runs left to right.
  const chartData = [...rows]
    .filter((r) => r.revenue > 0 || r.expenses > 0)
    .sort((a, b) => (a.event_date ?? '').localeCompare(b.event_date ?? ''))
    .map((r) => ({ label: r.name, revenue: r.revenue, profit: r.profit }))

  const marginAll = totals.revenue > 0 ? totals.profit / totals.revenue : null

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl text-plum">Events &amp; revenue</h2>
          <p className="mt-1 font-ui text-sm text-muted">
            Website orders roll up automatically. Type in anything the website never saw.
          </p>
        </div>
        <button
          type="button"
          onClick={addRow}
          disabled={busy === 'new'}
          className="label inline-flex items-center gap-2 rounded-full bg-rosewood px-5 py-2.5 text-[0.58rem] text-white transition-colors hover:bg-rosewood-dark disabled:opacity-50"
        >
          {busy === 'new' ? <Loader2 size={12} className="animate-spin" /> : <Plus size={13} />}
          Add event
        </button>
      </div>

      {/* Headline numbers */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Revenue" value={money(totals.revenue)} />
        <Stat label="Expenses" value={money(totals.expenses)} />
        <Stat label="Profit" value={money(totals.profit)} tone={totals.profit >= 0 ? 'good' : 'bad'} />
        <Stat
          label="Margin"
          value={marginAll === null ? '—' : `${Math.round(marginAll * 100)}%`}
          hint={`${totals.orders} orders`}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <ChartFrame
          title="Revenue by event"
          hint="Each bar is the event's revenue, split into profit and cost. Oldest to newest."
          legend={[
            { label: 'Profit', color: SERIES.profit },
            { label: 'Cost', color: SERIES.revenue },
          ]}
        >
          <RevenueProfitChart data={chartData} />
        </ChartFrame>
        <ChartFrame title="Where the money went" hint="All events combined.">
          <ExpenseSplitChart
            vases={totals.vases}
            flowers={totals.flowers}
            misc={totals.misc}
          />
        </ChartFrame>
      </div>

      {/* The grid */}
      {rows.length === 0 ? (
        <EmptyState>No events yet. Add one to start tracking.</EmptyState>
      ) : (
        <div className="overflow-x-auto rounded-sm border border-edge bg-surface">
          <table className="w-full min-w-[1050px] border-collapse text-left">
            <thead>
              <tr className="border-b border-edge">
                {['Event', 'Date', 'Type', 'Orders', 'Revenue', 'Vases', 'Flowers', 'Misc', 'Profit', ''].map(
                  (h) => (
                    <th
                      key={h}
                      className="label px-3 py-3 text-[0.55rem] font-medium text-muted"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <EventRowEditor
                  key={r.id}
                  row={r}
                  busy={busy === r.id}
                  onSave={save}
                  onDelete={remove}
                />
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-gold/30 bg-champagne/40">
                <td className="px-3 py-3 font-display text-lg text-plum" colSpan={3}>
                  Total
                </td>
                <td className="px-3 py-3 font-ui text-sm tabular-nums text-plum">
                  {totals.orders}
                </td>
                <td className="px-3 py-3 font-ui text-sm tabular-nums text-plum">
                  {money(totals.revenue)}
                </td>
                <td className="px-3 py-3 font-ui text-sm tabular-nums text-muted">
                  {money(totals.vases)}
                </td>
                <td className="px-3 py-3 font-ui text-sm tabular-nums text-muted">
                  {money(totals.flowers)}
                </td>
                <td className="px-3 py-3 font-ui text-sm tabular-nums text-muted">
                  {money(totals.misc)}
                </td>
                <td
                  className={`px-3 py-3 font-display text-lg tabular-nums ${
                    totals.profit >= 0 ? 'text-[#2f7a52]' : 'text-rosewood-dark'
                  }`}
                >
                  {money(totals.profit)}
                </td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  )
}

function EventRowEditor({
  row,
  busy,
  onSave,
  onDelete,
}: {
  row: EventRow
  busy: boolean
  onSave: (id: string, patch: Partial<EventRow>) => void
  onDelete: (id: string) => void
}) {
  const [draft, setDraft] = useState(row)
  const [confirm, setConfirm] = useState(false)

  // Only write when the value actually changed, so tabbing through doesn't spam saves.
  function commit(key: keyof EventRow) {
    if (draft[key] === row[key]) return
    onSave(row.id, { [key]: draft[key] } as Partial<EventRow>)
  }

  const cell = 'w-full bg-transparent px-2 py-1.5 font-ui text-sm text-ink focus:bg-ivory focus:outline-none focus:ring-1 focus:ring-gold/40 rounded-sm'
  const num = `${cell} tabular-nums`

  return (
    <tr className="border-b border-edge/70 last:border-0 hover:bg-champagne/20">
      <td className="px-1 py-1">
        <input
          value={draft.name ?? ''}
          onChange={(e) => setDraft({ ...draft, name: e.target.value })}
          onBlur={() => commit('name')}
          className={cell}
        />
      </td>
      <td className="px-1 py-1">
        <input
          type="date"
          value={draft.event_date ?? ''}
          onChange={(e) => setDraft({ ...draft, event_date: e.target.value })}
          onBlur={() => commit('event_date')}
          className={cell}
        />
      </td>
      <td className="px-1 py-1">
        <select
          value={draft.type ?? ''}
          onChange={(e) => {
            const v = e.target.value
            setDraft({ ...draft, type: v })
            onSave(row.id, { type: v })
          }}
          className={cell}
        >
          <option value="">—</option>
          {TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </td>

      {/* Orders / revenue: website orders roll up automatically; the input is the
          manual top-up for anything the site never saw. */}
      <td className="px-1 py-1">
        <input
          type="number"
          value={draft.manual_orders ?? 0}
          onChange={(e) => setDraft({ ...draft, manual_orders: Number(e.target.value) })}
          onBlur={() => commit('manual_orders')}
          className={num}
        />
        {row.autoOrders > 0 && (
          <span className="block px-2 font-ui text-[0.6rem] text-gold">
            +{row.autoOrders} from site = {row.orders}
          </span>
        )}
      </td>
      <td className="px-1 py-1">
        <input
          type="number"
          value={draft.manual_revenue ?? 0}
          onChange={(e) => setDraft({ ...draft, manual_revenue: Number(e.target.value) })}
          onBlur={() => commit('manual_revenue')}
          className={num}
        />
        {row.autoRevenue > 0 && (
          <span className="block px-2 font-ui text-[0.6rem] text-gold">
            +{money(row.autoRevenue)} = {money(row.revenue)}
          </span>
        )}
      </td>

      {(['expense_vases', 'expense_flowers', 'expense_misc'] as const).map((k) => (
        <td key={k} className="px-1 py-1">
          <input
            type="number"
            value={draft[k] ?? 0}
            onChange={(e) => setDraft({ ...draft, [k]: Number(e.target.value) })}
            onBlur={() => commit(k)}
            className={num}
          />
        </td>
      ))}

      <td className="px-3 py-1">
        <span
          className={`font-ui text-sm tabular-nums ${
            row.profit >= 0 ? 'text-[#2f7a52]' : 'text-rosewood-dark'
          }`}
        >
          {money(row.profit)}
        </span>
        {row.margin !== null && (
          <span className="block font-ui text-[0.6rem] text-muted">
            {Math.round(row.margin * 100)}% margin
          </span>
        )}
      </td>

      <td className="px-2 py-1 text-right">
        {busy ? (
          <Loader2 size={14} className="ml-auto animate-spin text-gold" />
        ) : confirm ? (
          <span className="flex items-center justify-end gap-1">
            <button
              type="button"
              onClick={() => onDelete(row.id)}
              aria-label="Confirm delete"
              className="rounded-full bg-rosewood-dark p-1.5 text-white"
            >
              <Check size={12} />
            </button>
            <button
              type="button"
              onClick={() => setConfirm(false)}
              className="label px-2 text-[0.55rem] text-muted hover:text-gold"
            >
              Keep
            </button>
          </span>
        ) : (
          <button
            type="button"
            onClick={() => setConfirm(true)}
            aria-label={`Delete ${row.name}`}
            className="text-muted transition-colors hover:text-rosewood-dark"
          >
            <Trash2 size={14} />
          </button>
        )}
      </td>
    </tr>
  )
}

function Stat({
  label,
  value,
  hint,
  tone,
}: {
  label: string
  value: string
  hint?: string
  // 'good' = positive money (green), 'bad' = in the red (rosewood). Default = plum ink.
  tone?: 'good' | 'bad'
}) {
  const color =
    tone === 'good' ? 'text-[#2f7a52]' : tone === 'bad' ? 'text-rosewood-dark' : 'text-plum'
  return (
    <div className="rounded-sm border border-edge bg-surface px-6 py-5">
      <p className="label text-[0.6rem] text-muted">{label}</p>
      <p className={`mt-2 font-display text-3xl tabular-nums ${color}`}>{value}</p>
      {hint && <p className="mt-1 font-ui text-sm text-muted">{hint}</p>}
    </div>
  )
}
