import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { GALLERY } from '@/lib/media'

// A horizontal rail rather than a grid: a grid of twenty squares reads as a catalog,
// and Annie's work deserves to be looked at one arrangement at a time. Scroll-snap does
// the heavy lifting so touch and trackpad feel native; the arrows are for mouse users.
export default function Gallery() {
  const rail = useRef<HTMLUListElement>(null)
  const [atStart, setAtStart] = useState(true)
  const [atEnd, setAtEnd] = useState(false)

  const sync = useCallback(() => {
    const el = rail.current
    if (!el) return
    setAtStart(el.scrollLeft < 8)
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 8)
  }, [])

  useEffect(() => {
    sync()
    const el = rail.current
    if (!el) return
    el.addEventListener('scroll', sync, { passive: true })
    window.addEventListener('resize', sync)
    return () => {
      el.removeEventListener('scroll', sync)
      window.removeEventListener('resize', sync)
    }
  }, [sync])

  function nudge(dir: 1 | -1) {
    const el = rail.current
    if (!el) return
    // Move by roughly one card so a click always lands on a new arrangement.
    const card = el.querySelector('li')
    const step = card ? card.clientWidth + 16 : el.clientWidth * 0.8
    el.scrollBy({ left: dir * step, behavior: 'smooth' })
  }

  return (
    <section className="bg-plum py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="label text-gold-light">Her work</p>
            <h2 className="mt-4 max-w-xl font-display text-4xl leading-tight text-ivory sm:text-5xl">
              Twenty arrangements, no two alike.
            </h2>
          </div>

          <div className="flex gap-3">
            <RailButton onClick={() => nudge(-1)} disabled={atStart} label="Previous arrangements">
              <ArrowLeft size={16} />
            </RailButton>
            <RailButton onClick={() => nudge(1)} disabled={atEnd} label="More arrangements">
              <ArrowRight size={16} />
            </RailButton>
          </div>
        </div>
      </div>

      <ul
        ref={rail}
        // Padding matches the max-width gutter so the first card lines up with the
        // heading above it, but cards can still run off the right edge.
        //
        // scroll-pl matters: snap-start aligns to the scroll port, which ignores
        // padding, so without it the browser nudges scrollLeft by the padding amount
        // and the first card ends up clipped against the left edge.
        className="mt-10 flex snap-x snap-mandatory scroll-pl-6 gap-4 overflow-x-auto px-6 pb-4 sm:scroll-pl-8 sm:px-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {GALLERY.map((item) => (
          <li
            key={item.src}
            className="w-[76vw] shrink-0 snap-start sm:w-[42vw] lg:w-[27vw] xl:w-[22vw]"
          >
            <figure className="m-0">
              <div className="aspect-[4/5] overflow-hidden rounded-sm bg-plum-light">
                <img
                  src={item.src}
                  alt={item.alt}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover transition-transform duration-700 hover:scale-[1.04]"
                />
              </div>
            </figure>
          </li>
        ))}
      </ul>
    </section>
  )
}

function RailButton({
  onClick,
  disabled,
  label,
  children,
}: {
  onClick: () => void
  disabled: boolean
  label: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="flex h-11 w-11 items-center justify-center rounded-full border border-gold/40 text-gold-light transition-colors hover:border-gold hover:bg-gold hover:text-plum disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gold-light"
    >
      {children}
    </button>
  )
}
