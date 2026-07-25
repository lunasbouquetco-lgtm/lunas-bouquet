import { useState } from 'react'

/**
 * Small hand-rolled SVG charts.
 *
 * No chart library on purpose: the admin shares a bundle with the customer-facing
 * site, and pulling in a charting dependency would make every shopper download it.
 * These datasets are a couple of dozen rows, which SVG handles happily.
 *
 * Palette is validated (dataviz six checks, light surface #fbf8f1):
 *   rosewood #a8465a · gold #a97c24 · blue #3b6ea5
 * Every pair clears the CVD and normal-vision separation floors, so series are
 * distinguishable without relying on color alone — and each series is also labelled.
 */

export const SERIES = {
  revenue: '#a8465a',
  profit: '#3b6ea5',
  vases: '#a97c24',
  flowers: '#a8465a',
  misc: '#3b6ea5',
}

const money = (n: number) =>
  n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : `$${Math.round(n)}`

export function ChartFrame({
  title,
  hint,
  legend,
  children,
}: {
  title: string
  hint?: string
  legend?: { label: string; color: string }[]
  children: React.ReactNode
}) {
  return (
    <figure className="m-0 rounded-sm border border-edge bg-surface p-5">
      <figcaption className="mb-1 flex flex-wrap items-baseline justify-between gap-2">
        <span className="font-display text-xl text-plum">{title}</span>
        {legend && (
          <span className="flex flex-wrap items-center gap-3">
            {legend.map((l) => (
              <span key={l.label} className="flex items-center gap-1.5">
                <span
                  aria-hidden
                  className="inline-block h-2.5 w-2.5 rounded-[2px]"
                  style={{ background: l.color }}
                />
                <span className="font-ui text-xs text-muted">{l.label}</span>
              </span>
            ))}
          </span>
        )}
      </figcaption>
      {hint && <p className="mb-3 font-ui text-xs text-muted">{hint}</p>}
      {children}
    </figure>
  )
}

/**
 * Stacked bars, built with plain HTML rather than SVG. Each bar's full height is the
 * event's REVENUE, split into profit (kept) at the bottom and cost (spent) on top.
 * Stacking is honest this way because profit + cost = revenue — unlike stacking
 * revenue and profit, which double-counts since profit is already inside revenue.
 *
 * HTML flex bars instead of SVG so rounded corners stay crisp and uniform — a stretched
 * SVG viewBox distorts rounded rects into lopsided ovals on narrow bars.
 */
export function RevenueProfitChart({
  data,
}: {
  data: { label: string; revenue: number; profit: number }[]
}) {
  const [hover, setHover] = useState<number | null>(null)
  if (data.length === 0) return <Empty />

  const max = Math.max(...data.map((d) => d.revenue), 1)

  return (
    <div className="relative">
      <div className="relative flex h-52 items-end gap-[3px]">
        {/* recessive gridlines behind the bars */}
        {[0.25, 0.5, 0.75, 1].map((t) => (
          <div
            key={t}
            aria-hidden
            className="pointer-events-none absolute inset-x-0 border-t border-edge"
            style={{ bottom: `${t * 100}%` }}
          />
        ))}

        {data.map((d, i) => {
          const profit = Math.max(d.profit, 0)
          const cost = Math.max(d.revenue - profit, 0)
          const active = hover === null || hover === i
          return (
            <div
              key={i}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              className="relative flex h-full flex-1 flex-col justify-end"
              style={{ opacity: active ? 1 : 0.4 }}
            >
              {/* cost sits on top */}
              <div
                className="w-full rounded-t-[3px]"
                style={{ height: `${(cost / max) * 100}%`, background: SERIES.revenue }}
              />
              {/* 2px surface gap between the two segments */}
              {cost > 0 && profit > 0 && <div className="h-[2px] w-full" />}
              {/* profit at the base */}
              <div
                className={cost > 0 ? 'w-full' : 'w-full rounded-t-[3px]'}
                style={{ height: `${(profit / max) * 100}%`, background: SERIES.profit }}
              />
            </div>
          )
        })}
      </div>

      {hover !== null && (
        <div
          className="pointer-events-none absolute -top-2 z-10 rounded-sm border border-edge bg-ivory px-3 py-2 shadow-lg"
          style={{
            left: `${Math.min(Math.max(((hover + 0.5) / data.length) * 100, 14), 86)}%`,
            transform: 'translateX(-50%)',
          }}
        >
          <p className="font-ui text-xs font-medium text-plum">{data[hover].label}</p>
          <p className="font-ui text-xs text-muted">
            Revenue {money(data[hover].revenue)} · Profit {money(data[hover].profit)} · Cost{' '}
            {money(data[hover].revenue - data[hover].profit)}
          </p>
        </div>
      )}

      <div className="mt-2 flex justify-between font-ui text-[0.62rem] text-muted">
        <span>{data[0]?.label}</span>
        <span>{data[data.length - 1]?.label}</span>
      </div>
    </div>
  )
}

/** Where the money went: one stacked bar, directly labelled. */
export function ExpenseSplitChart({
  vases,
  flowers,
  misc,
}: {
  vases: number
  flowers: number
  misc: number
}) {
  const total = vases + flowers + misc
  if (total <= 0) return <Empty />
  const parts = [
    { label: 'Flowers', value: flowers, color: SERIES.flowers },
    { label: 'Vases', value: vases, color: SERIES.vases },
    { label: 'Misc', value: misc, color: SERIES.misc },
  ].filter((p) => p.value > 0)

  return (
    <div>
      <div className="flex h-9 w-full gap-[2px] overflow-hidden rounded-sm">
        {parts.map((p) => (
          <div
            key={p.label}
            title={`${p.label} ${money(p.value)}`}
            style={{ background: p.color, width: `${(p.value / total) * 100}%` }}
          />
        ))}
      </div>
      <ul className="mt-3 flex flex-col gap-1.5">
        {parts.map((p) => (
          <li key={p.label} className="flex items-center gap-2">
            <span
              aria-hidden
              className="inline-block h-2.5 w-2.5 shrink-0 rounded-[2px]"
              style={{ background: p.color }}
            />
            <span className="font-ui text-sm text-ink">{p.label}</span>
            <span className="ml-auto font-ui text-sm tabular-nums text-muted">
              {money(p.value)} · {Math.round((p.value / total) * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function Empty() {
  return (
    <p className="py-10 text-center font-ui text-sm text-muted">
      Nothing to chart yet — add an event below.
    </p>
  )
}
