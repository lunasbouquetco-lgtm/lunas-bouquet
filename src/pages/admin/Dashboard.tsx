import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Loader2, ArrowRight } from 'lucide-react'
import { getStats, type Stats } from '@/lib/adminApi'
import { StatCard, StatusPill, formatDate, EmptyState, ErrorNote } from './parts'

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    getStats()
      .then(setStats)
      .catch((e) => setError(e instanceof Error ? e.message : 'Could not load.'))
  }, [])

  if (error) return <ErrorNote>{error}</ErrorNote>
  if (!stats)
    return (
      <p className="flex items-center gap-2 font-ui text-sm text-muted">
        <Loader2 size={15} className="animate-spin" /> Loading...
      </p>
    )

  return (
    <div className="flex flex-col gap-10">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Orders" value={stats.orderCount} hint="all time" />
        <StatCard
          label="Needs attention"
          value={stats.newOrderCount}
          hint={stats.newOrderCount === 1 ? 'new order' : 'new orders'}
        />
        <StatCard label="Customers" value={stats.customerCount} hint="on the books" />
        <StatCard
          label="Estimated value"
          value={`$${stats.lifetimeValue.toLocaleString()}`}
          hint="seasonal only, custom quoted separately"
        />
      </div>

      <section>
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="font-display text-2xl text-plum">Latest orders</h2>
          <Link
            to="/admin/orders"
            className="label inline-flex items-center gap-1.5 text-[0.6rem] text-gold hover:text-rosewood"
          >
            See all <ArrowRight size={13} />
          </Link>
        </div>

        {stats.recentOrders.length === 0 ? (
          <EmptyState>No orders yet. The first one will land here.</EmptyState>
        ) : (
          <ul className="divide-y divide-edge rounded-sm border border-edge bg-surface">
            {stats.recentOrders.map((o) => (
              <li key={o.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-4">
                <StatusPill status={o.status} />
                <span className="font-display text-xl text-plum">{o.customer_name}</span>
                <span className="font-body text-lg text-muted">
                  for {o.recipient_name}
                </span>
                <span className="ml-auto flex items-center gap-4">
                  <span className="font-ui text-sm text-muted">{formatDate(o.created_at)}</span>
                  <span className="font-display text-lg text-rosewood">
                    {o.estimated_total ? `$${o.estimated_total}` : 'Quote'}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
