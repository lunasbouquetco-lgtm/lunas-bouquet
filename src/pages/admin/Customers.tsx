import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Loader2, Search, ArrowRight } from 'lucide-react'
import { getCustomers, type CustomerSummary } from '@/lib/adminApi'
import { formatDate, EmptyState, ErrorNote } from './parts'

export default function Customers() {
  const [rows, setRows] = useState<CustomerSummary[] | null>(null)
  const [q, setQ] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    // Debounce so typing a name doesn't fire a query per keystroke.
    const id = setTimeout(() => {
      setError('')
      getCustomers(q)
        .then((r) => setRows(r.customers))
        .catch((e) => setError(e instanceof Error ? e.message : 'Could not load.'))
    }, 220)
    return () => clearTimeout(id)
  }, [q])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-display text-2xl text-plum">Customers</h2>
        <div className="relative w-full max-w-xs">
          <Search
            size={15}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name or email"
            aria-label="Search customers"
            className="w-full rounded-full border border-edge bg-surface py-2.5 pl-10 pr-4 font-ui text-sm text-ink placeholder:text-muted/70 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
          />
        </div>
      </div>

      {error && <ErrorNote>{error}</ErrorNote>}

      {!rows && !error && (
        <p className="flex items-center gap-2 font-ui text-sm text-muted">
          <Loader2 size={15} className="animate-spin" /> Loading...
        </p>
      )}

      {rows && rows.length === 0 && (
        <EmptyState>
          {q ? `No customer matches "${q}".` : 'No customers yet. They appear as orders come in.'}
        </EmptyState>
      )}

      {rows && rows.length > 0 && (
        <ul className="divide-y divide-edge rounded-sm border border-edge bg-surface">
          {rows.map((c) => (
            <li key={c.id}>
              <Link
                to={`/admin/customers/${c.id}`}
                className="flex flex-wrap items-center gap-x-5 gap-y-2 px-5 py-4 transition-colors hover:bg-champagne/40"
              >
                <div className="min-w-0">
                  <p className="font-display text-xl text-plum">{c.name}</p>
                  <p className="truncate font-ui text-sm text-muted">{c.email}</p>
                </div>

                <div className="ml-auto flex items-center gap-6 sm:gap-8">
                  <Metric n={c.orderCount} label={c.orderCount === 1 ? 'order' : 'orders'} />
                  <Metric
                    n={c.recipientCount}
                    label={c.recipientCount === 1 ? 'recipient' : 'recipients'}
                  />
                  <div className="hidden text-right sm:block">
                    <p className="font-display text-lg text-rosewood">
                      ${c.totalValue.toLocaleString()}
                    </p>
                    <p className="font-ui text-xs text-muted">since {formatDate(c.created_at)}</p>
                  </div>
                  <ArrowRight size={16} className="text-gold" />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function Metric({ n, label }: { n: number; label: string }) {
  return (
    <div className="text-center">
      <p className="font-display text-lg text-plum">{n}</p>
      <p className="font-ui text-xs text-muted">{label}</p>
    </div>
  )
}
