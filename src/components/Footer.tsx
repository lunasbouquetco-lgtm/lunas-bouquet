import InstagramIcon from '@/components/InstagramIcon'
import { Link } from 'react-router-dom'
import { Mail } from 'lucide-react'
import markIvory from '@/assets/mark-ivory.png'

export default function Footer() {
  return (
    <footer className="bg-plum text-ivory">
      <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8 sm:py-20">
        <div className="flex flex-col items-center gap-10 text-center md:flex-row md:items-start md:justify-between md:text-left">
          <div className="max-w-xs">
            <img src={markIvory} alt="Luna's Bouquet" className="mx-auto h-16 w-auto md:mx-0" />
            <p className="mt-5 font-body text-lg leading-relaxed text-ivory/75">
              Fresh, seasonal arrangements, hand-tied and delivered across the Phoenix Metro.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-14 gap-y-3">
            <FooterCol title="Explore">
              <FooterLink to="/bouquets">Bouquets</FooterLink>
              <FooterLink to="/about">Our Story</FooterLink>
              <FooterLink to="/order">Place an Order</FooterLink>
              <FooterLink to="/contact">Contact</FooterLink>
            </FooterCol>
            <FooterCol title="Reach us">
              <a
                href="mailto:lunasbouquet.co@gmail.com"
                className="inline-flex items-center gap-2 text-ivory/75 transition-colors hover:text-gold-light"
              >
                <Mail size={15} /> Email
              </a>
              <a
                href="https://instagram.com/lunas_bouquet12"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-ivory/75 transition-colors hover:text-gold-light"
              >
                <InstagramIcon size={15} /> @lunas_bouquet12
              </a>
              <p className="text-ivory/60">Phoenix Metro &amp; Scottsdale</p>
              <p className="text-ivory/60">48 hours notice</p>
            </FooterCol>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-3 border-t border-ivory/15 pt-7 text-center text-ivory/50 sm:flex-row sm:text-left">
          <p className="label text-[0.62rem]">© {new Date().getFullYear()} Luna's Bouquet</p>
          <p className="font-body text-base italic text-ivory/55">
            Handcrafted in Arizona
          </p>
        </div>
      </div>
    </footer>
  )
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2.5">
      <p className="label mb-1 text-[0.62rem] text-gold-light">{title}</p>
      {children}
    </div>
  )
}

function FooterLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link to={to} className="text-ivory/75 transition-colors hover:text-gold-light">
      {children}
    </Link>
  )
}
