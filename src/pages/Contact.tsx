import InstagramIcon from '@/components/InstagramIcon'
import { Link } from 'react-router-dom'
import { ArrowRight, Mail, MapPin, CreditCard } from 'lucide-react'
import Reveal from '@/components/Reveal'
import PageHeader from '@/components/PageHeader'
import PageMeta from '@/components/PageMeta'

const details = [
  {
    icon: Mail,
    title: 'Email',
    lines: ['lunasbouquet.co@gmail.com'],
    href: 'mailto:lunasbouquet.co@gmail.com',
  },
  {
    icon: InstagramIcon,
    title: 'Instagram',
    lines: ['@lunas_bouquet12'],
    href: 'https://instagram.com/lunas_bouquet12',
  },
  {
    icon: MapPin,
    title: 'Delivery area',
    lines: ['Phoenix Metro & Scottsdale', 'Free delivery'],
  },
  {
    icon: CreditCard,
    title: 'Payment',
    lines: ['Venmo, Zelle,', 'check, or cash'],
  },
]

export default function Contact() {
  return (
    <>
      <PageMeta
        title="Contact Luna's Bouquet — Phoenix & Scottsdale Florist"
        description="Get in touch about holiday arrangements, or corporate and nonprofit events. Free delivery across the Phoenix metro including Scottsdale."
        path="/contact"
      />
      <PageHeader
        eyebrow="Say hello"
        title="Get in touch"
        subtitle="Questions, custom requests, or just want to talk flowers? We would love to hear from you."
      />

      <section className="bg-ivory pb-24 sm:pb-28">
        <div className="mx-auto max-w-5xl px-6 sm:px-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {details.map((d, i) => {
              const Icon = d.icon
              const inner = (
                <div className="flex h-full flex-col rounded-sm border border-gold/15 bg-surface p-7 transition-colors hover:border-gold/40">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gold/12 text-gold">
                    <Icon size={18} />
                  </span>
                  <h3 className="mt-6 font-display text-xl text-plum">{d.title}</h3>
                  <div className="mt-2 font-body text-lg leading-snug text-ink/75">
                    {d.lines.map((line) => (
                      <p key={line}>{line}</p>
                    ))}
                  </div>
                </div>
              )
              return (
                <Reveal key={d.title} delay={i * 0.05}>
                  {d.href ? (
                    <a
                      href={d.href}
                      target={d.href.startsWith('http') ? '_blank' : undefined}
                      rel="noopener noreferrer"
                      className="block h-full"
                    >
                      {inner}
                    </a>
                  ) : (
                    inner
                  )}
                </Reveal>
              )
            })}
          </div>

          <Reveal className="mt-14 rounded-sm border border-gold/25 bg-champagne/60 px-8 py-14 text-center sm:px-12">
            <h2 className="font-display text-3xl text-plum sm:text-4xl">Ready to order?</h2>
            <p className="mx-auto mt-4 max-w-md font-body text-xl text-ink/75">
              Skip the back and forth. Place your order and Ahnaleigh will reach out to confirm the
              details.
            </p>
            <Link
              to="/order"
              className="label mt-8 inline-flex items-center gap-2 rounded-full bg-rosewood px-8 py-4 text-white transition-colors hover:bg-rosewood-dark"
            >
              Start your order <ArrowRight size={15} />
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  )
}
