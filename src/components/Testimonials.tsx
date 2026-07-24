import { useEffect, useRef, useState } from 'react'

type Testimonial = { quote: string; name: string }

// A rotating "Kind Words" carousel — one quote at a time, cross-fading. Auto-advances,
// pauses when hovered or focused, and does not auto-advance at all under reduced-motion.
// Built to hold many more quotes than the two it launches with, so new Google reviews
// drop straight in.
export default function Testimonials({ items }: { items: Testimonial[] }) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const reduce = useRef(false)

  useEffect(() => {
    reduce.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])

  useEffect(() => {
    if (paused || reduce.current || items.length < 2) return
    const id = setInterval(() => setIndex((i) => (i + 1) % items.length), 6000)
    return () => clearInterval(id)
  }, [paused, items.length])

  function go(i: number) {
    setIndex(((i % items.length) + items.length) % items.length)
  }

  return (
    <section className="bg-plum py-24 text-ivory sm:py-32">
      <div
        className="mx-auto max-w-3xl px-6 text-center sm:px-8"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={() => setPaused(false)}
      >
        <p className="label text-gold-light">Kind words</p>

        {/* Fixed-height stage so the surrounding layout doesn't jump as quotes change. */}
        <div className="relative mt-12 min-h-[13rem] sm:min-h-[11rem]">
          {items.map((t, i) => (
            <figure
              key={t.name + i}
              aria-hidden={i !== index}
              className="absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-700"
              style={{ opacity: i === index ? 1 : 0, pointerEvents: i === index ? 'auto' : 'none' }}
            >
              <blockquote className="font-body text-2xl italic leading-relaxed text-ivory/90 sm:text-[1.9rem]">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <figcaption className="label mt-7 text-gold-light">{t.name}</figcaption>
            </figure>
          ))}
        </div>

        {items.length > 1 && (
          <div className="mt-10 flex items-center justify-center gap-3">
            {items.map((t, i) => (
              <button
                key={t.name + i}
                type="button"
                onClick={() => go(i)}
                aria-label={`Show ${t.name}'s review`}
                aria-current={i === index}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === index ? 'w-7 bg-gold-light' : 'w-2 bg-ivory/30 hover:bg-ivory/60'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
