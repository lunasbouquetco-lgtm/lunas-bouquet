import { Link } from 'react-router-dom'
import { ArrowRight, Check } from 'lucide-react'
import Reveal from '@/components/Reveal'
import Gallery from '@/components/Gallery'
import LoopingVideo from '@/components/LoopingVideo'
import { HOLIDAY_ARRANGEMENTS, ROSE_PRICE, ROSE_COUNT } from '@/lib/arrangements'
import { HOLIDAY_MEDIA, ahnaleighVideo } from '@/lib/media'
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
      {/* Full-bleed hero — flowers behind a floating card, details flow down from here */}
      <section className="relative flex min-h-[74vh] items-center justify-center overflow-hidden">
        <img
          src={hero}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover"
        />
        {/* Soft wash so the card reads cleanly over any part of the image */}
        <div className="absolute inset-0 bg-gradient-to-b from-plum/30 via-plum/10 to-ivory/40" />
        <Reveal className="relative mx-5 mt-16 max-w-2xl rounded-sm bg-ivory/90 px-8 py-14 text-center shadow-[0_50px_100px_-55px_rgba(58,33,48,0.75)] backdrop-blur-[2px] sm:px-16 sm:py-16">
          <p className="label text-gold">What we make</p>
          <h1 className="mt-5 font-display text-5xl leading-tight text-plum sm:text-6xl">
            Bouquets &amp; arrangements
          </h1>
          <p className="mx-auto mt-6 max-w-xl font-body text-xl leading-relaxed text-ink/75">
            Large, seasonal arrangements for the moments that matter, plus custom work and events.
          </p>
          <div className="mx-auto mt-9 h-px w-16 bg-gold/40" />
        </Reveal>
      </section>

      {/* Seasonal arrangements */}
      <section className="bg-ivory pb-8 pt-20 sm:pt-24">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 sm:px-8 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <p className="label text-gold">Seasonal arrangements</p>
            <h2 className="mt-4 font-display text-4xl text-plum sm:text-5xl">Holiday bouquets</h2>
            <p className="mt-2 font-display text-2xl text-rosewood">$125 each</p>
            <div className="prose-serif mt-6 max-w-lg">
              <p>
                For each holiday, we design a large, generous arrangement from the season&apos;s
                finest flowers. Reserve yours ahead, and we deliver it fresh on the date.
              </p>
            </div>
            <ul className="mt-7 flex flex-col gap-3">
              {included.map((item) => (
                <li key={item} className="flex items-center gap-3 font-body text-lg text-ink/85">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold/15 text-gold">
                    <Check size={13} />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-6 rounded-sm bg-champagne/60 px-5 py-4 font-body text-lg text-plum">
              🌸 Order three or more and take <strong>$10 off</strong> each arrangement.
            </p>

            <div className="mt-4 rounded-sm border border-rosewood/25 bg-surface px-5 py-4">
              <p className="font-display text-xl text-plum">
                Or {ROSE_COUNT} roses, for any holiday
              </p>
              <p className="mt-1 font-display text-lg text-rosewood">${ROSE_PRICE}</p>
              <p className="mt-2 font-body text-lg text-ink/70">
                A rose-only arrangement, {ROSE_COUNT} stems, available for every date above.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="overflow-hidden rounded-sm shadow-[0_30px_70px_-40px_rgba(58,33,48,0.6)]">
              <LoopingVideo
                src={ahnaleighVideo.src}
                poster={ahnaleighVideo.poster}
                alt={ahnaleighVideo.alt}
                className="h-[520px] w-full object-cover"
              />
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
