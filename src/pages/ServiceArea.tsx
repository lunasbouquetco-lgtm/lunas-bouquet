import { useEffect } from 'react'
import { Link, useParams, Navigate } from 'react-router-dom'
import { ArrowRight, Check, MapPin } from 'lucide-react'
import Reveal from '@/components/Reveal'
import PageMeta from '@/components/PageMeta'
import { areaBySlug } from '@/lib/serviceAreas'
import { ROSE_PRICE, ROSE_COUNT, ARRANGEMENT_PRICE } from '@/lib/arrangements'
import hero from '@/assets/hero.jpg'

export default function ServiceArea() {
  const { slug = '' } = useParams()
  const area = areaBySlug(slug)

  // Add city-specific Florist structured data with areaServed while this page is shown.
  useEffect(() => {
    if (!area) return
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.id = 'service-area-jsonld'
    script.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Florist',
      name: "Luna's Bouquet",
      url: `https://lunasbouquet.com/flower-delivery/${area.slug}`,
      areaServed: { '@type': 'City', name: `${area.city}, AZ` },
      priceRange: '$125–$375',
      makesOffer: [
        { '@type': 'Offer', name: 'Seasonal holiday arrangement', price: '125', priceCurrency: 'USD' },
        { '@type': 'Offer', name: '100-rose arrangement', price: '275', priceCurrency: 'USD' },
      ],
    })
    document.head.appendChild(script)
    return () => {
      document.getElementById('service-area-jsonld')?.remove()
    }
  }, [area])

  if (!area) return <Navigate to="/" replace />

  const included = [
    'A large, hand-tied arrangement',
    'Fresh, seasonal blooms',
    'A vase, included',
    `Free delivery across ${area.city}`,
  ]

  return (
    <>
      <PageMeta
        title={area.title}
        description={area.metaDescription}
        path={`/flower-delivery/${area.slug}`}
      />

      {/* Hero */}
      <section className="relative flex min-h-[58vh] items-center overflow-hidden">
        <img src={hero} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-ivory via-ivory/80 to-transparent" />
        <div className="relative mx-auto w-full max-w-7xl px-6 pt-24 sm:px-8">
          <Reveal className="max-w-xl">
            <p className="label flex items-center gap-2 text-gold">
              <MapPin size={13} /> {area.city}, Arizona
            </p>
            <h1 className="mt-4 font-display text-5xl leading-tight text-plum sm:text-6xl">
              Flower delivery in {area.city}
            </h1>
            <p className="mt-6 font-body text-xl leading-relaxed text-ink/80">{area.lead}</p>
            <Link
              to="/order"
              className="label mt-8 inline-flex items-center gap-2 rounded-full bg-rosewood px-8 py-4 text-white transition-colors hover:bg-rosewood-dark"
            >
              Order flowers <ArrowRight size={15} />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* Local angle + what's included */}
      <section className="bg-ivory py-20 sm:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 sm:px-8 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <h2 className="font-display text-3xl text-plum sm:text-4xl">{area.angle.heading}</h2>
            <p className="prose-serif mt-5 max-w-lg">
              <span>{area.angle.body}</span>
            </p>
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
          </Reveal>

          <Reveal delay={0.1}>
            <div className="rounded-sm border border-gold/20 bg-surface p-8">
              <p className="label text-gold">What we bring to {area.city}</p>
              <div className="mt-5 flex flex-col gap-4">
                <PriceLine name="Seasonal holiday arrangement" note="Vase included" price={`$${ARRANGEMENT_PRICE}`} />
                <PriceLine name={`${ROSE_COUNT}-rose arrangement`} note="Any holiday" price={`$${ROSE_PRICE}`} />
                <PriceLine name="Custom & events" note="Designed for you" price="From $375" />
              </div>
              <p className="mt-6 border-t border-gold/15 pt-5 font-body text-lg text-ink/70">
                Free delivery across {area.city}. Please allow 48 hours. Payment by Venmo, Zelle,
                check, or cash, arranged after Ahnaleigh confirms your order.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Neighborhoods */}
      <section className="bg-champagne/50 py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-6 text-center sm:px-8">
          <Reveal>
            <p className="label text-gold">Neighborhoods we deliver to</p>
            <div className="mt-6 flex flex-wrap justify-center gap-x-3 gap-y-3">
              {area.neighborhoods.map((n) => (
                <span
                  key={n}
                  className="rounded-full border border-gold/25 bg-surface px-5 py-2 font-body text-lg text-plum"
                >
                  {n}
                </span>
              ))}
            </div>
            <p className="mx-auto mt-6 max-w-xl font-body text-lg text-ink/70">
              Don’t see your neighborhood? If it’s in {area.city}, we deliver there.
            </p>
          </Reveal>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-ivory py-20 sm:py-24">
        <div className="mx-auto max-w-3xl px-6 sm:px-8">
          <Reveal>
            <h2 className="text-center font-display text-3xl text-plum sm:text-4xl">
              Flower delivery in {area.city}, answered
            </h2>
          </Reveal>
          <div className="mt-10 flex flex-col gap-6">
            {area.faq.map((f, i) => (
              <Reveal as="article" key={f.q} delay={i * 0.06}>
                <div className="rounded-sm border border-gold/15 bg-surface p-6">
                  <h3 className="font-display text-xl text-plum">{f.q}</h3>
                  <p className="mt-2 font-body text-lg leading-relaxed text-ink/75">{f.a}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal className="mt-12 text-center">
            <Link
              to="/order"
              className="label inline-flex items-center gap-2 rounded-full bg-rosewood px-8 py-4 text-white transition-colors hover:bg-rosewood-dark"
            >
              Send flowers to {area.city} <ArrowRight size={15} />
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  )
}

function PriceLine({ name, note, price }: { name: string; note: string; price: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span>
        <span className="block font-body text-lg text-plum">{name}</span>
        <span className="block font-ui text-xs uppercase tracking-[0.12em] text-ink/45">{note}</span>
      </span>
      <span className="shrink-0 font-display text-xl text-rosewood">{price}</span>
    </div>
  )
}
