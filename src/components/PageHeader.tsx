import Reveal from '@/components/Reveal'

type Props = {
  eyebrow: string
  title: string
  subtitle?: string
}

// Consistent top-of-page header, clears the fixed nav.
export default function PageHeader({ eyebrow, title, subtitle }: Props) {
  return (
    <section className="bg-ivory px-6 pb-14 pt-36 sm:px-8 sm:pt-44">
      <div className="mx-auto max-w-3xl text-center">
        <Reveal>
          <p className="label text-gold">{eyebrow}</p>
          <h1 className="mt-5 font-display text-5xl leading-tight text-plum sm:text-6xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mx-auto mt-6 max-w-xl font-body text-xl leading-relaxed text-ink/75">
              {subtitle}
            </p>
          )}
          <div className="mx-auto mt-9 h-px w-16 bg-gold/40" />
        </Reveal>
      </div>
    </section>
  )
}
