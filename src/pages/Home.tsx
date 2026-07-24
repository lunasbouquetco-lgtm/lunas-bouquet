import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import Reveal from '@/components/Reveal'
import hero from '@/assets/hero.jpg'
import bloom from '@/assets/bloom.jpg'
import band from '@/assets/band.jpg'
import PageMeta from '@/components/PageMeta'

const occasions = [
  { name: "Valentine's Day", note: 'February' },
  { name: "Mother's Day", note: 'May' },
  { name: 'Easter', note: 'Spring' },
  { name: 'Thanksgiving', note: 'November' },
  { name: 'Christmas', note: 'December' },
  { name: 'Weddings & Events', note: 'Year-round' },
]

const testimonials = [
  {
    quote:
      'Luna’s Bouquet delivers breathtaking, high-quality arrangements. Every bouquet is beautiful and impactful.',
    name: 'Ashley',
  },
  {
    quote: 'The flowers were beautiful. Thank you for making our holiday extra special.',
    name: 'Lori',
  },
]

export default function Home() {
  return (
    <>
      <PageMeta
        title="Luna's Bouquet — Fresh flowers delivered across Phoenix & Scottsdale"
        description="Large, hand-tied seasonal arrangements from a Phoenix florist. Free delivery across the Phoenix metro including Scottsdale, with 48 hours notice."
        path="/"
      />
      {/* ---------- Hero ---------- */}
      <section className="relative flex min-h-[92vh] items-center overflow-hidden">
        <img
          src={hero}
          alt="A lush arrangement of garden roses, sweet peas, and blossom"
          className="absolute inset-0 h-full w-full object-cover object-right"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(90deg, rgba(246,241,231,0.96) 0%, rgba(246,241,231,0.86) 28%, rgba(246,241,231,0.35) 55%, rgba(246,241,231,0) 78%)',
          }}
        />
        <div className="relative mx-auto w-full max-w-7xl px-6 sm:px-8">
          <div className="max-w-xl pt-24">
            <p className="label rise rise-1 text-gold">Luna&apos;s Bouquet · Phoenix &amp; Scottsdale</p>
            <h1 className="rise rise-2 mt-6 font-display text-[2.9rem] leading-[1.04] text-plum sm:text-6xl">
              Flowers that brighten the day.
            </h1>
            <p className="rise rise-3 mt-6 max-w-md font-body text-xl leading-relaxed text-ink/80">
              Fresh, seasonal arrangements, hand-tied with care and delivered to your door across
              the Phoenix Metro.
            </p>
            <div className="rise rise-3 mt-9 flex flex-wrap items-center gap-4">
              <Link
                to="/order"
                className="label group inline-flex items-center gap-2 rounded-full bg-rosewood px-7 py-3.5 text-white transition-colors hover:bg-rosewood-dark"
              >
                Order flowers
                <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/bouquets"
                className="label inline-flex items-center gap-2 border-b border-gold/50 pb-1 text-plum transition-colors hover:text-gold"
              >
                See what we make
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Intro line ---------- */}
      <section className="bg-ivory py-24 sm:py-32">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <Reveal>
            <p className="label text-gold">Handcrafted, never mass-made</p>
            <p className="mt-7 font-display text-[1.8rem] leading-[1.35] text-plum sm:text-[2.4rem] sm:leading-[1.32]">
              Every arrangement is designed by hand from the season&apos;s best blooms, at their
              peak, and delivered fresh.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ---------- Occasions ---------- */}
      <section className="bg-champagne/50 py-24 sm:py-28">
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <Reveal className="mb-14 flex flex-col items-end justify-between gap-4 sm:flex-row">
            <div>
              <p className="label text-gold">For every occasion</p>
              <h2 className="mt-4 font-display text-4xl text-plum sm:text-5xl">
                A bouquet for the moment
              </h2>
            </div>
            <Link
              to="/bouquets"
              className="label inline-flex items-center gap-2 border-b border-gold/50 pb-1 text-plum transition-colors hover:text-gold"
            >
              All bouquets <ArrowRight size={14} />
            </Link>
          </Reveal>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
            {occasions.map((o, i) => (
              <Reveal as="article" key={o.name} delay={i * 0.05}>
                <div className="group flex h-full flex-col justify-between rounded-sm border border-gold/15 bg-surface p-7 transition-all duration-500 hover:border-gold/40 hover:shadow-[0_18px_40px_-28px_rgba(58,33,48,0.5)]">
                  <span className="label text-[0.6rem] text-gold/80">{o.note}</span>
                  <h3 className="mt-8 font-display text-2xl text-plum sm:text-[1.75rem]">
                    {o.name}
                  </h3>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Story teaser (image + text) ---------- */}
      <section className="bg-ivory py-24 sm:py-32">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 sm:px-8 lg:grid-cols-2 lg:gap-20">
          <Reveal className="order-2 lg:order-1">
            <p className="label text-gold">The florist</p>
            <h2 className="mt-4 font-display text-4xl leading-tight text-plum sm:text-5xl">
              Meet Ahnaleigh
            </h2>
            <div className="prose-serif mt-7 max-w-lg">
              <p>
                Luna&apos;s Bouquet began with a girl who fell in love with flowers at fifteen.
                Ahnaleigh grew up in foster care, and she is building this business with her own two
                hands, one arrangement at a time.
              </p>
              <p>
                Every order supports her craft and her future. It is also, simply, some of the most
                beautiful work in the valley.
              </p>
            </div>
            <Link
              to="/about"
              className="label mt-8 inline-flex items-center gap-2 border-b border-gold/50 pb-1 text-plum transition-colors hover:text-gold"
            >
              Read her story <ArrowRight size={14} />
            </Link>
          </Reveal>

          <Reveal className="order-1 lg:order-2" delay={0.1}>
            <div className="overflow-hidden rounded-sm shadow-[0_30px_70px_-40px_rgba(58,33,48,0.6)]">
              <img
                src={bloom}
                alt="A detail of a Luna's Bouquet arrangement"
                className="h-[420px] w-full object-cover sm:h-[540px]"
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------- Testimonials ---------- */}
      <section className="bg-plum py-24 text-ivory sm:py-32">
        <div className="mx-auto max-w-5xl px-6 sm:px-8">
          <Reveal className="text-center">
            <p className="label text-gold-light">Kind words</p>
          </Reveal>
          <div className="mt-14 grid gap-10 md:grid-cols-2 md:gap-14">
            {testimonials.map((t, i) => (
              <Reveal as="figure" key={t.name} delay={i * 0.1}>
                <blockquote className="font-body text-2xl italic leading-relaxed text-ivory/90 sm:text-[1.7rem]">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <figcaption className="label mt-6 text-gold-light">{t.name}</figcaption>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- CTA band ---------- */}
      <section className="relative overflow-hidden">
        <img src={band} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-ivory/85" />
        <div className="relative mx-auto max-w-3xl px-6 py-24 text-center sm:py-28">
          <Reveal>
            <h2 className="font-display text-4xl leading-tight text-plum sm:text-5xl">
              Ready to send something beautiful?
            </h2>
            <p className="mt-5 font-body text-xl text-ink/75">
              Free delivery across the Phoenix Metro and Scottsdale. Just give us 48 hours.
            </p>
            <Link
              to="/order"
              className="label mt-9 inline-flex items-center gap-2 rounded-full bg-rosewood px-8 py-4 text-white transition-colors hover:bg-rosewood-dark"
            >
              Start your order <ArrowRight size={15} />
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  )
}
