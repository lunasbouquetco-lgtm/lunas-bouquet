import { Link } from 'react-router-dom'
import { ArrowRight, Check } from 'lucide-react'
import Reveal from '@/components/Reveal'
import Gallery from '@/components/Gallery'
import { HOLIDAY_ARRANGEMENTS, ROSE_PRICE, ROSE_COUNT } from '@/lib/arrangements'
import { HOLIDAY_MEDIA } from '@/lib/media'
import hero from '@/assets/hero.jpg'
import PageMeta from '@/components/PageMeta'

// Sourced from arrangements.ts rather than repeated here — this page and the order form
// drifting apart on delivery dates is exactly the bug worth designing out.
const holidays = HOLIDAY_ARRANGEMENTS.map((a) => ({
  id: a.id,
  name: a.label,
  when: a.delivery,
}))

// Some holidays are a photo, some are a short clip of the real arrangement. Videos are
// muted and carry no audio track at all (see scripts/prepare-media.mjs), which is also
// what lets them autoplay — browsers block autoplay with sound.
function HolidayMediaFrame({ id, name }: { id: string; name: string }) {
  const media = HOLIDAY_MEDIA[id]
  if (!media) {
    return <div className="aspect-[4/3] w-full bg-champagne/60" aria-hidden />
  }
  if (media.kind === 'video') {
    return (
      <video
        className="aspect-[4/3] w-full object-cover"
        src={media.src}
        poster={media.poster}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-label={`${name} arrangement`}
      />
    )
  }
  return (
    <img
      src={media.src}
      alt={media.alt}
      loading="lazy"
      decoding="async"
      className="aspect-[4/3] w-full object-cover"
    />
  )
}

const included = [
  'A large, hand-tied arrangement',
  'Fresh, seasonal blooms at their peak',
  'A vase, included',
  'Free delivery across the Phoenix Metro',
]

