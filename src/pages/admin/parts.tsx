// Small shared pieces for the admin screens. Kept plainer than the marketing site —
// this is a working tool Annie opens between deliveries, not a page to be admired.
import type { OrderStatus } from '@/lib/adminApi'

export function StatCard({
  label,
  value,
  hint,
}: {
  label: string
  value: string | number
  hint?: string
}) {
  return (
    <div className="rounded-sm border border-edge bg-surface px-6 py-5">
      <p className="label text-[0.6rem] text-muted">{label}</p>
      <p className="mt-2 font-display text-4xl text-plum">{value}</p>
      {hint && <p className="mt-1 font-ui text-sm text-muted">{hint}</p>}
    </div>
  )
}

const STATUS_STYLES: Record<OrderStatus, string> = {
  new: 'bg-rosewood/12 text-rosewood-dark border-rosewood/30',
  confirmed: 'bg-gold/12 text-gold border-gold/35',
  paid: 'bg-sage/15 text-sage border-sage/35',
  delivered: 'bg-plum/8 text-plum border-plum/20',
  cancelled: 'bg-muted/10 text-muted border-muted/25',
}

export function StatusPill({ status }: { status: OrderStatus }) {
  return (
    <span
      className={`label inline-block rounded-full border px-3 py-1 text-[0.58rem] ${STATUS_STYLES[status]}`}
    >
      {status}
    </span>
  )
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-sm border border-dashed border-edge px-6 py-14 text-center">
      <p className="font-body text-xl text-muted">{children}</p>
    </div>
  )
}

export function ErrorNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-sm border border-rosewood/30 bg-rosewood/8 px-5 py-4">
      <p className="font-ui text-sm text-rosewood-dark">{children}</p>
    </div>
  )
}
