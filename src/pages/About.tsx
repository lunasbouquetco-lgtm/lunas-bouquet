import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import Reveal from '@/components/Reveal'
import PageHeader from '@/components/PageHeader'
import bloom from '@/assets/bloom.jpg'
import { ahnaleighVideo } from '@/lib/media'
import LoopingVideo from '@/components/LoopingVideo'
import PageMeta from '@/components/PageMeta'

export default function About() {
  return (
    <>
      <PageMeta
        title="Our Story — Ahnaleigh, Phoenix Florist | Luna's Bouquet"
        description="Luna's Bouquet began with a girl and a love of flowers. Ahnaleigh designs holiday arrangements, plus corporate and nonprofit events, across the Phoenix metro."
        path="/about"
      />
      <PageHeader
        eyebrow="Our story"
        title="Meet Ahnaleigh"
        subtitle="The florist behind Luna's Bouquet."
      />

      {/* Portrait image band */}
      <section className="bg-ivory">
        <div className="mx-auto max-w-5xl px-6 sm:px-8">
          <Reveal>
            <div className="overflow-hidden rounded-sm shadow-[0_30px_80px_-45px_rgba(58,33,48,0.6)]">
              <LoopingVideo
                src={ahnaleighVideo.src}
                poster={ahnaleighVideo.poster}
                alt={ahnaleighVideo.alt}
                className="h-[340px] w-full object-cover sm:h-[460px]"
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* Story */}
      <section className="bg-ivory py-20 sm:py-28">
        <div className="mx-auto max-w-2xl px-6 sm:px-8">
          <Reveal className="prose-serif">
            <p>
              Luna&apos;s Bouquet began with me and a love of flowers. I discovered floral design at
              fifteen, and found something that was entirely my own &mdash; a way to make beauty with
              my hands, and to brighten someone&apos;s day.
            </p>
            <p>
              I grew up in foster care, and I&apos;m building this business with real ambition,
              saving toward my first car and a future I&apos;m designing myself. Every arrangement I
              make is a step toward it.
            </p>
            <p>
              I&apos;ve designed for parties and gatherings, and for corporate and nonprofit events,
              and I&apos;m growing a loyal base of people who come back season after season. I pour
              genuine care into every arrangement &mdash; fresh, generous, and made by hand.
            </p>
            <p>
              When you order from Luna&apos;s Bouquet, you get some of the most beautiful flowers in
              the valley, and you help me build something lasting. That means the world to me.
            </p>
          </Reveal>

          <Reveal className="mt-10">
            <p className="font-body text-2xl italic text-plum">— Ahnaleigh</p>
          </Reveal>
        </div>
      </section>

      {/* Values strip */}
      <section className="bg-champagne/50 py-20 sm:py-24">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 sm:grid-cols-3 sm:px-8">
          {[
            { t: 'Fresh & seasonal', d: 'Only the season’s best blooms, at their peak, arranged by hand.' },
            { t: 'Made with heart', d: 'Every arrangement is designed one at a time, never mass-produced.' },
            { t: 'Rooted in Arizona', d: 'Free delivery across the Phoenix Metro, including Scottsdale.' },
          ].map((v, i) => (
            <Reveal key={v.t} delay={i * 0.08} className="text-center">
              <h3 className="font-display text-2xl text-plum">{v.t}</h3>
              <p className="mt-3 font-body text-lg leading-relaxed text-ink/75">{v.d}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-ivory">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-20 sm:px-8 lg:grid-cols-[1.2fr_1fr]">
          <Reveal>
            <h2 className="font-display text-4xl leading-tight text-plum sm:text-5xl">
              Send flowers, support her craft
            </h2>
            <p className="mt-5 max-w-md font-body text-xl text-ink/75">
              Order a seasonal arrangement or start a custom design today.
            </p>
            <Link
              to="/order"
              className="label mt-8 inline-flex items-center gap-2 rounded-full bg-rosewood px-8 py-4 text-white transition-colors hover:bg-rosewood-dark"
            >
              Order flowers <ArrowRight size={15} />
            </Link>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="overflow-hidden rounded-sm shadow-[0_24px_60px_-40px_rgba(58,33,48,0.6)]">
              <img src={bloom} alt="" aria-hidden className="h-72 w-full object-cover" />
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