export default function Bouquets() {
  return (
    <>
      <PageMeta
        title="Holiday Flower Arrangements in Phoenix | Luna's Bouquet"
        description="Seasonal arrangements for Thanksgiving, Christmas, Valentine's Day, Easter and Mother's Day, $125 with vase and free Phoenix delivery. Or 100 roses for $275."
        path="/bouquets"
      />
      {/* Blended hero: the photo melts down into the Holiday Bouquets content, so the
          page opens on flowers and flows straight into the offering — no hard card.
          Swap `hero` for a wide landscape shot of one of Annie's arrangements when ready. */}
      <section className="relative bg-ivory">
        {/* Image band that fades into the ivory below it */}
        <div className="relative h-[46vh] min-h-[340px] w-full overflow-hidden sm:h-[58vh]">
          <img src={hero} alt="" aria-hidden className="h-full w-full object-cover" />
          {/* top wash clears the nav; bottom fade melts the image into the page */}
          <div className="absolute inset-0 bg-gradient-to-b from-plum/25 via-transparent to-ivory" />
        </div>

        {/* Content pulled up into the blend, full-width and centered */}
        <div className="relative z-10 mx-auto -mt-28 max-w-4xl px-6 pb-4 text-center sm:-mt-36 sm:px-8">
          {/* Soft ivory halo behind the heading — feathered so it bleeds into the image
              rather than sitting on it as a hard box, keeping the text readable. */}
          <Reveal className="rounded-[50%] px-6 py-10 [background:radial-gradient(ellipse_75%_75%_at_50%_45%,rgba(246,241,231,0.94)_0%,rgba(246,241,231,0.6)_45%,transparent_72%)] sm:px-10">
            <p className="label text-gold">Seasonal arrangements</p>
            <h1 className="mt-4 font-display text-5xl leading-tight text-plum sm:text-6xl">
              Holiday bouquets
            </h1>
            <p className="mt-3 font-display text-2xl text-rosewood sm:text-3xl">$125 each</p>
            <p className="mx-auto mt-6 max-w-2xl font-body text-xl leading-relaxed text-ink/80">
              For each holiday, we design a large, generous arrangement from the season&apos;s finest
              flowers. Reserve yours ahead, and we deliver it fresh on the date.
            </p>
          </Reveal>

          {/* What's included — a wide row rather than a narrow column */}
          <Reveal className="mx-auto mt-9 flex max-w-3xl flex-wrap items-center justify-center gap-x-8 gap-y-3">
            {included.map((item) => (
              <span key={item} className="flex items-center gap-2 font-body text-lg text-ink/85">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold/15 text-gold">
                  <Check size={13} />
                </span>
                {item}
              </span>
            ))}
          </Reveal>

          {/* The two offers, side by side */}
          <Reveal className="mx-auto mt-10 grid max-w-3xl gap-4 sm:grid-cols-2">
            <div className="flex flex-col justify-center rounded-sm bg-champagne/60 px-6 py-6 text-center">
              <p className="font-body text-lg text-plum">
                Order three or more and take <strong>$10 off</strong> each arrangement.
              </p>
            </div>
            <div className="rounded-sm border border-rosewood/25 bg-surface px-6 py-6 text-center">
              <p className="font-display text-xl text-plum">Or {ROSE_COUNT} roses, any holiday</p>
              <p className="mt-1 font-display text-lg text-rosewood">${ROSE_PRICE}</p>
              <p className="mt-2 font-body text-base text-ink/70">
                A rose-only arrangement, {ROSE_COUNT} stems.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Holiday list */}
      <section className="bg-ivory py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {holidays.map((h, i) => (
              <Reveal as="article" key={h.name} delay={i * 0.04}>
                <div className="group flex h-full flex-col overflow-hidden rounded-sm border border-gold/15 bg-surface transition-colors hover:border-gold/40">
                  <HolidayMediaFrame id={h.id} name={h.name} />
                  <div className="flex flex-1 flex-col justify-between p-6">
                    <h3 className="font-display text-2xl text-plum">{h.name}</h3>
                    <p className="label mt-5 text-[0.6rem] text-gold/80">{h.when}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <Gallery />

      {/* Custom & events. The monthly subscription card used to sit beside this one;
          removed 2026-07-23 because nobody ordered it. Custom now runs full width. */}
      <section className="bg-champagne/50 py-24 sm:py-28">
        <div className="mx-auto max-w-3xl px-6 sm:px-8">
          <Reveal as="article">
            <div className="flex h-full flex-col rounded-sm bg-plum p-9 text-ivory">
              <p className="label text-gold-light">Custom & events</p>
              <h3 className="mt-4 font-display text-3xl text-white">Events & custom designs</h3>
              <p className="mt-2 font-display text-xl text-gold-light">From $375</p>
              <p className="mt-5 flex-1 font-body text-lg leading-relaxed text-ivory/80">
                Corporate and nonprofit events, parties, gatherings, and one-off designs made just
                for you. Tell us what you are dreaming of and we will design around it. Custom orders
                start at a $375 minimum.
              </p>
              <Link
                to="/order"
                className="label mt-8 inline-flex items-center gap-2 text-gold-light transition-colors hover:text-white"
              >
                Request custom work <ArrowRight size={14} />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-ivory py-24 sm:py-28">
        <div className="mx-auto max-w-5xl px-6 sm:px-8">
          <Reveal className="text-center">
            <p className="label text-gold">Ordering is easy</p>
            <h2 className="mt-4 font-display text-4xl text-plum sm:text-5xl">How it works</h2>
          </Reveal>
          <div className="mt-14 grid gap-10 sm:grid-cols-3">
            {[
              { n: 'One', t: 'Place your order', d: 'Fill out the order form with your flowers, recipient, and delivery details.' },
              { n: 'Two', t: 'We confirm', d: 'Ahnaleigh reaches out to confirm the details and arrange payment by Venmo, Zelle, check, or cash.' },
              { n: 'Three', t: 'Delivered fresh', d: 'Your arrangement is hand-tied and delivered fresh across the Phoenix Metro. Please allow 48 hours.' },
            ].map((s, i) => (
              <Reveal key={s.n} delay={i * 0.08} className="text-center">
                <p className="label text-gold/70">{s.n}</p>
                <div className="mx-auto mt-4 h-px w-10 bg-gold/40" />
                <h3 className="mt-5 font-display text-2xl text-plum">{s.t}</h3>
                <p className="mt-3 font-body text-lg leading-relaxed text-ink/75">{s.d}</p>
              </Reveal>
            ))}
          </div>
          <div className="mt-16 text-center">
            <Link
              to="/order"
              className="label inline-flex items-center gap-2 rounded-full bg-rosewood px-8 py-4 text-white transition-colors hover:bg-rosewood-dark"
            >
              Order flowers <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
